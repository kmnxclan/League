// Fetch data from results.json
async function fetchResults() {
  const res = await fetch("results.json");
  const data = await res.json();
  return data;
}

// -----------------------------
// Next Match Timer (Home page)
// -----------------------------
async function updateNextMatchTimer() {
  const matches = await fetchResults();
  const now = new Date();

  const upcoming = matches
    .filter(m => {
      const matchDate = new Date(`${m.date}T${m.time}:00`);
      return m.scoreA == null && m.scoreB == null && matchDate >= now;
    })
    .sort((a, b) => new Date(a.date + "T" + a.time) - new Date(b.date + "T" + b.time));

  const timerDiv = document.getElementById("next-match-timer");
  if (!timerDiv) return;

  if (upcoming.length === 0) {
    timerDiv.textContent = "No upcoming matches.";
    return;
  }

  const nextMatch = upcoming[0];
  const matchDate = new Date(`${nextMatch.date}T${nextMatch.time}:00`);

  function updateTimer() {
    const now = new Date();
    const diff = matchDate - now;

    if (diff <= 0) {
      timerDiv.textContent = `${nextMatch.teamA} vs ${nextMatch.teamB} is starting now!`;
      clearInterval(interval);
      return;
    }

    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    timerDiv.textContent = `${nextMatch.teamA} vs ${nextMatch.teamB} starts in ${hours}h ${minutes}m ${seconds}s`;
  }

  updateTimer();
  const interval = setInterval(updateTimer, 1000);
}

// -----------------------------
// Teams Page
// -----------------------------
async function populateTeams() {
  const matches = await fetchResults();
  const teamsDiv = document.getElementById("teams");
  if (!teamsDiv) return;

  const teams = {};

  matches.forEach(m => {
    [m.teamA, m.teamB].forEach(t => {
      if (!teams[t]) teams[t] = { wins: 0, losses: 0, kills: 0 };
    });

    if (m.scoreA != null && m.scoreB != null) {
      if (m.scoreA > m.scoreB) {
        teams[m.teamA].wins++;
        teams[m.teamB].losses++;
      } else if (m.scoreB > m.scoreA) {
        teams[m.teamB].wins++;
        teams[m.teamA].losses++;
      }
      teams[m.teamA].kills += m.killsA || 0;
      teams[m.teamB].kills += m.killsB || 0;
    }
  });

  teamsDiv.innerHTML = "";

  Object.entries(teams).forEach(([team, stats]) => {
    const card = document.createElement("div");
    card.className = "card fade-in";
    card.innerHTML = `
      <h3>${team}</h3>
      <p>Wins: ${stats.wins} | Losses: ${stats.losses} | Kills: ${stats.kills}</p>
    `;
    teamsDiv.appendChild(card);
  });
}

