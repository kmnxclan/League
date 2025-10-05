/* script.js - KMNx League
   Single shared script for all pages.
   Data source order:
     1) localStorage 'KMNx_data' (if you edited via Results/Schedule UI)
     2) fetch('data.json') if available (when hosted on a server)
     3) fallback DEFAULT_DATA embedded below
*/

/* ========= DEFAULT DATA (used if no data.json / no localStorage) ========= */
const DEFAULT_DATA = {
  teams: [
    { name: "TEST Clan 1" },
    { name: "TEST Clan 2" },
    { name: "TEST Clan 3" },
    { name: "TEST Clan 4" }
  ],
  matches: [
    { date:"2025-10-10", time:"19:00", map:"Map X", team1:"TEST Clan 1", team2:"TEST Clan 2", score1:2, score2:1, kills1:52, kills2:48 },
    { date:"2025-10-12", time:"20:00", map:"Map Y", team1:"TEST Clan 3", team2:"TEST Clan 4", score1:null, score2:null, kills1:null, kills2:null }
  ]
};

/* ========= UTILITIES ========= */
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
function el(name, attrs={}, html=''){ const e=document.createElement(name); for(const k in attrs) e.setAttribute(k, attrs[k]); e.innerHTML = html; return e; }
function saveDataToLocal(data){ localStorage.setItem('KMNx_data', JSON.stringify(data)); }
function loadDataFromLocal(){ try{ const s = localStorage.getItem('KMNx_data'); return s ? JSON.parse(s) : null; } catch(e){ return null; } }

/* Parse a Berlin-local date/time into a JS Date.
   NOTE: This uses an ISO with +02:00 offset (CEST). If you host and need DST-accurate, server-side handling is better.
*/
function berlinDate(dateStr, timeStr){
  // dateStr "YYYY-MM-DD", timeStr "HH:MM"
  // try to create best-effort ISO with +02:00
  return new Date(dateStr + 'T' + timeStr + ':00+02:00');
}

/* Compare dates (used for sorting) */
function sortMatchesByDate(a,b){
  const da = berlinDate(a.date,a.time);
  const db = berlinDate(b.date,b.time);
  return da - db;
}

/* Determine match state:
   - live: current time between start and start+duration
   - upcoming: start > now
   - ended: both scores are numbers
   We'll assume each match lasts 45 minutes for 'live' detection.
*/
function matchState(match){
  const now = new Date();
  if (match.score1 !== null && match.score2 !== null && !Number.isNaN(Number(match.score1)) && !Number.isNaN(Number(match.score2))) {
    return 'ended';
  }
  const start = berlinDate(match.date, match.time);
  const end = new Date(start.getTime() + (45*60*1000)); // 45 minutes
  if (now >= start && now <= end) return 'live';
  if (now < start) return 'upcoming';
  // If past and no scores -> treat as upcoming (or ended with no data). We'll put it in upcoming if both null.
  return 'upcoming';
}

