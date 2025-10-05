// SORT LEADERBOARD BY POINTS (descending)
const table = document.getElementById('leaderboard').getElementsByTagName('tbody')[0];
const rows = Array.from(table.rows);

rows.sort((a, b) => {
  const pointsA = parseInt(a.cells[4].textContent);
  const pointsB = parseInt(b.cells[4].textContent);
  return pointsB - pointsA; // Descending
});

// Re-add sorted rows to table
rows.forEach(row => table.appendChild(row));
