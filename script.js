
'use strict';

// Laboratório didático de corrente elétrica — JavaScript puro, sem dependências.
// Sistema de coordenadas fixo para preservar as proporções em projetores e celulares.
const $ = (id) => document.getElementById(id);
const canvas = $('canvas');
const ctx = canvas.getContext('2d');
const VIEW = { w: 1200, h: 760 };
const circuit = { left: 205, right: 995, top: 528, bottom: 693 };
const tube = { x: 90, y: 151, w: 1020, h: 235 };
const state = {
  closed: false, elapsed: 0, speed: 1, last: 0, dt: 0,
  scale: 1, offsetX: 0, offsetY: 0, width: 0, height: 0, lever: 0
};
const particles = [];
const TOTAL = 18;
const random = (a, b) => a + Math.random() * (b - a);

function resetParticles() {
  particles.length = 0;
  for (let i = 0; i < TOTAL; i++) {
    const angle = random(-Math.PI, Math.PI);
    particles.push({
      x: random(38, tube.w - 38), y: random(35, tube.h - 35),
      vx: Math.cos(angle), vy: Math.sin(angle),
      lane: i % 3, turn: random(0.5, 2.0), factor: random(0.8, 1.2)
    });
  }
}

function setCircuit(closed) {
  state.closed = closed;
  $('toggle').classList.toggle('on', closed);
  $('toggle').setAttribute('aria-pressed', String(closed));
  $('toggleLabel').textContent = closed ? 'Abrir chave CH' : 'Fechar chave CH';
  $('toggle').querySelector('.button-symbol').textContent = closed ? '●' : '◯';
  $('statePill').classList.toggle('on', closed);
  $('stateText').textContent = closed ? 'CHAVE FECHADA' : 'CHAVE ABERTA';
  $('convencional').disabled = !closed;
  $('real').disabled = !closed;
  $('formulaResult').classList.toggle('on', closed);
  $('formulaResult').textContent = closed ? 'i > 0' : 'i = 0';
  if (closed) {
    // Representação idealizada: elétrons se alinham em três pistas e derivam à esquerda.
    particles.forEach((p, i) => {
      p.y = [42, 118, 194][p.lane];
      p.x = 65 + Math.floor(i / 3) * 175 + p.lane * 16;
      p.vx = -1; p.vy = 0;
    });
  } else {
    particles.forEach(p => {
      const angle = random(-Math.PI, Math.PI);
      p.vx = Math.cos(angle); p.vy = Math.sin(angle);
      p.turn = random(.5, 1.6);
    });
  }
  draw();
}

function update(dt) {
  state.elapsed += dt * state.speed;
  state.lever += (Number(state.closed) - state.lever) * Math.min(1, dt * 13);
  const speed = 88 * dt * state.speed;
  for (const p of particles) {
    if (state.closed) {
      p.x -= speed * 1.15;
      if (p.x < 21) p.x = tube.w - 21;
    } else {
      p.turn -= dt * state.speed;
      if (p.turn <= 0) {
        const angle = Math.atan2(p.vy, p.vx) + random(-1.1, 1.1);
        p.vx = Math.cos(angle); p.vy = Math.sin(angle);
        p.turn = random(.5, 2);
      }
      p.x += p.vx * speed * p.factor;
      p.y += p.vy * speed * p.factor;
      if (p.x < 23) { p.x = 23; p.vx = Math.abs(p.vx); }
      if (p.x > tube.w - 23) { p.x = tube.w - 23; p.vx = -Math.abs(p.vx); }
      if (p.y < 22) { p.y = 22; p.vy = Math.abs(p.vy); }
      if (p.y > tube.h - 22) { p.y = tube.h - 22; p.vy = -Math.abs(p.vy); }
    }
  }
}

