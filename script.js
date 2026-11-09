
'use strict';
// Laboratório de eletricidade. Canvas nativo, sem bibliotecas ou internet.
// As trajetórias são modelos qualitativos e intencionalmente fora de escala.
const $ = id => document.getElementById(id);
const canvas = $('labCanvas'), ctx = canvas.getContext('2d');
const W = 1200, H = 650, TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const materials = {
  cobre: {
    name: 'Cobre', kind: 'metal', color: ['#e3a977', '#ab693f', '#623f33'], rating: 1, drift: 1, rho: 'ρ ≈ 1,68 × 10⁻⁸ Ω·m',
    headline: 'Cobre · excelente condutor', description: 'Elétrons livres se agitam. Com tensão, surge uma pequena deriva média, além da agitação térmica.'
  },
  aluminio: {
    name: 'Alumínio', kind: 'metal', color: ['#dce2e5', '#939ea7', '#566778'], rating: .63, drift: .67, rho: 'ρ ≈ 2,65 × 10⁻⁸ Ω·m',
    headline: 'Alumínio · bom condutor', description: 'Também possui elétrons móveis. Para a mesma geometria e tensão, conduz menos corrente que o cobre.'
  },
  aco: {
    name: 'Aço', kind: 'metal', color: ['#9babb6', '#576779', '#344251'], rating: .10, drift: .22, rho: 'ρ ≈ 1,5 × 10⁻⁷ Ω·m (valor aproximado)',
    headline: 'Aço · condutor menos eficiente', description: 'Ainda é um metal condutor, porém sua resistividade costuma ser maior e depende da liga.'
  },
  vidro: {
    name: 'Vidro', kind: 'insulator', color: ['#99b7c1', '#5a8190', '#36566b'], rating: 0, drift: 0, rho: 'ρ elevada · isolante',
    headline: 'Vidro · isolante em condições usuais', description: 'Não há uma população de elétrons livres comparável à dos metais; não aparece deriva elétrica neste modelo.'
  }
};
const state = {
  page: 0, material: 'cobre', field: false, closed: false, representation: 'electron',
  birdTwo: false, birdDifferent: true, paused: false, t: 0, last: 0, width: 0, height: 0, scale: 1, dx: 0, dy: 0, lever: 0
};
const dots = Array.from({ length: 40 }, (_, i) => ({
  x: rand(.05, .95), y: rand(.1, .9), a: rand(0, TAU), speed: rand(.6, 1.3), turn: rand(.1, 1.6), lane: i % 4
}));
const circuitDots = Array.from({ length: 20 }, (_, i) => ({
  x: (i + .5) / 20, y: .22 + (i % 4) * .19, a: rand(0, TAU), turn: rand(.3, 1.7)
}));
const sceneInfo = [
  ['Como os elétrons se movem em um metal?', 'Observe o interior do sólido. Compare materiais e aplique uma diferença de potencial.', 'VISTA MICROSCÓPICA'],
  ['Da agitação à corrente elétrica', 'Abra e feche a chave. Compare a deriva dos elétrons à convenção de corrente.', 'CIRCUITO + AMPLIAÇÃO'],
  ['Por que o pássaro não leva choque?', 'Compare os pontos de contato das patas e acompanhe a corrente pelo corpo.', 'DIFERENÇA DE POTENCIAL']
];
function setPage(page) {
  state.page = page;
  document.querySelectorAll('.chapter').forEach((btn, i) => {
    const on = i === page; btn.classList.toggle('active', on);
    if (on) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
  });
  ['controlsMaterials', 'controlsCircuit', 'controlsBird'].forEach((id, i) => $(id).hidden = i !== page);
  $('sceneIndex').textContent = `EXPERIMENTO 0${page + 1} / 03`;
  $('sceneTitle').textContent = sceneInfo[page][0];
  $('sceneSubtitle').textContent = sceneInfo[page][1];
  $('sceneTag').textContent = sceneInfo[page][2];
  $('footerNote').textContent = page === 2 ? 'Simulação conceitual: nunca faça experiências em redes elétricas.' : 'Representação qualitativa, não desenhada em escala.';
  render();
}
function setMaterial(mat) {
  state.material = mat; const m = materials[mat];
  document.querySelectorAll('[data-material]').forEach(b => {
    const on = b.dataset.material === mat; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on));
  });
  $('materialTitle').textContent = m.headline;
  $('materialDescription').textContent = m.description;
  $('materialRho').textContent = m.rho;
  render();
}
function setField(on) {
  state.field = on;
  $('fieldBtn').textContent = on ? 'Remover tensão' : 'Aplicar tensão';
  $('fieldBtn').classList.toggle('active', on);
  $('fieldBtn').setAttribute('aria-pressed', String(on));
  render();
}
function setCircuit(on) {
  state.closed = on;
  $('switchBtn').textContent = on ? 'Abrir circuito' : 'Fechar circuito';
  $('switchBtn').classList.toggle('active', on);
  $('switchBtn').setAttribute('aria-pressed', String(on));
  $('circuitTitle').textContent = on ? 'Chave fechada · i ≠ 0' : 'Chave aberta · i = 0';
  updateCircuitDescription();
  render();
}
function updateCircuitDescription() {
  $('circuitDescription').textContent = !state.closed
    ? 'Movimento desordenado: não existe fluxo líquido de carga.'
    : state.representation === 'electron'
      ? 'Elétrons (−) derivam do polo negativo ao positivo no fio externo.'
      : 'Cargas positivas equivalentes ilustram a convenção de + para −; os elétrons não invertem.';
}
function setRepresentation(rep) {
  state.representation = rep;
  [['electronsBtn', 'electron'], ['conventionalBtn', 'conventional']].forEach(([id, val]) => {
    $(id).classList.toggle('active', rep === val); $(id).setAttribute('aria-pressed', String(rep === val));
  });
  updateCircuitDescription(); render();
}
function setBird(two, different = state.birdDifferent) {
  state.birdTwo = two; state.birdDifferent = different;
  $('oneWireBtn').classList.toggle('active', !two); $('twoWireBtn').classList.toggle('active', two);
  $('oneWireBtn').setAttribute('aria-pressed', String(!two)); $('twoWireBtn').setAttribute('aria-pressed', String(two));
  $('equalBtn').disabled = !two; $('differentBtn').disabled = !two;
  $('equalBtn').classList.toggle('active', !different); $('differentBtn').classList.toggle('active', different);
  $('equalBtn').setAttribute('aria-pressed', String(!different));
  $('differentBtn').setAttribute('aria-pressed', String(different));
  const dangerous = two && different;
  $('birdTitle').textContent = dangerous ? 'Corrente atravessa o corpo' : two ? 'Dois fios no mesmo potencial' : 'Pés no mesmo fio';
  $('birdDescription').textContent = dangerous
    ? 'Os pés encostam em potenciais diferentes. Há caminho para a corrente através do corpo: situação perigosa.'
    : two ? 'Mesmo em dois fios, sem diferença de potencial entre as patas não há corrente significativa pelo corpo.'
      : 'Os dois pontos do mesmo fio têm potenciais muito próximos; a corrente pelo pássaro é desprezível.';
  $('birdEquation').textContent = dangerous ? 'ΔV = 120 V' : 'ΔV ≈ 0 V';
  $('birdEquationCaption').innerHTML = dangerous ? 'i<sub>corpo</sub> ≈ ΔV / R<sub>corpo</sub> &gt; 0' : 'i<sub>corpo</sub> ≈ ΔV / R<sub>corpo</sub> ≈ 0';
  render();
}
// ---------- Primitivas gráficas ----------
function line(x1, y1, x2, y2, color = '#fff', width = 2) { ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke() }
function poly(points, fill, stroke = null, sw = 1) { ctx.beginPath(); ctx.moveTo(...points[0]); points.slice(1).forEach(p => ctx.lineTo(...p)); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill() } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke() } }
function rect(x, y, w, h, r, fill, stroke = null, sw = 1) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); if (fill) { ctx.fillStyle = fill; ctx.fill() } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke() } }
function text(str, x, y, size = 20, color = '#f4f3ed', weight = 650, align = 'left') {
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.font = `${weight} ${size}px system-ui,Arial,sans-serif`; ctx.fillText(str, x, y);
}
function circle(x, y, r, fill, stroke = null, sw = 1) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = sw; ctx.stroke() } }
function arrow(x, y, angle, color, length = 42, width = 3) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  line(-length / 2, 0, length / 2, 0, color, width);
  poly([[length / 2, 0], [length / 2 - 12, -7], [length / 2 - 12, 7]], color); ctx.restore();
}
function capsule(x, y, w, h, label, color = '#f2ede3', bg = '#2a3b48') {
  rect(x, y, w, h, Math.min(13, h / 2), bg, '#6f778048', 1); text(label, x + w / 2, y + h / 2, 16, color, 720, 'center');
}
function backdrop() {
  const grad = ctx.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, '#24394a'); grad.addColorStop(1, '#142633');
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 48)line(x, 0, x, H, '#d6e8ee06', 1);
  for (let y = 0; y < H; y += 48)line(0, y, W, y, '#d6e8ee06', 1);
}
function ion(x, y, r = 12, colour = '#cba074') {
  const g = ctx.createRadialGradient(x - r * .3, y - r * .35, 2, x, y, r);
  g.addColorStop(0, '#fff4dc'); g.addColorStop(.28, colour); g.addColorStop(1, '#59463d');
  circle(x, y, r, g, '#f4e2c560', 1); text('+', x, y - 1, r * 1.15, '#fff4d8', 800, 'center');
}
function electron(x, y, r = 9, positive = false) {
  const g = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, r); g.addColorStop(0, '#e7faff'); g.addColorStop(.4, positive ? '#ffb19b' : '#7acbda'); g.addColorStop(1, positive ? '#995948' : '#306576');
  circle(x, y, r, g, '#f9ffffaa', 1); text(positive ? '+' : '−', x, y - 1, r * 1.65, '#23303a', 900, 'center');
}
function wirePath(points) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const stroke = (color, width, offsetY = 0) => {
    ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1] + offsetY);
    for (let i = 1; i < points.length; i++)ctx.lineTo(points[i][0], points[i][1] + offsetY);
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke()
  };
  stroke('#2c2728', 16); stroke('#855e4d', 11); stroke('#b68b6b', 7, -1); stroke('#e5bfa0', 2.7, -3);
}
// ---------- Página 1: diferentes sólidos ----------
function drawMaterials() {
  backdrop(); const m = materials[state.material];
  const isMetal = m.kind === 'metal'; const grad = ctx.createLinearGradient(0, 130, 0, 475);
  grad.addColorStop(0, m.color[0]); grad.addColorStop(.36, m.color[1]); grad.addColorStop(.9, m.color[2]); grad.addColorStop(1, m.color[0]);
  text('PEÇA SÓLIDA · CORTE DIDÁTICO', 90, 75, 15, '#e8d0b5', 780);
  capsule(945, 53, 165, 38, m.name.toUpperCase(), '#f8e8d8', '#354554');
  ctx.save(); ctx.shadowColor = '#0008'; ctx.shadowBlur = 26;
  poly([[112, 193], [169, 153], [1103, 153], [1060, 193]], m.color[0]);
  rect(112, 193, 948, 267, 21, grad, '#ffffff22', 2); ctx.restore();
  poly([[1060, 193], [1103, 153], [1103, 424], [1060, 460]], m.color[2]);
  // Janela de corte: a parte interna tem profundidade, sem aparência de tubo luminoso.
  rect(161, 233, 847, 186, 16, '#12232d', '#f0d7b043', 3);
  const shadow = ctx.createLinearGradient(0, 235, 0, 410); shadow.addColorStop(0, '#081720'); shadow.addColorStop(.3, '#22313a'); shadow.addColorStop(1, '#111f29');
  rect(170, 242, 829, 168, 12, shadow);
  ctx.save(); ctx.beginPath(); ctx.roundRect(173, 246, 822, 161, 11); ctx.clip();
  const ionColour = state.material === 'cobre' ? '#cc986b' : state.material === 'aluminio' ? '#b6c4cb' : state.material === 'aco' ? '#a0aab8' : '#a7b2c6';
  for (let row = 0; row < 4; row++)for (let col = 0; col < 13; col++) {
    const x = 204 + col * 62 + (row % 2) * 27, y = 269 + row * 44;
    if (isMetal) ion(x, y, 11, ionColour);
    else circle(x + Math.sin(col * 3 + row) * 5, y + Math.cos(col * 2 + row) * 4, 10, '#9db1bd', '#dae6ed55', 1);
  }
  if (isMetal) {
    dots.forEach((p, i) => {
      const x = 184 + p.x * 800, y = 250 + p.y * 152;
      electron(x, y, 8, false);
      const drift = state.field ? Math.PI : Math.atan2(Math.sin(p.a), Math.cos(p.a));
      if (i % 2 === 0) arrow(x + Math.cos(drift) * 20, y + Math.sin(drift) * 20, drift, '#e8c990', 23, 2.3);
    });
  } else {
    text('SEM PORTADORES LIVRES NESTE MODELO', 585, 325, 21, '#c1d5df', 720, 'center');
  }
  ctx.restore();
  line(191, 220, 968, 220, '#fff5e24c', 2);
  // Bloco de demonstração — relações qualitativas, sem confundir com uma medição.
  text('CONDUTIVIDADE RELATIVA · INDICADOR QUALITATIVO', 130, 521, 15, '#bac7cf', 770);
  rect(130, 552, 588, 18, 9, '#0c1c28');
  rect(130, 552, 588 * m.rating, 18, 9, m.rating ? '#d2aa81' : '#0c1c28');
  text(m.rating === 0 ? 'ISOLANTE' : m.rating > .8 ? 'MUITO ALTA' : m.rating > .3 ? 'ALTA' : 'MENOR', 743, 561, 15, '#f5e3cc', 820);
  const label = state.field ? 'CAMPO ELÉTRICO APLICADO' : 'SEM CAMPO ELÉTRICO APLICADO';
  text(label, 130, 611, 16, state.field ? '#b7dfcc' : '#b8c9d4', 800);
  if (state.field) { arrow(515, 611, 0, '#b7dfcc', 180, 5); text('E', 420, 592, 18, '#b7dfcc', 750, 'center') }
}
// ---------- Página 2: circuito, bateria e corte do fio ----------
function battery() {
  const x = 505, y = 383, w = 190, h = 73;
  const g = ctx.createLinearGradient(x, y, x, y + 73); g.addColorStop(0, '#c7c8c4'); g.addColorStop(.2, '#687178'); g.addColorStop(.58, '#3b474d'); g.addColorStop(1, '#b6b9b9');
  ctx.save(); ctx.shadowColor = '#0009'; ctx.shadowBlur = 16; rect(x, y, w, h, 15, g, '#dfded7a0', 2); ctx.restore();
  rect(x + 13, y + 6, 64, 61, 7, '#ad815c'); rect(x + 120, y + 6, 57, 61, 7, '#263443');
  text('+', x + 36, y + 36, 31, '#fff7e4', 900, 'center'); text('−', x + 153, y + 36, 31, '#dfe6e9', 900, 'center');
  text('V', x + 95, y + 36, 30, '#f5f2e9', 900, 'center');
}
function drawCircuit() {
  backdrop(); text('CIRCUITO EXTERNO', 92, 53, 15, '#e8d0b5', 780);
  // Fio de cobre realista: fino, com reflexo contido (não é um tubo luminoso).
  wirePath([[175, 401], [175, 179], [1023, 179], [1023, 275]]);
  wirePath([[1023, 341], [1023, 419], [695, 419]]);
  wirePath([[505, 419], [175, 419], [175, 401]]);
  battery();
  circle(1023, 275, 10, '#cba582', '#292a2a', 2); circle(1023, 341, 10, '#cba582', '#292a2a', 2);
  const a = state.lever;
  line(1023, 341, 1023 + 56 * (1 - a), 275 - 13 * (1 - a), a > .5 ? '#d4bb9f' : '#c0a388', 8);
  circle(1023, 341, 6, '#f2d9b5');
  capsule(1074, 288, 90, 39, 'CH', '#f4e8dd', '#2e4351');
  text(state.closed ? 'FECHADA' : 'ABERTA', 1081, 349, 14, state.closed ? '#9ddac8' : '#e1c29f', 760);
  // Setas referenciais são fixas, não têm checkboxes.
  if (state.closed) {
    arrow(464, 143, 0, '#e1a07f', 116, 4); text('i  (convencional)', 464, 113, 16, '#e8bb9d', 740, 'center');
    arrow(746, 215, Math.PI, '#8fbfc8', 116, 4); text('e⁻  (elétrons)', 746, 245, 16, '#aed4d8', 740, 'center');
  }
  // Lente de ampliação física ligada ao trecho superior.
  ctx.setLineDash([5, 8]); line(347, 184, 347, 475, '#d0cfb14a', 1.5); line(858, 184, 858, 475, '#d0cfb14a', 1.5); ctx.setLineDash([]);
  text('DETALHE AMPLIADO DO CONDUTOR', 190, 493, 14, '#e8d0b5', 780);
  const metal = ctx.createLinearGradient(0, 510, 0, 630); metal.addColorStop(0, '#dfb38d'); metal.addColorStop(.25, '#a46f4d'); metal.addColorStop(.52, '#704d3c'); metal.addColorStop(1, '#c99a71');
  rect(185, 510, 826, 117, 24, metal);
  rect(214, 529, 769, 78, 12, '#15232c', '#e7c49b7b', 2);
  ctx.save(); ctx.beginPath(); ctx.roundRect(214, 529, 769, 78, 12); ctx.clip();
  for (let r = 0; r < 3; r++)for (let c = 0; c < 15; c++)ion(234 + c * 52 + (r % 2) * 19, 545 + r * 25, 7, '#b7906c');
  circuitDots.forEach((p, i) => {
    const x = 230 + p.x * 737, y = 533 + p.y * 71;
    const positive = state.closed && state.representation === 'conventional';
    electron(x, y, 7, positive);
    const angle = state.closed ? (positive ? 0 : Math.PI) : p.a;
    if (i % 2 === 0) arrow(x + Math.cos(angle) * 15, y + Math.sin(angle) * 15, angle, '#ecd2a2', 15, 1.8);
  });
  ctx.restore();
  text(state.closed ? 'DERIVA MÉDIA + AGITAÇÃO TÉRMICA' : 'AGITAÇÃO TÉRMICA SEM CORRENTE RESULTANTE', 600, 648, 13, '#d6dad7', 710, 'center');
  if (state.closed) {
    const dir = state.representation === 'electron' ? -1 : 1;
    for (let i = 0; i < 5; i++) {
      const x = 260 + ((i * 158 + state.t * 58) % 700);
      arrow(x, 179, dir === 1 ? 0 : Math.PI, dir === 1 ? '#c8c1ac' : '#b2c5c9', 27, 2.6);
    }
  }
}
// ---------- Página 3: pássaro e diferença de potencial ----------
function sky() {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2c4355'); g.addColorStop(.65, '#476174'); g.addColorStop(1, '#263e4d'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // Horizonte discreto, sem efeito de jogo.
  ctx.fillStyle = '#b2c1be12';
  for (let i = 0; i < 9; i++)rect(i * 145 - 50, 520 + ((i * 31) % 62), 98, 160, 2, '#a6b5b114');
}
function currentBirdPath() {
  return [[615, 515], [616, 485], [628, 448], [644, 409], [663, 376], [692, 397], [715, 447], [731, 501], [745, 568]];
}
function pathPoint(points, t) {
  let lengths = [], sum = 0;
  for (let i = 1; i < points.length; i++) { const len = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]); lengths.push(len); sum += len }
  let remaining = t * sum;
  for (let i = 0; i < lengths.length; i++) { if (remaining <= lengths[i] || i === lengths.length - 1) { let f = Math.min(1, remaining / lengths[i]); return [points[i][0] + f * (points[i + 1][0] - points[i][0]), points[i][1] + f * (points[i + 1][1] - points[i][1])] } remaining -= lengths[i] }
  return points.at(-1);
}
function drawBird() {
  sky();
  text('CONTATO ELÉTRICO E DIFERENÇA DE POTENCIAL', 72, 69, 17, '#ecddc7', 810);
  const two = state.birdTwo, shock = two && state.birdDifferent;
  // Dois fios distintos só aparecem quando solicitado.
  if (two) {
    wirePath([[80, 515], [665, 515]]); wirePath([[705, 568], [1120, 568]]);
    capsule(104, 465, 162, 42, 'FIO A · 120 V', '#f4dfc8', '#385064');
    capsule(897, 588, 165, 42, `FIO B · ${shock ? '0' : '120'} V`, '#f4dfc8', '#385064');
  } else {
    wirePath([[80, 515], [1120, 515]]);
    capsule(108, 458, 182, 42, 'FIO · 120 V', '#f4dfc8', '#385064');
  }
  // Pulsos que seguem o condutor: a corrente no fio não implica corrente pelo pássaro.
  for (let i = 0; i < 9; i++) {
    const s = (i / 9 + state.t * .065) % 1;
    if (two) {
      circle(100 + s * 540, 515, 4, '#ead6b4'); circle(713 + s * 394, 568, 4, '#ead6b4');
    } else circle(100 + s * 1000, 515, 4, '#ead6b4');
  }
  drawBirdIllustration(two);
  if (shock) {
    const points = currentBirdPath();
    ctx.save(); ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(...points[0]); points.slice(1).forEach(p => ctx.lineTo(...p));
    ctx.strokeStyle = '#eac77e75'; ctx.lineWidth = 7; ctx.stroke(); ctx.restore();
    for (let i = 0; i < 6; i++) {
      const t = (state.t * .22 + i / 6) % 1, [x, y] = pathPoint(points, t);
      circle(x, y, 6, '#f7d58c', '#fff2cd', 1);
    }
    capsule(785, 372, 298, 49, 'CORRENTE PELO CORPO', '#fff1cd', '#7c4836');
    text('RISCO DE CHOQUE', 934, 440, 17, '#ffccae', 810, 'center');
  } else {
    capsule(785, 385, 316, 49, 'SEM CORRENTE RELEVANTE PELO CORPO', '#ecf3e9', '#34594e');
  }
  const labelA = two ? 'A' : 'A', labelB = 'B';
  circle(615, 515, 18, '#1b3d4b', '#f4e1b1', 2); text(labelA, 615, 515, 16, '#fff', 850, 'center');
  circle(two ? 745 : 742, two ? 568 : 515, 18, '#1b3d4b', '#f4e1b1', 2); text(labelB, two ? 745 : 742, two ? 568 : 515, 16, '#fff', 850, 'center');
  text(shock ? 'Vₐ = 120 V    Vᵦ = 0 V' : two ? 'Vₐ = Vᵦ = 120 V' : 'Vₐ ≈ Vᵦ', 130, 611, 24, '#f8e7d0', 760);
}
function drawBirdIllustration(two) {
  // Cauda longa e aspecto de ave pousada, sem imagem externa.
  poly([[578, 351], [465, 374], [502, 410], [587, 391]], '#6a564b', '#bc9e87', 2);
  poly([[569, 384], [474, 424], [526, 421], [594, 404]], '#796358');
  const body = ctx.createRadialGradient(631, 297, 15, 652, 362, 145);
  body.addColorStop(0, '#d1bda5'); body.addColorStop(.62, '#968370'); body.addColorStop(1, '#544a43');
  ctx.beginPath(); ctx.ellipse(644, 363, 137, 108, -.08, 0, TAU); ctx.fillStyle = body; ctx.fill(); ctx.strokeStyle = '#c5ad94'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(698, 381, 64, 74, 0, 0, TAU); ctx.fillStyle = '#c4b6a1'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(611, 358, 98, 55, -.28, 0, TAU); ctx.fillStyle = '#62574e'; ctx.fill(); ctx.strokeStyle = '#998476'; ctx.lineWidth = 2; ctx.stroke();
  for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.ellipse(589 + k * 11, 363 + k * 3, 63 - k * 5, 14, -.3, 0, Math.PI); ctx.strokeStyle = '#cab49c88'; ctx.lineWidth = 2; ctx.stroke() }
  const head = ctx.createRadialGradient(745, 251, 5, 748, 271, 71); head.addColorStop(0, '#d0b29b'); head.addColorStop(.7, '#87705e'); head.addColorStop(1, '#564941');
  circle(746, 270, 66, head, '#c3a88e', 2);
  ctx.beginPath(); ctx.ellipse(780, 290, 27, 35, -.3, 0, TAU); ctx.fillStyle = '#d9ccb4'; ctx.fill();
  poly([[803, 259], [866, 282], [803, 291]], '#caa06d', '#735d48', 2);
  circle(776, 257, 10, '#eee5d6'); circle(777, 258, 6, '#1e2428'); circle(779, 256, 2.2, '#fff');
  const footA = [615, 515], footB = two ? [745, 568] : [742, 515];
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  line(626, 439, footA[0], footA[1] - 18, '#b99370', 8);
  line(697, 438, footB[0], footB[1] - 18, '#b99370', 8);
  for (const [x, y] of [footA, footB]) {
    line(x, y - 18, x, y + 7, '#d0a67b', 6);
    line(x - 22, y + 6, x + 16, y + 5, '#d0a67b', 5);
    line(x - 6, y + 5, x - 15, y + 16, '#c69a74', 3);
  }
}
function animate(dt) {
  if (state.paused) return;
  state.t += dt;
  state.lever += (Number(state.closed) - state.lever) * Math.min(1, dt * 12);
  dots.forEach(p => {
    p.turn -= dt; if (p.turn < 0) { p.turn = rand(.3, 1.6); p.a += rand(-1.4, 1.4) }
    let vx = Math.cos(p.a) * p.speed * .075, vy = Math.sin(p.a) * p.speed * .095;
    if (state.field && materials[state.material].kind === 'metal') vx -= materials[state.material].drift * .085;
    p.x += vx * dt; p.y += vy * dt;
    if (p.x < .03) { p.x = .03; p.a = Math.PI - p.a } if (p.x > .97) { p.x = .97; p.a = Math.PI - p.a }
    if (p.y < .04) { p.y = .04; p.a = -p.a } if (p.y > .96) { p.y = .96; p.a = -p.a }
  });
  circuitDots.forEach(p => {
    p.turn -= dt; if (p.turn < 0) { p.turn = rand(.5, 1.6); p.a += rand(-1.5, 1.5) }
    const dir = state.representation === 'electron' ? -1 : 1;
    p.x += ((state.closed ? dir * .1 : Math.cos(p.a) * .07)) * dt;
    p.y += (!state.closed ? Math.sin(p.a) * .07 : 0) * dt;
    if (state.closed) { if (p.x < .01) p.x = .99; if (p.x > .99) p.x = .01 }
    else { if (p.x < .02 || p.x > .98) p.a = Math.PI - p.a; p.x = Math.max(.02, Math.min(.98, p.x)); if (p.y < .05 || p.y > .95) p.a = -p.a; p.y = Math.max(.05, Math.min(.95, p.y)) }
  });
}
function render() {
  if (!state.width) return;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = '#152635'; ctx.fillRect(0, 0, state.width, state.height);
  ctx.translate(state.dx, state.dy); ctx.scale(state.scale, state.scale);
  if (state.page === 0) drawMaterials(); else if (state.page === 1) drawCircuit(); else drawBird();
}
function resize() {
  const box = $('viewport').getBoundingClientRect(); state.width = box.width; state.height = box.height;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(box.width * ratio); canvas.height = Math.round(box.height * ratio);
  state.scale = Math.min(box.width / W, box.height / H);
  state.dx = (box.width - W * state.scale) / 2; state.dy = (box.height - H * state.scale) / 2; render();
}
function tick(now) { let dt = state.last ? Math.min(.05, (now - state.last) / 1000) : 0; state.last = now; animate(dt); render(); requestAnimationFrame(tick) }
// ---------- Controles ----------
document.querySelectorAll('.chapter').forEach(b => b.addEventListener('click', () => setPage(+b.dataset.page)));
document.querySelectorAll('[data-material]').forEach(b => b.addEventListener('click', () => setMaterial(b.dataset.material)));
$('fieldBtn').addEventListener('click', () => setField(!state.field));
$('switchBtn').addEventListener('click', () => setCircuit(!state.closed));
$('electronsBtn').addEventListener('click', () => setRepresentation('electron'));
$('conventionalBtn').addEventListener('click', () => setRepresentation('conventional'));
$('oneWireBtn').addEventListener('click', () => setBird(false));
$('twoWireBtn').addEventListener('click', () => setBird(true));
$('equalBtn').addEventListener('click', () => setBird(true, false));
$('differentBtn').addEventListener('click', () => setBird(true, true));
$('pauseBtn').addEventListener('click', () => {
  state.paused = !state.paused; $('pauseBtn').textContent = state.paused ? '▶ Continuar' : 'Ⅱ Pausar'; $('pauseBtn').setAttribute('aria-pressed', String(state.paused));
});
$('fullscreenBtn').addEventListener('click', async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.querySelector('.app').requestFullscreen() }
  catch { alert('O navegador não permitiu tela cheia. Use F11.'); }
});
document.addEventListener('fullscreenchange', () => { $('fullscreenBtn').textContent = document.fullscreenElement ? '⛶ Sair' : '⛶ Projetar'; setTimeout(resize, 40) });
document.addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  if ('123'.includes(e.key) && e.key.length === 1) setPage(Number(e.key) - 1);
  if (e.key.toLowerCase() === 'c' && state.page === 1) setCircuit(!state.closed);
});
canvas.addEventListener('pointerdown', e => {
  if (state.page !== 1) return; const bounds = canvas.getBoundingClientRect();
  const x = (e.clientX - bounds.left - state.dx) / state.scale, y = (e.clientY - bounds.top - state.dy) / state.scale;
  if (x > 970 && x < 1170 && y > 260 && y < 370) setCircuit(!state.closed);
});
window.addEventListener('resize', resize);
if ('ResizeObserver' in window) new ResizeObserver(resize).observe($('viewport'));
setMaterial('cobre'); setField(false); setCircuit(false); setRepresentation('electron'); setBird(false); setPage(0); resize(); requestAnimationFrame(tick);
