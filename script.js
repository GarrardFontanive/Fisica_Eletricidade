
'use strict';

const $ = id => document.getElementById(id);
const canvas = $('canvas');
const ctx = canvas.getContext('2d');

const VIEW = { w: 1200, h: 760 };
const fio = { x: 90, y: 151, w: 1020, h: 235 };
const circuito = {
  esquerda: 205, direita: 995, cima: 528, baixo: 693
};

const estado = {
  fechado: false,
  modo: 'real',
  velocidade: 1,
  tempo: 0,
  ultimo: 0,
  alavanca: 0,
  largura: 0,
  altura: 0,
  escala: 1,
  dx: 0,
  dy: 0
};

const particulas = [];
const total = 18;
const sorteio = (a, b) => a + Math.random() * (b - a);

// ==================================================
// 1. CRIAÇÃO E ORGANIZAÇÃO DAS PARTÍCULAS
// ==================================================

function criarParticulas() {
  particulas.length = 0;

  for (let i = 0; i < total; i++) {
    const angulo = sorteio(-Math.PI, Math.PI);

    particulas.push({
      x: sorteio(35, fio.w - 35),
      y: sorteio(25, fio.h - 25),
      vx: Math.cos(angulo),
      vy: Math.sin(angulo),
      pista: i % 3,
      fator: sorteio(.8, 1.2),
      mudar: sorteio(.4, 1.6)
    });
  }
}

function organizarParticulas() {
  particulas.forEach((p, i) => {
    p.x = 65 + Math.floor(i / 3) * 175 + p.pista * 14;
    p.y = [42, 118, 194][p.pista];
  });
}

// ==================================================
// 2. ALTERAÇÃO DO SENTIDO DA REPRESENTAÇÃO
// ==================================================

function selecionarModo(modo) {
  if (!estado.fechado) return;

  estado.modo = modo;

  $('modoReal').classList.toggle('ativo', modo === 'real');

  $('modoConvencional').classList.toggle(
    'ativo', modo === 'convencional'
  );

  $('modoConvencional').classList.toggle(
    'convencional', modo === 'convencional'
  );

  $('modoReal').setAttribute(
    'aria-pressed', String(modo === 'real')
  );

  $('modoConvencional').setAttribute(
    'aria-pressed', String(modo === 'convencional')
  );

  if (modo === 'real') {
    $('explicacao').textContent =
      'Elétrons (−) deslocam-se em média da direita para a esquerda.';

    $('legendaMovel').innerHTML =
      '<i class="eletron"></i> Elétrons (−)';
  } else {
    $('explicacao').textContent =
      'Modelo convencional: cargas positivas equivalentes ' +
      'deslocam-se para a direita. Não são os elétrons.';

    $('legendaMovel').innerHTML =
      '<i class="carga-positiva"></i> Cargas equivalentes (+)';
  }

  desenhar();
}

// ==================================================
// 3. CHAVE DO CIRCUITO
// ==================================================

function definirChave(fechado) {
  estado.fechado = fechado;

  $('chave').textContent =
    fechado ? 'Abrir chave CH' : 'Fechar chave CH';

  $('chave').classList.toggle('ligado', fechado);

  $('chave').setAttribute(
    'aria-pressed', String(fechado)
  );

  $('situacao').textContent =
    fechado ? 'CHAVE FECHADA' : 'CHAVE ABERTA';

  $('situacao').classList.toggle('ligado', fechado);

  $('modoReal').disabled = !fechado;
  $('modoConvencional').disabled = !fechado;

  $('resultado').textContent = fechado ? 'i > 0' : 'i = 0';
  $('resultado').classList.toggle('ligado', fechado);

  if (fechado) {
    organizarParticulas();
    selecionarModo(estado.modo);
  } else {
    particulas.forEach(p => {
      const a = sorteio(-Math.PI, Math.PI);
      p.vx = Math.cos(a);
      p.vy = Math.sin(a);
      p.mudar = sorteio(.4, 1.6);
    });

    $('explicacao').textContent =
      'Sem corrente: os elétrons se movimentam desordenadamente.';

    $('legendaMovel').innerHTML =
      '<i class="eletron"></i> Elétrons (−)';
  }

  desenhar();
}

