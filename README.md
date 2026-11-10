# Laboratório Virtual de Eletricidade & Eletrodinâmica

![Status](https://img.shields.io/badge/Status-Conclu%C3%ADdo-brightgreen)
![Tecnologia](https://img.shields.io/badge/Tecnologia-HTML5%20%7C%20CSS3%20%7C%20JavaScript-orange)
![Renderização](https://img.shields.io/badge/Renderiza%C3%A7%C3%A3o-Canvas_API_Nativo-blue)
![Instituição](https://img.shields.io/badge/Institui%C3%A7%C3%A3o-IFC_Rio_do_Sul-green)

Simulador educacional e laboratório interativo desenvolvido para o ensino de **Eletricidade e Eletrodinâmica** no **Instituto Federal Catarinense (IFC) — Campus Rio do Sul**, concebido para projeção em sala de aula ou estudo individual.

O projeto foi projetado para caber perfeitamente na tela de projetores e computadores sem cortes ou necessidade de rolagem vertical, com visual de laboratório didático de física e suporte a modo claro/escuro.

---

## 🎯 Roteiro de Aula e Módulos

Baseado na apresentação pedagógica do curso (`Aula/Introdução ao curso de eletricidade 2.pptx`), o laboratório está organizado em **4 módulos práticos**:

### 01. Materiais & Elétrons (Slides 8, 9, 10 e 18)
- **Estrutura Atômica e Rede Metálica:** Visualização dos íons metálicos dispostos em rede cristalina tridimensional e o mar de elétrons livres em movimento.
- **Comparação de Materiais:**
  - **Cobre ($Cu$, $Z=29$):** Excelente condutor ($\rho \approx 1{,}68 \times 10^{-8}\ \Omega\cdot\text{m}$).
  - **Alumínio ($Al$):** Bom condutor leve ($\rho \approx 2{,}65 \times 10^{-8}\ \Omega\cdot\text{m}$).
  - **Aço / Nicromo:** Alta resistividade ($\rho \approx 1{,}50 \times 10^{-7}\ \Omega\cdot\text{m}$), colisões intensas.
  - **Vidro (Isolante):** Elétrons fortemente aprisionados, sem portadores livres para corrente contínua.
- **Agitação Térmica vs. Deriva:**
  - Sem DDP ($U = 0\text{ V}$): agitação térmica caótica com vetores de velocidade em todas as direções ($\vec{v}_{\text{méd}} = 0$).
  - Com DDP ($U > 0\text{ V}$): surge o campo elétrico $\vec{E}$ e a velocidade de deriva ($\vec{v}_d$) orientando as flechas de velocidade dos elétrons em direção ao polo positivo, com fluxo contínuo.
- **Efeito Joule:** Demonstração microscópica das colisões dos elétrons com os íons da rede, aumentando a vibração e convertendo energia elétrica em calor.

### 02. Circuito Elétrico, Leis de Ohm & Medições (Slides 13 a 16)
- **Circuito Esquemático:**
  - Fonte DC com ajuste contínuo de Tensão ($U$ de $0\text{ a }24\text{ V}$).
  - Carga com ajuste de Resistência ($R$ de $2\text{ a }24\ \Omega$).
  - Chave CH acionável por clique no circuito, botão ou tecla <kbd>C</kbd>.
  - Lâmpada incandescente cujo filamento aquece e irradia brilho conforme $P = U \cdot i = R \cdot i^2$.
- **Instrumentação em Tempo Real:**
  - **Voltímetro** em paralelo e **Amperímetro** em série ($i = U / R$).
  - Medição de potência ($P$) e carga acumulada ($\Delta Q$).
- **Seção Transversal Reta ($\Delta S$):**
  - Corte ampliado com plano $\Delta S$ e sensor que contabiliza a carga acumulada $\Delta Q = N \cdot |e|$.
  - Alternância entre **Elétrons reais ($-$)** e **Sentido convencional ($+$)**.
- **Gráfico $i \times t$ (Slide 15):** Exibição da reta de corrente contínua com área sombreada representativa da carga $\Delta Q = i \cdot \Delta t$.

### 03. Aparelhos do Cotidiano & Efeito Joule (Slides 2 a 7 e 18)
Classificação pedagógica dos aparelhos conforme o conteúdo do curso:
1. **Aparelho Resistivo (Efeito Joule):** Chuveiro elétrico / ebulidor com espiral de nicromo aquecendo água dentro do recipiente de vidro, convecção térmica de bolhas e termômetro graduado ($Q = m \cdot c \cdot \Delta T$).
2. **Motor Elétrico:** Conversão em movimento mecânico de rotação (ventilador), com ímãs de estator (polos N e S), linhas de campo magnético $\vec{B}$, torque $\tau = i \cdot A \cdot B$ e hélice em rotação dinâmica.
3. **Lâmpada Incandescente:** Filamento de tungstênio a $\sim 2500\text{ }^\circ\text{C}$ no vácuo com balanço de rendimento (95% calor e 5% luz visível).

### 04. DDP, Pássaro no Fio & Segurança Humana (Slides 11, 12 e 17)
- **O Pássaro no Fio:**
  - *Pés no mesmo fio:* $V_A = V_B \implies \Delta V = 0\text{ V}$. A corrente segue pelo condutor de cobre e não passa pelo corpo do pássaro.
  - *Dois fios distintos:* $\Delta V = 120\text{ V}$. Há descarga elétrica através do corpo da ave.
- **Simulador de Choque Humano (Slide 17):**
  - Tensão de contato ($12\text{ V}$, $127\text{ V}$, $220\text{ V}$, $1000\text{ V}$).
  - Resistência do corpo: **Pele Seca** ($\approx 100\text{ k}\Omega$) versus **Pele Molhada** ($\approx 1\text{ k}\Omega$).
  - Cálculo instantâneo da corrente de choque $i = U / R_{\text{corpo}}$ em miliamperes ($\text{mA}$).
  - Régua de efeitos fisiológicos (Imperceptível $\to$ Formigamento $\to$ Tetanização $\to$ Fibrilação $\to$ Parada).
  - Coração com batimento que entra em tremor de fibrilação na faixa crítica.

---

## ⌨️ Atalhos de Teclado para a Aula

| Tecla | Função |
| :---: | :--- |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>, <kbd>4</kbd> | Alterna diretamente entre os 4 experimentos |
| <kbd>Espaço</kbd> | Pausa ou continua a animação |
| <kbd>C</kbd> | Abre ou fecha a chave do circuito (CH) no Experimento 02 |
| <kbd>F</kbd> | Entra ou sai do modo de projeção em Tela Cheia |
| <kbd>R</kbd> | Reinicia contadores de carga e temperatura |
| <kbd>H</kbd> ou <kbd>?</kbd> | Abre o painel rápido de atalhos |

---

## 💻 Como Executar

O projeto é 100% nativo (HTML5, CSS3 e JavaScript ES6+) via **Canvas 2D API**, sem dependências externas e com funcionamento offline imediato.

1. Clone o repositório:
   ```bash
   git clone https://github.com/GarrardFontanive/Fisica_Eletricidade.git
   cd Fisica_Eletricidade
   ```

2. Abra o arquivo `index.html` em qualquer navegador moderno.

Ou inicie com Python:
```bash
python3 -m http.server 8000
```
Acesse `http://localhost:8000`.

---

## 👨‍🏫 Autoria e Créditos

Desenvolvido por **[Garrard Fontanive](https://github.com/GarrardFontanive)** no âmbito do projeto de Laboratórios Virtuais de Física e Programação do **Instituto Federal Catarinense (IFC)**.
