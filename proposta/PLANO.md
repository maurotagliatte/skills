# Proposta interativa — plano de produção

> Formato: uma proposta comercial que se assiste como um vídeo e se usa como um produto.
> Cliente-âncora: veterinária de equinos, referência em biomecânica, que também vende cursos.
> Referência visual: landing pages da Plane (capturas em `referencias/plane-lps/`).

---

## 1. Onde está o valor

O sistema é técnico (CRM + ERP + agentes + CMS + atribuição de anúncios). Explicado em texto, a cliente
não enxerga. A proposta resolve isso com três movimentos:

1. **Mostrar a rotina dela, não o software.** Cada capítulo começa num momento real do dia
   (exame no cavalo, boleto vencendo, venda de curso, lead chegando), não numa feature.
2. **Deixar ela fazer, ao vivo.** Em pontos-chave o vídeo pausa e ela grava um áudio, envia um
   comprovante, pede um documento — e um agente real responde na hora. A prova é a experiência.
3. **Fechar cada capítulo como item de escopo.** Toda cena termina num cartão "Isso entra no projeto"
   (entregável, fase, como medimos). É isso que mantém a peça como **proposta**, não comercial.

Os benefícios, em ordem de impacto para ela:

| # | Dor hoje | Com o sistema | Ganho que mostramos |
|---|---|---|---|
| 1 | Prontuário à mão no iPad → Google Drive | Grava áudio no exame; agente transcreve e estrutura | Horas/semana de digitação; prontuário pesquisável |
| 2 | Contas a pagar/receber lançadas à mão | Foto do comprovante → lançamento automático + alertas | Zero digitação; nada vence sem aviso |
| 3 | Agenda dispersa | Áudio "marca pra mim…" → evento no calendário | Menos fricção operacional |
| 4 | Hotmart cobra ~9,9% + R$ 2,49/venda | Plataforma de cursos própria + agente que edita e publica aulas | Economia de taxa (simulador) + produção mais rápida |
| 5 | Não sabe qual origem traz lead bom | Métricas por origem + insight do agente | Corta verba de anúncio ruim |
| 6 | Documentos, artes e slides feitos do zero | Estúdio: agente gera com a marca dela | Material pronto para imprimir/postar |
| 7 | Blog/site parados | CMS com agente de SEO + métricas orgânicas | Conteúdo publicado que ranqueia |
| 8 | Conhecimento espalhado | Busca semântica (embeddings) em tudo | Acha casos parecidos em segundos |
| 9 | Anúncio otimiza para clique no WhatsApp | CRM devolve a **venda real** para Meta/Google | CPA cai; o algoritmo aprende com quem compra |

---

## 2. O formato: "proposta-filme"

**Uma URL privada**, aberta no desktop (com versão mobile simplificada). A tela é um **canvas escuro**
onde a câmera desliza entre composições de UI — como o vídeo de referência (Jitter/rico.) — e cada
composição usa a gramática das LPs da Plane.

Estrutura de cada capítulo (≈ 45–90 s):

```
[Cena]  8–15 s, autoplay   → câmera entra na UI, mostra a dor e a virada
[Pausa] "Sua vez"          → card de interação (gravar, enviar, pedir, simular)
[Ao vivo] agente responde  → UI se monta na frente dela (AG-UI)
[Escopo] cartão de fecho   → entregável · fase · métrica · (opcional) investimento do módulo
[→] próximo capítulo
```

Regras para **não virar comercial**:

- Sem trilha épica, sem locução de marketing. Som discreto (UI clicks, ambiente), legendas curtas.
- O texto fala **dela e do projeto** ("no seu consultório", "nesta fase entregamos…"), nunca slogans.
- Índice sempre visível (capítulos numerados, como "Showcase ⁽⁰⁹⁾" do vídeo). Ela pode pular, voltar,
  pausar. Teclado: espaço = pausa/continua, ←/→ = capítulos.
