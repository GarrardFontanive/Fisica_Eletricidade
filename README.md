# Laboratório Virtual de Circuitos Elétricos

Simulador interativo de um circuito com bateria, interruptor e lâmpada. Permite explorar a relação entre tensão, corrente e potência elétrica, com uma animação do fluxo de cargas. Desenvolvido em português para apoiar aulas de Física, com JavaScript e Canvas API nativa.

## Como executar

1. Clone o repositório:

   ```bash
   git clone https://github.com/GarrardFontanive/Fisica_Eletricidade.git
   cd Fisica_Eletricidade
   ```

2. Abra o arquivo `index.html` em um navegador moderno.

Não é necessário instalar dependências ou compilar o projeto. Como alternativa, se tiver Python 3 instalado, execute na pasta do projeto:

```bash
python3 -m http.server 8000
```

Depois, acesse <http://localhost:8000>.

## Como usar

- A página inicia com o circuito aberto e a bateria ajustada para **12 V**.
- Clique em **Ligar Circuito (Fechar)** para fechar o interruptor.
- Ajuste a diferença de potencial (DDP) da bateria entre **0 e 24 V**.
- Observe o movimento das cargas em azul, o brilho da lâmpada e os indicadores de corrente e potência.
- Clique em **Desligar Circuito (Abrir)** para interromper a corrente e apagar a lâmpada.

## Recursos

- Desenho de bateria, fios, interruptor e lâmpada no Canvas.
- Interruptor interativo para abrir e fechar o circuito.
- Resistência da lâmpada fixada em **10 Ω**.
- Cálculo de corrente pela Lei de Ohm e de potência elétrica.
- Animação de 30 marcadores de carga com velocidade proporcional à corrente.
- Brilho da lâmpada associado à potência, com limite visual de intensidade.
- Indicadores de corrente e potência atualizados durante a animação.
- Interface com painéis translúcidos no estilo *glassmorphism*.
- Canvas em tela cheia, com ajuste de suas dimensões ao redimensionar a janela.

## Modelo didático e limitações

A simulação considera uma bateria ideal, fios sem resistência e uma lâmpada com resistência constante de 10 Ω. Com o interruptor fechado, os indicadores seguem:

- **Corrente:** `I = V / R`.
- **Potência elétrica:** `P = V × I`.

Por exemplo, com 12 V e o circuito fechado, a corrente é **1,20 A** e a potência é **14,40 W**. Com o circuito aberto, ambas são zero, independentemente da tensão selecionada.

O brilho representa visualmente a potência elétrica e satura em valores mais altos. Não é uma medição de luminosidade nem um cálculo da eficiência luminosa. O modelo não calcula temperatura ou colisões microscópicas; a resistência de uma lâmpada real pode variar com o aquecimento.

Os marcadores de carga são ilustrativos, e sua velocidade não está em escala física. A direção de movimento na tela é uma convenção da animação; em um condutor metálico real, a corrente convencional tem sentido oposto à deriva dos elétrons.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| HTML5 | Estrutura da página e controles |
| CSS3 | Aparência dos painéis e layout |
| JavaScript | Estado do circuito, cálculos elétricos e animação |
| Canvas API | Desenho dos componentes e das cargas em 2D |
| `requestAnimationFrame` | Atualização contínua da animação |

## Estrutura do projeto

```text
.
├── .gitignore     # Exclusões de materiais de apoio e arquivos locais
├── README.md      # Apresentação e instruções de uso
├── index.html     # Interface, estilos e elemento canvas
└── app.js         # Motor da simulação e interação com os controles
```

## Materiais de apoio

Arquivos PDF e apresentações PowerPoint ficam fora do versionamento, assim como as configurações locais do editor. O repositório contém o simulador e sua documentação.

## Autoria

[Garrard Fontanive](https://github.com/GarrardFontanive)
