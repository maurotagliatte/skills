# Análise do vídeo de feedback: animação e design

Fonte: `video.mov` (9:45, 640×416, 120 fps, sem áudio). É uma gravação de tela com poucos cortes. O detector
`select='gt(scene,0.2)'` achou só 12 cortes. Por isso as cenas foram separadas por um índice de movimento
por segundo (diferença entre quadros a 4 fps) e por folhas de visão geral a cada 2 s. Depois tirei
sequências densas (2–10 fps, recortadas e ampliadas 2×) de cada componente animado. Também rodei o app
(`next dev -p 3011` + `tools/qa.js`, capítulos abertura, prontuário e financeiro, 1440×900). O console
não mostrou erros.

Os tempos (mm:ss) são do vídeo. O mapa real difere um pouco do aproximado: os 20 s iniciais e o trecho
1:36–1:52 também são do React Bits.

Folhas de contato nesta pasta:

| # | Arquivo | Origem |
|---|---|---|
| 01 | `01-rb-hero-gradient-waves_0002-0019.jpg` | 00:02–00:19, 1 fps |
| 02 | `02-rb-bento-micro-slats-tech-text_0210-0213.jpg` | 02:10–02:13, 10 fps |
| 03 | `03-rb-build-whole-product_0254-0303.jpg` | 02:54–03:03, 2 fps |
| 04 | `04-rb-3d-text-reveal-letter-swap_0418-0430.jpg` | 04:18–04:24 (6 fps) + 04:24–04:30 (4 fps) |
| 05 | `05-rb-ascii-tiles-backgrounds_0431-0438.jpg` | 04:31–04:35 (4 fps) + 04:36–04:38 (6 fps) |
| 06 | `06-rb-circular-curved-text_0504-0512.jpg` | 05:04–05:12, 3 fps |
| 07 | `07-rb-crystalized-ball_0518-0536.jpg` | 05:18–05:36, 2 fps |
| 08 | `08-rb-swarm-laser-flow-cubes_0540-0602.jpg` | 05:40–06:02, 2 fps |
| 09 | `09-proposta-abertura-camera_0020-0034.jpg` | 00:20–00:29 (2 fps) + 00:28.5–00:33.5 (6 fps) |
| 10 | `10-proposta-prontuario-financeiro_0109-0127.jpg` | 01:09–01:27, 2 fps |
| 11 | `11-plane-regua-figma_0615-0918.jpg` | 16 quadros entre 06:15 e 09:18 |
| 12 | `12-proposta-app-qa-abertura-financeiro.jpg` | app rodando, um print a cada 1,5 s (abertura em cima, financeiro embaixo) |

---

## (a) Cenas

