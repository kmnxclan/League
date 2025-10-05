// ================== DATA ==================
const teams = [
  { name: "TEST Clan 1", games: 3, wins: 2, losses: 1 },
  { name: "TEST Clan 2", games: 3, wins: 1, losses: 2 },
  { name: "TEST Clan 3", games: 3, wins: 3, losses: 0 },
  { name: "TEST Clan 4", games: 3, wins: 0, losses: 3 }
];

const matches = [
  { date: "2025-10-10", time: "19:00", map: "Map X", team1: "TEST Clan 1", team2: "TEST Clan 2" },
  { date: "2025-10-12", time: "20:00", map: "Map Y", team1: "TEST Clan 3", team2: "TEST Clan 4" }
];

// ================== COUNTDOWN ==================
function updateCountdown() {
  const nextMatch = new Date(matches[0].date + "T" + matches[0].time + ":00+02:00"); 
  const now = new Date();
  const diff = nextMatch - now;

  if (diff <= 0) {
    document.getElementById("countdown").textContent = "Match is live!";
    return;
  }

  const hours = Math.floor(diff / 1000 / 60 / 60);
  const mins = Math.floor(diff / 1000 / 60) % 60;
  const secs = Math.floor(diff / 1000) % 60;
  document.getElementById("countdown").textContent =
    `${hours}h ${mins}m ${secs}s`;
}
if (document.getElementById("countdown")) {
  setInterval(updateCountdown, 1000);
  updateCountdown();
}

// ================== LEADERBOARD ==================
function loadLeaderboard() {
  const tbody = document.querySelector("#leaderboard tbody");
  if (!tbody) return;

  const standings = teams.map(t => ({
    ...t,
    points: t.wins * 3
  })).sort((a, b) => b.points - a.points);

  standings.forEach(team => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${team.name}</td>
      <td>${team.games}</td>
      <td>${team.wins}</td>
      <td>${team.losses}</td>
      <td>${team.points}</td>
    `;
    tbody.appendChild(row);
  });
}
loadLeaderboard();

// ================== SCHEDULE ==================
function loadSchedule() {
  const container = document.getElementById("schedule");
  if (!container) return;

  matches.forEach(m => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <h3>${m.team1} vs ${m.team2}</h3>
      <p>Date: ${m.date}</p>
      <p>Time: ${m.time} (Berlin)</p>
      <p>Map: ${m.map}</p>
    `;
    container.appendChild(div);
  });
}
loadSchedule();

// ================== TEAMS ==================
function loadTeams() {
  const container = document.getElementById("teams");
  if (!container) return;

  teams.forEach(t => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<h3>${t.name}</h3>`;
    container.appendChild(div);
  });
}
loadTeams();
