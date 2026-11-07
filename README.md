# Laboratório Virtual de Eletricidade: Física e Programação

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-green)
![Tecnologia](https://img.shields.io/badge/Tecnologia-HTML5%20%7C%20CSS3%20%7C%20JavaScript-orange)
![Renderização](https://img.shields.io/badge/Renderiza%C3%A7%C3%A3o-Canvas_API-blue)

Simulador educacional para explorar a **corrente elétrica em condutores metálicos**, conectando a representação de um circuito à ampliação do interior de um fio de cobre. O estudante pode acionar a chave, observar o movimento das cargas e comparar o **sentido convencional da corrente** com o **sentido de deriva dos elétrons**.

O projeto segue a proposta dos [Laboratórios Virtuais de Física e Programação](https://github.com/GarrardFontanive/Fisica-ResistenciaAr): utilizar **Metodologias Ativas** e **Tecnologia Educacional** para aproximar conceitos de Física e práticas de programação no Ensino Médio Técnico. A iniciativa de referência é desenvolvida no **Instituto Federal Catarinense (IFC) — Campus Rio do Sul**.

## O projeto

Uma dúvida frequente no estudo da eletricidade é por que os elétrons e a corrente convencional têm sentidos opostos. Outra é imaginar que, ao abrir um circuito, todos os elétrons deixam de se mover.

O laboratório permite discutir essas questões por meio de duas visualizações conectadas: um **circuito com bateria e chave CH** e uma **ampliação do condutor**, com íons positivos fixos e partículas móveis. A interação ajuda a diferenciar movimento desordenado, deriva orientada e convenção de sentido da corrente.

### Objetivos de aprendizagem

- Diferenciar agitação térmica e movimento de deriva dos elétrons.
- Relacionar a abertura e o fechamento da chave à existência de corrente resultante.
- Comparar o sentido convencional com o deslocamento dos elétrons em um metal.
- Interpretar as relações entre quantidade de carga, número de portadores e intervalo de tempo.
- Identificar o que uma representação didática simplifica em relação ao fenômeno físico.

## Como a simulação funciona

| Estado ou modo | Representação na ampliação | Movimento mostrado |
| --- | --- | --- |
| **Chave aberta** | Elétrons azuis com sinal negativo | Desordenado, sem corrente resultante |
| **Chave fechada · Elétrons reais** | Elétrons azuis com sinal negativo | Deriva para a esquerda |
| **Chave fechada · Convencional** | Cargas positivas equivalentes, avermelhadas | Deslocamento para a direita |

Ao fechar a chave, **os dois sentidos aparecem simultaneamente no circuito**. O seletor altera a representação das partículas na ampliação: a polaridade da bateria e o sentido físico da deriva dos elétrons permanecem os mesmos.

As cargas positivas móveis do modo convencional representam uma corrente equivalente. **Os íons positivos da rede metálica continuam fixos no desenho.**

### Funcionalidades atuais

- Ampliação do fio com rede de íons e **18 partículas animadas**.
- Chave acionada pelo painel, pelo desenho ou pelo teclado.
- Seleção entre as representações **Elétrons reais** e **Convencional**.
- Atualização da legenda, dos sinais das cargas e dos vetores de movimento.
- Controle de velocidade visual entre **0,25× e 2,5×**.
- Botões para reiniciar a simulação e entrar em tela cheia.
- Interface responsiva, com adaptação do Canvas ao tamanho da área disponível.

## Fundamentos físicos

O painel apresenta a relação entre a carga que atravessa uma seção do condutor e o intervalo de tempo considerado:

$$
i = \frac{\Delta Q}{\Delta t}
\qquad
\Delta Q = N \cdot |e|
$$

| Grandeza | Significado | Unidade |
| --- | --- | --- |
| $i$ | Corrente média no intervalo considerado | Ampère (A) |
| $\Delta Q$ | Módulo da carga que atravessa a seção | Coulomb (C) |
| $\Delta t$ | Intervalo de tempo | Segundo (s) |
| $N$ | Número de elétrons que atravessam a seção | Contagem, sem unidade |
| $\lvert e \rvert$ | Módulo da carga do elétron, aproximadamente $1{,}6 \times 10^{-19}$ C | Coulomb (C) |

Assim, **1 A corresponde à passagem de 1 C de carga por segundo**.

Na versão atual, essas equações servem como referência conceitual. O indicador mostra **`i = 0`** ou **`i > 0`**, conforme o estado da chave. A contagem de cargas e o cálculo numérico da corrente ainda são propostas de evolução.

## Como executar

O simulador utiliza tecnologias web nativas e funciona diretamente no navegador, sem instalação de dependências ou etapa de compilação.

1. Clone o repositório:

   ```bash
   git clone https://github.com/GarrardFontanive/Fisica_Eletricidade.git
   cd Fisica_Eletricidade
   ```

2. Abra o arquivo **`index.html`** em um navegador moderno, mantendo `script.js` e `style.css` na mesma pasta.

Se preferir utilizar um servidor local e tiver Python 3 instalado, execute na pasta do projeto:

```bash
python3 -m http.server 8000
```

Depois, acesse [localhost:8000](http://localhost:8000).

### Controles

| Controle | Ação |
| --- | --- |
| **Fechar / Abrir chave CH** | Alterna o estado do circuito |
| **Chave CH no desenho** | Permite acionar a chave diretamente no Canvas |
| **Elétrons reais / Convencional** | Escolhe a representação da ampliação; disponível com a chave fechada |
| **Velocidade visual** | Ajusta a rapidez da animação |
| **Reiniciar** | Redistribui as partículas, abre a chave e seleciona o modo de elétrons |
| **Tela cheia** | Amplia a área de visualização, conforme o suporte do navegador |
| **Enter ou Espaço** | Aciona a chave quando o Canvas está em foco |

## Sugestão de uso em aula

1. **Observar:** iniciar com a chave aberta e discutir por que existe movimento de elétrons sem corrente resultante.
2. **Prever e testar:** pedir aos estudantes que indiquem os sentidos esperados antes de fechar a chave e comparar as duas representações.
3. **Relacionar à equação:** propor situações com diferentes quantidades de carga e intervalos de tempo, calculando a corrente e discutindo o significado de ampère.

## Tecnologias e organização

| Tecnologia | Aplicação |
| --- | --- |
| **HTML5** | Estrutura semântica da interface e controles |
| **CSS3** | Layout responsivo, estados dos botões e identidade visual |
| **JavaScript puro** | Estado do circuito, interação e movimento das partículas |
| **Canvas API 2D** | Desenho do condutor, das cargas, dos vetores e do circuito |
| **`requestAnimationFrame`** | Atualização da animação com base no tempo entre quadros |

O desenho e a lógica de movimento são implementados no próprio projeto, sem bibliotecas externas de física ou renderização.

```text
.
├── .gitignore     # Exclusões de materiais de apoio e arquivos locais
├── README.md      # Apresentação, fundamentos e instruções
├── index.html     # Estrutura da interface e elemento Canvas
├── style.css      # Estilos e layout responsivo
└── script.js      # Estado do circuito, animação e controles
```

## Modelo didático e limitações

A visualização é **qualitativa**: quantidade de partículas, dimensões e velocidades não estão em escala física. O controle de velocidade altera apenas a animação; ele não ajusta a tensão da bateria nem calcula a intensidade da corrente.

Com a chave fechada, as partículas são alinhadas em três pistas para destacar o movimento orientado. Em um metal real, a agitação térmica continua sobreposta à deriva. Os íons são mantidos fixos no desenho, e a simulação não calcula suas vibrações, colisões, aquecimento ou Efeito Joule.

## Próximos passos

As propostas abaixo ainda não estão implementadas:

- [ ] **Seção transversal do fio:** destacar uma seção e contar as cargas que a atravessam.
- [ ] **Corrente calculada:** medir o intervalo de tempo e relacionar a contagem à equação $i = \Delta Q / \Delta t$.
- [ ] **Gráfico de carga por tempo:** acompanhar o acúmulo de carga que atravessa a seção ao longo da animação.
- [ ] **Agitação térmica com deriva:** representar os dois movimentos simultaneamente no modo de elétrons.
- [ ] **Efeito Joule:** explorar colisões e transferência de energia para a rede metálica em uma evolução do modelo.

## Materiais de apoio e autoria

PDFs, apresentações PowerPoint e configurações locais do editor ficam fora do versionamento. O repositório reúne o código do simulador e sua documentação.

Desenvolvido por **[Garrard Fontanive](https://github.com/GarrardFontanive)**.
