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
    rectW = Math.min(700, canvas.width * 0.6);
    rectH = Math.min(400, canvas.height * 0.5);
    rectX = (canvas.width - rectW) / 2 + 150; // Deslocado para a direita por causa do menu
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
        btnSwitch.className = ""; // Fica vermelho
    } else {
        btnSwitch.innerText = "Ligar Circuito (Fechar)";
        btnSwitch.className = "btn-green";
    }
});

// Criando os elétrons
const electrons = [];
const numElectrons = 35;
for (let i = 0; i < numElectrons; i++) {
    electrons.push({
        progress: (i / numElectrons) * (rectW * 2 + rectH * 2)
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

    // Atualiza Painel de Texto
    currentVal.innerText = corrente.toFixed(2) + ' A';
    powerVal.innerText = potencia.toFixed(2) + ' W';

    // 1. DESENHANDO OS FIOS BASE
    ctx.beginPath();
    ctx.rect(rectX, rectY, rectW, rectH);
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 10;
    ctx.stroke();

    // 2. DESENHANDO A BATERIA (Lado Esquerdo)
    const batX = rectX;
    const batY = rectY + rectH / 2;
    const batW = 50;
    const batH = 100;
    
    ctx.clearRect(batX - 10, batY - batH/2 - 15, 20, batH + 30); // Limpa o fio por trás

    // Pino positivo (topo)
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(batX - 10, batY - batH/2 - 8, 20, 8);
    // Metade Cobre (Positivo)
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(batX - batW/2, batY - batH/2, batW, batH/2);
    // Metade Preta (Negativo)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(batX - batW/2, batY, batW, batH/2);
    // Textos + e -
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', batX, batY - batH/4);
    ctx.fillText('-', batX, batY + batH/4);


    // 3. DESENHANDO A LÂMPADA (Topo)
    const lampX = rectX + rectW / 2;
    const lampY = rectY;
    
    ctx.clearRect(lampX - 15, lampY - 10, 30, 20); // Limpa o fio por trás

    // Base metálica da lâmpada (Rosca)
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(lampX - 14, lampY - 10, 28, 20); 
    ctx.fillStyle = '#34495e';
    ctx.fillRect(lampX - 8, lampY + 10, 16, 8); // Contato inferior que liga no fio

    // Bulbo de Vidro
    const bulbY = lampY - 40;
    ctx.beginPath();
    ctx.arc(lampX, bulbY, 35, 0, Math.PI * 2);
    
    if (isFechado && potencia > 0) {
        const brilho = Math.min(potencia * 5, 255);
        ctx.fillStyle = `rgba(255, 255, 0, ${brilho / 255 * 0.7})`;
        ctx.shadowBlur = brilho + 20;
        ctx.shadowColor = '#ffea00';
    } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.stroke();
    ctx.shadowBlur = 0; // Reset

    // Filamento interno (Zigue-zague)
    ctx.beginPath();
    ctx.moveTo(lampX - 10, lampY - 10);
    ctx.lineTo(lampX - 10, bulbY + 5);
    ctx.lineTo(lampX - 5, bulbY - 10);
    ctx.lineTo(lampX, bulbY + 5);
    ctx.lineTo(lampX + 5, bulbY - 10);
    ctx.lineTo(lampX + 10, bulbY + 5);
    ctx.lineTo(lampX + 10, lampY - 10);
    ctx.strokeStyle = (isFechado && potencia > 0) ? '#ffffff' : '#555555';
    ctx.lineWidth = 3;
    ctx.stroke();


    // 4. DESENHANDO O INTERRUPTOR (Embaixo)
    const switchX = rectX + rectW / 2;
    const switchY = rectY + rectH;
    const swW = 80;

    ctx.clearRect(switchX - swW/2 - 10, switchY - 10, swW + 20, 20); // Limpa o fio

    // Terminais de Contato
    ctx.fillStyle = '#d35400';
    ctx.beginPath(); ctx.arc(switchX - swW/2, switchY, 10, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(switchX + swW/2, switchY, 10, 0, Math.PI*2); ctx.fill();

    // Lâmina Condutora (Faca)
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(switchX - swW/2, switchY);
    if (isFechado) {
        ctx.lineTo(switchX + swW/2, switchY); // Fechado (deitado)
    } else {
        ctx.lineTo(switchX - 15, switchY - 40); // Aberto (levantado)
    }
    ctx.stroke();
    
    // Pegador de plástico vermelho
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    if (isFechado) {
        ctx.arc(switchX + swW/2, switchY, 8, 0, Math.PI*2);
    } else {
        ctx.arc(switchX - 15, switchY - 40, 8, 0, Math.PI*2);
    }
    ctx.fill();


    // 5. ANIMANDO OS ELÉTRONS
    electrons.forEach(el => {
        if (isFechado) {
            el.progress += corrente * 1.5; // Velocidade baseada na corrente
        }

        const pos = getPosAlongRect(el.progress);

        // Verifica se o elétron está passando por baixo de um dos desenhos principais
        const inBat = (pos.x === batX && pos.y > batY - batH/2 - 10 && pos.y < batY + batH/2);
        const inLamp = (pos.y === lampY && pos.x > lampX - 15 && pos.x < lampX + 15);
        const inSwitch = (pos.y === switchY && pos.x > switchX - swW/2 - 10 && pos.x < switchX + swW/2 + 10);

        if (!inBat && !inLamp && !inSwitch) {
            // Corpo do elétron
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#00e5ff'; 
            ctx.fill();
            
            // Sinal negativo (-) no elétron
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('-', pos.x, pos.y + 1);
        }
    });

    requestAnimationFrame(update);
}

update();