// -----------------------------
// Leaderboard Page
// -----------------------------
async function populateLeaderboard() {
  const matches = await fetchResults();
  const leaderboardBody = document.querySelector("#leaderboard tbody");
  if (!leaderboardBody) return;

  const teams = {};

  matches.forEach(m => {
    [m.teamA, m.teamB].forEach(t => {
      if (!teams[t]) teams[t] = { wins: 0, losses: 0, kills: 0, points: 0 };
    });

    if (m.scoreA != null && m.scoreB != null) {
      if (m.scoreA > m.scoreB) {
        teams[m.teamA].wins++;
        teams[m.teamA].points += 3;
        teams[m.teamB].losses++;
      } else if (m.scoreB > m.scoreA) {
        teams[m.teamB].wins++;
        teams[m.teamB].points += 3;
        teams[m.teamA].losses++;
      }
      teams[m.teamA].kills += m.killsA || 0;
      teams[m.teamB].kills += m.killsB || 0;
    }
  });

  const sorted = Object.entries(teams).sort((a, b) => b[1].points - a[1].points);

  leaderboardBody.innerHTML = "";

  sorted.forEach(([team, stats], index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${team}</td>
      <td>${stats.wins}</td>
      <td>${stats.losses}</td>
      <td>${stats.kills}</td>
      <td>${stats.points}</td>
    `;
    leaderboardBody.appendChild(row);
  });
}

// -----------------------------
// Results Page
// -----------------------------
async function populateResults() {
  const matches = await fetchResults();
  const now = new Date();

  const liveDiv = document.getElementById("live-matches");
  const upcomingDiv = document.getElementById("upcoming-matches");
  const endedDiv = document.getElementById("ended-matches");

  if (liveDiv) liveDiv.innerHTML = "";
  if (upcomingDiv) upcomingDiv.innerHTML = "";
  if (endedDiv) endedDiv.innerHTML = "";

  matches.forEach(m => {
    const matchDate = new Date(`${m.date}T${m.time}:00`);
    const div = document.createElement("div");
    div.className = "card fade-in";
    div.innerHTML = `
      <p>${m.teamA} vs ${m.teamB} | ${m.map} | ${m.date} ${m.time} (Berlin)</p>
      ${m.scoreA != null && m.scoreB != null ? `<p>Score: ${m.scoreA} - ${m.scoreB} | Kills: ${m.killsA} - ${m.killsB}</p>` : ""}
    `;

    if (m.scoreA != null && m.scoreB != null) {
      endedDiv?.appendChild(div);
    } else if (matchDate <= now) {
      liveDiv?.appendChild(div);
    } else {
      upcomingDiv?.appendChild(div);
    }
  });

  if (liveDiv && liveDiv.innerHTML === "") liveDiv.innerHTML = "<p>No live matches right now.</p>";
  if (upcomingDiv && upcomingDiv.innerHTML === "") upcomingDiv.innerHTML = "<p>No upcoming matches.</p>";
  if (endedDiv && endedDiv.innerHTML === "") endedDiv.innerHTML = "<p>No matches have ended yet.</p>";
}

// -----------------------------
// Schedule Page
// -----------------------------
async function populateSchedule() {
  const matches = await fetchResults();
  const scheduleDiv = document.getElementById("schedule");
  if (!scheduleDiv) return;

  scheduleDiv.innerHTML = "";

  matches.forEach(m => {
    const div = document.createElement("div");
    div.className = "card fade-in";
    div.innerHTML = `
      <p>${m.date} ${m.time} | ${m.map} | ${m.teamA} vs ${m.teamB}</p>
    `;
    scheduleDiv.appendChild(div);
  });
}

// Example data (you can update results here, Points = Wins*3)
const teamsData = [
  { name: "Team Alpha", wins: 5, losses: 2, kills: 45 },
  { name: "Team Bravo", wins: 4, losses: 3, kills: 38 },
  { name: "Team Charlie", wins: 6, losses: 1, kills: 50 },
  // Add more teams here
];

// Function to calculate points and sort
function renderTeams() {
  const container = document.getElementById('teams-container');
  container.innerHTML = '';

  // Calculate points for each team
  teamsData.forEach(team => team.points = team.wins * 3);

  // Sort by points descending
  teamsData.sort((a, b) => b.points - a.points);

  // Create cards
  teamsData.forEach(team => {
    const card = document.createElement('div');
    card.classList.add('team-card');
    card.innerHTML = `
      <div class="team-name">${team.name}</div>
      <div class="team-stats">
        <span>Wins: ${team.wins}</span>
        <span>Losses: ${team.losses}</span>
        <span>Kills: ${team.kills}</span>
        <span>Points: ${team.points}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Render teams when page loads
document.addEventListener('DOMContentLoaded', renderTeams);


// -----------------------------
// Initialize All
// -----------------------------
function init() {
  updateNextMatchTimer();
  populateTeams();
  populateLeaderboard();
  populateResults();
  populateSchedule();
}

document.addEventListener("DOMContentLoaded", init);