// ==================================================
// 4. FÍSICA E ANIMAÇÃO
// ==================================================

function atualizar(dt) {
  estado.tempo += dt * estado.velocidade;

  estado.alavanca +=
    (Number(estado.fechado) - estado.alavanca) *
    Math.min(1, dt * 13);

  const passo = 95 * dt * estado.velocidade;

  for (const p of particulas) {
    if (estado.fechado) {

      // REAL: partículas negativas para a esquerda.
      // CONVENCIONAL: cargas positivas equivalentes
      // para a direita.
      const direcao =
        estado.modo === 'real' ? -1 : 1;

      p.x += direcao * passo;

      // Reaparecem na extremidade oposta,
      // representando um fio contínuo.
      if (p.x < 22) p.x = fio.w - 22;
      if (p.x > fio.w - 22) p.x = 22;

    } else {

      // Sem campo externo: movimento desordenado.
      p.mudar -= dt * estado.velocidade;

      if (p.mudar <= 0) {
        const a = Math.atan2(p.vy, p.vx) +
          sorteio(-1.2, 1.2);

        p.vx = Math.cos(a);
        p.vy = Math.sin(a);
        p.mudar = sorteio(.4, 1.8);
      }

      p.x += p.vx * passo * p.fator;
      p.y += p.vy * passo * p.fator;

      // Reflexões nas paredes internas do metal.
      if (p.x < 22) {
        p.x = 22;
        p.vx = Math.abs(p.vx);
      }

      if (p.x > fio.w - 22) {
        p.x = fio.w - 22;
        p.vx = -Math.abs(p.vx);
      }

      if (p.y < 22) {
        p.y = 22;
        p.vy = Math.abs(p.vy);
      }

      if (p.y > fio.h - 22) {
        p.y = fio.h - 22;
        p.vy = -Math.abs(p.vy);
      }
    }
  }
}

// ==================================================
// 5. FUNÇÕES BÁSICAS DO CANVAS
// ==================================================

function linha(x1, y1, x2, y2, cor, largura = 2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = cor;
  ctx.lineWidth = largura;
  ctx.stroke();
}

function caixa(x, y, w, h, r, cor) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = cor;
  ctx.fill();
}

function circulo(x, y, r, cor, contorno = null, espessura = 1) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = cor;
  ctx.fill();

  if (contorno) {
    ctx.strokeStyle = contorno;
    ctx.lineWidth = espessura;
    ctx.stroke();
  }
}

function texto(s, x, y, tamanho = 20,
  cor = '#eff8ff', peso = 700,
  alinhar = 'left') {
  ctx.font = `${peso} ${tamanho}px system-ui, Arial`;
  ctx.fillStyle = cor;
  ctx.textAlign = alinhar;
  ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}

function seta(x1, y1, x2, y2, cor, largura = 5) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const ponta = 18;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  linha(x1, y1, x2, y2, cor, largura);

  ctx.beginPath();
  ctx.moveTo(x2, y2);

  ctx.lineTo(
    x2 - ponta * Math.cos(a - .5),
    y2 - ponta * Math.sin(a - .5)
  );

  ctx.lineTo(
    x2 - ponta * Math.cos(a + .5),
    y2 - ponta * Math.sin(a + .5)
  );

  ctx.closePath();
  ctx.fillStyle = cor;
  ctx.fill();
  ctx.restore();
}

function vetor(x, y, angulo) {
  const a = 21;
  const b = 46;

  seta(
    x + Math.cos(angulo) * a,
    y + Math.sin(angulo) * a,
    x + Math.cos(angulo) * b,
    y + Math.sin(angulo) * b,
    '#ffe175',
    3
  );
}

// ==================================================
// 6. FIO METÁLICO AMPLIADO
// ==================================================

