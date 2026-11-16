#!/usr/bin/env python3
"""
Project launcher
================
Start, group and stop your project scripts (npm scripts, Python files, .bat,
.ps1, .js and more) from one window. Scripts can run hidden (output is shown
in the app) or in a visible terminal window. Both can be stopped from the app.

Run it by double-clicking "Start Project Launcher.bat", or with:  pythonw launcher.pyw
The interface lives in the ui/ folder (index.html, styles.css, app.js).
Your entries are saved next to this file in launcher-data.json.

Only the Python standard library is used.
"""
import json
import os
import re
import secrets
import shutil
import signal
import subprocess
import sys
import threading
import time
import uuid
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse
from urllib.request import urlopen

IS_WIN = os.name == "nt"
APP_DIR = Path(__file__).resolve().parent
UI_DIR = APP_DIR / "ui"
UI_FILES = {"/": ("index.html", "text/html; charset=utf-8"), "/index.html": ("index.html", "text/html; charset=utf-8"),
            "/styles.css": ("styles.css", "text/css; charset=utf-8"), "/app.js": ("app.js", "text/javascript; charset=utf-8")}
DATA_FILE = APP_DIR / "launcher-data.json"
LOG_DIR = APP_DIR / "launcher-logs"
SESSION_FILE = APP_DIR / ".launcher-session.json"
DEFAULT_PORT = 47821

NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)
NEW_CONSOLE = getattr(subprocess, "CREATE_NEW_CONSOLE", 0)

SCRIPT_KINDS = {
    ".py": "python", ".pyw": "python",
    ".bat": "batch", ".cmd": "batch",
    ".ps1": "powershell",
    ".js": "node", ".mjs": "node", ".cjs": "node",
    ".ts": "tsx",
    ".exe": "exe",
    ".sh": "shell",
}
KIND_HINT = {
    "python": "Python file", "batch": "Batch file", "powershell": "PowerShell script",
    "node": "Node file", "tsx": "TypeScript file (runs with npx tsx)", "exe": "Program",
    "shell": "Shell script (needs bash)",
}
SKIP_DIRS = {"node_modules", ".git", ".venv", "venv", "env", "__pycache__", "dist", "build", ".next", ".idea", ".vscode"}
VENV_NAMES = (".venv", "venv", "env", ".env")

TOKEN = secrets.token_urlsafe(24)
LOCK = threading.RLock()
DATA = {"groups": [], "entries": [], "settings": {}}
RUNS = {}  # run_id -> dict


# ----------------------------------------------------------------- data ---
def load_data():
    global DATA
    if DATA_FILE.exists():
        try:
            d = json.loads(DATA_FILE.read_text("utf-8"))
            if isinstance(d, dict):
                DATA = {
                    "groups": list(d.get("groups") or []),
                    "entries": list(d.get("entries") or []),
                    "settings": dict(d.get("settings") or {}),
                }
                return
        except Exception:
            backup = DATA_FILE.with_suffix(".broken-%d.json" % int(time.time()))
            try:
                DATA_FILE.replace(backup)
            except OSError:
                pass


def save_data(d):
    global DATA
    if not isinstance(d, dict) or not isinstance(d.get("entries"), list) or not isinstance(d.get("groups"), list):
        raise ValueError("The data was not in the expected shape.")
    with LOCK:
        DATA = {"groups": d["groups"], "entries": d["entries"], "settings": d.get("settings") or {}}
        tmp = DATA_FILE.with_suffix(".tmp")
        tmp.write_text(json.dumps(DATA, indent=2, ensure_ascii=False), "utf-8")
        tmp.replace(DATA_FILE)


def find_entry(entry_id):
    for e in DATA["entries"]:
        if e.get("id") == entry_id:
            return e
    return None


def group_of(entry):
    gid = entry.get("group") or ""
    return gid if any(g.get("id") == gid for g in DATA["groups"]) else ""


# ------------------------------------------------------------ detection ---
def console_python():
    exe = Path(sys.executable)
    if IS_WIN and exe.name.lower() == "pythonw.exe":
        c = exe.with_name("python.exe")
        if c.exists():
            return str(c)
    return str(exe)