| Tempo | Onde | Componente / o que se vê | Animado? |
|---|---|---|---|
| 00:00–00:19 | reactbits.dev, hero | **Gradient Waves** atrás de uma janela de código, terminal e lista de presets | sim, contínuo |
| 00:20–00:21 | Cloudflare (troca de aba) | — | não |
| 00:21–00:28 | **Nossa proposta**, Prontuário | janela clara sobre foto + cartão de escopo | parado (só cursor) |
| 00:28.5–00:33 | Proposta, corte para a Abertura | blur até o preto, cartões entram, zoom de câmera | sim |
| 00:34–00:52 | Proposta, Abertura (câmera) | câmera passeia entre os cartões soltos | sim (câmera) |
| 00:53–01:10 | Proposta, Abertura (pausa) | card de vidro centralizado "Uma proposta para você ver o projeto funcionando." | parado por cerca de 17 s |
| 01:10–01:27 | Proposta, Prontuário e Financeiro | blur e preto entre capítulos; legenda + janela; boleto "EXEMPLO" inclinado | sim (câmera) |
| 01:27–01:35 | Proposta, volta à Abertura | mesmos cartões soltos | sim |
| 01:36–01:52 | React Bits, hero | Gradient Waves passando pelos presets (verde, azul, laranja, roxo) | sim |
| 01:52–02:04 | React Bits, "What's inside" | bento escuro com microanimações (chips em marquee, ícones orbitando, contador 50.6K, gráfico) | sim, sutil |
| 02:06–02:50 | React Bits, bento "Bits" | **Micro Slats**, **Electric Logo**, **Tech Text**, **Circular Carousel**, **Hold Button** | sim, em loop |
| 02:52–03:06 | React Bits, "Build the whole product" | cards com fragmentos de produto; blob cromado 3D | sim, leve |
| 03:08–04:06 | React Bits, Application UI / Prompt Input / App Shell | blocos de UI de produto (sidebar, tabelas, chat) | quase nada (hover) |
| 04:10–04:16 | React Bits, galeria de Backgrounds | Spectral Drape, Horizon Bloom, Photon Knot, Luminous Filaments, Voxel Arc, Chroma Current… | sim (miniaturas) |
| 04:16–04:18 · 04:36 | Bending Marquee | faixa de texto que curva | sim |
| 04:18–04:24 | **3D Text Reveal** | "EXPLORE / THE FUTURE / OF DESIGN" girando num cilindro | sim, comandado pela rolagem |
| 04:24–04:30 | **3D Letter Swap** | "Hover Me!" com letras virando em 3D | sim, no hover |
| 04:31–04:35 | **ASCII Tiles** | ladrilhos 3D de pontos com borda iridescente | sim |
| 04:44–04:50 | "Five free tools" | Shape Magic (átomo cromado), Texture Lab (flor de pontos), Sound Lab (onda) | sim |
| 05:04–05:08 | **Circular Text** | texto em anel girando, seta ao centro | sim, loop |
| 05:08–05:11 | **Curved Loop** | marquee em arco | sim, loop |
| 05:11–05:17 | Scroll Velocity, Count Up | texto acelerando com a rolagem; "100" contando | sim |
| 05:18–05:38 | **Crystalized Ball** | esfera de partículas magenta que reage ao cursor | sim |
| 05:40–05:44 | **Swarm Cursor** | enxame de partículas atrás do hero "Teams move faster in formation" | sim |
| 05:45–05:57 | **Laser Flow** | feixe de luz vertical que bate na borda de uma janela de app e se espalha | sim |
| 05:58–06:02 | **Cubes** | grade de cubos em wireframe que inclinam perto do cursor | sim |
| 06:03–09:45 | Figma, LPs da Plane (home, self-host, AI, healthcare, marketing, dashboards, work items) | frames estáticos; o movimento é só rolagem e zoom do Figma | **não** (vale como régua de layout) |

---

## (b) Análise por componente

Durações e curvas estimadas pelos quadros (±1 quadro). Um ponto de cor antes de tudo: quase todo o React
Bits é **roxo/violeta com glow** sobre preto. Pela `design-taste-frontend` esse é o tell "assistant
palette / neon accent + glow". Do React Bits pegamos a **mecânica** do movimento, não a paleta.

### 1. Gradient Waves (hero), folha 01, 00:02–00:19
- **Movimento:** campo de ondas suaves (shader), lento (um ciclo de onda leva vários segundos). A cada
  ~4–5 s troca de preset (Ocean → Silk → Dune → Dusk) num crossfade de ~1 s. A troca vem marcada na
  lista de presets e nos valores do código (`waveColor`, `amplitude`), então o fundo **demonstra** o
  produto.
- **Profundidade:** a luz cai num ângulo (lightAngle 150), com vinheta escura nas bordas. Janelas de
  vidro escuro por cima, sem blur forte.
- **Texto:** o título não anima. Só o fundo se move.
- **Design:** título de 2 linhas alinhado à esquerda (~48 px), 1 frase + 2 botões; uma frase de apoio
  pequena à direita, ancorada na base do bloco. Margens externas ~64 px. A composição embaixo sangra
  pela base da tela. **Cor:** a tela é ~90% neutra escura. A cor só existe no fundo-shader, e uma cor por
  vez.

### 2. Bento "Bits", folha 02, 02:10–02:13
- **Micro Slats:** grade de lamelas cinza. Um "holofote" elíptico atravessa a grade (~1,5 s por
  passagem, ease-in-out, em loop). Cada lamela só muda de brilho, o que lê como luz numa superfície
  física.
- **Tech Text:** a cada ~0,2–0,3 s uma letra de "Bits" vira contorno pontilhado com caixa de seleção e
  medidas ("B 67×85"), depois volta. É um **stagger sequencial com uma letra por vez**: o olho segue o
  ritmo.
