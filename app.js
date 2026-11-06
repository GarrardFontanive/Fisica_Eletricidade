const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sliderN = document.getElementById('slider-n');
const sliderT = document.getElementById('slider-t');
const valN = document.getElementById('val-n');
const valT = document.getElementById('val-t');

const eqN = document.getElementById('eq-n');
const eqQ = document.getElementById('eq-q');
const eqQ2 = document.getElementById('eq-q2');
const eqT = document.getElementById('eq-t');
const eqI = document.getElementById('eq-i');

let N = 10;
let deltaT = 1.0;
const e = 1.6;

let Q = 0;
let current = 0;
let electrons = [];

function updateMath() {
    N = parseFloat(sliderN.value);
    deltaT = parseFloat(sliderT.value);

    Q = N * e * 0.1;
    current = Q / deltaT;

    valN.innerText = N;
    valT.innerText = deltaT.toFixed(1);
    eqN.innerText = N;
    eqQ.innerText = Q.toFixed(2);
    eqQ2.innerText = Q.toFixed(2);
    eqT.innerText = deltaT.toFixed(1);
    eqI.innerText = current.toFixed(2);

    const targetElectronCount = Math.floor(N * 3);
    while (electrons.length < targetElectronCount) {
        electrons.push(createElectron(true));
    }
    while (electrons.length > targetElectronCount) {
        electrons.pop();
    }
}

sliderN.addEventListener('input', updateMath);
sliderT.addEventListener('input', updateMath);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function createElectron(randomX = false) {
    const wireLength = Math.min(800, canvas.width * 0.7);
    const wireHeight = 220;
    const startX = (canvas.width - wireLength) / 2 + 100;
    const startY = (canvas.height - wireHeight) / 2;

    return {
        x: randomX ? startX + Math.random() * wireLength : startX,
        y: startY + 30 + Math.random() * (wireHeight - 60),
        speedMultiplier: 0.8 + Math.random() * 0.4
    };
}

function drawWire() {
    const w = Math.min(800, canvas.width * 0.7);
    const h = 220;
    const x = (canvas.width - w) / 2 + 100;
    const y = (canvas.height - h) / 2;

    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, '#555');
    grad.addColorStop(0.5, '#d3d3d3');
    grad.addColorStop(1, '#222');

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);

    ctx.beginPath();
    ctx.ellipse(x, y + h / 2, 40, h / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#666';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#111';
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(x + w, y + h / 2, 40, h / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#888';
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.moveTo(x, y + h);
    ctx.lineTo(x + w, y + h);
    ctx.stroke();
}

function drawCrossSection() {
    const w = Math.min(800, canvas.width * 0.7);
    const h = 220;
    const x = (canvas.width - w) / 2 + 100 + w / 2;
    const y = (canvas.height - h) / 2;

    ctx.fillStyle = 'rgba(103, 58, 183, 0.4)';
    ctx.strokeStyle = 'rgba(103, 58, 183, 0.9)';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.ellipse(x, y + h / 2, 40, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

function drawElectrons() {
    const w = Math.min(800, canvas.width * 0.7);
    const xBase = (canvas.width - w) / 2 + 100;

    electrons.forEach(el => {
        const baseSpeed = Math.max(0.5, current * 1.5);
        el.x += baseSpeed * el.speedMultiplier;

        if (el.x > xBase + w) {
            Object.assign(el, createElectron());
        }

        ctx.beginPath();
        ctx.arc(el.x, el.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#ffeb3b';
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000';
        ctx.stroke();

        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('-', el.x, el.y + 1);
    });
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawWire();
    drawElectrons();
    drawCrossSection();

    requestAnimationFrame(update);
}

updateMath();
update();