def default_python():
    found = shutil.which("python") or shutil.which("python3")
    if found and "windowsapps" not in found.lower():
        return found
    return console_python()


def find_venv_python(start):
    p = Path(start)
    for folder in [p, *list(p.parents)[:3]]:
        for name in VENV_NAMES:
            cand = folder / name / ("Scripts/python.exe" if IS_WIN else "bin/python")
            if cand.exists():
                return str(cand)
    return None


def package_manager(folder):
    f = Path(folder)
    if (f / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (f / "yarn.lock").exists():
        return "yarn"
    if (f / "bun.lockb").exists() or (f / "bun.lock").exists():
        return "bun"
    return "npm"


def npm_scripts(folder, rel=""):
    pkg = Path(folder) / "package.json"
    out = []
    try:
        scripts = json.loads(pkg.read_text("utf-8")).get("scripts") or {}
    except Exception:
        return out
    pm = package_manager(folder)
    for name, body in scripts.items():
        prefix = (rel.replace("\\", "/") + ": ") if rel else ""
        out.append({
            "id": "npm:%s:%s" % (rel, name), "type": "npm", "script": name, "cwd": rel, "pm": pm,
            "label": "%s%s run %s" % (prefix, pm, name), "hint": str(body)[:120],
        })
    return out


def inspect_path(raw):
    raw = (raw or "").strip().strip('"')
    if not raw:
        return {"ok": False, "error": "Choose a file or a folder first."}
    path = Path(os.path.expandvars(os.path.expanduser(raw)))
    if not path.exists():
        return {"ok": False, "error": "That location does not exist."}
    path = path.resolve()
    runnables = []
    if path.is_file():
        base = path.parent
        if path.name.lower() == "package.json":
            runnables += npm_scripts(base)
        else:
            kind = SCRIPT_KINDS.get(path.suffix.lower(), "open")
            runnables.append({"id": "file:" + path.name, "type": "file", "file": path.name, "kind": kind,
                              "label": path.name, "hint": KIND_HINT.get(kind, "Opens with its default program")})
    else:
        base = path
        runnables += npm_scripts(path)
        try:
            children = sorted(path.iterdir(), key=lambda x: x.name.lower())
        except OSError:
            children = []
        for sub in children:
            if sub.is_dir() and sub.name not in SKIP_DIRS and (sub / "package.json").exists():
                runnables += npm_scripts(sub, sub.name)
        for f in children:
            kind = SCRIPT_KINDS.get(f.suffix.lower())
            if f.is_file() and kind:
                runnables.append({"id": "file:" + f.name, "type": "file", "file": f.name, "kind": kind,
                                  "label": f.name, "hint": KIND_HINT.get(kind, "")})
    has_python = any(r.get("kind") == "python" for r in runnables)
    return {
        "ok": True, "kind": "file" if path.is_file() else "folder", "path": str(path), "base": str(base),
        "name": (path.parent.name if path.name.lower() == "package.json" else (path.stem if path.is_file() else path.name)),
        "runnables": runnables, "has_python": has_python,
        "venv_python": find_venv_python(base), "default_python": default_python(),
    }


# ------------------------------------------------------------- commands ---
def q(s):
    s = str(s)
    if IS_WIN:
        return '"%s"' % s
    import shlex
    return shlex.quote(s)


def build_command(entry, cmd):
    """Return (command line, working folder, kind)."""
    base = Path(entry.get("base") or entry.get("path") or ".")
    args = (entry.get("args") or "").strip()
    if cmd.get("type") == "npm":
        cwd = base / (cmd.get("cwd") or "")
        pm = cmd.get("pm") or "npm"
        line = "%s run %s" % (pm, q(cmd["script"]) if " " in cmd["script"] else cmd["script"])
        if args:
            line += (" " if pm == "yarn" else " -- ") + args
        return line, cwd, "npm"
    f = base / cmd["file"]
    cwd = f.parent
    kind = SCRIPT_KINDS.get(f.suffix.lower(), "open")
    if kind == "python":
        py = (entry.get("python") or "").strip() or find_venv_python(cwd) or default_python()
        line = "%s -u %s" % (q(py), q(f))
    elif kind == "batch":
        line = ("call %s" if IS_WIN else "bash %s") % q(f)
    elif kind == "powershell":
        line = "powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File %s" % q(f)
    elif kind == "node":
        line = "node %s" % q(f)
    elif kind == "tsx":
        line = "npx --yes tsx %s" % q(f)
    elif kind == "exe":
        line = q(f)
    elif kind == "shell":
        line = "bash %s" % q(f)
    else:
        return None, cwd, "open"
    if args:
        line += " " + args
    return line, cwd, kind


def safe_name(s):
    return re.sub(r"[^A-Za-z0-9._-]+", "-", s).strip("-")[:60] or "run"


def pid_alive(pid):
    if IS_WIN:
        import ctypes
        k32 = ctypes.windll.kernel32
        h = k32.OpenProcess(0x1000, False, int(pid))  # PROCESS_QUERY_LIMITED_INFORMATION
        if not h:
            return False
        code = ctypes.c_ulong()
        ok = k32.GetExitCodeProcess(h, ctypes.byref(code))
        k32.CloseHandle(h)
        return bool(ok) and code.value == 259  # STILL_ACTIVE
    try:
        os.kill(int(pid), 0)
        return True
    except OSError:
        return False


def alive(run):
    if run.get("pids") is not None:  # found running outside the launcher
        return any(pid_alive(p) for p in run["pids"])
    return run["proc"] is not None and run["proc"].poll() is None


def reap():
    """Close logs of finished runs and keep only the latest finished run per command."""
    with LOCK:
        finished = {}
        live_keys = set()
        for rid, r in list(RUNS.items()):
            key = (r["entry"], r["cmd_id"])
            if alive(r):
                live_keys.add(key)
                continue
            if r["exit"] is None:
                r["exit"] = r["proc"].returncode if r["proc"] else 0
                r["ended"] = time.time()
            if r.get("logf"):
                try:
                    r["logf"].close()
                except Exception:
                    pass
                r["logf"] = None
            finished.setdefault(key, []).append(r)
        for key, lst in finished.items():
            lst.sort(key=lambda x: x["started"])
            drop = lst if key in live_keys else lst[:-1]
            for r in drop:
                RUNS.pop(r["id"], None)


def runs_snapshot():
    reap()
    with LOCK:
        out = []
        for r in RUNS.values():
            out.append({
                "id": r["id"], "entry": r["entry"], "cmd_id": r["cmd_id"], "label": r["label"],
                "mode": r["mode"], "alive": alive(r), "exit": r["exit"], "stopped": r["stopped"],
                "started": r["started"], "pid": r["proc"].pid if r["proc"] else (r.get("pids") or [None])[0],
                "has_log": bool(r.get("log")),
            })
        out.sort(key=lambda x: x["started"])
        return out


def start_entry(entry, mode=None, cmd_id=None):
    if mode not in ("hidden", "terminal"):
        mode = entry.get("mode") or "hidden"
    started, skipped, errors = 0, 0, []
    base = Path(entry.get("base") or entry.get("path") or "")
    if not base.exists():
        return 0, 0, ["%s: the folder %s no longer exists." % (entry.get("name"), base)]
    cmds = entry.get("commands") or []
    if cmd_id:
        cmds = [c for c in cmds if c.get("id") == cmd_id]
    if not cmds:
        return 0, 0, ["%s has nothing selected to start." % entry.get("name")]
    for cmd in cmds:
        with LOCK:
            if any(r["entry"] == entry["id"] and r["cmd_id"] == cmd["id"] and alive(r) for r in RUNS.values()):
                skipped += 1
                continue
        try:
            line, cwd, kind = build_command(entry, cmd)
            if not Path(cwd).exists():
                errors.append("%s: %s does not exist." % (cmd["label"], cwd))
                continue
            if kind == "open":
                target = base / cmd["file"]
                if IS_WIN:
                    os.startfile(str(target))  # type: ignore[attr-defined]
                else:
                    subprocess.Popen(["xdg-open", str(target)])
                started += 1
                continue
            env = os.environ.copy()
            env["PYTHONUNBUFFERED"] = "1"
            env["PYTHONIOENCODING"] = "utf-8"
            run = {"id": uuid.uuid4().hex[:12], "entry": entry["id"], "cmd_id": cmd["id"], "label": cmd["label"],
                   "mode": mode, "exit": None, "stopped": False, "started": time.time(), "log": None, "logf": None,
                   "proc": None}
            if mode == "terminal":
                keep = entry.get("keep_open", True)
                if IS_WIN:
                    title = re.sub(r'[&|<>^"%]', "", "%s - %s" % (entry.get("name", ""), cmd["label"]))
                    full = 'cmd /s /%s "title %s & %s"' % ("k" if keep else "c", title, line)
                    proc = subprocess.Popen(full, cwd=str(cwd), env=env, creationflags=NEW_CONSOLE)
                else:
                    proc = subprocess.Popen(["bash", "-c", line], cwd=str(cwd), env=env, start_new_session=True)
            else:
                LOG_DIR.mkdir(exist_ok=True)
                log = LOG_DIR / ("%s--%s.log" % (safe_name(entry.get("name", "")), safe_name(cmd["label"])))
                logf = open(log, "wb")
                logf.write(("> %s\n> in %s\n\n" % (line, cwd)).encode("utf-8"))
                logf.flush()
                if IS_WIN:
                    proc = subprocess.Popen('cmd /s /c "%s"' % line, cwd=str(cwd), env=env, stdout=logf,
                                            stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, creationflags=NO_WINDOW)
                else:
                    proc = subprocess.Popen(["bash", "-c", line], cwd=str(cwd), env=env, stdout=logf,
                                            stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, start_new_session=True)
                run["log"], run["logf"] = str(log), logf
            run["proc"] = proc
            with LOCK:
                RUNS[run["id"]] = run
            started += 1
        except Exception as ex:  # noqa: BLE001
            errors.append("%s: %s" % (cmd.get("label"), ex))
    url = (entry.get("url") or "").strip()
    if started and url:
        delay = float(entry.get("url_delay") or 0)
        threading.Timer(max(0.0, delay), webbrowser.open, [url]).start()
    return started, skipped, errors


def kill_run(r):
    if not alive(r):
        return
    r["stopped"] = True
    if r.get("pids") is not None:
        for pid in r["pids"]:
            try:
                if IS_WIN:
                    subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True,
                                   creationflags=NO_WINDOW)
                else:
                    os.kill(pid, signal.SIGTERM)
            except Exception:
                pass
        return
    p = r["proc"]
    try:
        if IS_WIN:
            subprocess.run(["taskkill", "/PID", str(p.pid), "/T", "/F"], capture_output=True, creationflags=NO_WINDOW)
        else:
            os.killpg(p.pid, signal.SIGTERM)
            try:
                p.wait(3)
            except subprocess.TimeoutExpired:
                os.killpg(p.pid, signal.SIGKILL)
    except Exception:
        try:
            p.kill()
        except Exception:
            pass


