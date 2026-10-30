# Proposta Khard: modelo "vídeo que pede" e versão app no celular

Data: 2026-10-30 · App: `proposta/app` (Next.js 16 + OpenNext no worker `khard-content`)

## Intenção

A proposta para a Dra. Gabriela Guenka hoje mistura dois jeitos de assistir: às vezes roda sozinha
(câmera passeando por 13–17 s), às vezes espera um toque, e nada na tela diz qual dos dois está
valendo. No celular o problema piora: a cena fica pequena, parece parada por vários segundos, e tocar
na tela não faz nada. O Mauro chamou isso de "quebra de valores primitivos de experiência".

Queremos **um único modelo, que se explica sozinho**, igual no web e no celular:

> A proposta corre como um vídeo. Ela só toca quando a Donna pede algo.

E no celular em pé ela deve **parecer um app**, não um site de desktop encolhido, e nunca pedir para
girar o aparelho.

## Metas

1. Em qualquer instante, quem assiste sabe se está **rodando** (algo se move e a barra anda) ou se
   **a Donna está pedindo** (um cartão com um único botão).
2. Todo toque tem resposta visível.
3. No celular em pé (largura ≤ 640 px, retrato), cada capítulo aparece como telas de um app de
   celular, legíveis (texto ≥ 12 px), sem rolagem horizontal.
4. A mesma história, as mesmas falas e os mesmos dados da Donna no web e no celular.

## Fora do escopo

- Aviso "gire o celular" (sai).
- Moldura de aparelho desenhada em volta do app no celular (o celular já é o aparelho).
- Paridade total com o desktop: no celular cada capítulo mostra só 1–2 momentos-chave.
- Microfone, upload e agente ao vivo (hoje quase tudo roda em `demo: true`; continua assim).
- Mudanças de copy além do que o formato exige (o texto vem de `proposta/COPY.md` e do código atual).

## Anti-metas (falha mesmo que "funcione")

- Qualquer trecho de mais de ~2 s sem movimento visível **e** sem barra andando.
- Toque que não produz nenhuma reação.
- Dois botões competindo pela atenção no mesmo momento.
- No celular: texto miúdo, tela de desktop reduzida, rolagem lateral, ou ter que girar.
- Regressão de desempenho (ver Restrições).

## Restrições

- Stack existente: Next 16, React 19, `motion`, `gsap`, `@tabler/icons-react`; deploy via OpenNext
  no Cloudflare Workers (Workers Builds publica a cada push).
- Regra do repositório: nunca recriar logo, marca ou fonte; logos via `BrandLogo`, ícones da Tabler.
- Desempenho: nada de `filter`/`backdrop-filter` animado ou camadas grandes com blend no celular
  (a correção de 29/10 tirou o canvas do `Noise` e o motion blur no toque; manter assim).
- `prefers-reduced-motion`: trocar movimentos por cortes/fades curtos, sem perder os sinais de estado.
- Paisagem no celular e desktop continuam com o palco de câmera atual.

## Abordagens consideradas (para o celular)

| | Abordagem | Troca |
|---|---|---|
| A | Versão mobile completa de cada capítulo (todas as ~25 telas refeitas na vertical) | Mais fiel; muito trabalho e duas versões para manter |
| B | Telas atuais se reorganizam sozinhas (sidebar vira abas, colunas empilham) e a câmera mostra cada janela em tela cheia | Reaproveita tudo; as cenas têm posições fixas de desktop e o resultado parece site espremido |
| **C** | **Uma "casca" de app no celular, com 1–2 momentos-chave por capítulo, guiada pelo mesmo roteiro e pela mesma Donna** | Parece app de verdade e é coeso; menos conteúdo por capítulo no celular |

**Escolhida: C** (decisão do Mauro, 30/10). Motivo: entrega a sensação de app mais rápido, a casca
única deixa tudo coeso e os capítulos podem entrar um a um.

## Parte 1 — Modelo "vídeo que pede" (web e celular)

Decidido com o Mauro:

- **A barra mostra que está rodando.** O trecho do capítulo atual na barra de progresso enche em
  tempo real enquanto a proposta roda.
- **Nenhuma cena congelada.** Durante os `hold` da câmera há um movimento lento contínuo
  (ex.: deriva/zoom suave), para nada parecer travado.
- **Quando a Donna pede, a pausa é explícita.** A barra para, o fundo escurece levemente, aparece um
  cartão com **um** botão, com um pulso discreto. Tocar fora do botão faz o botão reagir (pulso/
  destaque), nunca "nada".
- **Tocar no palco enquanto roda = pausar/retomar**, com um ícone rápido de play/pause no centro.
  Espaço no teclado faz o mesmo.
- **Sai o botão de pausa do rodapé.** Fica o botão de capítulos.

