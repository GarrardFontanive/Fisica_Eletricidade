# Laboratório Virtual de Circuitos Elétricos

Simulador interativo de corrente elétrica com uma ampliação do interior de um fio de cobre e um circuito com bateria e chave. Permite comparar o movimento dos elétrons com a chave aberta e fechada e visualizar os sentidos da corrente convencional e da deriva dos elétrons. Desenvolvido em português para apoiar aulas de Física, com JavaScript e Canvas API nativa.

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

- A página inicia com a chave aberta e os elétrons em movimento desordenado.
- Clique em **Fechar chave CH** ou na chave desenhada no circuito para observar o movimento orientado dos elétrons.
- Ao fechar a chave, os dois sentidos ficam visíveis no circuito. Use **Convencional** ou **Elétrons reais** para alternar a representação das partículas na ampliação.
- No modo **Convencional**, as partículas ficam avermelhadas, com sinal positivo, e seguem para a direita. No modo **Elétrons reais**, ficam azuis, com sinal negativo, e seguem para a esquerda.
- Ajuste a **Velocidade visual** entre **0,25× e 2,5×** para acompanhar a animação.
- Clique em **Abrir chave CH** para retornar ao estado sem corrente, com movimento desordenado.
- Use **Reiniciar** para redistribuir os elétrons e abrir a chave, ou **Tela cheia** para ampliar a visualização.
- Com o canvas em foco, pressione **Enter** ou **Espaço** para acionar a chave pelo teclado.

## Recursos

- Ampliação do condutor com íons positivos fixos e 18 partículas animadas.
- Comparação visual entre movimento desordenado e deriva orientada.
- Circuito com bateria, fios de cobre e chave animada e interativa.
- Dois sentidos simultâneos no circuito fechado e seletor de representação das partículas na ampliação.
- Painel com as relações `i = ΔQ / Δt`, `ΔQ = N · |e|` e `1 A = 1 C/s`.
- Controles de velocidade visual, reinício e tela cheia.
- Layout responsivo e Canvas com proporções preservadas ao redimensionar a janela.
- HTML, CSS e JavaScript em arquivos separados, sem dependências externas.

## Modelo didático e limitações

A simulação é qualitativa: com a chave aberta, os elétrons apresentam movimento desordenado; com a chave fechada, as partículas são organizadas em três pistas. O modo **Elétrons reais** representa elétrons negativos em deriva para a esquerda; o modo **Convencional** representa cargas positivas equivalentes para a direita.

O seletor alterna entre duas representações da mesma corrente. A polaridade da bateria e o sentido físico da deriva dos elétrons permanecem os mesmos. As cargas positivas equivalentes são uma representação didática; os íons positivos da rede metálica continuam fixos no desenho.

As equações do painel apresentam a definição de corrente e sua relação com a carga elétrica. O indicador mostra apenas `i = 0` ou `i > 0`, conforme o estado da chave; não há cálculo numérico de corrente, tensão ou potência.

O alinhamento dos elétrons em pistas é uma simplificação visual. Em um metal real, a agitação térmica continua mesmo quando existe corrente. O desenho mantém os íons fixos e não calcula colisões, aquecimento ou Efeito Joule.

O número de partículas, as dimensões e as velocidades são ilustrativos, sem escala física. O controle de velocidade afeta apenas a animação.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| HTML5 | Estrutura da página e controles |
| CSS3 | Aparência dos painéis e layout responsivo |
| JavaScript | Estado do circuito, controles e animação |
| Canvas API | Desenho dos componentes e das cargas em 2D |
| `requestAnimationFrame` | Atualização contínua da animação |

## Estrutura do projeto

```text
.
├── .gitignore     # Exclusões de materiais de apoio e arquivos locais
├── README.md      # Apresentação e instruções de uso
├── index.html     # Estrutura da interface e elemento canvas
├── style.css      # Estilos e layout responsivo
└── script.js      # Motor da simulação e interação com os controles
```

## Materiais de apoio

Arquivos PDF e apresentações PowerPoint ficam fora do versionamento, assim como as configurações locais do editor. O repositório contém o simulador e sua documentação.

## Autoria

[Garrard Fontanive](https://github.com/GarrardFontanive)
