'use strict';
/**
 * LABORATÓRIO VIRTUAL DE ELETRICIDADE & ELETRODINÂMICA
 * Desenvolvido para o Instituto Federal Catarinense (IFC)
 * 100% Canvas API nativo, sem bibliotecas externas.
 */

const $ = id => document.getElementById(id);
const canvas = $('labCanvas');
const ctx = canvas.getContext('2d');
const W = 1200, H = 640, TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);

// ====================================================
// MATERIAIS & DADOS FÍSICOS
// ====================================================
const materials = {
  cobre: {
    name: 'Cobre (Cu)', kind: 'metal',
    color: ['#d98236', '#ad5a1d', '#6e350e'],
    rating: 1.0, drift: 1.0, rhoVal: '1,68 × 10⁻⁸ Ω·m',
    headline: 'Cobre · Excelente condutor metálico'
  },
  aluminio: {
    name: 'Alumínio (Al)', kind: 'metal',
    color: ['#cbd5e1', '#94a3b8', '#64748b'],
    rating: 0.65, drift: 0.72, rhoVal: '2,65 × 10⁻⁸ Ω·m',
    headline: 'Alumínio · Condutor leve para redes'
  },
  aco: {
    name: 'Aço / Nicromo', kind: 'metal',
    color: ['#94a3b8', '#64748b', '#334155'],
    rating: 0.15, drift: 0.30, rhoVal: '1,50 × 10⁻⁷ Ω·m',
    headline: 'Aço / Nicromo · Alta resistividade'
  },
  vidro: {
    name: 'Vidro (Isolante)', kind: 'insulator',
    color: ['#93c5fd', '#60a5fa', '#2563eb'],
    rating: 0.0, drift: 0.0, rhoVal: '> 10¹⁰ Ω·m',
    headline: 'Vidro · Isolante dielétrico'
  }
};

const appliances = {
  resistivo: {
    name: 'Chuveiro Elétrico', category: '100% CALOR (EFEITO JOULE)',
    nominalPower: 5500, nominalR: 2.93,
    formula: 'Q = m · c · ΔT'
  },
  motor: {
    name: 'Motor Elétrico', category: 'MOVIMENTO MECÂNICO',
    nominalPower: 120, nominalR: 134.4,
    formula: 'τ = i · A · B'
  },
  lampada: {
    name: 'Lâmpada Incandescente', category: '95% CALOR + 5% LUZ',
    nominalPower: 60, nominalR: 268.8,
    formula: 'P = U · i = R · i²'
  }
};

const sceneTitles = [
  ['Como os elétrons se movem em um condutor?', 'Compare os materiais, aplique uma ddp e observe a velocidade de deriva.'],
  ['Circuito Elétrico, Leis de Ohm & Medições', 'Varie U e R. Acompanhe voltímetro, amperímetro e a contagem de cargas na seção ΔS.'],
  ['Aparelhos do Cotidiano & Efeito Joule', 'Classificação dos aparelhos: transformação em calor (resistivos) e movimento (motores).'],
  ['DDP, Pássaro no Fio & Segurança Humana', 'Veja por que o pássaro não leva choque e simule o efeito da corrente no corpo humano.']
];

// ====================================================
// ESTADO GLOBAL
// ====================================================
const state = {
  page: 0,
  paused: false,
  t: 0,
  last: 0,
  width: 0,
  height: 0,
  scale: 1,
  dx: 0,
  dy: 0,
  isLight: false,

  // Cap 1
  material: 'cobre',
  matVoltage: 12,
  matFieldActive: true,
  matJoule: false,
  ionEnergy: Array.from({ length: 90 }, () => 0),
  showTracer: true,
  showVectors: true,
  samplePhotoImg: null,
  tracerTrail: [],       // {x, y} em coords do canvas

  // Cap 2
  closed: false,
  circuitVoltage: 12.0,
  circuitResistance: 6.0,
  representation: 'electron',
  lever: 0,
  chargeCount: 0,
  flashPulse: 0,

  // Cap 3
  appliance: 'resistivo',
  gridVoltage: 127,
  appliancePowerPct: 100,
  applianceActive: true,
  waterTemp: 22,
  motorAngle: 0,

  // Cap 4
  safetyMode: 'bird',
  birdTwo: false,
  humanVoltage: 127,
  humanSkin: 'seca',
  heartPhase: 0
};

// Partículas Microscópicas (Capítulo 1) - 60 elétrons bem distribuídos
const dots = Array.from({ length: 60 }, (_, i) => ({
  x: (i + 0.5) / 60,
  y: rand(0.08, 0.92),
  vx: rand(-1, 1),
  vy: rand(-1, 1),
  speed: rand(0.8, 1.3),
  turnTimer: rand(0.1, 0.8)
}));

// Partículas do Condutor (Capítulo 2)
const circuitDots = Array.from({ length: 32 }, (_, i) => ({
  x: (i + 0.5) / 32,
  y: 0.15 + (i % 4) * 0.23,
  lastX: (i + 0.5) / 32
}));

// Bolhas de convecção (Capítulo 3)
const bubbles = Array.from({ length: 24 }, () => ({
  x: rand(0.15, 0.85),
  y: rand(0.2, 0.85),
  r: rand(2.5, 6),
  speed: rand(0.25, 0.7),
  wobble: rand(0, TAU)
}));

// ====================================================
// NAVEGAÇÃO & UI
// ====================================================
function setPage(page) {
  state.page = page;
  document.querySelectorAll('.chapter').forEach((btn, i) => {
    btn.classList.toggle('active', i === page);
  });

  const panels = ['controlsMaterials', 'controlsCircuit', 'controlsAppliance', 'controlsSafety'];
  panels.forEach((id, i) => {
    const el = $(id);
    if (el) el.hidden = (i !== page);
  });

  $('sceneBadge').textContent = `EXP 0${page + 1} / 04`;
  $('sceneTitle').textContent = sceneTitles[page][0];
  $('sceneSubtitle').textContent = sceneTitles[page][1];

  if (page === 0) updateMaterialsUI();
  else if (page === 1) updateCircuitUI();
  else if (page === 2) updateApplianceUI();
  else if (page === 3) updateSafetyUI();

  render();
}

function updateMaterialsUI() {
  const m = materials[state.material];
  document.querySelectorAll('[data-material]').forEach(b => {
    b.classList.toggle('active', b.dataset.material === state.material);
  });

  $('matVoltageVal').textContent = `${state.matVoltage} V`;
  $('matVoltageSlider').value = state.matVoltage;

  const btnField = $('matFieldToggle');
  btnField.textContent = state.matFieldActive ? '⚡ Tensão Ativa' : '○ Tensão Desligada';
  btnField.classList.toggle('active', state.matFieldActive);

  $('matJouleToggle').classList.toggle('active', state.matJoule);

  $('matRhoReadout').textContent = m.rhoVal;
  const hasF = state.matFieldActive && state.matVoltage > 0 && m.kind === 'metal';
  const vd = hasF ? (state.matVoltage / 12 * m.drift).toFixed(2) : '0.00';
  $('matVdReadout').textContent = `${vd} mm/s (Lenta)`;
  if ($('matVthReadout')) $('matVthReadout').textContent = 'vth ≈ 10⁵ m/s (Rápida)';

  $('matStateReadout').textContent = hasF
    ? 'Deriva sob Campo E'
    : 'Agitação Caótica (U = 0)';
}

