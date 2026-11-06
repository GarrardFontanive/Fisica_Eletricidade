const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ddpSlider = document.getElementById('ddp-slider');
const ddpVal = document.getElementById('ddp-val');
const currentVal = document.getElementById('current-val');
const powerVal = document.getElementById('power-val');
const btnSwitch = document.getElementById('btn-switch');

// Variáveis de Estado do Circuito
let voltagem = 12;
const resistencia = 10; // Fixo em 10 Ohms
let isFechado = false;
let corrente = 0;
let potencia = 0;

// Configuração Visual do Circuito
let rectX, rectY, rectW, rectH;

function updateCircuitDimensions() {
    rectW = Math.min(600, canvas.width * 0.6);
    rectH = Math.min(300, canvas.height * 0.5);
    rectX = (canvas.width - rectW) / 2 + 100; // Deslocado um pouco para a direita
    rectY = (canvas.height - rectH) / 2;
}
updateCircuitDimensions();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateCircuitDimensions();
});

// Eventos da UI
ddpSlider.addEventListener('input', (e) => {
    voltagem = parseInt(e.target.value);
    ddpVal.innerText = voltagem + ' V';
});

btnSwitch.addEventListener('click', () => {
    isFechado = !isFechado;
    if (isFechado) {
        btnSwitch.innerText = "Desligar Circuito (Abrir)";
        btnSwitch.className = ""; // Remove a classe verde, fica vermelho
    } else {
        btnSwitch.innerText = "Ligar Circuito (Fechar)";
        btnSwitch.className = "btn-green";
    }
});

// Criando os elétrons para percorrer o fio
const electrons = [];
const numElectrons = 30;
for (let i = 0; i < numElectrons; i++) {
    electrons.push({
        progress: (i / numElectrons) * (rectW * 2 + rectH * 2) // Posição ao longo do perímetro
    });
}

function getPosAlongRect(progress) {
    const p = progress % (rectW * 2 + rectH * 2);
    if (p < rectW) return { x: rectX + p, y: rectY }; // Topo (indo pra direita)
    if (p < rectW + rectH) return { x: rectX + rectW, y: rectY + (p - rectW) }; // Direita (descendo)
    if (p < rectW * 2 + rectH) return { x: rectX + rectW - (p - rectW - rectH), y: rectY + rectH }; // Base (indo pra esquerda)
    return { x: rectX, y: rectY + rectH - (p - rectW * 2 - rectH) }; // Esquerda (subindo)
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cálculos da Lei de Ohm
    if (isFechado) {
        corrente = voltagem / resistencia;
        potencia = voltagem * corrente;
    } else {
        corrente = 0;
        potencia = 0;
    }

    // Atualiza Painel
    currentVal.innerText = corrente.toFixed(2) + ' A';
    powerVal.innerText = potencia.toFixed(2) + ' W';

    // 1. Desenhando os Fios
    ctx.beginPath();
    ctx.rect(rectX, rectY, rectW, rectH);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 10;
    ctx.stroke();

    // 2. Desenhando o Interruptor (Topo)
    const switchSize = 60;
    const switchX = rectX + rectW / 2;
    const switchY = rectY;
    
    // Apaga a linha debaixo do interruptor
    ctx.clearRect(switchX - switchSize/2, switchY - 10, switchSize, 20);
    
    // Contatos
    ctx.fillStyle = '#bbb';
    ctx.beginPath();
    ctx.arc(switchX - switchSize/2, switchY, 8, 0, Math.PI * 2);
    ctx.arc(switchX + switchSize/2, switchY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Haste do interruptor
    ctx.beginPath();
    ctx.moveTo(switchX - switchSize/2, switchY);
    if (isFechado) {
        ctx.lineTo(switchX + switchSize/2, switchY); // Fechado (deitado)
    } else {
        ctx.lineTo(switchX - 10, switchY - 40); // Aberto (levantado)
    }
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 6;
    ctx.stroke();

    // 3. Desenhando a Bateria (Esquerda)
    const batW = 40;
    const batH = 80;
    ctx.fillStyle = '#333';
    ctx.fillRect(rectX - batW/2, rectY + rectH/2 - batH/2, batW, batH);
    ctx.fillStyle = '#e94560'; // Polo Positivo
    ctx.fillRect(rectX - batW/2, rectY + rectH/2 - batH/2, batW, 20);
    ctx.fillStyle = '#fff'; // Detalhe da Bateria
    ctx.fillRect(rectX - 10, rectY + rectH/2 - batH/2 - 5, 20, 5);
    
    // Simbolos + e -
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('+', rectX - 6, rectY + rectH/2 - batH/2 + 16);
    ctx.fillText('-', rectX - 4, rectY + rectH/2 + batH/2 - 6);

    // 4. Desenhando a Lâmpada (Direita)
    const lampX = rectX + rectW;
    const lampY = rectY + rectH/2;
    
    // Se estiver ligado, faz a lâmpada brilhar baseado na potência
    if (isFechado && potencia > 0) {
        const brilho = Math.min(potencia * 2, 255); // Ajusta intensidade
        ctx.shadowBlur = brilho;
        ctx.shadowColor = 'rgba(255, 255, 0, 1)';
        ctx.fillStyle = `rgba(255, 255, 100, ${brilho/255})`;
    } else {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
    }

    ctx.beginPath();
    ctx.arc(lampX, lampY, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.shadowBlur = 0; // reseta sombra pro resto

    // Filamento da lâmpada
    ctx.beginPath();
    ctx.moveTo(lampX - 10, lampY + 10);
    ctx.lineTo(lampX - 5, lampY - 10);
    ctx.lineTo(lampX + 5, lampY - 10);
    ctx.lineTo(lampX + 10, lampY + 10);
    ctx.strokeStyle = (isFechado && potencia > 0) ? '#fff' : '#555';
    ctx.stroke();

    // 5. Animando os Elétrons (Fluxo de Corrente)
    electrons.forEach(el => {
        // Só andam se estiver fechado
        if (isFechado) {
            el.progress += corrente * 2; // Velocidade visual = Corrente * fator
        }

        const pos = getPosAlongRect(el.progress);

        // Esconde os elétrons se eles passarem "por cima" dos componentes
        const hideInBat = (pos.x === rectX && pos.y > rectY + rectH/2 - batH/2 && pos.y < rectY + rectH/2 + batH/2);
        const hideInLamp = (pos.x === rectX + rectW && pos.y > lampY - 30 && pos.y < lampY + 30);
        const hideInSwitch = (pos.y === rectY && pos.x > switchX - switchSize/2 && pos.x < switchX + switchSize/2);

        if (!hideInBat && !hideInLamp && !hideInSwitch) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#00e5ff'; // Cor dos elétrons
            ctx.fill();
        }
    });

    requestAnimationFrame(update);
}

update();

