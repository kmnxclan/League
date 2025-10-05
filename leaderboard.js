// SORT LEADERBOARD BY POINTS (descending)
const table = document.getElementById('leaderboard').getElementsByTagName('tbody')[0];
const rows = Array.from(table.rows);

rows.sort((a, b) => parseInt(b.cells[4].textContent) - parseInt(a.cells[4].textContent));

rows.forEach(row => table.appendChild(row));