function updateCircuitUI() {
  const u = state.closed ? state.circuitVoltage : 0;
  const r = state.circuitResistance;
  const i = state.closed ? (u / r) : 0;
  const p = state.closed ? (u * i) : 0;

  $('circuitVoltageVal').textContent = `${state.circuitVoltage.toFixed(1)} V`;
  $('circuitVoltageSlider').value = state.circuitVoltage;
  $('circuitResistanceVal').textContent = `${state.circuitResistance.toFixed(1)} Ω`;
  $('circuitResistanceSlider').value = state.circuitResistance;

  const btnSwitch = $('switchBtn');
  btnSwitch.textContent = state.closed ? '⚡ Chave CH: Fechada [C]' : '⚡ Chave CH: Aberta [C]';
  btnSwitch.classList.toggle('active', state.closed);

  $('electronsBtn').classList.toggle('active', state.representation === 'electron');
  $('conventionalBtn').classList.toggle('active', state.representation === 'conventional');

  $('readoutU').textContent = `${u.toFixed(1)} V`;
  $('readoutI').textContent = `${i.toFixed(2)} A`;
  $('readoutP').textContent = `${p.toFixed(1)} W`;
  $('readoutQ').textContent = `${(state.chargeCount * 0.16).toFixed(2)} C`;
}

function updateApplianceUI() {
  const app = appliances[state.appliance];
  document.querySelectorAll('[data-appliance]').forEach(b => {
    b.classList.toggle('active', b.dataset.appliance === state.appliance);
  });

  document.querySelectorAll('[data-grid]').forEach(b => {
    b.classList.toggle('active', Number(b.dataset.grid) === state.gridVoltage);
  });

  $('appliancePowerVal').textContent = `${state.appliancePowerPct}%`;
  $('appliancePowerSlider').value = state.appliancePowerPct;

  const btnApp = $('applianceToggleBtn');
  btnApp.textContent = state.applianceActive ? 'Ligado' : 'Desligado';
  btnApp.classList.toggle('active', state.applianceActive);

  const activeFrac = state.applianceActive ? (state.appliancePowerPct / 100) : 0;
  const pReal = app.nominalPower * activeFrac * Math.pow(state.gridVoltage / 127, 2);
  const iReal = state.applianceActive ? (pReal / state.gridVoltage) : 0;

  $('appliancePowerReadout').textContent = `${pReal.toFixed(0)} W`;
  $('applianceCurrentReadout').textContent = `${iReal.toFixed(1)} A`;
  $('applianceEnergyReadout').textContent = app.category;
}

function updateSafetyUI() {
  const isBird = state.safetyMode === 'bird';
  $('modeBirdBtn').classList.toggle('active', isBird);
  $('modeHumanBtn').classList.toggle('active', !isBird);

  $('birdControlsGroup').hidden = !isBird;
  $('humanControlsGroup').hidden = isBird;

  if (isBird) {
    $('oneWireBtn').classList.toggle('active', !state.birdTwo);
    $('twoWireBtn').classList.toggle('active', state.birdTwo);

    if (!state.birdTwo) {
      $('safetyBadge').textContent = 'RISCO: NENHUM (ΔV ≈ 0 V)';
      $('safetyBadge').className = 'safety-badge';
      $('safetyInfoText').textContent = 'Pés no mesmo fio condutor: VA = VB. A corrente segue pelo condutor de cobre e não passa pelo pássaro.';
      highlightMeter(0);
    } else {
      $('safetyBadge').textContent = 'PERIGO: DESCARGA ELÉTRICA (ΔV = 120 V)';
      $('safetyBadge').className = 'safety-badge lethal';
      $('safetyInfoText').textContent = 'Pés em condutores diferentes (Fase e Neutro): há grande DDP. A corrente fecha circuito através do corpo!';
      highlightMeter(3);
    }
  } else {
    document.querySelectorAll('[data-volt]').forEach(b => {
      b.classList.toggle('active', Number(b.dataset.volt) === state.humanVoltage);
    });
    document.querySelectorAll('[data-skin]').forEach(b => {
      b.classList.toggle('active', b.dataset.skin === state.humanSkin);
    });

    const rBody = state.humanSkin === 'seca' ? 100000 : 1000;
    const currentA = state.humanVoltage / rBody;
    const currentMA = currentA * 1000;

    let badgeText = 'SEGURO (Imperceptível)';
    let badgeClass = 'safety-badge';
    let stepIndex = 0;

    if (currentMA < 1) {
      badgeText = `SEGURO (${currentMA.toFixed(2)} mA)`;
      stepIndex = 0;
    } else if (currentMA < 5) {
      badgeText = `FORMIGAMENTO (${currentMA.toFixed(1)} mA)`;
      badgeClass = 'safety-badge warning';
      stepIndex = 1;
    } else if (currentMA < 20) {
      badgeText = `TETANIZAÇÃO / NÃO SOLTA (${currentMA.toFixed(1)} mA)`;
      badgeClass = 'safety-badge warning';
      stepIndex = 2;
    } else if (currentMA < 1000) {
      badgeText = `FIBRILAÇÃO VENTRICULAR FATAL (${currentMA.toFixed(1)} mA)`;
      badgeClass = 'safety-badge lethal';
      stepIndex = 3;
    } else {
      badgeText = `PARADA CARDÍACA & QUEIMADURAS (${(currentMA / 1000).toFixed(2)} A)`;
      badgeClass = 'safety-badge lethal';
      stepIndex = 4;
    }

    $('safetyBadge').textContent = badgeText;
    $('safetyBadge').className = badgeClass;
    $('safetyInfoText').textContent = `Tensão: ${state.humanVoltage} V · Resistência: ${rBody >= 1000 ? (rBody / 1000).toFixed(0) + ' kΩ' : rBody + ' Ω'} (${state.humanSkin === 'seca' ? 'Pele Seca' : 'Pele Molhada'}).`;
    highlightMeter(stepIndex);
  }
}

function highlightMeter(idx) {
  for (let i = 0; i < 5; i++) {
    const el = $(`mStep${i}`);
    if (!el) continue;
    el.className = 'meter-step';
    if (i === idx) {
      el.className = `meter-step ${i === 0 ? 'active-safe' : i <= 2 ? 'active-warn' : 'active-danger'}`;
    }
  }
}

// ====================================================
// PRIMITIVAS GRÁFICAS NO CANVAS
// ====================================================
function line(x1, y1, x2, y2, color = '#fff', width = 2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function poly(points, fill, stroke = null, sw = 1) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  points.slice(1).forEach(p => ctx.lineTo(...p));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

function rect(x, y, w, h, r, fill, stroke = null, sw = 1) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

function text(str, x, y, size = 16, color = '#f0f4f8', weight = 700, align = 'left') {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.fillText(str, x, y);
}

function circle(x, y, r, fill, stroke = null, sw = 1) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke(); }
}

function arrow(x, y, angle, color, length = 24, width = 2.5) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  line(-length / 2, 0, length / 2, 0, color, width);
  poly([[length / 2, 0], [length / 2 - 8, -4], [length / 2 - 8, 4]], color);
  ctx.restore();
}

function capsule(x, y, w, h, label, color = '#fff', bg = '#253545', stroke = '#486581') {
  rect(x, y, w, h, Math.min(10, h / 2), bg, stroke, 1);
  text(label, x + w / 2, y + h / 2, 13, color, 750, 'center');
}

function backdrop() {
  const isL = state.isLight;
  ctx.fillStyle = isL ? '#f8fafc' : '#141e2a';
  ctx.fillRect(0, 0, W, H);

  // Grade suave de fundo
  const gridColor = isL ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.03)';
  for (let x = 0; x < W; x += 40) line(x, 0, x, H, gridColor, 1);
  for (let y = 0; y < H; y += 40) line(0, y, W, y, gridColor, 1);
}