- **Electric Logo:** contorno com glow branco e ruído que treme (a intensidade oscila, não para).
- **Circular Carousel:** cartões de foto P&B numa roda 3D (rotateY), giro lento e constante.
- **Design:** bento com 5 células, gutter de ~16 px, cantos ~16 px. A legenda fica **fora** da peça (nome
  à esquerda, categoria à direita, em cinza). Fotos P&B, sem cor nenhuma além do branco do glow.

### 3. "Build the whole product", folha 03, 02:54–03:03
- O blob cromado gira devagar (reflexo de ambiente). Os outros cards são **fragmentos reais de
  produto** (templates, blocos de UI) recortados e sangrando no card. O movimento fica restrito a uma
  peça; o resto está parado.
- **Agrupamento:** grade 2 + 3 de cards; título da seção à esquerda com o CTA à direita na mesma linha.
  Cada card tem um título curto e 1 linha cinza.

### 4. 3D Text Reveal e 3D Letter Swap, folha 04, 04:18–04:30
- **3D Text Reveal:** as linhas ("EXPLORE", "THE FUTURE", "OF DESIGN") estão num **cilindro**. Com a
  rolagem, cada linha entra por baixo inclinada (rotateX ~60–70°, achatada, com perspectiva) e assenta
  de frente. A linha anterior sai por cima, comprimida. Entre linhas: ~0,3–0,5 s (comandado pela
  rolagem). Caixa alta grossa, branca sobre preto, sem cor.
- **3D Letter Swap:** no hover, cada letra gira no eixo X e troca por uma cópia (em 04:25.5 o "Ho"
  aparece no meio do giro). O stagger é de ~30–40 ms por letra e o efeito todo dura ~0,4 s. É uma
  microinteração de botão ou link, não um efeito de cena.

### 5. ASCII Tiles e galeria de backgrounds, folha 05, 04:31–04:38
- **ASCII Tiles:** ladrilhos quadrados em 3D, cada um preenchido de pontos (meio-tom), com bisel
  iridescente. A grade gira ou ondula em diagonal. Luz forte, lenta.
- **Galeria:** cada fundo é um shader de luz (feixes, filamentos, ondas de voxels, nuvem), quase tudo
  roxo. Tem valor como catálogo de mecânicas. A paleta não serve para nós.

### 6. Circular Text e Curved Loop, folha 06, 05:04–05:12
- O anel de texto gira linear e constante (~10–12 s por volta). O Curved Loop é um marquee em arco,
  linear. São loops sem significado, o tell de motion "infinite loops that mean nothing". **Não usar.**

### 7. Crystalized Ball, folha 07, 05:18–05:36
- Esfera com anel de glow. Dentro dela, milhares de partículas que "caem" para o lado oposto ao cursor,
  como líquido, com inércia (~0,5–1 s para acomodar). Responde ao mouse e lembra física real.
- **Profundidade:** o glow em volta dá volume e as partículas mais densas embaixo fazem a gravidade.
- **Cor:** magenta saturado. Precisaria ser trocado inteiro.

### 8. Swarm Cursor, Laser Flow e Cubes, folha 08, 05:40–06:02
- **Swarm Cursor:** um enxame de partículas brancas segue o cursor **atrás** de um hero centralizado.
  Atraso de ~0,3–0,5 s, deformação elástica.
- **Laser Flow:** um feixe vertical de luz desce do topo e **bate na borda superior de uma janela de
  produto** ("Tracker"). A luz escorre pelas bordas da janela e acende a névoa em volta. A tremulação
  é contínua e lenta. A janela fica parada e nítida; a luz é o único movimento. **É a peça mais
  aproveitável para nós:** uma janela frontal de produto iluminada por uma fonte, a mesma gramática da
  Plane (janela sobre fundo), com movimento em vez de foto.
- **Cubes:** grade de cubos em wireframe. Perto do cursor, um grupo de 3×3 a 4×4 inclina em 3D (onda
  radial) e volta (~0,4 s). A entrada (05:58) parte de um ponto central e se espalha em anéis até
  preencher a grade.

### Padrões que se repetem no React Bits
1. **Um único elemento vivo por tela.** O texto e a UI ao redor ficam parados.
2. O movimento ou **responde ao cursor e à rolagem**, ou **demonstra o produto** (a troca de preset muda
   o código ao lado). Raramente é decoração solta.