def stop_where(pred):
    with LOCK:
        targets = [r for r in RUNS.values() if alive(r) and pred(r)]
    for r in targets:
        kill_run(r)
    time.sleep(0.2)
    return len(targets)


# ------------------------------------------------- finding running scripts ---
# Shells and package managers that sit between a found script and the launcher or terminal that started it.
WRAPPERS = {"cmd.exe", "node.exe", "npm", "npm.cmd", "pnpm.exe", "pnpm", "yarn", "yarn.exe", "bun.exe", "bun",
            "npx", "sh", "bash", "node"}


def list_processes():
    """Return {pid: (parent pid, name, command line)} for every process we can see."""
    procs = {}
    if IS_WIN:
        ps = ("[Console]::OutputEncoding = [Text.Encoding]::UTF8; "
              "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,Name,CommandLine "
              "| ConvertTo-Json -Compress")
        res = subprocess.run(["powershell", "-NoLogo", "-NoProfile", "-Command", ps], capture_output=True,
                             text=True, encoding="utf-8", errors="replace", creationflags=NO_WINDOW, timeout=30)
        rows = json.loads(res.stdout or "[]")
        for p in rows if isinstance(rows, list) else [rows]:
            procs[p["ProcessId"]] = (p["ParentProcessId"], (p["Name"] or "").lower(), p["CommandLine"] or "")
    else:
        res = subprocess.run(["ps", "-eo", "pid=,ppid=,comm=,args="], capture_output=True, text=True, timeout=30)
        for line in res.stdout.splitlines():
            parts = line.split(None, 3)
            if len(parts) >= 3:
                procs[int(parts[0])] = (int(parts[1]), os.path.basename(parts[2]).lower(),
                                        parts[3] if len(parts) > 3 else "")
    return procs


