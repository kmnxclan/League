// leaderboard.js
// Sorts the leaderboard table by points (desc), then updates rank cells and animates points.

function sortLeaderboardAndAnimate(){
  const table = document.getElementById('leaderboardTable');
  if(!table) return;
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);

  // Ensure points column exists
  rows.forEach(row => {
    const ptsCell = row.querySelector('.pts');
    if(!ptsCell){
      // attempt to find by cell index (last cell)
      const cells = row.cells;
      const last = cells[cells.length-1];
      last.classList.add('pts');
    }
  });

  // parse points robustly (non-number -> 0)
  rows.sort((a,b) => {
    const pa = parseInt(a.querySelector('.pts').textContent||'0',10) || 0;
    const pb = parseInt(b.querySelector('.pts').textContent||'0',10) || 0;
    if(pb === pa){
      // tie-breaker: more wins above
      const wa = parseInt(a.querySelector('.w')?.textContent||'0',10) || 0;
      const wb = parseInt(b.querySelector('.w')?.textContent||'0',10) || 0;
      return wb - wa;
    }
    return pb - pa;
  });

  // remove and append in order
  rows.forEach((r, idx) => {
    // set rank cell (first cell)
    const rankCell = r.cells[0];
    if(rankCell) rankCell.textContent = (idx+1);
    tbody.appendChild(r);
    // subtle animation
    r.style.transform = 'translateY(-6px)';
    r.style.opacity = '0';
    setTimeout(()=> { r.style.transition = 'all 360ms ease'; r.style.transform='none'; r.style.opacity='1'; }, 40+idx*60);
  });

  // animate points count-up for visual flair
  rows.forEach((r, idx) => {
    const ptsEl = r.querySelector('.pts');
    if(!ptsEl) return;
    const target = parseInt(ptsEl.textContent||'0',10) || 0;
    // replace with animated value
    let current = 0;
    ptsEl.textContent = '0';
    const step = Math.max(1, Math.floor(target / 20));
    const timer = setInterval(() => {
      current += step;
      if(current >= target){
        ptsEl.textContent = ''+target;
        clearInterval(timer);
      } else {
        ptsEl.textContent = ''+current;
      }
    }, 22 + idx*6);
  });
}

// also re-run if admin updates localStorage and page is reloaded
document.addEventListener('DOMContentLoaded', () => {
  // If data is in localStorage, load it into table
  try {
    const saved = localStorage.getItem('KMNx_leaderboard');
    if(saved){
      const data = JSON.parse(saved);
      const tbody = document.getElementById('leaderboardTable').tBodies[0];
      tbody.innerHTML = '';
      data.forEach(team => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td></td><td>${escapeHtml(team.name)}</td><td class="gp">${team.gp}</td><td class="w">${team.w}</td><td class="l">${team.l}</td><td class="pts">${team.pts}</td>`;
        tbody.appendChild(tr);
      });
    }
  } catch(e){}
  sortLeaderboardAndAnimate();
});

// small html escape
function escapeHtml(s){ return (''+s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c])); }