function ion(x, y, r = 13, colour = '#d48b55', energy = 0) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 2, x, y, r);
  if (energy > 0.05) {
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.3, '#fbbf24');
    g.addColorStop(1, '#ef4444');
  } else {
    g.addColorStop(0, '#fffbeb');
    g.addColorStop(0.35, colour);
    g.addColorStop(1, '#78350f');
  }
  circle(x, y, r, g, energy > 0.1 ? '#fbbf24' : 'rgba(255, 255, 255, 0.4)', 1.5);
  text('+', x, y - 0.5, r * 1.15, '#ffffff', 850, 'center');
}

function electron(x, y, r = 8.5, positive = false) {
  const g = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, r);
  if (positive) {
    g.addColorStop(0, '#fee2e2');
    g.addColorStop(0.4, '#ef4444');
    g.addColorStop(1, '#991b1b');
  } else {
    g.addColorStop(0, '#e0f2fe');
    g.addColorStop(0.4, '#38bdf8');
    g.addColorStop(1, '#0284c7');
  }
  circle(x, y, r, g, '#ffffff', 1);
  text(positive ? '+' : '−', x, y - 0.5, r * 1.5, '#ffffff', 900, 'center');
}

function wirePath(points, copperColor = '#c26d32') {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const stroke = (color, width, offsetY = 0) => {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1] + offsetY);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1] + offsetY);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  };
  stroke('#0f172a', 14);
  stroke(copperColor, 10);
  stroke('#fed7aa', 2.5, -1);
}

// ====================================================
// EXPERIMENTO 01: MATERIAIS & VISÃO MICROSCÓPICA
// ====================================================
function drawMaterials() {
  backdrop();
  const isL = state.isLight;
  const m = materials[state.material];
  const isMetal = m.kind === 'metal';
  const hasField = state.matFieldActive && state.matVoltage > 0;

  // CORTE DO CONDUTOR AMPLIADO (Ocupa o espaço central com folga)
  const bx = 80, by = 100, bw = 1040, bh = 420;

  // Barra sólida metálica
  rect(bx, by, bw, bh, 18, isL ? '#e2e8f0' : '#1e293b', isL ? '#cbd5e1' : '#334155', 2);

  // Janela interna de corte microscópico
  const ix = bx + 25, iy = by + 25, iw = bw - 50, ih = bh - 50;
  rect(ix, iy, iw, ih, 14, isL ? '#f1f5f9' : '#0f172a', isL ? '#cbd5e1' : '#1e293b', 2);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(ix, iy, iw, ih, 14);
  ctx.clip();

  // Grade de Íons Metálicos (5 linhas x 16 colunas = 80 íons bem espaçados)
  const rows = 5, cols = 16;
  const colSpacing = iw / (cols + 0.5);
  const rowSpacing = ih / (rows + 0.5);

  let ionIndex = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const energy = state.ionEnergy[ionIndex] || 0;
      const jitterAmp = state.matJoule ? 3.5 : 1.0;
      const jx = Math.sin(state.t * 15 + c * 2 + r) * jitterAmp * (1 + energy * 2.5);
      const jy = Math.cos(state.t * 14 + r * 2 + c) * jitterAmp * (1 + energy * 2.5);

      const x = ix + colSpacing * (c + 0.75 + (r % 2) * 0.3) + jx;
      const y = iy + rowSpacing * (r + 0.8) + jy;

      if (isMetal) {
        ion(x, y, 13, m.color[0], energy);
      } else {
        // Átomos do Vidro: núcleos neutros com elétrons presos
        circle(x, y, 12, '#64748b', '#94a3b8', 1.5);
        text('Si-O', x, y - 0.5, 9, '#ffffff', 800, 'center');
        const orb = state.t * 3 + c + r;
        electron(x + Math.cos(orb) * 18, y + Math.sin(orb) * 18, 5, false);
      }
      ionIndex++;
    }
  }

  // Mar de Elétrons Livres com FLECHAS NÍTIDAS, traçador e legenda
  if (isMetal) {
    // 1. Rastro do elétron traçador (atrás dos elétrons)
    if (state.showTracer && state.tracerTrail.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.globalAlpha = 0.65;
      ctx.beginPath();
      state.tracerTrail.forEach((pt, i) => {
        const tx = ix + pt.x * iw;
        const ty = iy + pt.y * ih;
        if (i === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);
      });
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    // 2. Elétrons individuais
    dots.forEach((p, idx) => {
      const x = ix + p.x * iw;
      const y = iy + p.y * ih;
      const isTracer = idx === 0 && state.showTracer;

      // Círculo do elétron
      electron(x, y, isTracer ? 11 : 7.5, false);
      if (isTracer) {
        // Anel dourado destacado
        ctx.save();
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(x, y, 15, 0, TAU);
        ctx.stroke();
        ctx.restore();
        text('traçador', x, y - 20, 9, '#fbbf24', 700, 'center');
      }

      // Vetores de velocidade
      if (state.showVectors) {
        const thermalAngle = Math.atan2(p.vy, p.vx);
        const len = isTracer ? 34 : 20;
        const col = isTracer ? '#fbbf24' : (hasField ? '#94a3b8' : '#f59e0b');
        // Vetor térmico
        arrow(x, y, thermalAngle, col, len, isTracer ? 3 : 1.8);

        // Vetor de deriva (separado, em azul) só com campo
        if (hasField) {
          arrow(x, y, Math.PI, '#38bdf8', isTracer ? 32 : 22, isTracer ? 3 : 2);
        }
      }
    });

    // 3. Legenda dos vetores (canto inferior esquerdo da janela)
    if (state.showVectors) {
      const lx = ix + 10, ly = iy + ih - 28;
      // Linha térmica
      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + 28, ly); ctx.stroke();
      text('agitação térmica (rápida)', lx + 32, ly + 4, 10, '#f59e0b', 700);
      if (hasField) {
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath(); ctx.moveTo(lx, ly + 14); ctx.lineTo(lx + 28, ly + 14); ctx.stroke();
        text('deriva vd → polo (+)  (lenta)', lx + 32, ly + 18, 10, '#38bdf8', 700);
      }
      ctx.restore();
    }

  } else {
    capsule(bx + bw / 2 - 200, by + bh / 2 - 25, 400, 50, 'SEM ELÉTRONS LIVRES NESTE ISOLANTE', '#fff', '#1e293b');
  }
  ctx.restore();

  // Foto da amostra real (canto superior direito da janela interna)
  if (state.samplePhotoImg) {
    const pw = 170, ph = 110;
    const px = ix + iw - pw - 8, py = iy + 8;
    ctx.save();
    ctx.drawImage(state.samplePhotoImg, px, py, pw, ph);
    rect(px, py, pw, ph, 6, null, '#d48b55', 2);
    text('AMOSTRA REAL', px + pw / 2, py + ph + 12, 10, '#d48b55', 750, 'center');
    ctx.restore();
  }

  // Terminal Positivo (+) à esquerda e Negativo (−) à direita quando com DDP
  if (hasField && isMetal) {
    capsule(bx + 10, by - 36, 130, 28, 'POLO (+) V+', '#fff', '#dc2626');
    capsule(bx + bw - 140, by - 36, 130, 28, 'POLO (−) 0 V', '#fff', '#2563eb');
    arrow(bx + bw / 2, by - 22, Math.PI, '#38bdf8', 140, 3);
    text('DERIVA DOS ELÉTRONS (e⁻) → POLO POSITIVO', bx + bw / 2, by - 40, 11, '#38bdf8', 800, 'center');
  } else if (isMetal) {
    capsule(bx + bw / 2 - 160, by - 34, 320, 26, 'SEM DDP · AGITAÇÃO TÉRMICA CAÓTICA', isL ? '#334155' : '#cbd5e1', isL ? '#e2e8f0' : '#1e293b');
  }

  // Rodapé interno: Condutividade e Efeito Joule
  const subY = by + bh + 25;
  text(`MATERIAL: ${m.name.toUpperCase()} (ρ ≈ ${m.rhoVal})`, bx, subY, 13, isL ? '#334155' : '#cbd5e1', 800);
  if (state.matJoule && isMetal && hasField) {
    capsule(bx + bw - 360, subY - 14, 360, 28, '🔥 EFEITO JOULE: COLISÕES AQUECEM A REDE', '#fff', '#ea580c');
  }
}

