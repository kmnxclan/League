// Collapsible sections
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const target = document.getElementById(button.dataset.target);
        document.querySelectorAll('.collapsible').forEach(sec => {
            if(sec !== target) sec.classList.remove('active');
        });
        target.classList.toggle('active');
    });
});

// Leaderboard auto-calc & sort
function updateLeaderboard() {
    const table = document.getElementById('leaderboard-table');
    const rows = Array.from(table.querySelectorAll('tr'));

    rows.forEach(row => {
        const wins = parseInt(row.dataset.wins);
        const losses = parseInt(row.dataset.losses);
        const played = wins + losses;
        const points = wins * 3;
        row.cells[2].innerText = played;
        row.cells[3].innerText = wins;
        row.cells[4].innerText = losses;
        row.cells[5].innerText = points;
    });

    rows.sort((a,b) => parseInt(b.cells[5].innerText) - parseInt(a.cells[5].innerText));

    rows.forEach((row, index) => {
        row.cells[0].innerText = index + 1;
        table.appendChild(row);
    });
}
updateLeaderboard();