3. **Luz** como linguagem (holofote nas lamelas, feixe na janela, glow no contorno). Quase não usam
   blur de desfoque.
4. Ritmos lentos (ciclos de 1,5–5 s) nos fundos. Nas microinterações, rápidos (0,3–0,4 s, stagger de
   30–40 ms).
5. Texto grande entra **por linha** (cilindro, máscara), nunca com fade-up genérico.

---

## (c) Régua Plane (06:03–09:45), folha 11

Os frames no Figma são estáticos: **não há animação a analisar**, e eles servem como régua de layout.
Medidas aproximadas, em relação a um frame de 1440 px:

**Espaçamento**
- Margens externas de ~120–160 px no desktop, as mesmas em todas as seções. Conteúdo dentro de ~1100–1200
  px.
- Título → subtítulo: ~16–20 px. Subtítulo → botões: ~24–32 px. Botões → janela de produto: ~48–64 px.
  **Não há vazio entre o texto e a imagem.**
- Entre seções, ~120–200 px, sempre mais que qualquer espaço dentro de uma seção.
- A janela de produto ocupa 60–75% da largura da seção e **sangra** pela base ou pela lateral do fundo
  pintado. Em volta dela aparece só uma moldura de foto de ~5–8%.

**Agrupamento**
- Hero: título de 2 linhas (centralizado na home/healthcare, à esquerda no "Flexible features" e no
  "Describe work…"), uma frase e 2 botões (preto sólido + contorno).