function desenharFioAmpliado() {
  texto(
    'AMPLIAÇÃO DO FIO METÁLICO',
    72, 50, 26, '#e7f7ff', 850
  );

  let titulo = 'AGITAÇÃO DESORDENADA';

  if (estado.fechado) {
    titulo = estado.modo === 'real'
      ? 'ELÉTRONS: PARA A ESQUERDA'
      : 'CONVENÇÃO: PARA A DIREITA';
  }

  texto(
    titulo, 1128, 50, 22,
    estado.fechado ? '#82f2c9' : '#ffdc97',
    850, 'right'
  );

  // Envoltória cilíndrica de cobre.
  const metal = ctx.createLinearGradient(0, 98, 0, 434);
  metal.addColorStop(0, '#ffcd92');
  metal.addColorStop(.11, '#b56a3e');
  metal.addColorStop(.21, '#623527');
  metal.addColorStop(.58, '#ae5e32');
  metal.addColorStop(.83, '#542a21');
  metal.addColorStop(.94, '#c8844c');
  metal.addColorStop(1, '#f7c68c');

  ctx.save();
  ctx.shadowBlur = 23;
  ctx.shadowColor = '#000b';
  caixa(56, 100, 1088, 332, 77, metal);
  ctx.restore();

  // Interior do fio.
  const miolo = ctx.createLinearGradient(
    0, fio.y, 0, fio.y + fio.h
  );

  miolo.addColorStop(0, '#202e3a');
  miolo.addColorStop(.5, '#293641');
  miolo.addColorStop(1, '#141f30');

  caixa(fio.x, fio.y, fio.w, fio.h, 34, miolo);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(fio.x, fio.y, fio.w, fio.h, 34);
  ctx.clip();

  // Íons positivos FIXOS da rede cristalina.
  for (let fila = 0; fila < 3; fila++) {
    for (let col = 0; col < 9; col++) {
      const x = fio.x + 66 + col * 112 + (fila % 2) * 21;
      const y = fio.y + 48 + fila * 72;

      if (col < 8) {
        linha(x + 18, y, x + 91, y, '#9c724f44', 2);
      }

      const brilho = ctx.createRadialGradient(
        x - 6, y - 6, 1, x, y, 21
      );

      brilho.addColorStop(0, '#ffe5b5');
      brilho.addColorStop(.55, '#bd7d49');
      brilho.addColorStop(1, '#5e392b');

      circulo(x, y, 18, brilho, '#e7b07d', 1.5);
      texto('+', x, y - 1, 20, '#fff2da', 850, 'center');
    }
  }

  // Pistas ilustrativas da corrente organizada.
  if (estado.fechado) {
    for (const y of [42, 118, 194]) {
      ctx.setLineDash([6, 12]);

      linha(
        fio.x + 20,
        fio.y + y,
        fio.x + fio.w - 20,
        fio.y + y,
        '#ffffff29',
        2
      );

      ctx.setLineDash([]);
    }
  }

  // Alternância da representação das cargas.
  const convencao =
    estado.fechado && estado.modo === 'convencional';

  for (const p of particulas) {
    const x = fio.x + p.x;
    const y = fio.y + p.y;

    ctx.save();
    ctx.shadowBlur = 13;
    ctx.shadowColor = convencao ? '#ff898e' : '#50dfff';

    circulo(
      x, y, 15,
      convencao ? '#ff9b91' : '#61e0f4',
      '#ffffff', 1.5
    );

    ctx.restore();

    circulo(
      x, y, 10,
      convencao ? '#a03d48' : '#19637e'
    );

    texto(
      convencao ? '+' : '−',
      x, y, 20, '#ffffff', 900, 'center'
    );

    const direcao = estado.fechado
      ? (convencao ? 0 : Math.PI)
      : Math.atan2(p.vy, p.vx);

    vetor(x, y, direcao);
  }

  ctx.restore();

  // Borda e reflexos do fio metálico.
  ctx.beginPath();
  ctx.roundRect(fio.x, fio.y, fio.w, fio.h, 34);
  ctx.strokeStyle = '#ffbd87';
  ctx.lineWidth = 7;
  ctx.stroke();

  linha(152, 113, 1047, 113, '#ffe0ae91', 4);
  linha(151, 421, 1044, 421, '#ffca8e8a', 4);

  texto('ÍONS (+) FIXOS', 137, 460, 18, '#efb88e', 800);

  texto(
    convencao
      ? 'CARGAS POSITIVAS EQUIVALENTES (+)'
      : 'ELÉTRONS LIVRES (−)',
    1067, 460, 18,
    convencao ? '#ffa1a5' : '#83eaff',
    800, 'right'
  );
}

