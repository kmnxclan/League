const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');
let width, height;
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

let particles = [];
for(let i=0;i<150;i++){
    particles.push({
        x: Math.random()*width,
        y: Math.random()*height,
        r: Math.random()*3 + 1,
        dx: (Math.random()-0.5)*0.5,
        dy: (Math.random()-0.5)*0.5
    });
}

function draw(){
    ctx.clearRect(0,0,width,height);

    // Gradient background
    let gradient = ctx.createLinearGradient(0,0,width,height);
    gradient.addColorStop(0,"#0f0c29");
    gradient.addColorStop(0.5,"#302b63");
    gradient.addColorStop(1,"#24243e");
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,width,height);

    // Draw particles
    ctx.fillStyle = "rgba(255,0,0,0.7)";
    particles.forEach(p=>{
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if(p.x<0 || p.x>width) p.dx*=-1;
        if(p.y<0 || p.y>height) p.dy*=-1;
    });

    requestAnimationFrame(draw);
}
draw();
