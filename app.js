const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ddpSlider = document.getElementById('ddp-slider');
const ddpVal = document.getElementById('ddp-val');
const currentVal = document.getElementById('current-val');
const tempVal = document.getElementById('temp-val');

let ddp = 0;
let temperatura = 20;
let corrente = 0;

const ions = [];
const rows = 6;
const cols = Math.floor(canvas.width / 100);
const spacingX = canvas.width / cols;
const spacingY = canvas.height / rows;

for (let i = 1; i < cols; i++) {
    for (let j = 1; j < rows; j++) {
        ions.push({
            x: i * spacingX,
            y: j * spacingY,
            radius: 25,
            heat: 0
        });
    }
}

const electrons = [];
const numElectrons = 150;

for (let i = 0; i < numElectrons; i++) {
    electrons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: 5
    });
}

ddpSlider.addEventListener('input', (e) => {
    ddp = parseInt(e.target.value);
    ddpVal.innerText = ddp + ' V';
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let currentHeat = 0;
    let driftVelocity = 0;

    ions.forEach(ion => {
        if (ion.heat > 0) ion.heat -= 0.2;
        
        const r = 80 + ion.heat;
        const g = 130 - (ion.heat * 0.5);
        const b = 220 - ion.heat;
        
        ctx.beginPath();
        ctx.arc(ion.x, ion.y, ion.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fill();
        ctx.closePath();
        
        currentHeat += ion.heat;
    });

    temperatura = 20 + (currentHeat / ions.length);

    electrons.forEach(el => {
        el.vx += (Math.random() - 0.5) * 2;
        el.vy += (Math.random() - 0.5) * 2;

        if (ddp > 0) {
            el.vx += ddp * 0.005;
        }

        const speed = Math.sqrt(el.vx * el.vx + el.vy * el.vy);
        const maxSpeed = 10;
        if (speed > maxSpeed) {
            el.vx = (el.vx / speed) * maxSpeed;
            el.vy = (el.vy / speed) * maxSpeed;
        }

        el.x += el.vx;
        el.y += el.vy;

        driftVelocity += el.vx;

        if (el.x > canvas.width) el.x = 0;
        if (el.x < 0) el.x = canvas.width;
        if (el.y > canvas.height) el.y = 0;
        if (el.y < 0) el.y = canvas.height;

        ions.forEach(ion => {
            const dx = el.x - ion.x;
            const dy = el.y - ion.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < ion.radius + el.radius) {
                el.vx *= -0.8;
                el.vy *= -0.8;
                
                ion.heat += (speed * 0.8) + (ddp * 0.05);
                if (ion.heat > 175) ion.heat = 175;
            }
        });

        ctx.beginPath();
        ctx.arc(el.x, el.y, el.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
        ctx.closePath();
    });

    corrente = Math.max(0, driftVelocity / numElectrons);
    currentVal.innerText = corrente.toFixed(2) + ' A';
    tempVal.innerText = temperatura.toFixed(1) + ' °C';

    requestAnimationFrame(update);
}

update();