function line(x1, y1, x2, y2, color, width = 2) {
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke();
}
function rounded(x, y, w, h, r) {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
}
function circle(x, y, r, fill, stroke = null, sw = 1) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}
function label(text, x, y, size = 19, color = '#eef8ff', weight = 700, align = 'left') {
  ctx.font = `${weight} ${size}px system-ui,Arial,sans-serif`;
  ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(text, x, y);
}
function arrow(x1, y1, x2, y2, color, width = 8) {
  const theta = Math.atan2(y2 - y1, x2 - x1), head = 19;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.shadowColor = color; ctx.shadowBlur = 12;
  line(x1, y1, x2, y2, color, width);
  ctx.beginPath(); ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - Math.cos(theta - .52) * head, y2 - Math.sin(theta - .52) * head);
  ctx.lineTo(x2 - Math.cos(theta + .52) * head, y2 - Math.sin(theta + .52) * head);
  ctx.closePath(); ctx.fillStyle = color; ctx.fill(); ctx.restore();
}
function vector(x, y, theta) {
  const r = 20, length = 25;
  arrow(x + Math.cos(theta) * r, y + Math.sin(theta) * r,
    x + Math.cos(theta) * (r + length), y + Math.sin(theta) * (r + length), '#ffe178', 3.2);
}
function drawBackground() {
  ctx.fillStyle = '#081726'; ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  const light = ctx.createRadialGradient(580, 250, 20, 580, 320, 850);
  light.addColorStop(0, '#163047'); light.addColorStop(1, '#081523');
  ctx.fillStyle = light; ctx.fillRect(0, 0, VIEW.w, VIEW.h);
}

function drawCopperTube() {
  label('AMPLIAÇÃO DO FIO DE COBRE', 74, 48, 26, '#e7f6ff', 800);
  label(state.closed ? 'MOVIMENTO ORIENTADO' : 'MOVIMENTO DESORDENADO', 1126, 48, 23,
    state.closed ? '#77efc8' : '#ffd28c', 800, 'right');

  // Envoltória cilíndrica do fio, com gradientes metálicos e duas pontas curvas.
  const outer = ctx.createLinearGradient(0, 98, 0, 440);
  outer.addColorStop(0, '#f4c894'); outer.addColorStop(.10, '#b7683b');
  outer.addColorStop(.18, '#552f25'); outer.addColorStop(.55, '#9d532e');
  outer.addColorStop(.84, '#522a22'); outer.addColorStop(.95, '#d2874d'); outer.addColorStop(1, '#f5c289');
  ctx.save(); ctx.shadowColor = '#000b'; ctx.shadowBlur = 24;
  rounded(56, 100, 1088, 332, 78); ctx.fillStyle = outer; ctx.fill(); ctx.restore();
  rounded(56, 100, 1088, 332, 78); ctx.strokeStyle = '#e9ae75'; ctx.lineWidth = 4; ctx.stroke();

  // Abertura didática mostrando a rede cristalina no metal.
  const inner = ctx.createLinearGradient(0, tube.y, 0, tube.y + tube.h);
  inner.addColorStop(0, '#1d2832'); inner.addColorStop(.5, '#2c3139'); inner.addColorStop(1, '#171e2a');
  rounded(tube.x, tube.y, tube.w, tube.h, 36); ctx.fillStyle = inner; ctx.fill();
  ctx.save(); rounded(tube.x, tube.y, tube.w, tube.h, 36); ctx.clip();
  // Padrão cristalino (íons positivos fixos na estrutura do metal).
  for (let row = 0; row < 3; row++)for (let col = 0; col < 9; col++) {
    const x = tube.x + 66 + col * 112 + (row % 2) * 21;
    const y = tube.y + 48 + row * 72;
    if (col < 8) line(x + 18, y, x + 94, y, '#76594c99', 2);
    if (row < 2) line(x, y + 18, x + 21, y + 54, '#76594c66', 2);
  }
  for (let row = 0; row < 3; row++)for (let col = 0; col < 9; col++) {
    const x = tube.x + 66 + col * 112 + (row % 2) * 21;
    const y = tube.y + 48 + row * 72;
    const glow = ctx.createRadialGradient(x - 5, y - 6, 2, x, y, 24);
    glow.addColorStop(0, '#ffd9a1'); glow.addColorStop(.5, '#bc7445'); glow.addColorStop(1, '#623e2e');
    circle(x, y, 18, glow, '#e8ae7a', 1.6);
    label('+', x, y - 1, 18, '#fff0d2', 800, 'center');
  }
  // Pistas luminosas apenas no estado idealizado com corrente.
  if (state.closed) for (let i = 0; i < 3; i++) {
    const y = tube.y + [42, 118, 194][i];
    ctx.setLineDash([6, 13]); line(tube.x + 20, y, tube.x + tube.w - 20, y, '#5de2f930', 2);
    ctx.setLineDash([]);
  }
  for (const p of particles) {
    const x = tube.x + p.x, y = tube.y + p.y;
    ctx.save(); ctx.shadowColor = '#48d9ff'; ctx.shadowBlur = 15;
    circle(x, y, 14, '#54dafa', '#dbfaff', 2); ctx.restore();
    circle(x, y, 9.5, '#136885');
    line(x - 6, y, x + 6, y, '#e5ffff', 3);
    vector(x, y, state.closed ? Math.PI : Math.atan2(p.vy, p.vx));
  }
  ctx.restore();
  rounded(tube.x, tube.y, tube.w, tube.h, 36); ctx.strokeStyle = '#ffc48e'; ctx.lineWidth = 7; ctx.stroke();
  // Reflexos superiores e inferiores dão volume ao fio metálico.
  line(154, 112, 1047, 112, '#ffdcaa9e', 4);
  line(153, 420, 1043, 420, '#ffd09a8b', 4);
  label('ÍONS (+) FIXOS', 140, 460, 18, '#e5b68e', 750);
  label('ELÉTRONS LIVRES (−)', 1063, 460, 18, '#8be9fc', 750, 'right');
}