// ====================================================
// EXPERIMENTO 02: CIRCUITO ELÉTRICO, SEÇÃO ΔS & GRÁFICO
// ====================================================
function drawCircuit() {
  backdrop();
  const isL = state.isLight;
  const u = state.closed ? state.circuitVoltage : 0;
  const r = state.circuitResistance;
  const iCurrent = state.closed ? (u / r) : 0;
  const power = state.closed ? (u * iCurrent) : 0;

  // 1. CIRCUITO ELÉTRICO ESQUEMÁTICO (PARTE SUPERIOR: y = 50 a y = 350)
  wirePath([[140, 240], [140, 100], [540, 100]]);
  wirePath([[660, 100], [1060, 100], [1060, 200]]);
  wirePath([[1060, 270], [1060, 350], [670, 350]]);
  wirePath([[510, 350], [140, 350], [140, 240]]);

  // Bateria DC (à esquerda)
  drawBatteryBox(90, 190, 100, 100, state.circuitVoltage);

  // Lâmpada incandescente (topo centro)
  drawBulb(600, 100, power);

  // Chave CH (à direita)
  drawSwitchCH(1060, 200, 1060, 270, state.lever);

  // Reostato (fundo centro)
  drawRheostat(590, 350, state.circuitResistance);

  // Voltímetro e Amperímetro
  drawMeter(760, 50, 120, 42, 'VOLTÍMETRO', `${u.toFixed(1)} V`, '#0284c7');
  line(760, 92, 760, 100, '#0284c7', 1.5);
  line(880, 92, 880, 100, '#0284c7', 1.5);

  drawMeter(300, 50, 120, 42, 'AMPERÍMETRO', `${iCurrent.toFixed(2)} A`, '#f59e0b');
  line(360, 92, 360, 100, '#f59e0b', 1.5);

  // Setas de corrente no circuito fechado
  if (state.closed && iCurrent > 0) {
    const isElec = state.representation === 'electron';
    arrow(430, 100, isElec ? Math.PI : 0, isElec ? '#38bdf8' : '#ef4444', 36, 3);
    text(isElec ? 'e⁻' : 'i', 430, 84, 13, isElec ? '#38bdf8' : '#ef4444', 800, 'center');
    arrow(850, 350, isElec ? 0 : Math.PI, isElec ? '#38bdf8' : '#ef4444', 36, 3);
  }

  // 2. CORTE AMPLIADO DO CONDUTOR COM SEÇÃO ΔS (PARTE INFERIOR ESQUERDA)
  const cutX = 80, cutY = 410, cutW = 700, cutH = 190;
  rect(cutX, cutY, cutW, cutH, 14, isL ? '#e2e8f0' : '#1e293b', isL ? '#cbd5e1' : '#334155', 2);

  // Fundo de cobre do interior
  const innerCutX = cutX + 16, innerCutY = cutY + 16, innerCutW = cutW - 32, innerCutH = cutH - 32;
  rect(innerCutX, innerCutY, innerCutW, innerCutH, 10, isL ? '#fed7aa' : '#2b1b11', '#d48b55', 2);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(innerCutX, innerCutY, innerCutW, innerCutH, 10);
  ctx.clip();

  // Rede de íons de cobre
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 15; c++) {
      ion(innerCutX + 25 + c * 46 + (r % 2) * 22, innerCutY + 28 + r * 50, 10, '#c26d32');
    }
  }

  // SEÇÃO TRANSVERSAL RETA ΔS (NÍTIDA, ELEGANTE E COM DESTAQUE)
  const crossX = innerCutX + innerCutW * 0.5;
  const isFlashing = state.flashPulse > 0.05;

  ctx.fillStyle = isFlashing ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.2)';
  ctx.fillRect(crossX - 12, innerCutY, 24, innerCutH);

  line(crossX, innerCutY, crossX, innerCutY + innerCutH, '#ef4444', 2.5);

  // Partículas móveis
  circuitDots.forEach(p => {
    const x = innerCutX + p.x * innerCutW;
    const y = innerCutY + p.y * innerCutH;
    const isPos = state.closed && state.representation === 'conventional';
    electron(x, y, 8, isPos);

    if (state.closed) {
      arrow(x, y, isPos ? 0 : Math.PI, isPos ? '#ef4444' : '#38bdf8', 16, 2);
    }
  });

  ctx.restore();

  // Etiqueta da Seção Reta
  capsule(crossX - 50, cutY + 6, 100, 22, 'SEÇÃO ΔS', '#fff', '#dc2626');

  // Detalhe explicativo sob a seção reta
  text(`CORRENTE ELÉTRICA: i = ΔQ / Δt = ${(iCurrent).toFixed(2)} A (1 A = 1 C/s)`, cutX + 16, cutY + cutH + 18, 12, isL ? '#334155' : '#cbd5e1', 750);

  // 3. GRÁFICO i × t (AMPLO E LEGÍVEL À DIREITA, SLIDE 15)
  const gx = 820, gy = 410, gw = 300, gh = 190;
  drawGraph(gx, gy, gw, gh, iCurrent);
}

function drawBatteryBox(x, y, w, h, val) {
  const isL = state.isLight;
  rect(x, y, w, h, 12, isL ? '#e2e8f0' : '#1e293b', '#d48b55', 2);
  rect(x + 18, y - 6, 18, 6, 2, '#d48b55');
  rect(x + w - 36, y - 6, 18, 6, 2, '#64748b');

  text('FONTE DC', x + w / 2, y + 22, 10, '#d48b55', 800, 'center');
  text(`${val.toFixed(1)}V`, x + w / 2, y + 52, 20, isL ? '#0f172a' : '#ffffff', 850, 'center');
  text('+  −', x + w / 2, y + 78, 15, isL ? '#64748b' : '#94a3b8', 800, 'center');
}

function drawSwitchCH(x1, y1, x2, y2, lever) {
  circle(x1, y1, 7, '#d48b55', '#0f172a', 2);
  circle(x2, y2, 7, '#d48b55', '#0f172a', 2);

  const angle = -0.55 * (1 - lever);
  const len = 70;
  ctx.save();
  ctx.translate(x2, y2);
  ctx.rotate(angle);
  line(0, 0, 0, -len, lever > 0.8 ? '#10b981' : '#f59e0b', 5);
  circle(0, -len, 5, '#ffffff');
  ctx.restore();

  capsule(x2 + 20, (y1 + y2) / 2 - 12, 50, 24, 'CH', '#ffffff', '#334155');
}

function drawBulb(cx, cy, power) {
  const brightness = Math.min(1, power / 96);
  if (brightness > 0.05) {
    const glow = ctx.createRadialGradient(cx, cy, 6, cx, cy, 70 * brightness + 15);
    glow.addColorStop(0, `rgba(254, 240, 138, ${0.9 * brightness})`);
    glow.addColorStop(0.5, `rgba(245, 158, 11, ${0.45 * brightness})`);
    glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    circle(cx, cy, 70 * brightness + 15, glow);
  }

  circle(cx, cy, 24, 'rgba(255, 255, 255, 0.25)', '#94a3b8', 2);
  const filColor = brightness > 0.1 ? `rgb(255, ${Math.floor(200 + 55 * brightness)}, 80)` : '#64748b';
  line(cx - 6, cy + 10, cx - 4, cy - 6, filColor, 2);
  line(cx + 6, cy + 10, cx + 4, cy - 6, filColor, 2);
  line(cx - 4, cy - 6, cx, cy - 12, filColor, 2.5);
  line(cx, cy - 12, cx + 4, cy - 6, filColor, 2.5);
  rect(cx - 9, cy + 18, 18, 10, 2, '#d48b55');
}