// ==================================================
// 7. FIOS, BATERIA E CHAVE
// ==================================================

function fioDeCobre(x1, y1, x2, y2) {
  ctx.save();
  ctx.lineCap = 'round';

  linha(x1, y1, x2, y2, '#48261e', 25);
  linha(x1, y1, x2, y2, '#ae6239', 19);
  linha(x1, y1 - 3, x2, y2 - 3, '#e8aa73', 6);
  linha(x1, y1 + 6, x2, y2 + 6, '#6c392a', 4);

  ctx.restore();
}

function bateria() {
  const x = 495, y = 657, w = 212, h = 71;
  const brilho = ctx.createLinearGradient(x, y, x, y + h);

  brilho.addColorStop(0, '#d6e4ef');
  brilho.addColorStop(.5, '#40556d');
  brilho.addColorStop(1, '#bacde1');

  caixa(x, y, w, h, 14, brilho);

  circulo(x + 12, y + 35, 21, '#bdcbd9', '#e9f2fd', 2);
  circulo(x + w - 12, y + 35, 21, '#506a83', '#d1e4f5', 2);

  texto('+', x + 37, y + 21, 25, '#fff6db', 900, 'center');
  texto('−', x + w - 37, y + 21, 25, '#e4f1ff', 900, 'center');
  texto('V', x + w / 2, y + 42, 42, '#ffffff', 900, 'center');
  texto('BATERIA', x + w / 2, y + 92, 17, '#aec6dd', 800, 'center');
}

function chaveNoDesenho() {
  const x = circuito.direita;
  const y1 = 577, y2 = 634;

  circulo(x, y1, 12, '#e7cda7', '#6a4031', 2);
  circulo(x, y2, 12, '#e7cda7', '#6a4031', 2);

  const xf = x + 51 * (1 - estado.alavanca);
  const yf = y1 - 8 * (1 - estado.alavanca);

  ctx.save();
  ctx.lineCap = 'round';

  linha(
    x, y2, xf, yf,
    estado.fechado ? '#8cf2c7' : '#fad19a',
    12
  );

  ctx.restore();

  circulo(x, y2, 6, '#fff0dc');
  texto('CH', x + 95, 604, 32, '#ffedcf', 900, 'center');
}

function desenharCircuito() {
  const c = circuito;

  // Linhas que ligam a ampliação ao circuito.
  ctx.setLineDash([8, 11]);
  linha(191, 433, 191, 507, '#9de4ef62', 2);
  linha(1008, 433, 1008, 507, '#9de4ef62', 2);
  ctx.setLineDash([]);

  // Fios metálicos do circuito principal.
  fioDeCobre(c.esquerda, c.cima, c.direita, c.cima);
  fioDeCobre(c.esquerda, c.cima, c.esquerda, c.baixo);
  fioDeCobre(c.esquerda, c.baixo, 495, c.baixo);
  fioDeCobre(707, c.baixo, c.direita, c.baixo);
  fioDeCobre(c.direita, c.cima, c.direita, 565);
  fioDeCobre(c.direita, 646, c.direita, c.baixo);

  bateria();
  chaveNoDesenho();

  // Os dois sentidos ficam sempre visíveis
  // quando o circuito está fechado.
  if (estado.fechado) {
    // Sentido convencional, vermelho.
    seta(379, 494, 781, 494, '#ff7185', 8);
    texto('i', 809, 494, 29, '#ff8b9c', 900);

    // Fluxo dos elétrons, azul.
    seta(781, 563, 378, 563, '#73a9ff', 8);
    texto('e⁻', 350, 565, 27, '#92bfff', 900, 'center');
  } else {
    texto(
      'SEM CORRENTE RESULTANTE',
      600, 492, 22, '#ffda9b', 850, 'center'
    );
  }
}