function copperWire(x1, y1, x2, y2) {
  // Fio de cobre com borda escura e reflexo longitudinal.
  ctx.save(); ctx.lineCap = 'round';
  line(x1, y1, x2, y2, '#4c261e', 24);
  line(x1, y1, x2, y2, '#a95d35', 19);
  line(x1, y1 - 3, x2, y2 - 3, '#e5a16c', 6);
  line(x1, y1 + 6, x2, y2 + 6, '#733c2b', 4);
  ctx.restore();
}
function drawBattery() {
  const x = 495, y = 657, w = 212, h = 71;
  ctx.save(); ctx.shadowColor = '#000a'; ctx.shadowBlur = 14;
  const metal = ctx.createLinearGradient(x, y, x, y + h);
  metal.addColorStop(0, '#dbe5f2'); metal.addColorStop(.22, '#8796aa');
  metal.addColorStop(.55, '#405368'); metal.addColorStop(.88, '#778ca3'); metal.addColorStop(1, '#dce5ed');
  rounded(x, y, w, h, 14); ctx.fillStyle = metal; ctx.fill(); ctx.restore();
  rounded(x, y, w, h, 14); ctx.strokeStyle = '#b8c7d6'; ctx.lineWidth = 3; ctx.stroke();
  circle(x + 11, y + h / 2, 21, '#bdccdd', '#e4f2fc', 2);
  circle(x + w - 11, y + h / 2, 21, '#4f6885', '#b0c0d0', 2);
  label('+', x + 32, y + 19, 22, '#fff5d9', 900, 'center');
  label('−', x + w - 32, y + 19, 22, '#e4efff', 900, 'center');
  label('V', x + w / 2, y + h / 2 + 7, 40, '#f7fdff', 900, 'center');
  label('BATERIA', x + w / 2, y + 92, 17, '#bdcce0', 800, 'center');
}
function drawSwitch() {
  const x = circuit.right, upper = 577, lower = 634;
  circle(x, upper, 12, '#dec5a5', '#613c2c', 3);
  circle(x, lower, 12, '#dec5a5', '#613c2c', 3);
  circle(x, upper, 5, '#513627'); circle(x, lower, 5, '#513627');
  const tipX = x + 51 * (1 - state.lever);
  const tipY = upper - 8 * (1 - state.lever);
  ctx.save(); ctx.lineCap = 'round'; ctx.shadowColor = state.closed ? '#65eac4' : '#ffce87'; ctx.shadowBlur = 10;
  line(x, lower, tipX, tipY, state.closed ? '#8df5c6' : '#f8c98f', 13); ctx.restore();
  circle(x, lower, 7, '#fff0d1');
  label('CH', x + 93, 600, 32, '#f9edda', 900, 'center');
}
function drawCircuit() {
  const { left, right, top, bottom } = circuit;
  // Lentes tracejadas conectam o zoom ao trecho ampliado do circuito.
  ctx.setLineDash([8, 11]);
  line(192, 432, 192, 508, '#91cbdd51', 2);
  line(1008, 432, 1008, 508, '#91cbdd51', 2);
  ctx.setLineDash([]);
  copperWire(left, top, right, top);
  copperWire(left, top, left, bottom);
  copperWire(left, bottom, 495, bottom);
  copperWire(707, bottom, right, bottom);
  copperWire(right, top, right, 566);
  copperWire(right, 645, right, bottom);
  drawBattery(); drawSwitch();
  // Sobre o fio superior, os vetores de corrente têm sentidos opostos.
  if (state.closed) {
    if ($('convencional').checked) {
      arrow(385, 497, 777, 497, '#ff657b', 9);
      label('i', 798, 497, 28, '#ff7a91', 900);
    }
    if ($('real').checked) {
      arrow(775, 564, 386, 564, '#6fa8ff', 9);
      label('e⁻', 355, 565, 26, '#87b8ff', 900, 'center');
    }
  } else {
    label('SEM CORRENTE', 597, 500, 22, '#ffd29b', 800, 'center');
  }
}