function drawRheostat(cx, cy, rVal) {
  const isL = state.isLight;
  rect(cx - 65, cy - 16, 130, 32, 6, isL ? '#e2e8f0' : '#1e293b', '#d48b55', 1.5);
  for (let x = cx - 55; x <= cx + 55; x += 10) {
    line(x, cy - 12, x, cy + 12, '#d48b55', 2);
  }
  text(`R = ${rVal.toFixed(1)} Ω`, cx, cy + 28, 11, isL ? '#0f172a' : '#f59e0b', 750, 'center');
}

function drawMeter(x, y, w, h, label, val, color) {
  const isL = state.isLight;
  rect(x, y, w, h, 6, isL ? '#ffffff' : '#0f172a', color, 1.5);
  text(label, x + w / 2, y + 12, 9, color, 800, 'center');
  text(val, x + w / 2, y + 28, 14, isL ? '#0f172a' : '#ffffff', 850, 'center');
}

function drawGraph(x, y, w, h, current) {
  const isL = state.isLight;
  rect(x, y, w, h, 12, isL ? '#ffffff' : '#0f172a', isL ? '#cbd5e1' : '#334155', 1.5);

  text('GRÁFICO i × t (SLIDE 15)', x + w / 2, y + 18, 11, '#d48b55', 800, 'center');

  const gx = x + 35, gy = y + 35, gw = w - 50, gh = h - 60;

  // Eixos
  line(gx, gy + gh, gx + gw, gy + gh, isL ? '#475569' : '#94a3b8', 2);
  line(gx, gy, gx, gy + gh, isL ? '#475569' : '#94a3b8', 2);
  text('t (s)', gx + gw - 10, gy + gh + 14, 10, isL ? '#475569' : '#94a3b8', 700);
  text('i (A)', gx - 8, gy + 8, 10, isL ? '#475569' : '#94a3b8', 700, 'right');

  // Nível da corrente
  const maxI = 6.0;
  const curH = (current / maxI) * (gh - 15);
  const curY = gy + gh - curH;

  if (current > 0) {
    // Área = ΔQ sombreada
    ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.fillRect(gx + 1, curY, gw - 15, curH);
    text('ÁREA = ΔQ (Carga)', gx + (gw - 15) / 2, curY + curH / 2, 10, '#10b981', 800, 'center');

    // Linha de corrente constante
    line(gx, curY, gx + gw - 15, curY, '#f59e0b', 2.5);
  } else {
    line(gx, gy + gh, gx + gw - 15, gy + gh, '#f59e0b', 2);
  }
}

// ====================================================
// EXPERIMENTO 03: APARELHOS DO COTIDIANO
// ====================================================
function drawAppliances() {
  backdrop();
  const app = appliances[state.appliance];

  if (state.appliance === 'resistivo') {
    drawHeaterAppliance();
  } else if (state.appliance === 'motor') {
    drawMotorAppliance();
  } else {
    drawLampAppliance();
  }
}

