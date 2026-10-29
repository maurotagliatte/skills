# Como construir um capítulo

Leia antes: `../PLANO.md` (roteiro e regras do formato), `../../CLAUDE.md` (regra de marca) e o capítulo
modelo `src/chapters/prontuario/` — copie a estrutura dele.

## Estrutura

```
src/chapters/<id>/
  Chapter.tsx   componente default (ChapterProps) — cena, pausa, ao vivo, escopo
  agent.ts      export const agent: ChapterAgent | null   (lado do servidor)
  *.tsx         telas do capítulo (ex.: prontuario/Record.tsx)
```

`src/chapters/index.ts` e `src/agent/registry.ts` já importam o seu capítulo. **Não edite arquivos fora
da sua pasta** (engine, kit, agent, outros capítulos). Se precisar de algo no kit, crie na sua pasta e
avise no relatório final.

## Fases (src/engine/types.ts)

1. **scene** — `<Stage width height shots running onCue onEnd>`; o mundo é um canvas grande com
   elementos posicionados em absoluto. Monte os `shots` com `frame(box, { hold, dur, cue })` —
   nunca chute zoom. 8–15 s no total. `onEnd` → fase pause.
2. **pause** — `await stage.current.goTo(frame(box, { region: "left" }))` e **só depois** `setPhase("pause")`:
   o `<Overlay show><PauseCard …>` nunca aparece com a câmera andando. Entre dois cards, esconda o
   anterior já na partida (fase intermediária) e mostre o próximo quando a câmera chegar.
   Sempre com `onSkip` ("Pular e ver um exemplo").
3. **live** — `useAgent().start({ chapter: "<id>", text | image, demo })`; leia `agent.tool("<nome>")`
   (args parciais chegando) e desenhe a UI se preenchendo. Mostre `<ModeTag mode={agent.run.mode} />`.
4. **scope** — `<Overlay show><ScopeCard number title items phase metric onNext />`.

Peça ao agente opções do capítulo (ex.: a aba do estúdio) em `options: { … }`, não dentro de `text`.

Capítulos sem agente (ex.: simulador) pulam o `live` e usam interação local determinística.

## Agente (agent.ts)

`ChapterAgent = { system, tools, prompt(req), demo(req) }`. As tools são de **render**: o Claude chama,
o frontend desenha, nada executa no servidor. `demo()` devolve os passos do roteiro de exemplo
(`tool`, `text`, `state`, `wait`) — gera os mesmos eventos AG-UI do modo ao vivo, então a UI é a mesma.
Sem `ANTHROPIC_API_KEY` tudo roda em demo; teste nesse modo.

## Visual (gramática das LPs da Plane + identidade Khard)

- Canvas escuro (`--stage`). Janelas claras **frontais** sobre foto ICM: `<Backdrop photo="icm-…">`
  (oliva, dourado, areia, noite, musgo, pessego) + `<AppWindow nav aside>`.
- Títulos `className="display"` (Satoshi 430), eyebrow mono em vermelho Khard, corpo Inter 13 px.
- Texto grande no mundo: `<Caption x y eyebrow title sub show>`.
- Do kit, antes de escrever o seu: `V` (valor do agente com fade+blur), `CountUp`/`useCountUp`,
  `useReveal` (revelar um a um), `LiveCard`, `Slider`, `TextField` + `Suggestions`, `MicLevel`, `SpecRow`.
- Agente = **Donna**: `<AgentRow>` (cor, `list`, `dark` configuráveis), `<Cursor label>` (cursor com etiqueta), badge AGENTE, status âmbar.
- Ícones **só** de `@tabler/icons-react`. **Nunca** desenhe SVG à mão, nunca recrie logo/fonte.
  Logos: `<BrandLogo brand="khard" | "guenka">` (carrega o arquivo oficial ou mostra espaço reservado).
- Cores: tokens em `src/app/globals.css`. Acento = `--k-red`, com parcimônia.
- Texto em pt-BR falando dela e do projeto, sem slogan ("no seu consultório", "nesta fase entregamos").
- A cliente é a Dra. Gabriela Guenka, veterinária de equinos (biomecânica), vende cursos.
  Paciente-exemplo recorrente: **Trovão**, Quarto de Milha, 8 anos (capítulo 01).

## Rodar e revisar

```bash
cd proposta/app
NEXT_DIST_DIR=.next-<id> npx next dev -p <porta>      # porta própria por subagente
node ../tools/qa.js <id> /tmp/qa-<id> <porta> 40        # prints a cada 1,5 s
npx tsc --noEmit
```

Olhe os prints (monte uma folha de contato) e corrija até: nada cortado ou sobreposto, texto legível
(zoom efetivo ≥ 0,75 em janelas com texto de 13 px), cards não cobrindo a área útil, sem erros no console.

## Engine/kit: o que mudou (passagem, títulos, tom claro)

- **Passagem entre capítulos** é automática: o `<Stage>` que sai continua o movimento da câmera e o que entra
  chega andando (sem desfoque, sem preto). Não anime a entrada do capítulo inteiro por conta própria.
- **`<Caption>`**: o título entra linha a linha (máscara + leve giro, `SplitText`); quebras com `\n`, no máximo 2
  linhas. Novo `size` (padrão 56). O corpo entra só com opacidade. Para um título fora do Caption:
  `<SceneTitle text size delay show />` e `titleDuration(text)` (de `@/engine/ChapterFrame`).
- **Campo claro**: `<Stage tone="light">` pinta o palco de `#eff0f0` (`--canvas-light`) e troca o cromo para
  texto escuro. Use `<Caption light>` e janelas claras por cima.
- **`<Backdrop grain>`**: grão de filme (React Bits Noise) sobre a foto ICM, padrão 0,16; `grain={0}` desliga.
  `<PhotoGrain photo position grain />` dá só a camada foto + grão para molduras próprias.
- **`useAgent`**: run sem evento por 15 s (ou com erro) é refeito sozinho, uma vez, com `demo: true`.
- **`V`** (valor do agente) desliza sem desfoque.
- Cromo: o cabeçalho tem só o logo; o nome do capítulo fica pequeno no rodapé, junto da barra de progresso
  (clicável). Use no máximo um rótulo pequeno (eyebrow) por cena.
