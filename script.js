const leaderboardBody = document.querySelector("#leaderboard-table tbody");
const matchesContainer = document.getElementById("matches-container");

// Function to render leaderboard
function renderLeaderboard() {
    // Sort teams by points descending
    teams.sort((a,b) => b.points - a.points);
    leaderboardBody.innerHTML = "";
    teams.forEach((team, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index+1}</td>
            <td>${team.team}</td>
            <td>${team.wins}</td>
            <td>${team.losses}</td>
            <td>${team.points}</td>
        `;
        leaderboardBody.appendChild(row);

        // Animate row highlight
        gsap.from(row, {opacity: 0, y: -20, duration: 0.6});
    });
}

// Function to render matches
function renderMatches() {
    matchesContainer.innerHTML = "";
    matches.forEach(match => {
        const card = document.createElement("div");
        card.className = "match-card";
        card.innerHTML = `
            <span>${match.team1} <strong>${match.score1}</strong></span>
            <span>VS</span>
            <span><strong>${match.score2}</strong> ${match.team2}</span>
        `;
        matchesContainer.appendChild(card);

        gsap.from(card, {opacity: 0, y: 20, duration: 0.6});
    });
}

// Initial render
renderLeaderboard();
renderMatches();

// Simulate live update every 5 seconds (for demo)
setInterval(() => {
    // Randomly update points
    const randomTeam = teams[Math.floor(Math.random() * teams.length)];
    randomTeam.wins += 1;
    randomTeam.points += 3;

    renderLeaderboard();
}, 5000);