Estado global de reprodução (em `engine/playback.tsx`), um de três:

| Estado | Quando | Barra | Toque no palco |
|---|---|---|---|
| `playing` | câmera/telas andando, Donna trabalhando, timers entre etapas | enche (ver abaixo) | pausa |
| `waiting` | há um cartão pedindo ação (AdvanceCard, botão de LiveCard que bloqueia o fluxo, ScopeCard, "Começar", "Ver a proposta") | parada, ponto pulsando no fim do trecho | destaca o botão pedido |
| `paused` | ela pausou | parada, ícone de pausa | retoma |

Barra enquanto `playing`:
- Durante o roteiro de câmera (ou a sequência de telas no celular), o preenchimento é **determinado**:
  progresso do roteiro (soma de `dur` + `hold` dos SHOTS é conhecida).
- Durante trechos sem duração conhecida (Donna gerando, revelações), o trecho mostra um brilho
  **indeterminado** correndo, para continuar claro que está rodando.

Como um capítulo declara que está pedindo: o builder escolhe o mecanismo (ex.: `usePlayback()`
expõe `ask(id)`/`done()` ou os cartões `AdvanceCard`/`ScopeCard` registram o pedido ao montar).
Requisito: nenhum capítulo precisa calcular a barra à mão, e o "pedido" fica ligado ao botão
visível para o destaque do toque-fora.

Toques (*decisão do Claude*): elementos interativos que já existem nas cenas (galeria, abas,
slides) continuam funcionando e **não** pausam; só o toque em área vazia do palco pausa. Toque é
`pointerup` sem arrasto: rolar o conteúdo no celular não pausa.

Pausar congela tudo o que anda: timeline de câmera (já existe), timelines próprias dos capítulos
(ex.: o celular do Atendimento, já existe), timers `later()`/`setTimeout` de etapas e revelações
(hoje não pausam — precisam pausar), e a revelação do agente: *decisão do Claude* — o servidor continua transmitindo, mas o cliente
(`useAgent`) segura os eventos recebidos enquanto pausado e os aplica ao retomar, sem mexer na rota.

## Parte 2 — App no celular em pé

Ativa quando a viewport é retrato e largura ≤ 640 px. Muda de modo ao girar, sem recarregar.

### A casca (`MobileShell`)

Tela cheia, fundo claro de app (mesma linguagem das janelas do desktop: Inter, títulos em Satoshi,
ícones Tabler, vermelho Khard como destaque), respeitando safe areas:

- **Topo**: logo Khard (arquivo oficial) + nome do capítulo; botão de capítulos.
- **Conteúdo**: a tela do momento atual (rola por dentro se precisar, nunca na horizontal).
- **Folha inferior da Donna**: quando a Donna pede, sobe de baixo uma folha com título curto, uma
  linha de contexto e **um** botão grande. É a mesma ação e o mesmo texto do cartão do desktop.
- **Barra de progresso** no rodapé, com os mesmos estados da Parte 1.

Cada capítulo abre com um **cartão de título** de ~2 s (número, título, subtítulo de uma linha,
estilo das Captions atuais) que se transforma na primeira tela do app. Entre telas: transições de
app (empurrar, subir folha, notificação chegando), não câmera.

O cartão "Isso entra no projeto" (ScopeCard) vira uma folha de altura cheia, com "Próximo capítulo".

### Momentos por capítulo no celular

Cada linha é a sequência de telas no celular. **[pede]** = folha da Donna com um botão (estado
`waiting`). Componentes e dados citados existem hoje e devem ser reaproveitados (dados) ou ter uma
versão de celular (vista).

