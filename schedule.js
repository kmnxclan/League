// schedule.js
// Reads scheduleTable rows (date + time), finds next upcoming (Berlin timezone), shows card and starts countdown.

function parseLocalBerlin(dateStr, timeStr){
  // dateStr: YYYY-MM-DD, timeStr: HH:MM  (24h)
  // Construct a Date using the local timezone but interpret as Europe/Berlin.
  // Because there's no reliable timezone conversion without backend or Intl, we'll compute using Date.UTC and Berlin offset.
  // Simpler approach: create ISO with +02:00 or +01:00 depending on schedule - assume user uses Berlin local time.
  // We'll construct an ISO string with '+02:00' which works for CEST; note: for production you'd want server-side timezone handling.
  const iso = `${dateStr}T${timeStr}:00+02:00`; // assumes CEST (summer). Good for demo.
  return new Date(iso);
}

function schedule_initCountdown(){
  const table = document.getElementById('scheduleTable');
  if(!table) return;
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  const now = new Date();

  // Collect upcoming matches
  const upcoming = [];
  rows.forEach(r => {
    const dateEl = r.querySelector('.date');
    const timeEl = r.querySelector('.time');
    if(!dateEl || !timeEl) return;
    const d = dateEl.textContent.trim();
    const t = timeEl.textContent.trim();
    if(!d || !t) return;
    const dt = parseLocalBerlin(d,t);
    if(dt > now) upcoming.push({row:r, dt, map: (r.querySelector('.map')?.textContent||'Map')});
  });

  upcoming.sort((a,b)=> a.dt - b.dt);

  if(upcoming.length === 0){
    document.getElementById('nextMatchInfo').textContent = 'No upcoming matches';
    document.getElementById('countdown').textContent = '--:--:--';
    return;
  }

  const next = upcoming[0];
  const nextInfoEl = document.getElementById('nextMatchInfo');
  nextInfoEl.textContent = `${next.dt.toLocaleDateString()} • ${next.dt.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} — ${next.map}`;

  // Start countdown
  startCountdownTo(next.dt);
}

let schedule_countdownTimer = null;
function startCountdownTo(targetDate){
  const el = document.getElementById('countdown');
  if(!el) return;
  if(schedule_countdownTimer) clearInterval(schedule_countdownTimer);

  function update(){
    const now = new Date();
    let diff = targetDate - now;
    if(diff <= 0){
      el.textContent = 'LIVE!';
      clearInterval(schedule_countdownTimer);
      return;
    }
    const days = Math.floor(diff / (1000*60*60*24));
    diff -= days*(1000*60*60*24);
    const hours = Math.floor(diff/(1000*60*60));
    diff -= hours*(1000*60*60);
    const mins = Math.floor(diff/(1000*60));
    diff -= mins*(1000*60);
    const secs = Math.floor(diff/1000);

    const pad = v => String(v).padStart(2,'0');
    el.textContent = `${days}d ${pad(hours)}:${pad(mins)}:${pad(secs)}`;
  }

  update();
  schedule_countdownTimer = setInterval(update, 1000);
}

// Also load from localStorage (Admin saved schedule)
document.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = localStorage.getItem('KMNx_schedule');
    if(saved){
      const data = JSON.parse(saved);
      const tbody = document.getElementById('scheduleTable').tBodies[0];
      tbody.innerHTML = '';
      data.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="date">${m.date}</td><td class="time">${m.time}</td><td class="map">${escapeHtml(m.map)}</td>`;
        tbody.appendChild(tr);
      });
    }
  } catch(e){}
  // init schedule countdown
  schedule_initCountdown();
});

// reuse escape from leaderboard.js if available
function escapeHtml(s){ return (''+s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