function drawHeaterAppliance() {
  const isL = state.isLight;
  // Recipiente de Vidro com Água (Grande, Centralizado)
  const bx = 360, by = 110, bw = 480, bh = 450;
  rect(bx, by, bw, bh, 20, isL ? '#ffffff' : '#0f172a', isL ? '#cbd5e1' : '#334155', 2.5);

  const waterLevel = by + 70;
  const waterH = bh - 85;
  const waterGrad = ctx.createLinearGradient(0, waterLevel, 0, by + bh);
  waterGrad.addColorStop(0, 'rgba(14, 165, 233, 0.35)');
  waterGrad.addColorStop(1, 'rgba(2, 132, 199, 0.65)');
  rect(bx + 8, waterLevel, bw - 16, waterH, 14, waterGrad);

  // Espiral de aquecimento de nicromo
  const rx = bx + bw / 2, ry = by + 280;
  const isHeating = state.applianceActive && state.appliancePowerPct > 0;
  const coilColor = isHeating ? '#ea580c' : '#64748b';

  ctx.save();
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.strokeStyle = coilColor;
  ctx.beginPath();
  for (let a = 0; a < TAU * 4.5; a += 0.2) {
    const x = rx + Math.cos(a) * (60 + a * 4);
    const y = ry + Math.sin(a) * (24 + a * 2.5);
    if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  // Fios de alimentação
  wirePath([[rx - 35, by - 20], [rx - 35, ry - 40]], '#d48b55');
  wirePath([[rx + 35, by - 20], [rx + 35, ry - 40]], '#d48b55');

  // Bolhas de convecção térmica
  if (isHeating) {
    bubbles.forEach(b => {
      const px = bx + 40 + b.x * (bw - 80) + Math.sin(state.t * 3 + b.wobble) * 8;
      const py = waterLevel + b.y * waterH;
      circle(px, py, b.r, 'rgba(255, 255, 255, 0.6)', '#ffffff', 1);
    });
  }

  // Termômetro graduado
  drawThermometer(bx + bw + 30, by + 40, state.waterTemp);

  // Cartão com fórmula
  capsule(bx + 40, by + 20, 400, 32, 'APARELHO RESISTIVO: ENERGIA ELÉTRICA → CALOR', '#fff', '#c2410c');
}

function drawThermometer(x, y, temp) {
  const isL = state.isLight;
  rect(x, y, 26, 320, 13, isL ? '#ffffff' : '#1e293b', '#cbd5e1', 2);
  const fillH = Math.min(280, Math.max(10, (temp / 100) * 280));
  rect(x + 5, y + 315 - fillH, 16, fillH, 8, '#dc2626');
  circle(x + 13, y + 325, 20, '#dc2626', '#ffffff', 2);
  text(`${temp.toFixed(0)}°C`, x + 40, y + 315 - fillH, 15, '#dc2626', 800);
}

function drawMotorAppliance() {
  const isL = state.isLight;
  const cx = 600, cy = 320;

  // Imãs Estator: Polo Norte (vermelho) à esquerda, Sul (azul) à direita
  rect(cx - 280, cy - 120, 100, 240, 14, '#dc2626', '#b91c1c', 2);
  text('N', cx - 230, cy, 40, '#ffffff', 900, 'center');

  rect(cx + 180, cy - 120, 100, 240, 14, '#2563eb', '#1d4ed8', 2);
  text('S', cx + 230, cy, 40, '#ffffff', 900, 'center');

  // Linhas de campo B
  for (let dy = -80; dy <= 80; dy += 40) {
    line(cx - 170, cy + dy, cx + 170, cy + dy, 'rgba(16, 185, 129, 0.4)', 2);
    arrow(cx, cy + dy, 0, 'rgba(16, 185, 129, 0.7)', 30, 2.5);
  }
  text('CAMPO MAGNÉTICO B →', cx, cy - 105, 13, '#10b981', 800, 'center');

  // Rotor giratório e pás de ventilador
  const rot = state.motorAngle;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  rect(-85, -28, 170, 56, 10, '#d97706', '#b45309', 2);
  circle(0, 0, 30, '#334155', '#ffffff', 2);

  for (let k = 0; k < 4; k++) {
    ctx.rotate(Math.PI / 2);
    poly([[0, -12], [160, -42], [170, 0], [160, 42], [0, 12]], 'rgba(203, 213, 225, 0.7)', '#94a3b8', 1.5);
  }
  ctx.restore();

  circle(cx, cy, 14, '#0f172a', '#ffffff', 2.5);
  capsule(cx - 200, cy - 180, 400, 34, 'MOTOR ELÉTRICO: ENERGIA ELÉTRICA → MOVIMENTO', '#fff', '#15803d');
}

function drawLampAppliance() {
  const isL = state.isLight;
  const cx = 600, cy = 320;
  const isLit = state.applianceActive && state.appliancePowerPct > 0;
  const glowR = isLit ? 180 : 35;

  if (isLit) {
    const glow = ctx.createRadialGradient(cx, cy - 25, 25, cx, cy - 25, glowR);
    glow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
    glow.addColorStop(0.4, 'rgba(245, 158, 11, 0.5)');
    glow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    circle(cx, cy - 25, glowR, glow);
  }

  // Bulbo de vidro
  circle(cx, cy - 35, 110, 'rgba(255, 255, 255, 0.25)', isL ? '#94a3b8' : '#ffffff88', 3);

  // Filamento duplo de tungstênio
  const filColor = isLit ? '#ffffff' : '#64748b';
  line(cx - 40, cy + 35, cx - 28, cy - 50, filColor, 3);
  line(cx + 40, cy + 35, cx + 28, cy - 50, filColor, 3);

  ctx.beginPath();
  for (let x = cx - 28; x <= cx + 28; x += 3) {
    const y = cy - 50 + Math.sin((x - cx) * 0.8) * 7;
    if (x === cx - 28) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = filColor;
  ctx.lineWidth = 4;
  ctx.stroke();

  // Soquete
  rect(cx - 40, cy + 75, 80, 55, 6, '#d48b55', '#334155', 2);
  rect(cx - 24, cy + 130, 48, 16, 4, '#64748b');

  capsule(cx - 180, cy - 190, 360, 34, 'LÂMPADA: 95% CALOR + 5% LUZ VISÍVEL', '#fff', '#b45309');
}

// ====================================================
// EXPERIMENTO 04: DDP, PÁSSARO & CHOQUE HUMANO
// ====================================================
function drawSafety() {
  if (state.safetyMode === 'bird') {
    drawBirdScene();
  } else {
    drawHumanShockScene();
  }
}

function drawBirdScene() {
  backdrop();
  const isL = state.isLight;
  const two = state.birdTwo;

  // Céu
  rect(80, 80, 1040, 480, 16, isL ? '#e0f2fe' : '#1e293b');

  // Linhas de alta tensão
  if (two) {
    wirePath([[100, 410], [600, 410]]);
    wirePath([[710, 480], [1100, 480]]);
    capsule(110, 360, 160, 32, 'FIO FASE A (120 V)', '#fff', '#dc2626');
    capsule(880, 500, 160, 32, 'FIO NEUTRO (0 V)', '#fff', '#2563eb');
  } else {
    wirePath([[100, 410], [1100, 410]]);
    capsule(110, 360, 180, 32, 'FIO CONDUTOR (120 V)', '#fff', '#d48b55');
  }

  // Corrente fluindo pelo fio de cobre
  for (let i = 0; i < 10; i++) {
    const s = (i / 10 + state.t * 0.08) % 1;
    if (two) {
      circle(120 + s * 470, 410, 3.5, '#f59e0b');
      circle(720 + s * 360, 480, 3.5, '#f59e0b');
    } else {
      circle(120 + s * 960, 410, 3.5, '#f59e0b');
    }
  }

  // Pássaro pousado
  const bx = 630, by = 295;
  drawBirdGraphic(bx, by, two);

  const footA = [570, 410];
  const footB = two ? [710, 480] : [680, 410];

  circle(footA[0], footA[1], 13, '#0f172a', '#fbbf24', 2);
  text('A', footA[0], footA[1], 12, '#fff', 800, 'center');

  circle(footB[0], footB[1], 13, '#0f172a', '#fbbf24', 2);
  text('B', footB[0], footB[1], 12, '#fff', 800, 'center');

  if (two) {
    // Descarga elétrica violenta
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(footA[0], footA[1]);
    ctx.lineTo(610, 330);
    ctx.lineTo(660, 360);
    ctx.lineTo(footB[0], footB[1]);
    ctx.stroke();
    ctx.restore();

    capsule(760, 240, 320, 38, '⚡ DESCARGA ELÉTRICA (ΔV = 120 V)', '#fff', '#dc2626');
  } else {
    capsule(760, 240, 320, 38, '✓ SEM CHOQUE: VA ≈ VB (ΔV = 0 V)', '#fff', '#15803d');
  }
}

function drawBirdGraphic(bx, by, two) {
  // Corpo
  ctx.beginPath();
  ctx.ellipse(bx, by, 75, 55, -0.1, 0, TAU);
  ctx.fillStyle = '#854d0e';
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cabeça
  circle(bx + 65, by - 40, 32, '#854d0e', '#ca8a04', 2);
  circle(bx + 76, by - 46, 5, '#ffffff');
  circle(bx + 78, by - 46, 3, '#000000');

  // Bico
  poly([[bx + 90, by - 48], [bx + 120, by - 40], [bx + 90, by - 34]], '#ea580c', '#c2410c', 1.5);

  // Pernas
  const footA = [570, 410];
  const footB = two ? [710, 480] : [680, 410];
  line(bx - 20, by + 40, footA[0], footA[1], '#d48b55', 4);
  line(bx + 20, by + 40, footB[0], footB[1], '#d48b55', 4);
}

function drawHumanShockScene() {
  backdrop();
  const isL = state.isLight;
  const rBody = state.humanSkin === 'seca' ? 100000 : 1000;
  const iA = state.humanVoltage / rBody;
  const iMA = iA * 1000;

  const hx = 420, hy = 230;

  // Fonte de Tensão
  rect(120, 180, 150, 180, 14, isL ? '#ffffff' : '#1e293b', '#d48b55', 2);
  text('REDE ELÉTRICA', 195, 210, 12, '#d48b55', 800, 'center');
  text(`${state.humanVoltage} V`, 195, 255, 26, isL ? '#0f172a' : '#ffffff', 850, 'center');
  capsule(140, 305, 110, 30, 'FASE VIVA', '#ffffff', '#dc2626');

  // Fio condutor até a mão
  wirePath([[270, 320], [hx - 90, hy + 60]], '#dc2626');

  // Silhueta Humana
  // Cabeça
  circle(hx, hy - 40, 28, '#475569', '#94a3b8', 2);
  // Tronco
  line(hx, hy - 12, hx, hy + 120, '#475569', 18);
  // Braço esquerdo
  line(hx, hy + 15, hx - 90, hy + 60, '#475569', 11);
  circle(hx - 90, hy + 60, 9, '#f59e0b', '#ffffff', 2);
  // Braço direito
  line(hx, hy + 15, hx + 85, hy + 60, '#475569', 11);
  // Pernas
  line(hx, hy + 120, hx - 38, hy + 250, '#475569', 12);
  line(hx, hy + 120, hx + 38, hy + 250, '#475569', 12);

  // Terra
  line(hx - 100, hy + 252, hx + 100, hy + 252, '#10b981', 3);
  text('TERRA / NEUTRO (0 V)', hx, hy + 272, 11, '#10b981', 800, 'center');

  // Descarga pelo corpo
  if (iMA >= 1) {
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = Math.min(8, 2 + iMA * 0.12);
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(hx - 90, hy + 60);
    ctx.lineTo(hx, hy + 25);
    ctx.lineTo(hx, hy + 120);
    ctx.lineTo(hx - 38, hy + 250);
    ctx.stroke();
    ctx.restore();
  }

  // Coração anatômico
  drawHeart(hx, hy + 35, iMA);

  // Painel de diagnóstico fisiológico à direita
  const px = 760, py = 150, pw = 340, ph = 360;
  rect(px, py, pw, ph, 14, isL ? '#ffffff' : '#1e293b', isL ? '#cbd5e1' : '#334155', 2);
  text('AVALIAÇÃO FISIOLÓGICA (SLIDE 17)', px + pw / 2, py + 25, 12, '#d48b55', 800, 'center');

  rect(px + 20, py + 50, pw - 40, 56, 8, isL ? '#f1f5f9' : '#0f172a', '#f59e0b', 1.5);
  text('CORRENTE CALCULADA (i = U / R)', px + pw / 2, py + 68, 10, isL ? '#64748b' : '#94a3b8', 750, 'center');
  text(`${iMA >= 1000 ? (iMA / 1000).toFixed(2) + ' A' : iMA.toFixed(1) + ' mA'}`, px + pw / 2, py + 90, 22, isL ? '#0f172a' : '#f59e0b', 850, 'center');

  const faixas = [
    { label: '< 1 mA: Imperceptível', color: '#10b981', on: iMA < 1 },
    { label: '1 - 5 mA: Formigamento leve', color: '#f59e0b', on: iMA >= 1 && iMA < 10 },
    { label: '10 - 20 mA: Tetanização (não solta)', color: '#ea580c', on: iMA >= 10 && iMA < 50 },
    { label: '50 - 100 mA: Fibrilação cardíaca fatal', color: '#dc2626', on: iMA >= 50 && iMA < 1000 },
    { label: '> 1 A: Parada cardíaca / Queimaduras', color: '#7c3aed', on: iMA >= 1000 }
  ];

  faixas.forEach((f, idx) => {
    const fy = py + 125 + idx * 42;
    rect(px + 20, fy, pw - 40, 34, 6, f.on ? f.color : (isL ? '#f1f5f9' : '#0f172a'), f.color, 1);
    text(f.label, px + 30, fy + 17, 11, f.on ? '#ffffff' : (isL ? '#475569' : '#94a3b8'), f.on ? 850 : 650);
  });
}

function drawHeart(x, y, iMA) {
  const isFatal = iMA >= 50;
  const isDanger = iMA >= 10;
  const pulse = isFatal ? Math.sin(state.t * 35) * 4 : Math.sin(state.heartPhase) * 3;
  const heartSize = 16 + pulse;

  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = isFatal ? '#dc2626' : isDanger ? '#ea580c' : '#10b981';
  ctx.beginPath();
  ctx.moveTo(0, heartSize * 0.4);
  ctx.bezierCurveTo(-heartSize, -heartSize * 0.6, -heartSize * 1.5, heartSize * 0.4, 0, heartSize * 1.5);
  ctx.bezierCurveTo(heartSize * 1.5, heartSize * 0.4, heartSize, -heartSize * 0.6, 0, heartSize * 0.4);
  ctx.fill();
  ctx.restore();

  text(isFatal ? 'FIBRILAÇÃO' : isDanger ? 'TETANIZADO' : 'RITMO NORMAL', x, y + 36, 10, '#ffffff', 800, 'center');
}

// ====================================================
// ANIMAÇÃO & LOOP PRINCIPAL
// ====================================================
function animate(dt) {
  if (state.paused) return;
  state.t += dt;

  state.lever += (Number(state.closed) - state.lever) * Math.min(1, dt * 12);
  state.heartPhase += dt * 4;
  if (state.flashPulse > 0) state.flashPulse = Math.max(0, state.flashPulse - dt * 3);

  // 1. Materiais (Capítulo 1)
  const m = materials[state.material];
  const hasField = state.matFieldActive && state.matVoltage > 0 && m.kind === 'metal';
  // Deriva: proporcional à tensão, bem mais lenta que a térmica visual
  const driftV = (state.matVoltage / 12) * m.drift * 0.08;

  dots.forEach((p, idx) => {
    // Agitação térmica: mudança de direção bem frequente (caótico)
    p.turnTimer -= dt;
    if (p.turnTimer < 0) {
      p.turnTimer = rand(0.05, 0.25);   // ← muda direção ~4–20× por segundo
      const ang = rand(0, TAU);
      p.vx = Math.cos(ang);
      p.vy = Math.sin(ang);
    }

    // Velocidade térmica RÁPIDA visualmente (contraste didático com deriva lenta)
    let netVx = p.vx * p.speed * 0.38;
    let netVy = p.vy * p.speed * 0.38;

    // Com campo: adiciona componente de deriva (muito menor que térmica)
    if (hasField) {
      netVx -= driftV;
    }

    p.x += netVx * dt;
    p.y += netVy * dt;

    // WRAP-AROUND SUAVE: Quando sai na esquerda, reentra na direita (circuito contínuo!)
    if (p.x < 0.01) {
      p.x = 0.99;
      p.y = rand(0.08, 0.92);
    }
    if (p.x > 0.99) { p.x = 0.01; }
    if (p.y < 0.03) { p.y = 0.03; p.vy = Math.abs(p.vy); }
    if (p.y > 0.97) { p.y = 0.97; p.vy = -Math.abs(p.vy); }

    // Rastro do elétron traçador (dots[0])
    if (idx === 0 && state.showTracer && state.page === 0) {
      state.tracerTrail.push({ vx: p.vx, vy: p.vy, x: p.x, y: p.y });
      if (state.tracerTrail.length > 60) state.tracerTrail.shift();
    }
  });

  // Dissipação de energia térmica dos íons
  for (let k = 0; k < state.ionEnergy.length; k++) {
    state.ionEnergy[k] = Math.max(0, state.ionEnergy[k] - dt * 2.5);
  }
  if (state.matJoule && hasField && Math.random() < 0.35) {
    const pick = Math.floor(Math.random() * state.ionEnergy.length);
    state.ionEnergy[pick] = 1.0;
  }

  // 2. Circuito (Capítulo 2)
  if (state.closed) {
    const speed = (state.circuitVoltage / state.circuitResistance) * 0.055;
    const dir = state.representation === 'electron' ? -1 : 1;

    circuitDots.forEach(p => {
      p.lastX = p.x;
      p.x += dir * speed * dt;

      // Detecção de cruzamento na seção ΔS (x = 0.5)
      if ((dir === -1 && p.lastX >= 0.5 && p.x < 0.5) ||
        (dir === 1 && p.lastX <= 0.5 && p.x > 0.5)) {
        state.chargeCount++;
        state.flashPulse = 1.0;
        $('readoutQ').textContent = `${(state.chargeCount * 0.16).toFixed(2)} C`;
      }

      if (p.x < 0.01) p.x = 0.99;
      if (p.x > 0.99) p.x = 0.01;
    });
  }

  // 3. Aparelhos (Capítulo 3)
  if (state.applianceActive && state.appliancePowerPct > 0) {
    if (state.appliance === 'resistivo') {
      const targetTemp = 22 + (state.appliancePowerPct / 100) * 78;
      state.waterTemp += (targetTemp - state.waterTemp) * Math.min(1, dt * 0.5);

      bubbles.forEach(b => {
        b.y -= b.speed * (state.appliancePowerPct / 100) * dt;
        if (b.y < 0.05) b.y = 0.85;
      });
    } else if (state.appliance === 'motor') {
      const rotSpeed = (state.appliancePowerPct / 100) * 16;
      state.motorAngle += rotSpeed * dt;
    }
  } else {
    state.waterTemp += (22 - state.waterTemp) * Math.min(1, dt * 0.2);
  }
}

function render() {
  if (!state.width) return;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  ctx.fillStyle = state.isLight ? '#f8fafc' : '#141e2a';
  ctx.fillRect(0, 0, state.width, state.height);

  ctx.translate(state.dx, state.dy);
  ctx.scale(state.scale, state.scale);

  if (state.page === 0) drawMaterials();
  else if (state.page === 1) drawCircuit();
  else if (state.page === 2) drawAppliances();
  else if (state.page === 3) drawSafety();
}

function resize() {
  const box = $('viewport').getBoundingClientRect();
  state.width = box.width;
  state.height = box.height;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(box.width * ratio);
  canvas.height = Math.round(box.height * ratio);

  state.scale = Math.min(box.width / W, box.height / H);
  state.dx = (box.width - W * state.scale) / 2;
  state.dy = (box.height - H * state.scale) / 2;
  render();
}

function tick(now) {
  const dt = state.last ? Math.min(0.05, (now - state.last) / 1000) : 0;
  state.last = now;
  animate(dt);
  render();
  requestAnimationFrame(tick);
}

// ====================================================
// LISTENERS & ATALHOS
// ====================================================
document.querySelectorAll('.chapter').forEach(btn => {
  btn.addEventListener('click', () => setPage(Number(btn.dataset.page)));
});

// Tema Claro / Escuro
$('themeToggleBtn').addEventListener('click', () => {
  state.isLight = !state.isLight;
  document.documentElement.dataset.theme = state.isLight ? 'light' : 'dark';
  $('themeToggleBtn').textContent = state.isLight ? '🌙 Escuro' : '☀️ Claro';
  render();
});

// Capítulo 1
document.querySelectorAll('[data-material]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.material = btn.dataset.material;
    state.tracerTrail = [];   // limpa rastro ao trocar material
    updateMaterialsUI();
    render();
  });
});

