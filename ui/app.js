"use strict";
const TOKEN = window.LAUNCHER_TOKEN;

/* ---------- icons (1.5px outline, rounded joins) ---------- */
const ICONS = {
  terminal:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/>',
  code:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
  server:'<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
  database:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  rocket:'<path d="M12 3c3 2 5 5.5 5 9.5L15 17H9l-2-4.5C7 8.5 9 5 12 3z"/><circle cx="12" cy="10" r="1.6"/><path d="M9 17l-2 3M15 17l2 3M12 17v4"/>',
  bot:'<rect x="5" y="8" width="14" height="11" rx="3"/><path d="M12 4v4M9.5 13h.01M14.5 13h.01M10 16h4M3 12v3M21 12v3"/>',
  flask:'<path d="M9 3h6M10 3v6L5 18a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3L14 9V3M7.5 14h9"/>',
  gamepad:'<path d="M7 8h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.4 1.8L15 14H9l-.6.8A3 3 0 0 1 3 13v-1a4 4 0 0 1 4-4z"/><path d="M8 10v3M6.5 11.5h3M15 11h.01M17 12.5h.01"/>',
  music:'<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
  chart:'<path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>',
  folder:'<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  box:'<path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8"/>',
  zap:'<path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z"/>',
  leaf:'<path d="M5 19C5 11 10 5 20 5c0 10-6 15-14 15M5 19l7-7"/>',
  cpu:'<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"/>',
  cloud:'<path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9.2 4.5 4.5 0 0 1 17.5 18z"/>',
  book:'<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3"/>',
  camera:'<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
  home:'<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  wrench:'<path d="M14.7 6.3a4 4 0 0 0 5 5l-8.2 8.2a2.1 2.1 0 0 1-3-3zM14.7 6.3L17.5 3.5a5 5 0 0 1 3 3l-2.8 2.8"/>',
  heart:'<path d="M12 20s-7-4.4-9-9a4.5 4.5 0 0 1 9-3 4.5 4.5 0 0 1 9 3c-2 4.6-9 9-9 9z"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  pin:'<circle cx="12" cy="8" r="4.5"/><path d="M12 12.5V21M10.5 8h3"/>',
  quarter:'<path d="M4 20V4a16 16 0 0 1 16 16z"/>',
};
const UI = {
  play:'<path d="M8 5.5v13l10.5-6.5z"/>',
  stop:'<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/>',
  chevron:'<path d="M6 9l6 6 6-6"/>',
  dots:'<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  close:'<path d="M6 6l12 12M18 6L6 18"/>',
  power:'<path d="M12 3v8M6.4 6.6a8 8 0 1 0 11.2 0"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  edit:'<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  folder:ICONS.folder,
  external:'<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  terminal:ICONS.terminal,
  eyeoff:'<path d="M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 8.5 4.5 9.5 6a17 17 0 0 1-2.6 3.2M6.6 6.6C4.4 8 3 10 2.5 12c1 1.5 4.5 6 9.5 6 1.6 0 3-.4 4.3-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  restart:'<path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4"/>',
  refresh:'<path d="M19.5 9A8 8 0 0 0 5 7.5M4 4v4h4M4.5 15A8 8 0 0 0 19 16.5M20 20v-4h-4"/>',
  up:'<path d="M12 19V5M6 11l6-6 6 6"/>',
  down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
  output:'<path d="M4 6h16M4 10h16M4 14h10M4 18h7"/>',
  alert:'<path d="M12 4l9 16H3zM12 10v4M12 17h.01"/>',
  move:'<path d="M5 12h14M13 6l6 6-6 6"/>',
};
const COLOURS = [
  ["#0A9A55","Green"],["#8FD9B6","Mint"],["#A9D2EE","Sky"],["#4F86C6","Blue"],["#B7A6E0","Lilac"],
  ["#E8A0B4","Rose"],["#F08A6C","Coral"],["#F2B84B","Amber"],["#5B6663","Slate"],["#111A1E","Ink"],
];
const svg = (name, cls="") => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || UI[name] || ICONS.terminal}</svg>`;
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const stripAnsi = s => s.replace(/\x1b\[[0-9;?]*[ -\/]*[@-~]/g, "").replace(/\x1b\][^\x07]*\x07/g, "").replace(/\r(?!\n)/g, "\n");

function textOn(hex){
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || ""); if(!m) return "#111A1E";
  const n = parseInt(m[1],16), ch = [n>>16&255, n>>8&255, n&255].map(v => { v/=255; return v<=.03928 ? v/12.92 : ((v+.055)/1.055)**2.4; });
  const L = .2126*ch[0] + .7152*ch[1] + .0722*ch[2];
  return (L + .05) / .05 >= 4.5 ? "#111A1E" : "#FFFFFF";
}

/* ---------- server ---------- */
async function api(path, body){
  const opt = { method: body === undefined ? "GET" : "POST", headers: {"X-Token": TOKEN} };
  if(body !== undefined){ opt.headers["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
  let r;
  try { r = await fetch(path, opt); } catch(_) { throw new Error("The launcher is not answering."); }
  const j = await r.json().catch(() => ({ok:false, error:"The launcher sent an answer I could not read."}));
  if(!r.ok || j.ok === false){ const err = new Error(j.error || ("Request failed (" + r.status + ")")); err.payload = j; throw err; }
  return j;
}

let data = {groups:[], entries:[], settings:{}};
let runs = [];
let filter = "";
let dragId = null;
let lastSig = "";
let failures = 0;

async function save(){ try { await api("/api/data", data); } catch(e){ toast(e.message, "danger"); } }
function runsFor(id){ return runs.filter(r => r.entry === id); }
function liveFor(id){ return runs.filter(r => r.entry === id && r.alive); }
function groupIdOf(e){ return data.groups.some(g => g.id === e.group) ? e.group : ""; }
function entryById(id){ return data.entries.find(e => e.id === id); }
function groupById(id){ return data.groups.find(g => g.id === id); }
function setRuns(r){ if(r){ runs = r; lastSig = sigOf(runs); } }
const sigOf = rs => JSON.stringify(rs.map(r => [r.id, r.alive, r.exit]));

/* ---------- toasts ---------- */
function toast(msg, kind="info", ms){
  const t = document.createElement("div");
  t.className = "toast pp-float " + kind;
  const word = kind === "danger" ? "<strong>Error:</strong> " : kind === "warning" ? "<strong>Warning:</strong> " : "";
  t.innerHTML = `<div>${word}${esc(msg)}</div><button class="icon-btn" aria-label="Dismiss">${svg("close")}</button>`;
  t.querySelector("button").onclick = () => t.remove();
  $("#toasts").appendChild(t);
  setTimeout(() => t.remove(), ms || (kind === "danger" ? 9000 : 4000));
}

/* ---------- theme ---------- */
function applyTheme(){
  const pref = data.settings?.theme;
  const dark = pref ? pref === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  $("#themeBtn").innerHTML = svg(dark ? "sun" : "moon");
}
$("#themeBtn").onclick = () => {
  data.settings = data.settings || {};
  data.settings.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(); save();
};
$("#quitBtn").innerHTML = svg("power");
$("#logClose").innerHTML = svg("close");
$$("[data-close]").forEach(b => { b.innerHTML = b.innerHTML || svg("close"); b.onclick = () => b.closest("dialog").close(); });

/* ---------- board ---------- */
function shortPath(p){ return (p || "").replace(/^([A-Za-z]:)?[\\/](Users|home)[\\/][^\\/]+/, "~"); }

function render(){
  const board = $("#board");
  const live = runs.filter(r => r.alive).length;
  $("#runningTag").innerHTML = `<span class="pp-tag running-total${live ? " pp-tag-active" : ""}">${live} running</span>`;
  if(!data.entries.length && !data.groups.length){
    board.innerHTML = `<div class="empty"><div class="art" aria-hidden="true"><span class="q"></span><span class="h"></span><span class="s"></span></div>
      <h2>No projects yet</h2><p>Add a project folder or a script, give it a name, an icon and a colour, and start it from here.</p>
      <button class="pp-btn pp-btn-secondary" data-act="new-entry">Add your first entry</button></div>`;
    return;
  }
  const q = filter.trim().toLowerCase();
  const match = e => !q || (e.name + " " + e.path + " " + (e.commands||[]).map(c => c.label).join(" ")).toLowerCase().includes(q);
  const sections = data.groups.map(g => ({g, items: data.entries.filter(e => e.group === g.id)}));
  const loose = data.entries.filter(e => !groupIdOf(e));
  if(loose.length || !data.groups.length) sections.push({g:{id:"", name:"Ungrouped", virtual:true}, items:loose});
  let html = "", shown = 0;
  for(const {g, items} of sections){
    const vis = items.filter(match);
    if(q && !vis.length) continue;
    shown += vis.length;
    html += groupHtml(g, vis, items);
  }
  if(q && !shown) html = `<div class="no-results">Nothing matches “${esc(filter)}”.</div>`;
  board.innerHTML = html;
}

function groupHtml(g, vis, all){
  const liveN = all.reduce((n, e) => n + liveFor(e.id).length, 0);
  const collapsed = g.collapsed && !filter;
  return `<section class="group${collapsed ? " collapsed" : ""}" data-group="${esc(g.id)}">
    <div class="group-head" data-drop="${esc(g.id)}">
      ${g.virtual ? "" : `<button class="icon-btn collapse" data-act="collapse" aria-expanded="${!collapsed}" aria-label="Show or hide ${esc(g.name)}">${svg("chevron")}</button>`}
      <h2>${esc(g.name)}</h2>
      <span class="label">${all.length} ${all.length === 1 ? "entry" : "entries"}</span>
      ${liveN ? `<span class="pp-tag pp-tag-active">${liveN} running</span>` : ""}
      <span class="spacer"></span>
      <button class="pp-btn pp-btn-secondary sm" data-act="group-start" ${all.length ? "" : "disabled"}>${svg("play")}Start all</button>
      <button class="pp-btn pp-btn-secondary sm" data-act="group-stop" ${liveN ? "" : "disabled"}>${svg("stop")}Stop all</button>
      <button class="icon-btn" data-act="group-menu" aria-label="More for ${esc(g.name)}" aria-haspopup="menu">${svg("dots")}</button>
    </div>
    <div class="grid" data-drop="${esc(g.id)}">
      ${vis.map(cardHtml).join("") || `<p class="grid-empty">Drag entries here, or pick this group when you add an entry.</p>`}
    </div>
  </section>`;
}

function cardHtml(e){
  const rs = runsFor(e.id), live = rs.filter(r => r.alive), n = (e.commands || []).length;
  const failed = !live.length && rs.find(r => r.exit !== null && r.exit !== 0 && !r.stopped);
  let status, state;
  if(live.length){
    const modes = [...new Set(live.map(r => modeText(r.mode)))].join(", ");
    state = "running";
    status = `<span class="dot" aria-hidden="true"></span>Running${n > 1 ? " " + live.length + " of " + n : ""}<span class="bar-note">${modes}</span>`;
  } else if(failed){
    state = "failed";
    status = `${svg("alert")}Stopped with code ${esc(failed.exit)}`;
  } else {
    state = "idle";
    status = `<span class="dot" aria-hidden="true"></span>Not running<span class="bar-note">${e.mode === "terminal" ? "starts in a terminal" : "starts hidden"}</span>`;
  }
  const hasLog = rs.some(r => r.has_log);
  const multi = n > 1;
  const chips = multi ? `<ul class="cmds">${e.commands.map(c => cmdRowHtml(e, c, rs)).join("")}</ul>`
    : `<div class="chips">${(e.commands || []).map(c => `<span class="chip" title="${esc(c.label)}">${esc(c.label)}</span>`).join("")
    || `<span class="chip muted">Nothing selected to start</span>`}</div>`;
  const notLive = n - live.length;
  return `<article class="card is-${state}" draggable="true" data-id="${esc(e.id)}">
    <div class="card-bar">${status}</div>
    <div class="card-top">
      <div class="tile" style="background:${esc(e.color)};color:${textOn(e.color)}">${svg(e.icon)}</div>
      <div class="meta"><h3 title="${esc(e.name)}">${esc(e.name)}</h3><p class="path" title="${esc(e.path)}"><bdi>${esc(shortPath(e.path))}</bdi></p></div>
      <button class="icon-btn" data-act="entry-menu" aria-label="More for ${esc(e.name)}" aria-haspopup="menu">${svg("dots")}</button>
    </div>
    ${chips}
    <div class="card-foot">
      <button class="icon-btn" data-act="detect" aria-label="Check if ${esc(e.name)} is running" title="Check if it is running">${svg("refresh")}</button>
      ${hasLog && !multi ? `<button class="icon-btn" data-act="output" aria-label="Show output of ${esc(e.name)}" title="Show output">${svg("output")}</button>` : ""}
      <span class="spacer"></span>
      ${live.length ? `<button class="pp-btn pp-btn-danger sm" data-act="stop">${svg("stop")}${multi ? "Stop all" : "Stop"}</button>` : ""}
      ${!live.length || (multi && notLive) ? `<div class="split"><button class="pp-btn pp-btn-secondary sm" data-act="start">${svg("play")}${multi ? (live.length ? "Start rest" : "Start all") : "Start"}</button><button class="pp-btn pp-btn-secondary sm split-arrow" data-act="start-menu" aria-label="Start options for ${esc(e.name)}" aria-haspopup="menu">${svg("chevron")}</button></div>` : ""}
    </div>
  </article>`;
}

function modeText(mode){ return mode === "hidden" ? "hidden" : mode === "external" ? "started outside the launcher" : "in terminal"; }

function cmdRowHtml(e, c, rs){
  const mine = rs.filter(r => r.cmd_id === c.id), run = mine.find(r => r.alive);
  const last = mine[mine.length - 1];
  let state = "";
  if(run) state = `<span class="cmd-state on">Running ${modeText(run.mode)}</span>`;
  else if(last && last.exit !== null && last.exit !== 0 && !last.stopped) state = `<span class="cmd-state warn">${svg("alert")}Stopped with code ${esc(last.exit)}</span>`;
  const label = esc(c.label);
  return `<li class="cmd${run ? " is-on" : ""}" data-cmd="${esc(c.id)}">
    <div class="cmd-text"><span class="cmd-label" title="${label}">${label}</span>${state}</div>
    ${mine.some(r => r.has_log) ? `<button class="icon-btn sm" data-act="cmd-output" aria-label="Show output of ${label}" title="Show output">${svg("output")}</button>` : ""}
    ${run ? `<button class="icon-btn sm stop" data-act="cmd-stop" aria-label="Stop ${label}" title="Stop">${svg("stop")}</button>`
          : `<button class="icon-btn sm play" data-act="cmd-start" aria-label="Start ${label}" title="Start (${e.mode === "terminal" ? "in a terminal" : "hidden"})">${svg("play")}</button>`}
    <button class="icon-btn sm" data-act="cmd-menu" aria-label="More for ${label}" aria-haspopup="menu">${svg("chevron")}</button>
  </li>`;
}

$("#board").addEventListener("click", ev => {
  const b = ev.target.closest("[data-act]"); if(!b) return;
  const card = b.closest(".card"), sec = b.closest(".group");
  const id = card?.dataset.id, gid = sec?.dataset.group ?? "";
  const cmd = b.closest("[data-cmd]")?.dataset.cmd;
  switch(b.dataset.act){
    case "cmd-start": startEntry(id, undefined, cmd); break;
    case "cmd-stop": stopEntry(id, cmd); break;
    case "cmd-output": openLog(id, cmd); break;
    case "cmd-menu": {
      const live = liveFor(id).some(r => r.cmd_id === cmd);
      const items = [
        {label:"Start hidden", icon:"eyeoff", disabled:live, action:() => startEntry(id, "hidden", cmd)},
        {label:"Start in a terminal", icon:"terminal", disabled:live, action:() => startEntry(id, "terminal", cmd)},
      ];
      if(live) items.push({label:"Restart", icon:"restart", action:() => restartEntry(id, cmd)}, {label:"Stop", icon:"stop", action:() => stopEntry(id, cmd)});
      if(runsFor(id).some(r => r.cmd_id === cmd && r.has_log)) items.push({sep:true}, {label:"Show output", icon:"output", action:() => openLog(id, cmd)});
      showMenu(b, items); break;
    }
    case "new-entry": openEntry(null); break;
    case "start": startEntry(id); break;
    case "stop": stopEntry(id); break;
    case "output": openLog(id); break;
    case "detect": detectEntry(id, b); break;
    case "start-menu": showMenu(b, [
      {label:"Start hidden", icon:"eyeoff", action:() => startEntry(id, "hidden")},
      {label:"Start in a terminal", icon:"terminal", action:() => startEntry(id, "terminal")},
    ]); break;
    case "entry-menu": entryMenu(b, id); break;
    case "group-start": startGroup(gid); break;
    case "group-stop": stopGroup(gid); break;
    case "group-menu": groupMenu(b, gid); break;
    case "collapse": { const g = groupById(gid); if(g){ g.collapsed = !g.collapsed; render(); save(); } break; }
  }
});
$("#board").addEventListener("dblclick", ev => {
  const card = ev.target.closest(".card");
  if(card && !ev.target.closest("button")) openEntry(entryById(card.dataset.id));
});

/* drag and drop between groups */
function clearDrop(){ $$(".drop-before,.drop-after,.drop-target").forEach(el => el.classList.remove("drop-before","drop-after","drop-target")); }
function dropPoint(ev){
  const zone = ev.target.closest("[data-drop]"); if(!zone) return null;
  const card = ev.target.closest(".card");
  if(card && card.dataset.id !== dragId){
    const r = card.getBoundingClientRect();
    return {gid: zone.dataset.drop, card, after: ev.clientX > r.left + r.width / 2};
  }
  return {gid: zone.dataset.drop, card: null};
}
$("#board").addEventListener("dragstart", ev => {
  const c = ev.target.closest(".card"); if(!c) return;
  dragId = c.dataset.id; ev.dataTransfer.effectAllowed = "move"; ev.dataTransfer.setData("text/plain", dragId);
  requestAnimationFrame(() => c.classList.add("dragging"));
});
$("#board").addEventListener("dragend", () => { dragId = null; clearDrop(); render(); });
$("#board").addEventListener("dragover", ev => {
  if(!dragId) return;
  const p = dropPoint(ev); if(!p) return;
  ev.preventDefault(); clearDrop();
  if(p.card) p.card.classList.add(p.after ? "drop-after" : "drop-before");
  else ev.target.closest(".group")?.classList.add("drop-target");
});
$("#board").addEventListener("drop", ev => {
  if(!dragId) return;
  const p = dropPoint(ev); if(!p) return;
  ev.preventDefault();
  let beforeId = null;
  if(p.card){
    if(p.after){ const nx = p.card.nextElementSibling; beforeId = nx && nx.classList.contains("card") ? nx.dataset.id : null; }
    else beforeId = p.card.dataset.id;
  }
  if(beforeId === dragId) beforeId = null;
  moveEntry(dragId, p.gid, beforeId);
  dragId = null; clearDrop(); render(); save();
});
function moveEntry(id, gid, beforeId){
  const i = data.entries.findIndex(x => x.id === id); if(i < 0) return;
  const [e] = data.entries.splice(i, 1);
  e.group = gid;
  if(beforeId){ const j = data.entries.findIndex(x => x.id === beforeId); data.entries.splice(j < 0 ? data.entries.length : j, 0, e); return; }
  let last = -1;
  data.entries.forEach((x, k) => { if(groupIdOf(x) === gid) last = k; });
  data.entries.splice(last + 1, 0, e);
}

/* ---------- menus ---------- */
const menu = $("#menu");
function showMenu(anchor, items){
  menu.innerHTML = items.map((it, i) => it.sep ? `<div class="menu-sep" role="separator"></div>`
    : it.heading ? `<div class="menu-heading">${esc(it.heading)}</div>`
    : `<button role="menuitem" class="menu-item${it.danger ? " danger" : ""}" data-i="${i}" ${it.disabled ? "disabled" : ""}>${it.icon ? svg(it.icon) : ""}<span>${esc(it.label)}</span></button>`).join("");
  menu._items = items; menu.hidden = false;
  const r = anchor.getBoundingClientRect(), w = menu.offsetWidth, h = menu.offsetHeight;
  let left = Math.min(r.right - w, innerWidth - w - 12); left = Math.max(12, left);
  let top = r.bottom + 6; if(top + h > innerHeight - 12) top = Math.max(12, r.top - h - 6);
  menu.style.left = left + "px"; menu.style.top = top + "px";
  menu._anchor = anchor;
  menu.querySelector("button:not(:disabled)")?.focus();
}
function hideMenu(){ if(!menu.hidden){ menu.hidden = true; menu._anchor?.isConnected && menu._anchor.focus(); } }
menu.addEventListener("click", ev => {
  const b = ev.target.closest("[data-i]"); if(!b) return;
  const it = menu._items[+b.dataset.i]; hideMenu(); it.action && it.action();
});
menu.addEventListener("keydown", ev => {
  const btns = $$("button:not(:disabled)", menu), i = btns.indexOf(document.activeElement);
  if(ev.key === "ArrowDown"){ ev.preventDefault(); btns[(i + 1) % btns.length]?.focus(); }
  if(ev.key === "ArrowUp"){ ev.preventDefault(); btns[(i - 1 + btns.length) % btns.length]?.focus(); }
});
document.addEventListener("mousedown", ev => { if(!menu.hidden && !menu.contains(ev.target)) hideMenu(); });
document.addEventListener("keydown", ev => {
  if(ev.key === "Escape" && !menu.hidden){ hideMenu(); return; }
  const typing = /INPUT|SELECT|TEXTAREA/.test(document.activeElement?.tagName) || document.querySelector("dialog[open]");
  if(!typing && ev.key === "/"){ ev.preventDefault(); $("#search").focus(); }
  if(!document.querySelector("dialog[open]") && (ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "n"){ ev.preventDefault(); openEntry(null); }
});
window.addEventListener("resize", hideMenu);
window.addEventListener("scroll", hideMenu, true);

function entryMenu(anchor, id){
  const e = entryById(id); if(!e) return;
  const live = liveFor(id).length > 0;
  const others = [...data.groups.filter(g => g.id !== groupIdOf(e)).map(g => ({id:g.id, name:g.name})), ...(groupIdOf(e) ? [{id:"", name:"Ungrouped"}] : [])];
  const items = [
    {label:"Start hidden", icon:"eyeoff", action:() => startEntry(id, "hidden")},
    {label:"Start in a terminal", icon:"terminal", action:() => startEntry(id, "terminal")},
  ];
  if(live) items.push({label:"Restart", icon:"restart", action:() => restartEntry(id)}, {label:"Stop", icon:"stop", action:() => stopEntry(id)});
  items.push({sep:true},
    {label:"Edit", icon:"edit", action:() => openEntry(e)},
    {label:"Duplicate", icon:"copy", action:() => duplicate(id)},
    {label:"Open folder", icon:"folder", action:() => api("/api/open", {path:e.path}).catch(err => toast(err.message, "danger"))});
  if(e.url) items.push({label:"Open " + e.url, icon:"external", action:() => api("/api/open", {url:e.url})});
  if(runsFor(id).some(r => r.has_log)) items.push({label:"Show output", icon:"output", action:() => openLog(id)});
  if(others.length){
    items.push({sep:true}, {heading:"Move to"});
    others.forEach(g => items.push({label:g.name, icon:"move", action:() => { moveEntry(id, g.id, null); render(); save(); }}));
  }
  items.push({sep:true}, {label:"Delete", icon:"trash", danger:true, action:() => deleteEntry(id)});
  showMenu(anchor, items);
}
function groupMenu(anchor, gid){
  const g = groupById(gid);
  const items = [
    {label:"Start all hidden", icon:"eyeoff", action:() => startGroup(gid, "hidden")},
    {label:"Start all in terminals", icon:"terminal", action:() => startGroup(gid, "terminal")},
    {sep:true},
    {label:"Add an entry here", icon:"edit", action:() => openEntry(null, gid)},
  ];
  if(g){
    const i = data.groups.indexOf(g);
    items.push(
      {label:"Rename or set the wait", icon:"edit", action:() => openGroup(g)},
      {label:"Move up", icon:"up", disabled:i === 0, action:() => { data.groups.splice(i - 1, 0, data.groups.splice(i, 1)[0]); render(); save(); }},
      {label:"Move down", icon:"down", disabled:i === data.groups.length - 1, action:() => { data.groups.splice(i + 1, 0, data.groups.splice(i, 1)[0]); render(); save(); }},
      {sep:true},
      {label:"Delete group", icon:"trash", danger:true, action:() => deleteGroup(gid)});
  }
  showMenu(anchor, items);
}

/* ---------- actions ---------- */
async function startEntry(id, mode, cmd){
  try { const r = await api("/api/start", {entry:id, mode, cmd}); setRuns(r.runs); render(); if(r.message) toast(r.message); }
  catch(e){ setRuns(e.payload?.runs); render(); toast(e.message, "danger"); }
}
async function stopEntry(id, cmd){
  try { const r = await api("/api/stop", {entry:id, cmd}); setRuns(r.runs); render(); } catch(e){ toast(e.message, "danger"); }
}
async function detectEntry(id, btn){
  const e = entryById(id); if(!e || btn.disabled) return;
  btn.disabled = true; btn.classList.add("busy");
  try {
    const r = await api("/api/detect", {entry:id});
    setRuns(r.runs); render();
    const live = liveFor(id).length;
    toast(live ? `${e.name} is running.` : `${e.name} is not running.`);
  } catch(err){ toast(err.message, "danger"); btn.disabled = false; btn.classList.remove("busy"); }
}
async function restartEntry(id, cmd){
  const live = liveFor(id).filter(r => !cmd || r.cmd_id === cmd);
  await stopEntry(id, cmd);
  if(cmd) return startEntry(id, live[0]?.mode, cmd);
  for(const r of live) await startEntry(id, r.mode, r.cmd_id);
}
async function startGroup(gid, mode){
  try { const r = await api("/api/start-group", {group:gid, mode}); setRuns(r.runs); render(); if(r.warning) toast(r.warning, "warning"); else if(r.message) toast(r.message); }
  catch(e){ toast(e.message, "danger"); }
}
async function stopGroup(gid){
  try { const r = await api("/api/stop-group", {group:gid}); setRuns(r.runs); render(); } catch(e){ toast(e.message, "danger"); }
}
function duplicate(id){
  const e = entryById(id); const c = structuredClone(e); c.id = uid(); c.name = e.name + " copy";
  data.entries.splice(data.entries.indexOf(e) + 1, 0, c); render(); save();
}
async function deleteEntry(id){
  const e = entryById(id); if(!e) return;
  const live = liveFor(id).length;
  const ok = await confirmBox("Delete " + e.name + "?", live ? "It is running now. Deleting it stops it first. Your files are not touched." : "This removes it from the launcher. Your files are not touched.", "Delete", true);
  if(!ok) return;
  if(live) await stopEntry(id);
  data.entries = data.entries.filter(x => x.id !== id); render(); save();
  $("#entryDlg").open && $("#entryDlg").close();
}
async function deleteGroup(gid){
  const g = groupById(gid); if(!g) return;
  const n = data.entries.filter(e => e.group === gid).length;
  const ok = await confirmBox("Delete the group " + g.name + "?", n ? `Its ${n} ${n === 1 ? "entry moves" : "entries move"} to Ungrouped.` : "The group is empty.", "Delete group", true);
  if(!ok) return;
  data.entries.forEach(e => { if(e.group === gid) e.group = ""; });
  data.groups = data.groups.filter(x => x.id !== gid); render(); save();
}

/* ---------- confirm ---------- */
function confirmBox(title, text, okLabel, danger, check){
  const d = $("#confirmDlg");
  $("#cTitle").textContent = title; $("#cText").textContent = text;
  const ok = $("#cOk"); ok.textContent = okLabel; ok.className = "pp-btn " + (danger ? "pp-btn-danger" : "pp-btn-primary");
  $("#cCheckWrap").hidden = !check;
  if(check){ $("#cCheckText").textContent = check.label; $("#cCheck").checked = check.checked; }
  d.returnValue = "no"; d.showModal();
  return new Promise(res => d.addEventListener("close", () => res(check ? (d.returnValue === "yes" ? {checked: $("#cCheck").checked} : false) : d.returnValue === "yes"), {once:true}));
}

/* ---------- quit ---------- */
$("#quitBtn").onclick = async () => {
  const live = runs.filter(r => r.alive).length;
  const res = await confirmBox("Quit the launcher?", live ? `${live} ${live === 1 ? "script is" : "scripts are"} running.` : "Nothing is running.", "Quit", false,
    live ? {label:"Also stop the running scripts", checked:true} : null);
  if(!res) return;
  try { await api("/api/quit", {stop: res === true ? true : res.checked}); } catch(_){}
  $("#offline").hidden = false; stopPolling = true;
  setTimeout(() => window.close(), 400);
};

/* ---------- group dialog ---------- */
let editingGroup = null, groupDone = null;
function openGroup(g, onDone){
  editingGroup = g; groupDone = onDone || null;
  $("#groupTitle").textContent = g ? "Edit group" : "New group";
  $("#gName").value = g?.name || ""; $("#gDelay").value = g?.delay ?? 0;
  fieldError("#fGName", "");
  $("#groupDlg").showModal(); $("#gName").focus();
}
$("#newGroupBtn").onclick = () => openGroup(null);
$("#groupForm").addEventListener("submit", ev => {
  ev.preventDefault();
  const name = $("#gName").value.trim();
  if(!name){ fieldError("#fGName", "Give the group a name."); return; }
  const delay = Math.max(0, parseFloat($("#gDelay").value) || 0);
  let g = editingGroup;
  if(g){ g.name = name; g.delay = delay; }
  else { g = {id: uid(), name, delay, collapsed:false}; data.groups.push(g); }
  $("#groupDlg").close(); render(); save();
  groupDone && groupDone(g);
});
$("#groupDlg").addEventListener("close", () => { groupDone = null; });

/* ---------- entry dialog ---------- */
let edit = null, info = null, inspectSeq = 0;
function fieldError(sel, msg){
  const f = $(sel), p = f.querySelector(".pp-error");
  if(msg){ f.dataset.error = ""; p.textContent = msg; p.hidden = false; } else { delete f.dataset.error; p.hidden = true; }
}
function buildPickers(){
  $("#iconGrid").innerHTML = Object.keys(ICONS).map(k => `<label title="${k}"><input type="radio" name="icon" value="${k}" aria-label="${k}"><span>${svg(k)}</span></label>`).join("");
  $("#swatches").innerHTML = COLOURS.map(([c, n]) => `<label title="${n}"><input type="radio" name="colour" value="${c}" aria-label="${n}"><span style="background:${c}"></span></label>`).join("")
    + `<label class="custom-color">Custom <input type="color" id="eColor" aria-label="Custom colour"></label>`;
}
buildPickers();
function fillGroups(sel){
  $("#eGroup").innerHTML = data.groups.map(g => `<option value="${esc(g.id)}">${esc(g.name)}</option>`).join("")
    + `<option value="">No group</option><option value="__new">New group…</option>`;
  $("#eGroup").value = sel ?? "";
}
$("#eGroup").addEventListener("change", ev => {
  if(ev.target.value !== "__new") return;
  ev.target.value = edit.group || "";
  openGroup(null, g => { fillGroups(g.id); edit.group = g.id; });
});
function updatePreview(){
  const colour = edit.color, icon = $("input[name=icon]:checked")?.value || edit.icon;
  const t = $("#pvTile"); t.style.background = colour; t.style.color = textOn(colour); t.innerHTML = svg(icon);
  $("#pvName").textContent = $("#eName").value.trim() || "[Project name]";
  const picked = $$("#cmdList input:checked").map(i => info?.runnables.find(r => r.id === i.value)?.label).filter(Boolean);
  $("#pvSub").textContent = picked.length ? picked.join(", ") : "Nothing selected yet";
  $("#keepWrap").style.display = $("input[name=mode]:checked")?.value === "terminal" ? "" : "none";
}
function setColour(c){
  edit.color = c;
  $$("input[name=colour]").forEach(i => i.checked = i.value.toLowerCase() === c.toLowerCase());
  $("#eColor").value = /^#[0-9a-f]{6}$/i.test(c) ? c : "#0a9a55";
  updatePreview();
}
$("#swatches").addEventListener("change", ev => {
  if(ev.target.name === "colour") setColour(ev.target.value);
  if(ev.target.id === "eColor") setColour(ev.target.value);
});
$("#swatches").addEventListener("input", ev => { if(ev.target.id === "eColor") setColour(ev.target.value); });
$("#iconGrid").addEventListener("change", updatePreview);
$("#entryForm").addEventListener("change", ev => { if(ev.target.name === "mode" || ev.target.closest("#cmdList")) updatePreview(); });
$("#eName").addEventListener("input", updatePreview);

function openEntry(e, presetGroup){
  hideMenu();
  const firstGroup = filter ? "" : (data.groups[0]?.id || "");
  edit = e ? structuredClone(e) : {id:uid(), name:"", path:"", base:"", commands:[], args:"", mode:"hidden", keep_open:true, url:"", url_delay:3, python:"",
    group: presetGroup ?? firstGroup, icon:"terminal", color:COLOURS[0][0], _new:true};
  info = null;
  $("#entryTitle").textContent = e ? "Edit entry" : "New entry";
  $("#entryDelete").hidden = !e;
  $("#eName").value = edit.name; $("#ePath").value = edit.path; $("#eArgs").value = edit.args || "";
  $("#ePy").value = edit.python || ""; $("#eUrl").value = edit.url || ""; $("#eDelay").value = edit.url_delay ?? 3;
  $("#eKeep").checked = edit.keep_open !== false;
  $$("input[name=mode]").forEach(i => i.checked = i.value === (edit.mode || "hidden"));
  $$("input[name=icon]").forEach(i => i.checked = i.value === edit.icon);
  fillGroups(groupIdOf(edit));
  ["#fName", "#fPath", "#fCmds"].forEach(s => fieldError(s, ""));
  $(".adv").open = !!(edit.args || edit.python || edit.url);
  renderCmds();
  setColour(edit.color);
  $("#entryDlg").showModal();
  if(edit.path) inspect(edit.path, true); else $("#ePath").focus();
}
$("#newEntryBtn").onclick = () => openEntry(null);

function renderCmds(selected){
  const box = $("#cmdList");
  if(!info){
    box.innerHTML = `<p class="pp-callout">Choose a location to see the npm scripts and script files you can start.</p>`;
    $("#pyInfo").hidden = true; updatePreview(); return;
  }
  if(!info.runnables.length){
    box.innerHTML = `<p class="pp-callout pp-callout-warning"><strong>Nothing found.</strong> There is no package.json with scripts and no .py, .bat, .ps1 or .js file here. Choose the project's main folder or a single script.</p>`;
  } else {
    $("#selAll").hidden = info.runnables.length < 2;
    box.innerHTML = `<div class="checks">` + info.runnables.map(r => `<label class="check"><input type="checkbox" value="${esc(r.id)}" ${selected.has(r.id) ? "checked" : ""}><span class="cl">${esc(r.label)}</span>${r.hint ? `<span class="ch">${esc(r.hint)}</span>` : ""}</label>`).join("") + `</div>`;
  }
  const py = $("#pyInfo");
  if(info.has_python){
    py.hidden = false;
    py.textContent = info.venv_python ? "Python files use the project environment: " + info.venv_python : "Python files use: " + info.default_python;
  } else py.hidden = true;
  $("#ePy").placeholder = info.venv_python || info.default_python || "python";
  updatePreview();
}
const HOOK = /^(pre|post)[a-z]|^prepare$|^prepublish/;
function defaultSelection(rs, kind){
  if(kind === "folder") return new Set(rs.filter(r => !(r.type === "npm" && HOOK.test(r.script))).map(r => r.id));
  const npm = rs.filter(r => r.type === "npm" && !r.cwd), names = npm.map(r => r.script);
  for(const pick of ["dev", "start", "serve"]) if(names.includes(pick)) return new Set([npm.find(r => r.script === pick).id]);
  if(rs.length === 1) return new Set([rs[0].id]);
  for(const f of ["main.py", "app.py", "run.py", "manage.py", "start.bat", "run.bat", "start.ps1", "index.js", "server.js"]){
    const m = rs.find(r => r.type === "file" && r.file.toLowerCase() === f); if(m) return new Set([m.id]);
  }
  return new Set();
}
let inspecting = null;
function inspect(path, keep){
  inspecting = doInspect(path, keep).finally(() => { inspecting = null; });
  return inspecting;
}
async function doInspect(path, keep){
  const seq = ++inspectSeq;
  fieldError("#fPath", ""); fieldError("#fCmds", "");
  $("#cmdList").innerHTML = `<p class="pp-help">Looking in ${esc(path)}…</p>`;
  try {
    const r = await api("/api/inspect", {path});
    if(seq !== inspectSeq) return;
    info = r;
    $("#ePath").value = r.path;
    if(!$("#eName").value.trim()) $("#eName").value = r.name;
    const sel = keep ? new Set((edit.commands || []).map(c => c.id).filter(id => r.runnables.some(x => x.id === id))) : defaultSelection(r.runnables, r.kind);
    if(keep && !sel.size) defaultSelection(r.runnables, r.kind).forEach(x => sel.add(x));
    renderCmds(sel);
    if(edit._new && edit.icon === "terminal"){
      const guess = r.runnables.some(x => x.type === "npm") ? "globe" : r.has_python ? "code" : "terminal";
      $$("input[name=icon]").forEach(i => i.checked = i.value === guess); updatePreview();
    }
  } catch(e){
    if(seq !== inspectSeq) return;
    info = null; renderCmds(); fieldError("#fPath", e.message);
  }
}
$("#ePath").addEventListener("change", () => {
  const v = $("#ePath").value.trim();
  if(!v){ info = null; renderCmds(); return; }
  if(info && info.path === v) return;
  inspect(v, false);
});
$("#ePath").addEventListener("keydown", ev => { if(ev.key === "Enter"){ ev.preventDefault(); $("#ePath").dispatchEvent(new Event("change")); } });
async function browse(kind){
  const btns = [$("#browseFolder"), $("#browseFile")]; btns.forEach(b => b.disabled = true);
  try {
    const r = await api("/api/browse", {kind, initial: $("#ePath").value.trim()});
    if(r.path){ $("#ePath").value = r.path; await inspect(r.path, false); }
  } catch(e){ fieldError("#fPath", e.message); }
  finally { btns.forEach(b => b.disabled = false); }
}
$("#selAll").addEventListener("click", ev => {
  const b = ev.target.closest("[data-sel]"); if(!b) return;
  $$("#cmdList input[type=checkbox]").forEach(i => i.checked = b.dataset.sel === "all"); updatePreview();
});
$("#browseFolder").onclick = () => browse("folder");
$("#browseFile").onclick = () => browse("file");
$("#entryDelete").onclick = () => deleteEntry(edit.id);