- Toda interação tem **"pular e ver exemplo"** — nunca trava a narrativa.
- Final é uma página de proposta de verdade: escopo consolidado, fases, prazos, investimento, aceite.
- Versão "documento" (PDF/print) gerada da mesma fonte de conteúdo, para quem precisa anexar.

---

## 3. Linguagem visual (a partir das LPs da Plane)

O que observamos nas LPs (`home`, `healthcare`, `design-teams`, `marketing`, `dashboards`,
`workflows`, `work-items`, `work-item-types`, `customer-requests`):

1. **Janela de produto clara flutuando sobre fundo fotográfico pintado/desfocado** — paisagens com
   motion blur em tons de terra, oliva, areia, céu (cantos 12–16 px, sombra suave, moldura fina).
   É a imagem-assinatura que você citou.
2. **Hero centralizado**: eyebrow mono em azul (`PLANE FOR HEALTHCARE`), título grande leve (2 linhas),
   subtítulo cinza, 2 botões (preto sólido + outline).
3. **Seções de feature 50/50**: texto + 3 bullets com ícone à esquerda; recorte de UI sobre fundo pintado
   à direita, cortado na borda ("sangrando").
4. **Grades de 3 cards claros** com micro-recorte de UI em cada um ("Small details…").
5. **Blocos escuros (#141515)** para IA: cards cinza-escuro com UI do agente dentro.
6. **Agente como colega dentro da UI**: badge de agente, status âmbar "Awaiting response",
   thread de atividade, painel "AI assistant" à direita.
7. **Ilustrações em pontos/ASCII 3D** (página healthcare: máquinas em nuvem de pontos).
8. **Tabs com sublinhado progressivo** ("Plan with the whole team | Pages… | Agents…") que trocam o recorte.
9. **CTA final** sobre faixa fotográfica pintada + rodapé preto com wordmark gigante.

Tipografia/tokens da Plane (do CSS do site): **Inter** (UI), **Satoshi** (títulos), **IBM Plex Mono**
(eyebrows/labels); acento `#006399` (claro) / `#2893cc` (escuro); neutros `#141515`, `#1d1f20`, `#fafafa`.

**Tradução para a cliente** (mesma gramática, conteúdo dela):

- Fundos pintados com **cavalos, pista, haras, luz dourada**, em motion blur — gerados (Magnific/FLUX)
  com o mesmo tratamento das LPs.
- **Esqueleto/biomecânica do cavalo em nuvem de pontos** (eco das ilustrações ASCII da healthcare) —
  usado no capítulo de busca semântica e na abertura.
- A marca exibida é **Khard** (nunca logotipo/nome da Plane). Pegamos a gramática, não a identidade.
- Telas do produto: as composições do Khard's Space já existentes no Figma (`referencias/figma/`)
  redesenhadas no estilo claro das LPs.

---

## 4. Roteiro por capítulo

| # | Capítulo | Cena (vídeo) | Pausa — ela faz | Agente / tools | Cartão de escopo |
|---|---|---|---|---|---|
| 0 | Abertura | Canvas de componentes flutuando (como o vídeo rico.), cavalo em pontos se forma. "Esta proposta foi feita para você ver o projeto funcionando." | "Começar" (pede permissão de microfone aqui, com explicação) | — | Visão geral dos 9 módulos |
| 1 | Prontuário por voz | iPad com prontuário manuscrito → Drive bagunçado → corte para o app no celular durante o exame | **Gravar áudio** simulando um exame (ou tocar exemplo) | STT → `estruturar_prontuario` (schema dos seus modelos) → `salvar_prontuario`. UI: campos preenchendo ao vivo, record view estilo Plane | App mobile + agente de prontuário + modelos |
| 2 | Financeiro | Planilha de contas a pagar sendo digitada à mão | **Enviar comprovante** (upload ou escolher 1 de 3 fakes que fornecemos) | Visão → `extrair_comprovante` → `lancar_conta` → `agendar_alerta`. Push no celular: "2 boletos vencem amanhã" | Módulo financeiro (AP/AR), OCR, notificações |
| 3 | Agenda | Mensagens e anotações soltas de horário | **Áudio**: "marca uma consulta…" | STT → `criar_evento`. Calendário anima o evento entrando | Agenda integrada (Google Calendar) |
| 4 | Cursos | Painel Hotmart com taxa por venda destacada | **Simulador**: sliders de faturamento anual e ticket médio | Cálculo determinístico. Depois cena: agente corta aula, gera legenda e descrição, publica na plataforma própria | Plataforma de cursos própria + agente de produção |
| 5 | Leads | Leads chegando de WhatsApp, indicação, anúncio A, anúncio B | Clicar "Pedir análise" | `analisar_leads` → insight: "Anúncio A traz 3× mais leads desqualificados" | CRM de leads + painel por origem |
| — | *Interlúdio CMS* | Tela minimalista de CMS no estilo Plane | **Descrever um post** ou **colar um link** do site dela | `pesquisar_tema` → `gerar_post_seo` → preview publicado (título, meta, headings, interlinks) | CMS + agente de SEO + métricas orgânicas |
| 6 | Estúdio | Orquestrador (cursor minimalista) chama especialistas | **Pedir**: documento / arte Instagram / slide deck (3 abas) | Subagentes: `documento` (logo + marca d'água, PDF imprimível), `arte` (canvas estilo pen.dev: cursor nomeado, seleção, camadas), `slides` (com manual da marca) | Estúdio de conteúdo com marca |
| 7 | Busca semântica | Indexação: documentos viram pontos que se agrupam (nuvem de pontos) | **Buscar** algo em linguagem natural ("claudicação posterior em potro") | Embeddings + busca vetorial em corpus demo → resultados similares com destaque do porquê | Indexação de prontuários, aulas, docs |
| 8 | Atribuição real | Gráfico "lead por clique no WhatsApp" vs. "lead que comprou" | Alternar o toggle "otimizar por clique / por venda" | Simulação: CPA caindo. Diagrama CRM → Meta CAPI / Google (Data Manager API) | WhatsApp integrado + conversões offline |
| 9 | Fechamento | Câmera recua: todos os módulos no canvas (loop como o vídeo) | Revisar escopo, escolher pacote, **aceitar** | — | Escopo consolidado, fases, investimento, próximos passos |

Números do capítulo 4 (base pesquisada, confirmar com ela):
Hotmart ≈ **9,9% + R$ 2,49** por venda (central de ajuda, vigente desde 21/09/2026).
Gateway próprio, ex.: Asaas cartão à vista **2,99% + R$ 0,49**; Stripe BR **3,99% + R$ 0,39**.
Venda de R$ 497: Hotmart ≈ R$ 51,69 × Asaas ≈ R$ 15,35. O simulador mostra a economia **conservadora**
(≥ 2,5 p.p., já descontando hospedagem/área de membros/antifraude) e a "bruta" lado a lado.

---

## 5. Arquitetura

```
Next.js (App Router) ─┬─ /p/[token]           página da proposta (token por cliente)
                      ├─ Motor de cenas        GSAP timeline mestre (labels = capítulos)
                      │                        mundo em transform translate/scale = "câmera"
                      │                        Lenis p/ suavidade; lenis.stop() nas pausas
                      ├─ UI kit "Plane-like"   React + tokens (Inter/Satoshi/Plex Mono)
                      │                        Motion p/ microinterações e UI gerada
                      ├─ Agente (AG-UI)        CopilotKit runtime  ←→  servidor AG-UI
                      │                        (@ag-ui/claude-agent-sdk + Claude)
                      │                        tools de frontend renderizam a UI ao vivo
                      └─ APIs auxiliares       STT (áudio → texto), embeddings, PDF
```

- **AG-UI**: o frontend registra tools por capítulo (`useFrontendTool`) e renderiza cada tool call como
  componente (`useRenderTool`) — é isso que faz o prontuário "se preencher" na frente dela.
  Estado compartilhado (`STATE_SNAPSHOT/DELTA`) alimenta tabelas e calendário. Pacotes:
  `@ag-ui/client` 1.0.3, `@ag-ui/claude-agent-sdk` 0.0.8, `@copilotkit/react-core` 1.83.0 (API v2).
- **Modelos**: Claude para orquestração, extração de comprovante (visão), estruturação de prontuário,
  SEO e documentos. **Claude não transcreve áudio** → usar um STT dedicado (Whisper/Deepgram/ElevenLabs).
  Embeddings via provedor dedicado (ex.: Voyage) sobre um corpus demo pré-indexado.
- **Cenas "vídeo"** são DOM real animado (não MP4): nítido em qualquer tela, e os mesmos componentes
  viram a UI interativa. Remotion só se quisermos exportar um MP4 de divulgação depois.
- **Chave da API só no servidor.** Link com token, limite de execuções por token, teto de custo,
  timeout por run.
- **Modo demo obrigatório**: cada interação tem resposta gravada (determinística). Se a API falhar,
  o microfone for negado ou ela estiver no celular, a experiência continua idêntica, só não é "ao vivo".
- **LGPD**: áudios e comprovantes processados e descartados; nada persiste além da sessão; aviso claro
  antes de gravar.

---

## 6. Time de subagentes

Fase 0 é sequencial (define o kit); fases 1–2 rodam em paralelo; fase 3 fecha.

| Fase | Subagente | Entrega | Skills do repo |
|---|---|---|---|
| 0 | **Diretor de arte** | Tokens, tipografia, 6–8 fundos pintados, cavalo em pontos, regras de composição; 1 frame-modelo por padrão (hero, 50/50, grade, bloco escuro) | `design-taste-frontend`, `ui-taste`, `media-use` |
| 0 | **Arquiteto** | Scaffold Next.js, motor de câmera (GSAP), contrato de capítulo (`Scene`, `Pause`, `Live`, `Scope`), servidor AG-UI + modo demo | `vercel-react-best-practices`, `codebase-design` |
| 0 | **Roteirista** | Textos pt-BR de todos os capítulos, microcopy das pausas, cartões de escopo | `brainstorming` |
| 1 | **Capítulos A** (1–3: prontuário, financeiro, agenda) | Cenas + tools AG-UI + respostas demo | `prototype`, `tdd` |
| 1 | **Capítulos B** (4–5 + CMS: cursos, leads, SEO) | Simulador, painéis, CMS | idem |
| 1 | **Capítulos C** (6–8: estúdio, busca, atribuição) | Canvas estilo pen.dev, PDF, slides, nuvem de pontos | idem |
| 2 | **Agente/Prompts** | System prompt por etapa, schemas de saída, evals simples por tool | `claude-api` |
| 3 | **QA** | Percorre o fluxo inteiro em browser real (desktop + mobile), modo demo, falha de API, microfone negado, performance | `agent-browser`, `web-design-guidelines` |

---

## 7. O que preciso de você antes de produzir

1. **Modelos de prontuário** (você disse que ia enviar) — definem o schema do capítulo 1.
2. **Nome e marca da cliente** (logo, cores, fontes) — para documento, arte e slides do capítulo 6.
   Ou usamos uma marca fictícia na primeira versão?
3. **Persona do agente**: usamos a **Donna** (já existe no Khard's Space) ou outro nome?
4. **Números reais**: faturamento/ticket dos cursos, verba e origens de anúncio — senão usamos
   estimativas marcadas como simulação.
5. **Escopo comercial**: fases, prazos e investimento para os cartões de escopo e o fechamento.
6. **Provedores**: qual chave de API (Anthropic) e STT podemos usar; onde hospedar (Vercel/Cloudflare).