$('matVoltageSlider').addEventListener('input', e => {
  state.matVoltage = Number(e.target.value);
  updateMaterialsUI();
  render();
});

$('matFieldToggle').addEventListener('click', () => {
  state.matFieldActive = !state.matFieldActive;
  updateMaterialsUI();
  render();
});

$('matJouleToggle').addEventListener('click', () => {
  state.matJoule = !state.matJoule;
  updateMaterialsUI();
  render();
});

// Capítulo 2
$('switchBtn').addEventListener('click', () => {
  state.closed = !state.closed;
  updateCircuitUI();
  render();
});

$('circuitVoltageSlider').addEventListener('input', e => {
  state.circuitVoltage = Number(e.target.value);
  updateCircuitUI();
  render();
});

$('circuitResistanceSlider').addEventListener('input', e => {
  state.circuitResistance = Number(e.target.value);
  updateCircuitUI();
  render();
});

$('electronsBtn').addEventListener('click', () => {
  state.representation = 'electron';
  updateCircuitUI();
  render();
});

$('conventionalBtn').addEventListener('click', () => {
  state.representation = 'conventional';
  updateCircuitUI();
  render();
});

$('resetCounterBtn').addEventListener('click', () => {
  state.chargeCount = 0;
  updateCircuitUI();
  render();
});