$("#entryForm").addEventListener("submit", async ev => {
  ev.preventDefault();
  if(inspecting) await inspecting;
  const name = $("#eName").value.trim(), path = $("#ePath").value.trim();
  let bad = false;
  fieldError("#fName", name ? "" : "Give the entry a name."); bad = bad || !name;
  if(!path){ fieldError("#fPath", "Choose a folder or a file."); bad = true; }
  if(path && (!info || info.path !== path)) { await inspect(path, true); if(!info) return; }
  const ids = new Set($$("#cmdList input:checked").map(i => i.value));
  const commands = info ? info.runnables.filter(r => ids.has(r.id)) : [];
  if(info && !commands.length){ fieldError("#fCmds", "Pick at least one thing to start."); bad = true; }
  if(bad) return;
  const out = Object.assign(edit, {
    name, path: info.path, base: info.base, commands,
    args: $("#eArgs").value.trim(), python: $("#ePy").value.trim(), url: $("#eUrl").value.trim(),
    url_delay: Math.max(0, parseFloat($("#eDelay").value) || 0),
    mode: $("input[name=mode]:checked")?.value || "hidden", keep_open: $("#eKeep").checked,
    group: $("#eGroup").value === "__new" ? "" : $("#eGroup").value,
    icon: $("input[name=icon]:checked")?.value || "terminal",
  });
  const isNew = out._new; delete out._new;
  const i = data.entries.findIndex(x => x.id === out.id);
  if(i >= 0) data.entries[i] = out;
  else insertAtGroupEnd(out);
  $("#entryDlg").close(); render(); await save();
  if(isNew) toast(out.name + " is saved. Press Start when you are ready.");
});
function insertAtGroupEnd(e){
  let last = -1; data.entries.forEach((x, k) => { if(groupIdOf(x) === groupIdOf(e)) last = k; });
  data.entries.splice(last + 1, 0, e);
}

