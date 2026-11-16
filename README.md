# Project launcher

A small desktop app for starting, grouping and stopping your project scripts on Windows. Add a project folder, a `package.json` or a single script, give it a name, an icon and a colour, and start it from one window.

- **npm and Python first.** Finds the npm scripts in `package.json` (also in subfolders such as `client/`, and with pnpm, yarn or bun when the project uses them), plus `.py`, `.bat`, `.cmd`, `.ps1`, `.js` and `.ts` files. Python files run with the project's own `.venv` when there is one.
- **Each script on its own.** Every script in a folder entry gets its own Start and Stop button, with Start all and Stop all for the entry.
- **Hidden or in a terminal.** Run a script in the background, with its output shown in the app, or in a visible terminal window. Both can be stopped from the app, including any programs the script started.
- **Groups.** Put entries from different places together, start or stop a whole group at once, and set a wait between starts. Drag cards between groups.
- **Light and dark theme**, styled with the Pinpoint Studio design system (Gruppo and Jost, hairlines and hard offset shadows).

Only the Python standard library is used, so there is nothing to install.

## Start it

1. Install Python 3.9 or newer (Miniconda or python.org both work).
2. Double-click `Start Project Launcher.bat`, or run `pythonw launcher.pyw` from this folder.

The app opens in an app-style Microsoft Edge window (Chrome is used if Edge is missing, otherwise your default browser). Closing the window keeps your scripts running; open the launcher again to come back to them. The power button in the top right quits the launcher.

## How it works

`launcher.pyw` runs a small web server on `127.0.0.1` (port 47821, or a free one if that is taken) and serves the interface from `ui/`. The interface talks to it through a JSON API that only accepts requests carrying the token that is injected into the page at load time, and only from `localhost`.

| Path | What it is |
|---|---|
| `launcher.pyw` | Server, script detection and process management (start, stop, logs) |
| `ui/index.html` | Page structure and the dialogs |
| `ui/styles.css` | All styling; colour, type and spacing tokens are at the top |
| `ui/app.js` | Interface logic: rendering cards and groups, dialogs, drag and drop, polling |
| `Start Project Launcher.bat` | Starts the launcher without a console window |

Files made while it runs, ignored by git:

| Path | What it is |
|---|---|
| `launcher-data.json` | Your entries, groups and settings |
| `launcher-logs/` | Output of scripts started hidden (one file per script, replaced on each start) |
| `.launcher-session.json` | Port and token of the running launcher, used to open the existing window instead of a second copy |

## Where to change things

- **Colours, fonts, spacing:** the CSS variables at the top of `ui/styles.css` (light theme in `:root`, dark theme in `[data-theme=dark]`).
- **Entry colours and icons:** `COLOURS` and `ICONS` at the top of `ui/app.js`. Icons are 24×24 SVG paths with a 1.5px stroke.
- **Which files count as scripts, and how they run:** `SCRIPT_KINDS` and `build_command()` in `launcher.pyw`.
- **Which scripts are ticked by default:** `defaultSelection()` in `ui/app.js`.
- **The port:** `DEFAULT_PORT` in `launcher.pyw`.

After changing a file in `ui/`, reload the window (Ctrl+R). After changing `launcher.pyw`, quit the launcher with the power button and start it again.

## Notes

- Stopping uses `taskkill /T /F`, which ends the whole process tree straight away; scripts get no chance to clean up.
- If you quit the launcher without stopping scripts, they keep running but the launcher no longer tracks them after it restarts.
- `.sh` files need `bash` on your PATH (for example from Git for Windows).