def process_cwd(pid):
    """Working folder of another process, or None when it cannot be read."""
    if not IS_WIN:
        try:
            return os.readlink("/proc/%d/cwd" % pid)
        except OSError:
            return None
    import ctypes
    import struct
    from ctypes import wintypes
    if struct.calcsize("P") != 8:
        return None
    k32, ntdll = ctypes.windll.kernel32, ctypes.windll.ntdll
    k32.OpenProcess.restype = wintypes.HANDLE
    k32.ReadProcessMemory.argtypes = [wintypes.HANDLE, ctypes.c_void_p, ctypes.c_void_p, ctypes.c_size_t,
                                      ctypes.POINTER(ctypes.c_size_t)]
    ntdll.NtQueryInformationProcess.argtypes = [wintypes.HANDLE, ctypes.c_ulong, ctypes.c_void_p, ctypes.c_ulong,
                                                ctypes.c_void_p]
    h = k32.OpenProcess(0x0410, False, int(pid))  # QUERY_INFORMATION | VM_READ
    if not h:
        return None
    try:
        pbi = (ctypes.c_void_p * 6)()  # PROCESS_BASIC_INFORMATION; [1] is the PEB address
        if ntdll.NtQueryInformationProcess(h, 0, pbi, ctypes.sizeof(pbi), None) != 0 or not pbi[1]:
            return None

        def read(addr, size):
            buf = ctypes.create_string_buffer(size)
            n = ctypes.c_size_t()
            if not k32.ReadProcessMemory(h, ctypes.c_void_p(addr), buf, size, ctypes.byref(n)) or n.value != size:
                raise OSError
            return buf.raw

        params = struct.unpack("<Q", read(pbi[1] + 0x20, 8))[0]  # PEB.ProcessParameters
        length, _, buf_addr = struct.unpack("<HH4xQ", read(params + 0x38, 16))  # CurrentDirectory.DosPath
        if not length or length > 4096:
            return None
        return read(buf_addr, length).decode("utf-16-le")
    except OSError:
        return None
    finally:
        k32.CloseHandle(h)