function draw() {
  if (!state.width || !state.height) return;
  const dpr = Math.min(2.5, window.devicePixelRatio || 1);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#081726'; ctx.fillRect(0, 0, state.width, state.height);
  ctx.translate(state.offsetX, state.offsetY);
  ctx.scale(state.scale, state.scale);
  drawBackground(); drawCopperTube(); drawCircuit();
}
function resize() {
  const bounds = $('canvasWrap').getBoundingClientRect();
  state.width = Math.max(200, bounds.width); state.height = Math.max(200, bounds.height);
  const dpr = Math.min(2.5, window.devicePixelRatio || 1);
  canvas.width = Math.round(state.width * dpr); canvas.height = Math.round(state.height * dpr);
  state.scale = Math.min(state.width / VIEW.w, state.height / VIEW.h);
  state.offsetX = (state.width - VIEW.w * state.scale) / 2;
  state.offsetY = (state.height - VIEW.h * state.scale) / 2;
  draw();
}
function frame(now) {
  const dt = state.last ? Math.min(.045, (now - state.last) / 1000) : 0;
  state.last = now; update(dt); draw(); requestAnimationFrame(frame);
}
function canvasPosition(event) {
  const box = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - box.left - state.offsetX) / state.scale,
    y: (event.clientY - box.top - state.offsetY) / state.scale
  };
}
function isSwitch(x, y) { return x > 955 && x < 1135 && y > 555 && y < 656; }
canvas.addEventListener('pointerdown', e => {
  const { x, y } = canvasPosition(e);
  if (isSwitch(x, y)) setCircuit(!state.closed);
});
canvas.addEventListener('pointermove', e => {
  const { x, y } = canvasPosition(e);
  canvas.style.cursor = isSwitch(x, y) ? 'pointer' : 'default';
});
canvas.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCircuit(!state.closed); }
});
$('toggle').addEventListener('click', () => setCircuit(!state.closed));
$('convencional').addEventListener('change', draw);
$('real').addEventListener('change', draw);
$('speed').addEventListener('input', e => {
  state.speed = Number(e.target.value);
  $('speedOutput').textContent = state.speed.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '×';
});
$('reset').addEventListener('click', () => {
  resetParticles(); state.elapsed = 0; setCircuit(false);
});
$('full').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('simulation').requestFullscreen();
  } catch { alert('Não foi possível entrar em tela cheia. Tente F11.'); }
});
document.addEventListener('fullscreenchange', () => {
  $('full').textContent = document.fullscreenElement ? '⛶ Sair' : '⛶ Tela cheia';
  setTimeout(resize, 50);
});
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe($('canvasWrap'));
resetParticles(); setCircuit(false); resize(); requestAnimationFrame(frame);
