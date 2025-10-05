// admin.js - simple client-only admin helper
document.addEventListener('DOMContentLoaded', () => {
  // Add Team
  const addTeamBtn = document.getElementById('admin_add_team');
  if(addTeamBtn){
    addTeamBtn.addEventListener('click', () => {
      const name = document.getElementById('admin_team_name').value.trim();
      const gp = parseInt(document.getElementById('admin_gp').value||'0',10) || 0;
      const w = parseInt(document.getElementById('admin_w').value||'0',10) || 0;
      const l = parseInt(document.getElementById('admin_l').value||'0',10) || 0;
      const pts = w*3; // auto calc
      if(!name){ alert('Enter a team name'); return; }
      const teams = JSON.parse(localStorage.getItem('KMNx_leaderboard')||'[]');
      teams.push({name, gp, w, l, pts});
      localStorage.setItem('KMNx_leaderboard', JSON.stringify(teams));
      alert('Team added to localStorage. Open leaderboard.html to view (reload page).');
      // clear inputs
      document.getElementById('admin_team_name').value='';
    });
  }

  // Add Match
  const addMatchBtn = document.getElementById('admin_add_match');
  if(addMatchBtn){
    addMatchBtn.addEventListener('click', () => {
      const date = document.getElementById('admin_date').value;
      const time = document.getElementById('admin_time').value;
      const map = document.getElementById('admin_map').value.trim() || 'Map';
      if(!date || !time){ alert('Select date and time'); return; }
      const matches = JSON.parse(localStorage.getItem('KMNx_schedule')||'[]');
      matches.push({date, time, map});
      localStorage.setItem('KMNx_schedule', JSON.stringify(matches));
      alert('Match added to localStorage. Open schedule.html to view (reload page).');
      // clear
      document.getElementById('admin_map').value='';
    });
  }

  // Apply button (no-op except informs)
  const applyBtn = document.getElementById('admin_apply');
  if(applyBtn){
    applyBtn.addEventListener('click', () => {
      alert('Changes saved to localStorage. Reload leaderboard.html and schedule.html to load updated data.');
    });
  }

  const resetBtn = document.getElementById('admin_reset');
  if(resetBtn){
    resetBtn.addEventListener('click', () => {
      if(!confirm('Reset demo data in localStorage?')) return;
      localStorage.removeItem('KMNx_leaderboard');
      localStorage.removeItem('KMNx_schedule');
      alert('Demo data reset. Reload pages to see default TEST rows.');
    });
  }
});