def norm_cmdline(s):
    s = s.replace('"', "").replace("'", "")
    if IS_WIN:
        s = re.sub(r"[\\/]+", r"\\", s).lower()
    return s


def command_marker(entry, cmd):
    """Text that shows up in the command line of a process started for this command."""
    base = Path(entry.get("base") or entry.get("path") or ".")
    if cmd.get("type") == "npm":
        p = str(base / (cmd.get("cwd") or "") / "node_modules") + os.sep
    else:
        p = str(base / cmd["file"])
    return norm_cmdline(p)


def tracked_pids(procs):
    """Pids that belong to runs the launcher already knows about, children included."""
    with LOCK:
        roots = set()
        for r in RUNS.values():
            if alive(r):
                roots.update(r.get("pids") or ([r["proc"].pid] if r["proc"] else []))
    out, changed = set(roots), True
    while changed:
        changed = False
        for pid, (ppid, _, _) in procs.items():
            if ppid in out and pid not in out:
                out.add(pid)
                changed = True
    return out


def climb(pid, procs, matched):
    """Walk up from a matching process to the outermost process that was started for it."""
    me = os.getpid()
    seen = {pid}
    while True:
        ppid = procs[pid][0]
        if ppid in seen or ppid not in procs or ppid == me:
            return pid
        _, name, line = procs[ppid]
        # An interactive shell (cmd without /c or /k) is the user's own window: never take that down.
        is_wrapper = name in WRAPPERS and not (name == "cmd.exe" and not re.search(r"\s/[ck]\b", line, re.I))
        if ppid not in matched and not is_wrapper:
            return pid
        seen.add(ppid)
        pid = ppid