/* ========= DATA LOADING =========
   Try localStorage -> fetch data.json -> fallback DEFAULT_DATA
*/
async function loadData(){
  // 1) localStorage
  const local = loadDataFromLocal();
  if(local) return local;

  // 2) try fetch data.json (works when site is served over a webserver)
  try {
    const resp = await fetch('data.json', {cache: 'no-store'});
    if(resp.ok){
      const json = await resp.json();
      return json;
    }
  } catch(e){
    // fetch failed (likely file:// or not hosted) -> fallback
  }

  // 3) fallback
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

/* ========= CALCULATION: BUILD TEAMS STATS FROM MATCHES =========
   Produces an object { teamName: { name, gp, w, l, pts, kills } }
*/
function buildTeamStats(data){
  const stats = {};
  // init
  (data.teams || []).forEach(t => { stats[t.name] = { name: t.name, gp:0, w:0, l:0, pts:0, kills:0 }; });
  // some matches may include teams not in teams list -> include them
  (data.matches || []).forEach(m => {
    if(!stats[m.team1]) stats[m.team1] = { name:m.team1, gp:0, w:0, l:0, pts:0, kills:0 };
    if(!stats[m.team2]) stats[m.team2] = { name:m.team2, gp:0, w:0, l:0, pts:0, kills:0 };
    const state = matchState(m);
    if(state === 'ended'){
      // both scores exist -> count
      stats[m.team1].gp += 1;
      stats[m.team2].gp += 1;
      const s1 = Number(m.score1), s2 = Number(m.score2);
      if(s1 > s2){ stats[m.team1].w += 1; stats[m.team2].l += 1; stats[m.team1].pts += 3; }
      else if(s2 > s1){ stats[m.team2].w += 1; stats[m.team1].l += 1; stats[m.team2].pts += 3; }
      else { /* draw? none specified; no points change */ }
      // kills (if provided)
      const k1 = (m.kills1 != null && !Number.isNaN(Number(m.kills1))) ? Number(m.kills1) : 0;
      const k2 = (m.kills2 != null && !Number.isNaN(Number(m.kills2))) ? Number(m.kills2) : 0;
      stats[m.team1].kills += k1;
      stats[m.team2].kills += k2;
    } else {
      // not ended: count nothing yet (GP only counts finished games)
    }
  });
  return stats;
}

/* ========= RENDER FUNCTIONS ========= */
async function renderAll(){
  const data = await loadData();
  window.KMNx_DATA = data; // expose for console/debug

  // Build team stats
  const statsObj = buildTeamStats(data);
  const statsArr = Object.values(statsObj);

  // 1) Home: next match + countdown
  renderHomeNext(data);

  // 2) Teams page
  renderTeams(statsArr);

  // 3) Results page (live / upcoming / ended)
  renderResults(data);

  // 4) Leaderboard page (sorted by points desc)
  renderLeaderboard(statsArr);

  // 5) Schedule list
  renderScheduleList(data);
}

/* ---- HOME ---- */
function renderHomeNext(data){
  const rootInfo = qs('#homeNextMatch');
  const rootCount = qs('#homeCountdown');
  if(!rootInfo || !rootCount) return;

  const matches = (data.matches || []).slice().sort(sortMatchesByDate);
  // next upcoming (including live)
  const now = new Date();
  let next = null;
  for(const m of matches){
    const st = matchState(m);
    if(st === 'live'){ next = m; break; }
    if(st === 'upcoming'){ next = m; break; }
  }
  if(!next){
    rootInfo.textContent = 'No scheduled matches';
    rootCount.textContent = '--:--:--';
    return;
  }
  const start = berlinDate(next.date,next.time);
  const localTimeStr = start.toLocaleDateString() + ' • ' + start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  rootInfo.textContent = `${next.team1} vs ${next.team2} — ${next.map} (${localTimeStr})`;

  // countdown
  function update(){
    const now = new Date();
    const diff = start - now;
    if(diff <= 0){
      rootCount.textContent = 'LIVE';
      return;
    }
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    rootCount.textContent = `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  update();
  if(window.__homeCountdownInterval) clearInterval(window.__homeCountdownInterval);
  window.__homeCountdownInterval = setInterval(update, 1000);
}

/* ---- TEAMS ---- */
function renderTeams(statsArr){
  const container = qs('#teamsGrid');
  if(!container) return;
  container.innerHTML = '';
  // sort by pts desc then kills
  statsArr.sort((a,b) => (b.pts - a.pts) || (b.kills - a.kills));
  statsArr.forEach(s => {
    const card = el('div', {class:'card'}, `
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:56px;height:56px;background:linear-gradient(135deg,#111,#222);border-radius:8px"></div>
        <div>
          <div style="font-weight:800">${escapeHtml(s.name)}</div>
          <div class="small">${s.gp} GP • ${s.w} W • ${s.l} L • ${s.kills} K</div>
        </div>
      </div>
    `);
    container.appendChild(card);
  });
}

/* ---- RESULTS ----
   Renders three lists: live, upcoming, ended
   Each upcoming card is clickable: click to open simple editor to submit score (saved to localStorage)
*/
function renderResults(data){
  const liveRoot = qs('#liveList');
  const upRoot = qs('#upcomingList');
  const endRoot = qs('#endedList');
  if(!liveRoot || !upRoot || !endRoot) return;

  liveRoot.innerHTML = ''; upRoot.innerHTML = ''; endRoot.innerHTML = '';

  const matches = (data.matches || []).slice().sort(sortMatchesByDate);

  matches.forEach((m, idx) => {
    const st = matchState(m);
    const card = el('div', {class:'card'}, `
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-weight:800">${escapeHtml(m.team1)} <span style="opacity:0.7">vs</span> ${escapeHtml(m.team2)}</div>
          <div class="small">${escapeHtml(m.date)} • ${escapeHtml(m.time)} (Berlin) • ${escapeHtml(m.map)}</div>
        </div>
        <div style="text-align:right">
          ${st === 'ended' ? `<div style="font-weight:900">${m.score1} : ${m.score2}</div><div class="small">${m.kills1 ?? 0} K • ${m.kills2 ?? 0} K</div>` : st === 'live' ? `<div style="color:var(--red);font-weight:900">LIVE</div>` : `<div class="small">Upcoming</div>`}
        </div>
      </div>
    `);

    // behavior: if upcoming or live -> click to edit scores (editor saved to localStorage)
    if(st === 'upcoming' || st === 'live'){
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => openScoreEditor(data, m));
    }
    if(st === 'live') liveRoot.appendChild(card);
    else if(st === 'upcoming') upRoot.appendChild(card);
    else endRoot.appendChild(card);
  });

  if(liveRoot.children.length === 0) liveRoot.innerHTML = '<div class="small">No live matches right now</div>';
  if(upRoot.children.length === 0) upRoot.innerHTML = '<div class="small">No upcoming matches</div>';
  if(endRoot.children.length === 0) endRoot.innerHTML = '<div class="small">No ended matches yet</div>';
}

/* Score editor modal (simple prompt-based)
   - Edits the match object, saves to localStorage and re-renders everything
*/
function openScoreEditor(data, match){
  // prompt for scores and kills (simple UX). Could be replaced with a proper modal form.
  const s1 = prompt(`Enter score for ${match.team1} (leave blank to cancel):`, match.score1 != null ? match.score1 : '');
  if(s1 === null) return; // cancelled
  const s2 = prompt(`Enter score for ${match.team2} (leave blank to cancel):`, match.score2 != null ? match.score2 : '');
  if(s2 === null) return;
  // kills (optional)
  const k1 = prompt(`Enter kills for ${match.team1} (optional):`, match.kills1 != null ? match.kills1 : '');
  if(k1 === null) return;
  const k2 = prompt(`Enter kills for ${match.team2} (optional):`, match.kills2 != null ? match.kills2 : '');
  if(k2 === null) return;

  // set values (null if blank)
  match.score1 = s1 === '' ? null : Number(s1);
  match.score2 = s2 === '' ? null : Number(s2);
  match.kills1 = k1 === '' ? null : Number(k1);
  match.kills2 = k2 === '' ? null : Number(k2);

  // save back to localStorage
  saveDataToLocal(data);
  // re-render everywhere
  renderAll();
}

/* ---- LEADERBOARD ---- */
function renderLeaderboard(statsArr){
  const tbody = qs('#leaderboardTable tbody');
  if(!tbody) return;
  tbody.innerHTML = '';
  // sort by points desc, tiebreaker kills desc
  statsArr.sort((a,b) => (b.pts - a.pts) || (b.kills - a.kills));
  statsArr.forEach((s, idx) => {
    const tr = el('tr', {}, `
      <td style="font-weight:800">${idx+1}</td>
      <td style="font-weight:700">${escapeHtml(s.name)}</td>
      <td>${s.gp}</td>
      <td>${s.w}</td>
      <td>${s.l}</td>
      <td>${s.kills}</td>
      <td style="font-weight:900">${s.pts}</td>
    `);
    tbody.appendChild(tr);
  });
}

/* ---- SCHEDULE LIST (and Schedule page add fixture) ---- */
function renderScheduleList(data){
  const root = qs('#scheduleList');
  if(!root) return;
  root.innerHTML = '';
  const sorted = (data.matches || []).slice().sort(sortMatchesByDate);
  sorted.forEach(m => {
    const st = matchState(m);
    const card = el('div', {class:'card'}, `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-weight:800">${escapeHtml(m.date)} ${escapeHtml(m.time)} — ${escapeHtml(m.team1)} vs ${escapeHtml(m.team2)}</div>
          <div class="small">${escapeHtml(m.map)} • ${st.toUpperCase()}</div>
        </div>
        <div class="small">${st==='ended' ? (m.score1+' : '+m.score2) : ''}</div>
      </div>
    `);
    root.appendChild(card);
  });

  // wire schedule add button (if present)
  const addBtn = qs('#sch_add');
  if(addBtn){
    addBtn.onclick = () => {
      const team1 = qs('#sch_team1').value.trim();
      const team2 = qs('#sch_team2').value.trim();
      const date = qs('#sch_date').value;
      const time = qs('#sch_time').value;
      const map = qs('#sch_map').value.trim() || 'Map X';
      if(!team1 || !team2 || !date || !time){ alert('Fill team1, team2, date and time'); return; }
      const newMatch = { date, time, map, team1, team2, score1:null, score2:null, kills1:null, kills2:null };
      data.matches.push(newMatch);
      // ensure teams list includes them
      if(!data.teams.find(t=>t.name===team1)) data.teams.push({name:team1});
      if(!data.teams.find(t=>t.name===team2)) data.teams.push({name:team2});
      saveDataToLocal(data);
      // clear form
      qs('#sch_team1').value=''; qs('#sch_team2').value=''; qs('#sch_date').value=''; qs('#sch_time').value=''; qs('#sch_map').value='';
      renderAll();
    };
  }

  const resetBtn = qs('#sch_reset');
  if(resetBtn){
    resetBtn.onclick = () => {
      if(!confirm('Reset demo data (clear local changes)?')) return;
      localStorage.removeItem('KMNx_data');
      // reload page to re-load defaults or data.json
      location.reload();
    };
  }
}

/* ========= HELPERS ========= */
function escapeHtml(s){ if(s==null) return ''; return (''+s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }

/* ========= INIT =========
   Render the site. Called at page load.
*/
document.addEventListener('DOMContentLoaded', () => {
  // run initial render
  renderAll();

  // If on Results page, poll to update 'live' status every 10s
  setInterval(() => renderAll(), 10*1000);
});