/* ---------- output panel ---------- */
let logEntry = null, logRun = null, logTimer = null;
function openLog(entryId, cmd){
  logEntry = entryId;
  const rs = runsFor(entryId).filter(r => r.has_log);
  if(!rs.length){ toast("There is no output yet. Output is kept for scripts started hidden."); return; }
  const pool = cmd ? rs.filter(r => r.cmd_id === cmd) : rs;
  const pick = pool.length ? pool : rs;
  logRun = (pick.find(r => r.alive) || pick[pick.length - 1]).id;
  $("#log").hidden = false; refreshLog(true);
  clearInterval(logTimer); logTimer = setInterval(refreshLog, 1000);
}
function closeLog(){ $("#log").hidden = true; clearInterval(logTimer); logEntry = logRun = null; }
$("#logClose").onclick = closeLog;
$("#logTabs").addEventListener("click", ev => { const b = ev.target.closest("[data-run]"); if(b){ logRun = b.dataset.run; refreshLog(true); } });
$("#logStop").onclick = async () => {
  try { const r = await api("/api/stop", {run: logRun}); setRuns(r.runs); render(); refreshLog(); } catch(e){ toast(e.message, "danger"); }
};
async function refreshLog(scrollEnd){
  if(!logEntry) return;
  const e = entryById(logEntry), rs = runsFor(logEntry).filter(r => r.has_log);
  if(!rs.find(r => r.id === logRun) && rs.length) logRun = (rs.find(r => r.alive) || rs[rs.length - 1]).id;
  const run = rs.find(r => r.id === logRun);
  $("#logTitle").textContent = "Output · " + (e?.name || "");
  $("#logTabs").innerHTML = rs.length > 1 ? rs.map(r => `<button class="log-tab" data-run="${r.id}" aria-selected="${r.id === logRun}">${esc(r.label)}${r.alive ? "" : " (stopped)"}</button>`).join("") : "";
  const stop = $("#logStop");
  stop.innerHTML = svg("stop") + "Stop"; stop.hidden = !run?.alive;
  if(!run) return;
  try {
    const r = await api("/api/log?run=" + encodeURIComponent(run.id));
    const pre = $("#logText"), atEnd = pre.scrollHeight - pre.scrollTop - pre.clientHeight < 40;
    let text = stripAnsi(r.text);
    if(r.truncated) text = "[Showing the last part of the output]\n" + text;
    if(!r.alive) text += "\n[Stopped" + (run.exit !== null && run.exit !== undefined ? " with code " + run.exit : "") + "]";
    if(pre.textContent !== text){ pre.textContent = text; if(atEnd || scrollEnd) pre.scrollTop = pre.scrollHeight; }
  } catch(_){}
}

/* ---------- polling ---------- */
let stopPolling = false;
async function poll(){
  if(stopPolling) return;
  try {
    const s = await api("/api/state");
    failures = 0;
    const sig = sigOf(s.runs);
    runs = s.runs;
    if(sig !== lastSig){ lastSig = sig; if(!dragId) render(); }
  } catch(_){
    if(++failures >= 3){ $("#offline").hidden = false; }
  }
}
$("#search").addEventListener("input", ev => { filter = ev.target.value; render(); });

(async function init(){
  try {
    const s = await api("/api/state");
    data = s.data; data.settings = data.settings || {}; setRuns(s.runs);
  } catch(e){ $("#offline").hidden = false; return; }
  applyTheme(); render();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme);
  setInterval(poll, 1500);
})();