def detect_entry(entry):
    """Adopt processes of this entry that are running but not tracked. Returns how many commands were found."""
    procs = list_processes()
    known = tracked_pids(procs)
    known.add(os.getpid())
    found = 0
    for cmd in entry.get("commands") or []:
        with LOCK:
            if any(r["entry"] == entry["id"] and r["cmd_id"] == cmd["id"] and alive(r) for r in RUNS.values()):
                continue
        if cmd.get("type") != "npm" and SCRIPT_KINDS.get(Path(cmd.get("file", "")).suffix.lower()) is None:
            continue  # plain files are opened, not run
        marker = command_marker(entry, cmd)
        matched = {pid for pid, (_, name, line) in procs.items()
                   if pid not in known and name != "powershell.exe" and marker in norm_cmdline(line)}
        if cmd.get("type") == "npm" and not matched:
            # Some scripts run with relative paths only ("node dist/index.js"). Then look for the
            # "<pm> run <script>" process itself and check which folder it was started in.
            folder = norm_cmdline(str(Path(entry.get("base") or entry.get("path") or ".") / (cmd.get("cwd") or "")))
            pat = re.compile(r"\brun\s+" + re.escape(cmd["script"].lower()) + r"(\s|$)")
            for pid, (_, name, line) in procs.items():
                if pid in known or name not in WRAPPERS or not pat.search(line.lower()):
                    continue
                cwd = process_cwd(pid)
                if cwd and norm_cmdline(cwd).rstrip("\\/") == folder.rstrip("\\/"):
                    matched.add(pid)
        if not matched:
            continue
        roots = sorted({climb(pid, procs, matched) for pid in matched} - known)
        if not roots:
            continue
        run = {"id": uuid.uuid4().hex[:12], "entry": entry["id"], "cmd_id": cmd["id"], "label": cmd["label"],
               "mode": "external", "exit": None, "stopped": False, "started": time.time(), "log": None,
               "logf": None, "proc": None, "pids": roots}
        with LOCK:
            RUNS[run["id"]] = run
        found += 1
    return found


# ------------------------------------------------------------------ API ---
BROWSE_CODE = r'''
import sys, tkinter as tk
from tkinter import filedialog
r = tk.Tk(); r.withdraw(); r.attributes("-topmost", True); r.update()
kind, initial = sys.argv[1], sys.argv[2]
opts = dict(parent=r, initialdir=initial or None)
if kind == "folder":
    p = filedialog.askdirectory(title="Choose a project folder", mustexist=True, **opts)
else:
    p = filedialog.askopenfilename(title="Choose a script", filetypes=[
        ("Scripts and package.json", "*.py *.pyw *.bat *.cmd *.ps1 *.js *.mjs *.cjs *.ts *.sh *.exe package.json"),
        ("All files", "*.*")], **opts)
sys.stdout.write(p or "")
'''


def api_browse(body):
    kind = "folder" if body.get("kind") == "folder" else "file"
    initial = body.get("initial") or ""
    if initial and Path(initial).is_file():
        initial = str(Path(initial).parent)
    try:
        res = subprocess.run([console_python(), "-c", BROWSE_CODE, kind, initial], capture_output=True, text=True,
                             creationflags=NO_WINDOW, timeout=900)
    except Exception as ex:  # noqa: BLE001
        return {"ok": False, "error": "Could not open the picker (%s). Paste the path instead." % ex}
    if res.returncode != 0:
        return {"ok": False, "error": "Could not open the picker. Paste the path instead."}
    p = res.stdout.strip()
    if IS_WIN:
        p = p.replace("/", "\\")
    return {"ok": True, "path": p}