| Cap. | Sequência no celular | Dados / referência atual |
|---|---|---|
| 00 Abertura | Splash: logos Khard e Guenka, título "Um caso seu, do haras até a aula." → **[pede] Começar** | `abertura/Chapter.tsx`, `BrandLogo` |
| 01 Atendimento | Tela de bloqueio: toque no atalho, "Trovão · gravando", Donna montando → notificação "Relatório pronto" → **[pede] Ver o relatório pronto** → relatório (Editorial) montando-se, rolável → **[pede] Aprovar e enviar ao Ricardo** → confirmação "Enviado ao Ricardo" → escopo | `LockScreen.tsx` (já é tela de celular), `Folha.tsx` `FolhaEditorial`, tool `montar_relatorio`, `EXEMPLO_RELATORIO`, `EXEMPLO_TRANSCRICAO` |
| 02 Seus casos | Pergunta em balão de chat → **[pede] Achar os casos parecidos** → lista de casos parecidos aparecendo, com o "porquê" → resposta da Donna com citações numeradas → escopo | `busca/agent.ts` `CASOS`, `RESPOSTA`, `PERGUNTA`; `corpus.ts` `byId` |
| 03 Agenda | Áudio do carro em balão de WhatsApp → **[pede] Organizar a semana** → agenda do dia/semana com eventos entrando → conflito destacado → **[pede] Mover para as 16h** → confirmações enviadas → escopo | `agenda/agent.ts` `EVENTOS`, `CONFLITO`, `CONFIRMACOES`, `RESPOSTAS`; `datas.ts`; `VoiceNote.tsx` |
| 04 Contas | Foto da cobrança do ferrador chegando no WhatsApp → **[pede] Lançar a conta** → leitura da foto → conta lançada (fornecedor, valor, vencimento) → tela de bloqueio com o aviso da véspera → escopo | `/comprovantes/ferrador-silva.png`, `contas/agent.ts` `EXEMPLOS` (`Comprovante`, `Alerta`), `LockScreen` |
| 05 Conversas | Conversa com o Ricardo perguntando da reavaliação → **[pede] Ver a resposta da Donna** → rascunho escrito pela Donna + evento de quinta → **[pede] Enviar ao Ricardo** → enviado → escopo | `conversas/agent.ts` `PERGUNTA_RICARDO`, `respostaExemplo()` |
| 06 Números | Pergunta "De onde vêm os alunos que compram?" → **[pede] Ver a resposta** → resposta em uma frase + gráfico de barras com a origem em destaque → escopo | `numeros/agent.ts` `EXEMPLOS`, `numeros/data.ts` `ORIGENS` |
| 07 Cursos | Comparação Hotmart × plataforma própria com a economia no ano em destaque → **[pede] Ver a área de membros** → área de membros com a marca dela → escopo | `cursos/calc.ts` `calcular(CENARIO_PADRAO)`, `TAXAS`; `Members.tsx` |
| 08 Conteúdo | Pedido da semana → **[pede] Ver as peças** → arte do Instagram em pré-visualização de post + cortes da aula → escopo | `conteudo/agent.ts` `EXEMPLO_ARTE`, `EXEMPLO_AULA`, `PEDIDOS` |
| 09 Proposta | Apps soltos se juntando num só (versão simples do `Fusao`) → **[pede] Ver a proposta** → painel da proposta (já responsivo) | `fechamento/Fusao.tsx`, `Proposta.tsx`, `escopo.ts` |

Nota: momentos do desktop que não aparecem no celular (galeria de modelos e "outro relatório" no 01,
mapa no 02, cobrança ao Ricardo no 04, grupo da internação no 05, segunda pergunta e "ensinar o
anúncio" no 06, slides no 08) ficam só no desktop.

### Lógica compartilhada

*Decisão do Claude (revisável):* o que é compartilhado são **os dados, os textos e as chamadas da
Donna** (constantes e `agent.ts` de cada capítulo, textos dos cartões extraídos para constantes
comuns). Cada vista sequencia as próprias etapas: o desktop continua como está hoje (sem reescrever
os `Chapter.tsx` que funcionam) e cada capítulo ganha um `Mobile.tsx` com o seu roteiro de telas.
Motivo: o celular tem outra ordem e menos pedidos, e reescrever os 10 capítulos de desktop em hooks
triplicaria o trabalho e o risco sem ganho para quem assiste.

### Entrega em etapas

1. **Modelo "vídeo que pede"** (Parte 1) no desktop e no celular deitado, e no celular em pé ainda
   com o palco atual + folha. Já publicável sozinho.
2. **`MobileShell`** + Abertura e Atendimento no celular. Publicável; capítulos sem versão de
   celular continuam usando o palco atual em retrato (comportamento de hoje) até ganharem a sua.
3. Demais capítulos no celular, um a um.

## Como saber que deu certo

- Roteiro de QA em iPhone (retrato) e desktop: em cada segundo da proposta, ou a barra está andando
  com algo se movendo, ou há exatamente um botão pedindo ação. Tocar em qualquer lugar sempre muda
  algo na tela.
- Assistir do começo ao fim no celular em pé sem girar, sem zoom e sem dúvida sobre o que fazer.
- Desempenho no celular: sem queda em relação à medição de 29/10 — Playwright, iPhone 13
  emulado, CPU 4× mais lenta, quadros contados em 8 s após abrir `?c=<capítulo>`: Atendimento 437,
  Seus casos 355, Agenda 475, Contas 467, Conteúdo 469 (máximo ~480). O movimento lento nos `hold`
  só pode usar `transform` no compositor e deve manter esses números.

## Fica a cargo de quem constrói

Desenho exato das telas de celular dentro da linguagem visual atual, durações e curvas das
transições, o mecanismo técnico do estado `waiting`, a estrutura de arquivos dos hooks e vistas, e o
movimento lento durante os `hold`.
