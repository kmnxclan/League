// Countdown to next game
let nextGame = new Date("2025-10-10T19:00:00+02:00").getTime(); // Berlin Time
const countdownElement = document.getElementById('countdown');

function updateCountdown() {
  const now = new Date().getTime();
  const distance = nextGame - now;

  if(distance < 0){
    countdownElement.innerHTML = "Next game is live!";
    return;
  }

  const days = Math.floor(distance / (1000*60*60*24));
  const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
  const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
  const seconds = Math.floor((distance % (1000*60)) / 1000);

  countdownElement.innerHTML = `Next game in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}

setInterval(updateCountdown, 1000);
updateCountdown();
