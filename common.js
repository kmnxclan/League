// common.js - shared helpers for KMNx League
// Put this file in same folder and load on every page

// Nav highlight helper (adds .active class if href matches)
(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.main-nav .nav-link');
    const current = location.pathname.split('/').pop() || 'index.html';
    links.forEach(a => {
      const href = a.getAttribute('href');
      if(href === current) a.classList.add('active');
    });
  });
})();

// simple count-up function used by homepage
function common_countUp(elem, target, duration=1000){
  if(!elem) return;
  const start = 0;
  const range = target - start;
  const stepTime = Math.max(Math.floor(duration / target), 8);
  let current = start;
  const timer = setInterval(() => {
    current += Math.ceil(range / (duration / stepTime));
    if(current >= target){
      current = target;
      clearInterval(timer);
    }
    elem.textContent = current.toLocaleString();
  }, stepTime);
}