- Seção 50/50: janela grande à esquerda (sobre foto ICM oliva) e gráfico menor à direita. Embaixo, uma
  linha de 3–4 itens **sem caixa**, só com ícone pequeno, título e 2 linhas cinza ("Cycles and
  sprints", "Documentation built-in"…).
- Bloco escuro de IA (06:58, 07:04, 09:18): título à esquerda, janela clara grande sobre foto, depois 3
  colunas de texto. Os cards escuros (#1d1f20) carregam UI do agente dentro.
- Faixa de logos de clientes e um CTA sobre foto pintada para fechar.

**Cor**
- Página **predominantemente clara** (#fff / #eff0f0). O escuro (#141515) aparece em 1–2 blocos por
  página, para IA e self-host.
- A cor vem **só das fotos ICM** (oliva, mostarda, ocre, rosa-terracota em 08:44, azul-claro em 06:22).
  O acento de UI quase não aparece: azul nos eyebrows, mais nada.
- Por tela: 1 campo de foto colorida + UI neutra. Não usa glow nem gradiente sintético; a foto faz esse
  papel.

**Tipografia**
- Títulos leves (Satoshi ~430), grandes (44–58 px), tracking negativo, 2 linhas no máximo. Corpo cinza
  de 15–16 px. Eyebrow mono pequeno em azul ("CORE CAPABILITIES", "PLANE AI", "INSIDE EVERY WORK
  ITEM"), um por seção, nunca em todo lugar.

---

## (d) Diagnóstico da proposta atual e recomendações

### O que funciona
- A ideia de câmera num canvas (`engine/Stage.tsx`, GSAP `power3.inOut`, 1,4–1,6 s, com motion blur
  proporcional à velocidade) e as janelas claras frontais sobre foto seguem a régua.
- Os conteúdos são da cliente (Trovão, Ração Premium Equi, boleto "EXEMPLO", Donna). Isso passa no
  teste do concorrente da `design-taste-frontend`.
- O vermelho Khard é usado com parcimônia, quase só na ação. Os cartões de escopo são claros.

### Onde parece genérico ou "cara de IA" (critérios ui-taste, design-taste, web-design-guidelines)

1. **Uma transição só, e é blur.** O blur aparece na troca de capítulo (`Proposal.tsx`: blur 14 px +
   scale, 0,7 s), na entrada de quadro (`ChapterFrame.tsx`: blur 8 px + y 24), nos valores (`kit/motion.tsx`:
   blur 6 px), no overlay (`backdrop-filter: blur(16px)`) e no motion blur da câmera. No vídeo, cada
   troca passa por **~0,6–1 s de tela quase preta e borrada** (00:28.7–00:29.3, 01:14.5–01:15.5,
   01:25.5–01:26.5; folhas 09 e 10). É o tell "identical fade on every block", e o preto lê como
   carregamento.
2. **Abertura parada atrás de vidro.** O card centralizado translúcido com backdrop-blur fica ~17 s
   (00:53–01:10) sobre os cartões borrados (folha 09, folha 12 em cima). Juntos aparecem: glass panel,
   tudo centralizado, eyebrow mono vermelho em caixa alta espaçada, microtexto mono no rodapé ("espaço
   pausa · ← → capítulos · leva uns 12 minutos"), índice "(00)" e "00 / 10". O subtítulo deixa uma
   viúva ("hora."). Nada se move e nada mostra o produto. É a tela mais fraca justamente no primeiro
   contato.
3. **Escala e espaço.** No Financeiro (folha 12, embaixo) o título tem ~36 px e o corpo 13 px cinza;
   entre o texto e a janela sobram **~140 px vazios**, e a janela é cortada na base pela legenda gigante
   "Financeiro (02)" (~44 px). São **dois títulos competindo**, e o maior é o que menos informa. A régua
   Plane põe a janela a 48–64 px do texto e um único título dominante.
4. **Cor monótona.** O palco é 100% preto em todos os capítulos, com as mesmas janelas brancas e fotos de
   fundo bege e areia, dessaturadas e muito borradas. Não aparece o oliva/mostarda da Plane, nem uma
   seção clara para respirar. Fica "fundo preto + um acento", sem o campo de cor que a régua usa.
5. **Cartões soltos sem relação** na Abertura (folha 09, 00:29.5–00:31): mic, chips e mini-gráfico de
   barras cinza flutuam espalhados. Lêem como "UI fragments" decorativos (tell "fake dashboard of grey
   bars"), não como uma cena.

> Conflito a decidir: a `design-taste-frontend` proíbe eyebrow, mono e numeração de índice, e o
> PLANO.md pede eyebrow mono (gramática Plane) e um índice de capítulos visível. Sugestão: **manter só o
> índice funcional** (a barra de progresso embaixo e o menu) e **um eyebrow por cena, no máximo**.
> Sair o "(00)", o "00 / 10" duplicado e o microtexto mono do rodapé.

### Recomendações priorizadas

**P1. Trocar a transição de blur por um movimento assinatura e contínuo.**
O quê: a passagem entre capítulos vira um voo de câmera pelo próprio canvas. O último frame de um
capítulo desliza até o primeiro do próximo, sem passar pelo preto. A câmera já existe no
`Stage.tsx`/GSAP. Tirar o `filter: blur(14px)` da troca em `Proposal.tsx` e o blur de entrada em
`ChapterFrame.tsx`. Deixar o motion blur só na câmera rápida.
Por quê: elimina o tell nº 1 e os ~0,6–1 s de preto por troca. O "um elemento vivo por tela" do React
Bits aqui é a câmera.

**P2. Abertura: uma janela iluminada no lugar do card de vidro (Laser Flow adaptado).**
O quê: título grande à esquerda (2 linhas, ~56–64 px, sem viúva), 1 frase, 1 botão "Começar". À
direita, a janela do prontuário do Trovão, frontal e nítida, com **um feixe de luz quente** (dourado da
foto ICM ou branco; nada de roxo) descendo do topo e escorrendo pela borda dela. Loop lento de 3–5 s e
`prefers-reduced-motion` com a luz parada. Sem `backdrop-filter`. O título entra por linha (ver P3).
Onde: `chapters/abertura`. Mecânica do Laser Flow (05:45–05:57, folha 08), composição da Plane
(06:58 e 07:04, folha 11).
Por quê: o primeiro contato passa a mostrar o produto e tem uma única peça viva. Somem glass, tudo
centralizado e a tela parada por 17 s.

**P3. Títulos de cena entram por linha (máscara ou cilindro curto).**
O quê: cada linha sobe de dentro de uma máscara (translateY 100% → 0, com rotateX de ~40° → 0 e
perspectiva para um leve efeito de cilindro), em 600–700 ms, `cubic-bezier(0.16,1,0.3,1)`, com stagger
de 80–100 ms entre linhas. Só nos títulos de cena (`<Caption>`), nunca no corpo nem nos cards. O corpo
entra 120 ms depois, só com opacidade. O blur dos valores (`kit/motion.tsx`) sai e fica o deslizar
numérico.
Por quê: o 3D Text Reveal (04:18–04:24, folha 04) mostra que o título de tela cheia ganha peso quando
entra por linha. Hoje ele chega borrado, igual a todo o resto.

**P4. Régua de espaço da Plane em todos os capítulos: um título, janela colada, sangria.**
O quê: título de 44–58 px (Satoshi 430, tracking −0.03em); corpo de 15–16 px; texto → janela em 48–64
px; janela com 60–75% da largura, sangrando pela base, com 5–8% de foto em volta. A legenda "Financeiro
(02)" desce para o tamanho de UI (14–16 px, junto da barra de progresso) ou some, porque o título da
cena já diz onde ela está. Cenas 50/50 seguem a régua: texto e 3 bullets sem caixa de um lado, janela
do outro.
Onde: `<Caption>` e `<Backdrop>`/`<AppWindow>` no kit; cada capítulo ajusta os `frame(box)`.
Por quê: acaba com os ~140 px de vazio e com os dois títulos competindo (critérios fullness, frame e
hierarquia).

**P5. Cor: alternar campos e saturar as fotos; o acento fica na ação.**
O quê: (a) fotos ICM com a saturação da régua (oliva, mostarda, ocre) e menos borradas, com as pinceladas
visíveis; (b) pelo menos um capítulo em campo claro (#eff0f0) com janela clara, como a Plane faz na
maioria das seções, deixando o preto para Abertura, IA/agente e Fechamento; (c) vermelho Khard só no
botão e no estado ativo. Os eyebrows passam a texto simples ou ficam em 1 por cena.
Por quê: hoje são 10 capítulos com a mesma tela preta, a mesma janela branca e o mesmo bege. A régua
tira a cor da foto, não do glow.

**P6. Partículas só onde têm significado (capítulos 0 e 7).**
O quê: no capítulo 7 (busca semântica), o "documentos viram pontos que se agrupam" pode usar a mecânica
do Crystalized Ball / Swarm (partículas com inércia que se agrupam em clusters ao buscar; 05:18–05:44,
folhas 07 e 08), em branco/creme, com os clusters rotulados com casos reais. O "cavalo em pontos" da
Abertura pode usar o meio-tom do Texture Lab / ASCII Tiles (04:31, 04:44; folha 05). Evitar Circular
Text, Curved Loop e Bending Marquee: são loops sem significado.
Por quê: o movimento passa a demonstrar o que o sistema faz (busca vetorial), como no React Bits, onde o
fundo demonstra o produto.

**P7. Microinterações rápidas nos controles.**
O quê: 3D Letter Swap discreto (stagger de 30–40 ms, 0,4 s) só no "Começar" e no "Próximo capítulo";
pressionar com scale 0,98 por 120 ms nos botões; foco visível. Os cartões dos 3 comprovantes de exemplo
(Financeiro, 00:10 no app) ganham hover com elevação de 2–4 px e mais nada.
Por quê: é o "feedback em todo controle" que a `design-taste-frontend` exige, sem virar decoração.

**P8. Remover os fragmentos cinza soltos da Abertura.**
O quê: trocar o mic, os chips e as barras cinza espalhados (00:29.5–00:31) por 3–4 recortes reais e
legíveis, cada um com um dado da cliente, agrupados numa composição com alinhamento comum (bento de
gutter 16 px como o React Bits em 02:10, ou a fila da Plane), ou simplesmente tirar.
Por quê: o tell "fake dashboard of grey bars" some, e o agrupamento passa a ter hierarquia.

### Limites desta análise
- Vídeo de 640×416: tamanhos em px e durações são estimativas (±1 quadro no fps amostrado).
- O app foi visto só em modo demo, a 1440×900, nos capítulos 0–2. Mobile e os capítulos 3–9 ficaram de
  fora. Não rodei `inspect.mjs` nem as regras do web-interface-guidelines arquivo por arquivo; as
  observações de acessibilidade (contraste do texto cinza de 13 px sobre preto, foco) precisam de
  medição.
- Os trechos com texto selecionado em azul (01:13–01:18) parecem marcações do autor do vídeo sobre o
  título e a legenda do capítulo, o que reforça o P4.