// Capítulo 3
document.querySelectorAll('[data-appliance]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.appliance = btn.dataset.appliance;
    updateApplianceUI();
    render();
  });
});

document.querySelectorAll('[data-grid]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.gridVoltage = Number(btn.dataset.grid);
    updateApplianceUI();
    render();
  });
});

$('appliancePowerSlider').addEventListener('input', e => {
  state.appliancePowerPct = Number(e.target.value);
  updateApplianceUI();
  render();
});

$('applianceToggleBtn').addEventListener('click', () => {
  state.applianceActive = !state.applianceActive;
  updateApplianceUI();
  render();
});

// Capítulo 4
$('modeBirdBtn').addEventListener('click', () => {
  state.safetyMode = 'bird';
  updateSafetyUI();
  render();
});

$('modeHumanBtn').addEventListener('click', () => {
  state.safetyMode = 'human';
  updateSafetyUI();
  render();
});

$('oneWireBtn').addEventListener('click', () => {
  state.birdTwo = false;
  updateSafetyUI();
  render();
});

$('twoWireBtn').addEventListener('click', () => {
  state.birdTwo = true;
  updateSafetyUI();
  render();
});

document.querySelectorAll('[data-volt]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.humanVoltage = Number(btn.dataset.volt);
    updateSafetyUI();
    render();
  });
});

document.querySelectorAll('[data-skin]').forEach(btn => {
  btn.addEventListener('click', () => {
    state.humanSkin = btn.dataset.skin;
    updateSafetyUI();
    render();
  });
});

// Ações
$('pauseBtn').addEventListener('click', () => {
  state.paused = !state.paused;
  $('pauseBtn').textContent = state.paused ? '▶ Continuar' : '⏸ Pausar';
});

$('fullscreenBtn').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.querySelector('.app').requestFullscreen();
    }
  } catch {
    alert('Use a tecla F11 para tela cheia.');
  }
});

document.addEventListener('fullscreenchange', () => {
  $('fullscreenBtn').textContent = document.fullscreenElement ? '⛶ Sair' : '⛶ Projetar';
  setTimeout(resize, 40);
});

// Modal
const helpModal = $('helpModal');
$('helpBtn').addEventListener('click', () => helpModal.hidden = false);
$('modalCloseBtn').addEventListener('click', () => helpModal.hidden = true);
$('modalOkBtn').addEventListener('click', () => helpModal.hidden = true);
helpModal.addEventListener('click', e => {
  if (e.target === helpModal) helpModal.hidden = true;
});

// Atalhos
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA/.test(e.target.tagName)) return;

  if (['1', '2', '3', '4'].includes(e.key)) {
    setPage(Number(e.key) - 1);
  } else if (e.key === ' ' || e.code === 'Space') {
    e.preventDefault();
    state.paused = !state.paused;
    $('pauseBtn').textContent = state.paused ? '▶ Continuar' : '⏸ Pausar';
  } else if (e.key.toLowerCase() === 'c' && state.page === 1) {
    state.closed = !state.closed;
    updateCircuitUI();
  } else if (e.key.toLowerCase() === 'r') {
    state.chargeCount = 0;
    state.waterTemp = 22;
    if (state.page === 1) updateCircuitUI();
  } else if (e.key.toLowerCase() === 'f') {
    $('fullscreenBtn').click();
  } else if (e.key.toLowerCase() === 'h' || e.key === '?') {
    helpModal.hidden = !helpModal.hidden;
  }
});

// Clique na chave no Canvas (Capítulo 2)
canvas.addEventListener('pointerdown', e => {
  const bounds = canvas.getBoundingClientRect();
  const x = (e.clientX - bounds.left - state.dx) / state.scale;
  const y = (e.clientY - bounds.top - state.dy) / state.scale;

  if (state.page === 1 && x > 1010 && x < 1120 && y > 180 && y < 290) {
    state.closed = !state.closed;
    updateCircuitUI();
    render();
  }
});

window.addEventListener('resize', resize);
if ('ResizeObserver' in window) {
  new ResizeObserver(resize).observe($('viewport'));
}

// ── Cap 1: Traçador, Vetores e Foto da Amostra ──
$('tracerToggleBtn').addEventListener('click', () => {
  state.showTracer = !state.showTracer;
  state.tracerTrail = [];
  $('tracerToggleBtn').classList.toggle('active', state.showTracer);
});

$('vectorsToggleBtn').addEventListener('click', () => {
  state.showVectors = !state.showVectors;
  $('vectorsToggleBtn').classList.toggle('active', state.showVectors);
});

$('samplePhotoInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => { state.samplePhotoImg = img; };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// Inicialização
setPage(0);
resize();
requestAnimationFrame(tick);