def api_start(body):
    e = find_entry(body.get("entry"))
    if not e:
        return {"ok": False, "error": "That entry no longer exists."}
    started, skipped, errors = start_entry(e, body.get("mode"), body.get("cmd"))
    msg = None
    if skipped and not started and not errors:
        msg = "That is already running."

    if errors:
        return {"ok": False, "error": " ".join(errors), "runs": runs_snapshot()}
    return {"ok": True, "message": msg, "runs": runs_snapshot()}


def api_stop(body):
    if body.get("run"):
        n = stop_where(lambda r: r["id"] == body["run"])
    elif body.get("cmd"):
        n = stop_where(lambda r: r["entry"] == body.get("entry") and r["cmd_id"] == body["cmd"])
    else:
        n = stop_where(lambda r: r["entry"] == body.get("entry"))
    return {"ok": True, "stopped": n, "runs": runs_snapshot()}


def api_start_group(body):
    gid = body.get("group") or ""
    entries = [e for e in DATA["entries"] if group_of(e) == gid]
    group = next((g for g in DATA["groups"] if g.get("id") == gid), {})
    delay = float(group.get("delay") or 0)
    mode = body.get("mode")
    errors = []
    if not entries:
        return {"ok": False, "error": "This group is empty."}
    first, rest = entries[0], entries[1:]
    _, _, errs = start_entry(first, mode)
    errors += errs

    def worker():
        for e in rest:
            if delay:
                time.sleep(delay)
            start_entry(e, mode)
    if rest:
        threading.Thread(target=worker, daemon=True).start()
    out = {"ok": True, "message": "Starting %d entries." % len(entries) if len(entries) > 1 else None,
           "runs": runs_snapshot()}
    if errors:
        out["warning"] = " ".join(errors)
    return out


def api_stop_group(body):
    gid = body.get("group") or ""
    ids = {e["id"] for e in DATA["entries"] if group_of(e) == gid}
    n = stop_where(lambda r: r["entry"] in ids)
    return {"ok": True, "stopped": n, "runs": runs_snapshot()}


def api_open(body):
    if body.get("url"):
        webbrowser.open(body["url"])
        return {"ok": True}
    p = Path(body.get("path") or "")
    if p.is_file():
        p = p.parent
    if not p.exists():
        return {"ok": False, "error": "That folder does not exist."}
    if IS_WIN:
        os.startfile(str(p))  # type: ignore[attr-defined]
    else:
        subprocess.Popen(["xdg-open", str(p)])
    return {"ok": True}


def api_data(body):
    save_data(body)
    return {"ok": True}


def api_inspect(body):
    return inspect_path(body.get("path"))


def api_quit(body):
    if body.get("stop", True):
        stop_where(lambda r: True)

    def bye():
        time.sleep(0.3)
        try:
            SESSION_FILE.unlink()
        except OSError:
            pass
        os._exit(0)
    threading.Thread(target=bye, daemon=True).start()
    return {"ok": True}


def api_detect(body):
    e = find_entry(body.get("entry"))
    if not e:
        return {"ok": False, "error": "That entry no longer exists."}
    try:
        found = detect_entry(e)
    except Exception as ex:  # noqa: BLE001
        return {"ok": False, "error": "Could not check the running programs (%s)." % ex}
    return {"ok": True, "found": found, "runs": runs_snapshot()}


def read_log(run_id, limit=200_000):
    with LOCK:
        r = RUNS.get(run_id)
        if not r or not r.get("log"):
            return {"ok": False, "error": "There is no output for this run."}
        path, is_alive = r["log"], alive(r)
    try:
        with open(path, "rb") as f:
            f.seek(0, 2)
            size = f.tell()
            f.seek(max(0, size - limit))
            text = f.read().decode("utf-8", "replace")
    except OSError:
        text = ""
    return {"ok": True, "text": text, "alive": is_alive, "truncated": size > limit}


ROUTES = {
    "/api/data": api_data, "/api/inspect": api_inspect, "/api/browse": api_browse,
    "/api/start": api_start, "/api/stop": api_stop, "/api/start-group": api_start_group,
    "/api/stop-group": api_stop_group, "/api/open": api_open, "/api/quit": api_quit,
    "/api/detect": api_detect,
}


