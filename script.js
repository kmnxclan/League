async function loadResults() {
  const res = await fetch("results.json");
  return await res.json();
}

function calcTeams(matches) {
  const teams = {};
  matches.forEach(m => {
    if (!teams[m.teamA]) teams[m.teamA] = { wins: 0, losses: 0, points: 0, kills: 0 };
    if (!teams[m.teamB]) teams[m.teamB] = { wins: 0, losses: 0, points: 0, kills: 0 };

    if (m.scoreA != null && m.scoreB != null) {
      if (m.scoreA > m.scoreB) {
        teams[m.teamA].wins++; teams[m.teamA].points += 3;
        teams[m.teamB].losses++;
      } else {
        teams[m.teamB].wins++; teams[m.teamB].points += 3;
        teams[m.teamA].losses++;
      }
      teams[m.teamA].kills += m.killsA || 0;
      teams[m.teamB].kills += m.killsB || 0;
    }
  });
  return teams;
}

function renderLeaderboard(teams) {
  const tbody = document.querySelector("#leaderboard tbody");
  if (!tbody) return;
  const sorted = Object.entries(teams).sort((a, b) => b[1].points - a[1].points);
  tbody.innerHTML = sorted.map(([team, stats], i) => `
    <tr class="fade-in">
      <td>${i + 1}</td>
      <td>${team}</td>
      <td>${stats.wins}</td>
      <td>${stats.losses}</td>
      <td>${stats.kills}</td>
      <td>${stats.points}</td>
    </tr>`).join("");
}

function renderTeams(teams) {
  const container = document.getElementById("teams");
  if (!container) return;
  container.innerHTML = Object.entries(teams).map(([team, stats]) => `
    <div class="card glow-border fade-in">
      <h2>${team}</h2>
      <p>Wins: ${stats.wins} | Losses: ${stats.losses} | Kills: ${stats.kills} | Points: ${stats.points}</p>
    </div>`).join("");
}

function renderResults(matches) {
  const liveDiv = document.getElementById("live-matches");
  const upcomingDiv = document.getElementById("upcoming-matches");
  const endedDiv = document.getElementById("ended-matches");
  if (!liveDiv || !upcomingDiv || !endedDiv) return;

  const now = new Date();
  const live = [], upcoming = [], ended = [];
  matches.forEach(m => {
    const matchDate = new Date(`${m.date}T${m.time}:00`);
    if (m.scoreA != null && m.scoreB != null) {
      ended.push(m);
    } else if (matchDate <= now && m.scoreA == null && m.scoreB == null) {
      live.push(m);
    } else {
      upcoming.push(m);
    }
  });

  liveDiv.innerHTML = live.length ? live.map(m => `<p>${m.teamA} vs ${m.teamB} (LIVE)</p>`).join("") : "No matches right now.";
  upcomingDiv.innerHTML = upcoming.map(m => `<p>${m.date} ${m.time} - ${m.teamA} vs ${m.teamB} @ ${m.map}</p>`).join("");
  endedDiv.innerHTML = ended.map(m => `<p>${m.teamA} ${m.scoreA} - ${m.scoreB} ${m.teamB}</p>`).join("");
}

function renderSchedule(matches) {
  const container = document.getElementById("schedule");
  if (!container) return;
  container.innerHTML = matches.map(m => `
    <div class="card fade-in">
      <h3>${m.date} ${m.time}</h3>
      <p>${m.teamA} vs ${m.teamB} @ ${m.map}</p>
    </div>`).join("");
}

async function main() {
  const matches = await loadResults();
  const teams = calcTeams(matches);

  renderLeaderboard(teams);
  renderTeams(teams);
  renderResults(matches);
  renderSchedule(matches);
}
main();
