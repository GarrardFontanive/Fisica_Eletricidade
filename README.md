# Laboratório Virtual de Eletricidade e Efeito Joule

Simulador interativo para explorar o movimento de elétrons no interior de um condutor e visualizar o aquecimento associado às colisões com os íons da rede. Desenvolvido em português para apoiar aulas de Física, com JavaScript e Canvas API nativa.

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

- Observe os elétrons amarelos e os íons inicialmente azuis no interior do condutor.
- Ajuste a diferença de potencial (DDP) pelo controle deslizante, entre **0 e 220 V**.
- Acompanhe a mudança no movimento dos elétrons, os indicadores de corrente e temperatura e a alteração da cor dos íons durante as colisões.
- Reduza a tensão para observar a evolução do movimento e do aquecimento ao longo da simulação.

## Recursos

- Animação de 150 elétrons com movimento aleatório e deriva influenciada pela tensão.
- Rede de íons com colisões, aquecimento visual e resfriamento gradual.
- Indicadores de corrente e temperatura atualizados durante a animação.
- Interface com painéis translúcidos no estilo *glassmorphism*.
- Canvas em tela cheia, com ajuste de suas dimensões ao redimensionar a janela.

## Modelo didático e limitações

A simulação é qualitativa: os valores apresentados em ampères e graus Celsius são indicadores calculados pelo modelo visual, sem calibração experimental. Eles não devem ser usados para dimensionar circuitos ou prever a temperatura de um condutor real.

O movimento combina perturbações aleatórias, aceleração horizontal dependente da DDP e colisões simplificadas. A temperatura exibida deriva do aquecimento médio dos íons; a corrente deriva da velocidade horizontal média dos elétrons. Por isso, os indicadores podem oscilar mesmo com a tensão fixa, inclusive em 0 V.

A direção de movimento dos elétrons na tela é uma convenção da animação. Em um condutor metálico real, o sentido da corrente convencional é oposto ao da deriva dos elétrons.

A rede de íons é criada ao carregar a página. Ao mudar muito o tamanho da janela, recarregue a página para redistribuí-la.

## Tecnologias

| Tecnologia | Uso |
| --- | --- |
| HTML5 | Estrutura da página e controles |
| CSS3 | Aparência dos painéis e layout |
| JavaScript | Movimento, colisões e indicadores |
| Canvas API | Desenho das partículas em 2D |
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