// ==================================================
// 8. REDIMENSIONAMENTO E LOOP DE ANIMAÇÃO
// ==================================================

function desenhar() {
  if (!estado.largura || !estado.altura) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#081726';
  ctx.fillRect(0, 0, estado.largura, estado.altura);

  ctx.translate(estado.dx, estado.dy);
  ctx.scale(estado.escala, estado.escala);

  const fundo = ctx.createRadialGradient(
    580, 230, 0, 580, 370, 850
  );

  fundo.addColorStop(0, '#173048');
  fundo.addColorStop(1, '#071422');

  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);

  desenharFioAmpliado();
  desenharCircuito();
}

function redimensionar() {
  const r = $('area').getBoundingClientRect();

  estado.largura = Math.max(r.width, 200);
  estado.altura = Math.max(r.height, 200);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(estado.largura * dpr);
  canvas.height = Math.round(estado.altura * dpr);

  estado.escala = Math.min(
    estado.largura / VIEW.w,
    estado.altura / VIEW.h
  );

  estado.dx =
    (estado.largura - VIEW.w * estado.escala) / 2;

  estado.dy =
    (estado.altura - VIEW.h * estado.escala) / 2;

  desenhar();
}

function quadro(agora) {
  const dt = estado.ultimo
    ? Math.min(.045, (agora - estado.ultimo) / 1000)
    : 0;

  estado.ultimo = agora;

  atualizar(dt);
  desenhar();

  requestAnimationFrame(quadro);
}

// ==================================================
// 9. INTERATIVIDADE
// ==================================================

function posicao(evento) {
  const r = canvas.getBoundingClientRect();

  return {
    x: (evento.clientX - r.left - estado.dx) / estado.escala,
    y: (evento.clientY - r.top - estado.dy) / estado.escala
  };
}

function sobreChave(x, y) {
  return x > 952 && x < 1135 && y > 554 && y < 655;
}

$('chave').addEventListener('click', () => {
  definirChave(!estado.fechado);
});

$('modoReal').addEventListener('click', () => {
  selecionarModo('real');
});

$('modoConvencional').addEventListener('click', () => {
  selecionarModo('convencional');
});

$('velocidade').addEventListener('input', e => {
  estado.velocidade = Number(e.target.value);

  $('valorVelocidade').textContent =
    estado.velocidade.toLocaleString(
      'pt-BR', { maximumFractionDigits: 2 }
    ) + '×';
});

$('reiniciar').addEventListener('click', () => {
  estado.modo = 'real';
  criarParticulas();
  estado.tempo = 0;
  definirChave(false);

  $('modoReal').classList.add('ativo');

  $('modoConvencional').classList.remove(
    'ativo', 'convencional'
  );

  $('modoReal').setAttribute('aria-pressed', 'true');
  $('modoConvencional').setAttribute('aria-pressed', 'false');
});

$('telaCheia').addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await $('laboratorio').requestFullscreen();
    }
  } catch {
    alert('O navegador não permitiu tela cheia. Tente F11.');
  }
});

document.addEventListener('fullscreenchange', () => {
  $('telaCheia').textContent = document.fullscreenElement
    ? 'Sair da tela cheia'
    : 'Tela cheia';

  setTimeout(redimensionar, 50);
});

canvas.addEventListener('pointerdown', e => {
  const p = posicao(e);

  if (sobreChave(p.x, p.y)) {
    definirChave(!estado.fechado);
  }
});

canvas.addEventListener('pointermove', e => {
  const p = posicao(e);

  canvas.style.cursor =
    sobreChave(p.x, p.y) ? 'pointer' : 'default';
});

canvas.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    definirChave(!estado.fechado);
  }
});

window.addEventListener('resize', redimensionar);

if (window.ResizeObserver) {
  new ResizeObserver(redimensionar).observe($('area'));
}

// Inicialização
criarParticulas();
definirChave(false);
redimensionar();
requestAnimationFrame(quadro);