class Handler(BaseHTTPRequestHandler):
    server_version = "ProjectLauncher/1"

    def log_message(self, *args):
        pass

    def _send(self, code, body, ctype="application/json; charset=utf-8"):
        b = body if isinstance(body, bytes) else body.encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(b)

    def _json(self, obj, code=200):
        self._send(code, json.dumps(obj))

    def _host_ok(self):
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0]
        return host in ("127.0.0.1", "localhost")

    def do_GET(self):  # noqa: N802
        if not self._host_ok():
            return self._send(403, "Forbidden", "text/plain")
        u = urlparse(self.path)
        if u.path in UI_FILES:
            name, ctype = UI_FILES[u.path]
            try:
                body = (UI_DIR / name).read_text("utf-8")
            except OSError:
                return self._send(500, "The ui folder is missing next to launcher.pyw.", "text/plain")
            if name == "index.html":
                body = body.replace("__TOKEN__", TOKEN)
            return self._send(200, body, ctype)
        if u.path == "/api/ping":
            return self._json({"ok": parse_qs(u.query).get("t", [""])[0] == TOKEN})
        if self.headers.get("X-Token") != TOKEN:
            return self._json({"ok": False, "error": "Not allowed."}, 403)
        if u.path == "/api/state":
            return self._json({"ok": True, "data": DATA, "runs": runs_snapshot(), "platform": sys.platform})
        if u.path == "/api/log":
            return self._json(read_log(parse_qs(u.query).get("run", [""])[0]))
        return self._json({"ok": False, "error": "Not found."}, 404)

    def do_POST(self):  # noqa: N802
        if not self._host_ok() or self.headers.get("X-Token") != TOKEN:
            return self._json({"ok": False, "error": "Not allowed."}, 403)
        route = ROUTES.get(urlparse(self.path).path)
        if not route:
            return self._json({"ok": False, "error": "Not found."}, 404)
        try:
            n = int(self.headers.get("Content-Length") or 0)
            body = json.loads(self.rfile.read(n) or b"{}")
            return self._json(route(body))
        except Exception as ex:  # noqa: BLE001
            return self._json({"ok": False, "error": str(ex)}, 500)


# -------------------------------------------------------------- window ---
def open_window(url):
    if IS_WIN:
        candidates = []
        for env in ("PROGRAMFILES(X86)", "PROGRAMFILES", "LOCALAPPDATA"):
            root = os.environ.get(env)
            if root:
                candidates.append(Path(root) / "Microsoft/Edge/Application/msedge.exe")
                candidates.append(Path(root) / "Google/Chrome/Application/chrome.exe")
        for exe in candidates:
            if exe.exists():
                subprocess.Popen([str(exe), "--app=" + url, "--window-size=1240,820"], creationflags=NO_WINDOW)
                return
    webbrowser.open(url)


def existing_instance():
    try:
        s = json.loads(SESSION_FILE.read_text("utf-8"))
        url = "http://127.0.0.1:%d/" % s["port"]
        with urlopen(url + "api/ping?t=" + s["token"], timeout=1.5) as r:
            if json.loads(r.read()).get("ok"):
                return url
    except Exception:
        return None
    return None


def main():
    no_window = "--no-window" in sys.argv
    url = existing_instance()
    if url:
        if not no_window:
            open_window(url)
        return
    load_data()
    try:
        server = ThreadingHTTPServer(("127.0.0.1", DEFAULT_PORT), Handler)
    except OSError:
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    port = server.server_address[1]
    SESSION_FILE.write_text(json.dumps({"port": port, "token": TOKEN}), "utf-8")
    url = "http://127.0.0.1:%d/" % port
    print("Project launcher running at", url, flush=True) if sys.stdout else None
    if not no_window:
        threading.Timer(0.3, open_window, [url]).start()
    try:
        server.serve_forever()
    finally:
        try:
            SESSION_FILE.unlink()
        except OSError:
            pass


if __name__ == "__main__":
    main()
