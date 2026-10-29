import type { AgentRequest, ChapterAgent, DemoStep } from "@/agent/protocol";
import { contextoSite } from "./site";

/**
 * Conteúdo: a partir do caso do Trovão, a Donna entrega aula editada, post para o site,
 * arte para o Instagram ou slides com a identidade dela. A aba vem em req.options.aba.
 * As tools são de render: o Claude chama, o frontend monta a peça.
 */

export type Aba = "aula" | "post" | "arte" | "slides";
export const ABAS_IDS: readonly Aba[] = ["aula", "post", "arte", "slides"];

export type Aula = {
  titulo: string;
  descricao: string;
  capitulos: { tempo: string; titulo: string }[];
  legenda_amostra: string[];
};

export type Post = {
  titulo: string;
  slug: string;
  resumo_google: string;
  busca_principal: string;
  subtitulos: string[];
  corpo: string;
  links: string[];
  conferencia: { item: string; ok: boolean }[];
};

export const FOTOS = ["oliva", "dourado", "areia", "noite", "musgo", "pessego"] as const;
export type Foto = (typeof FOTOS)[number];
export type Arte = { foto: Foto; layout: "topo" | "base" | "centro"; headline: string; subtitulo: string; cta: string };
export type Slide = { titulo: string; bullets: string[]; tipo: "capa" | "conteudo" | "fechamento" };
export type Deck = { slides: Slide[] };

export const TOOL_POR_ABA: Record<Aba, string> = { aula: "gerar_aula", post: "gerar_post", arte: "gerar_arte", slides: "gerar_slides" };

export const PEDIDOS: Record<Aba, string> = {
  aula: "Aula sobre claudicação posterior: flexão, bloqueios e o caso do Trovão",
  post: "Como perceber cedo que o cavalo está mancando de trás, para proprietários e treinadores",
  arte: "Post anunciando a nova turma do curso [nome real]",
  slides: "Aula 1: introdução à biomecânica do posterior",
};

export function lerPedido(req: AgentRequest): { aba: Aba; pedido: string } {
  const opt = req.options?.aba as Aba | undefined;
  const aba = opt && ABAS_IDS.includes(opt) ? opt : "aula";
  return { aba, pedido: (req.text ?? "").trim() || PEDIDOS[aba] };
}

const str = { type: "string" };

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, médica veterinária de equinos especialista em biomecânica, que atende haras e vende cursos para veterinários.",
    "Nesta semana o caso de exemplo é o Trovão (Quarto de Milha de tambor, 8 anos, claudicação no posterior esquerdo, paciente fictício); o cliente é o Ricardo Alves, do Haras Santa Fé.",
    "Nunca exponha dados do cliente nas peças: o caso entra sem o nome do Ricardo e sem o nome do haras.",
    "Chame exatamente a ferramenta da aba pedida: gerar_aula, gerar_post, gerar_arte ou gerar_slides, uma vez.",
    "Aula: a gravação bruta tem 42 min e a editada cerca de 31 min. Título até 70 caracteres; descrição de 2 a 3 frases; 4 a 6 capítulos mm:ss crescentes começando em 00:00 e terminando antes de 31:00; legenda_amostra com 3 ou 4 falas curtas na primeira pessoa.",
    "Post para o site, para proprietários e treinadores: titulo até 60 caracteres; slug sem acentos; resumo_google entre 140 e 155 caracteres; subtitulos 3 a 5; corpo em markdown curto de 3 a 5 parágrafos com ## nos subtítulos; links: 2 a 4 URLs relativas que existem no site (use só as da lista); conferencia: 5 a 7 itens com ok verdadeiro ou falso honesto.",
    "Arte para o Instagram: headline até 7 palavras; subtítulo de uma frase; CTA de 2 a 4 palavras; se faltar dado do curso (nome, datas), escreva entre colchetes, ex. [data a confirmar].",
    "Slides: 5 a 7 slides, o primeiro capa e o último fechamento; bullets até 10 palavras, no máximo 4 por slide.",
    "Não invente estudos, números de pesquisa nem doses. Sem slogans. Português do Brasil.",
  ].join(" "),
  tools: [
    {
      name: "gerar_aula",
      description: "Preenche a aula editada (título, descrição, capítulos e legendas) para publicar na área de membros.",
      parameters: {
        type: "object",
        properties: {
          titulo: str,
          descricao: str,
          capitulos: { type: "array", items: { type: "object", properties: { tempo: { type: "string", description: "mm:ss" }, titulo: str }, required: ["tempo", "titulo"] } },
          legenda_amostra: { type: "array", items: str },
        },
        required: ["titulo", "descricao", "capitulos", "legenda_amostra"],
      },
    },
    {
      name: "gerar_post",
      description: "Preenche o editor do site com o post pronto para revisão.",
      parameters: {
        type: "object",
        properties: {
          titulo: str,
          slug: str,
          resumo_google: { type: "string", description: "o texto que aparece no resultado do Google" },
          busca_principal: { type: "string", description: "o que a pessoa digita no Google para achar o post" },
          subtitulos: { type: "array", items: str },
          corpo: str,
          links: { type: "array", items: str },
          conferencia: { type: "array", items: { type: "object", properties: { item: str, ok: { type: "boolean" } }, required: ["item", "ok"] } },
        },
        required: ["titulo", "slug", "resumo_google", "busca_principal", "subtitulos", "corpo", "links", "conferencia"],
      },
    },
    {
      name: "gerar_arte",
      description: "Monta uma arte 1080×1350 para o Instagram no editor, camada por camada.",
      parameters: {
        type: "object",
        properties: {
          foto: { type: "string", enum: [...FOTOS] },
          layout: { type: "string", enum: ["topo", "base", "centro"] },
          headline: str,
          subtitulo: str,
          cta: str,
        },
        required: ["foto", "layout", "headline", "subtitulo", "cta"],
      },
    },
    {
      name: "gerar_slides",
      description: "Monta os slides de uma aula com a identidade visual dela.",
      parameters: {
        type: "object",
        properties: {
          slides: {
            type: "array",
            items: {
              type: "object",
              properties: { titulo: str, bullets: { type: "array", items: str }, tipo: { type: "string", enum: ["capa", "conteudo", "fechamento"] } },
              required: ["titulo", "bullets", "tipo"],
            },
          },
        },
        required: ["slides"],
      },
    },
  ],
  prompt: (req) => {
    const { aba, pedido } = lerPedido(req);
    const extra = aba === "post" ? `\n\nPosts e páginas do site (exemplo):\n${contextoSite()}` : "";
    return `Aba: ${aba}. Use a ferramenta ${TOOL_POR_ABA[aba]}.\n\nPedido da Dra. Gabriela:\n"""${pedido.slice(0, 500)}"""${extra}`;
  },
  demo: (req) => demoPara(req),
};

export const FALAS: Record<Aba, string> = {
  aula: "Tirei 11 dos 42 minutos (pausas e repetições), legendei e deixei a aula no Módulo 3. O caso do Trovão entrou sem os dados do Ricardo.",
  post: "Escrevi em formato de guia, com links para dois posts seus e para o curso. Está curto: os posts que mais trazem visita no seu blog têm de 1.500 a 2.500 palavras.",
  arte: "Arte no tamanho do feed. As camadas ficam editáveis se quiser trocar a foto.",
  slides: "Seis slides nas cores da sua identidade. Deixei espaço para o vídeo de marcha no slide 4.",
};

function demoPara(req: AgentRequest): DemoStep[] {
  const { aba } = lerPedido(req);
  const args = { aula: EXEMPLO_AULA, post: EXEMPLO_POST, arte: EXEMPLO_ARTE, slides: EXEMPLO_DECK }[aba];
  return [
    { kind: "wait", ms: 700 },
    { kind: "tool", name: TOOL_POR_ABA[aba], args },
    { kind: "text", text: FALAS[aba] },
  ];
}

export const EXEMPLO_AULA: Aula = {
  titulo: "Claudicação posterior: o caso do Trovão",
  descricao:
    "Como conduzir a avaliação de um membro posterior do início ao fim: o trote em linha reta e no círculo, quando a flexão ajuda e como ler o bloqueio. Com o caso do Trovão, Quarto de Milha de 8 anos.",
  capitulos: [
    { tempo: "00:00", titulo: "O que a queixa já conta" },
    { tempo: "04:12", titulo: "Trote em linha reta e no círculo" },
    { tempo: "11:38", titulo: "Flexão de jarrete: quando confiar" },
    { tempo: "18:05", titulo: "Bloqueios: sequência e leitura" },
    { tempo: "25:40", titulo: "Caso Trovão: do exame à conduta" },
  ],
  legenda_amostra: [
    "Repare no quadril: ele sobe mais quando o posterior esquerdo apoia.",
    "No círculo à esquerda, com piso duro, a assimetria fica evidente.",
    "Depois da flexão, os primeiros passos de trote são os que contam.",
    "O bloqueio localizou a dor no tarso. Agora a conduta fica mais clara.",
  ],
};

export const EXEMPLO_POST: Post = {
  titulo: "Cavalo mancando de trás: como perceber cedo",
  slug: "cavalo-mancando-de-tras",
  resumo_google: "Quadril que sobe, passada curta, piora no círculo: os sinais de que o cavalo atleta está mancando de trás e quando é hora de chamar a veterinária.",
  busca_principal: "cavalo mancando de trás",
  subtitulos: ["Os sinais no trote", "O que o exame confirma", "Quando chamar a veterinária"],
  corpo: [
    "Mancar de trás é mais difícil de ver do que mancar da frente. O cavalo compensa com o dorso e o pescoço, e a passada só muda de verdade quando a dor já está instalada.",
    "## Os sinais no trote",
    "Observe o cavalo trotando em linha reta, de trás. O quadril do lado dolorido sobe mais e desce menos. No círculo, em piso duro, a diferença costuma aparecer.",
    "## O que o exame confirma",
    "No exame, a flexão e os bloqueios localizam a origem da dor. Em cavalos de tambor, o jarrete é um dos pontos mais comuns.",
    "## Quando chamar a veterinária",
    "Se a queda de rendimento durar mais de uma semana, ou se a diferença aparecer no trote em linha reta, vale marcar uma avaliação. Quanto antes, mais simples a conduta.",
  ].join("\n\n"),
  links: ["/blog/teste-de-flexao-em-equinos", "/blog/bloqueios-anestesicos-diagnosticos", "/cursos"],
  conferencia: [
    { item: "O que a pessoa busca aparece no título e no começo", ok: true },
    { item: "Resumo do Google no tamanho certo", ok: true },
    { item: "Subtítulos claros para quem lê no celular", ok: true },
    { item: "Links para dois posts seus e para o curso", ok: true },
    { item: "Foto com descrição para quem não enxerga", ok: false },
    { item: "Texto curto: ampliar para 1.500 palavras", ok: false },
  ],
};

export const EXEMPLO_ARTE: Arte = {
  foto: "dourado",
  layout: "base",
  headline: "Nova turma do curso [nome real]",
  subtitulo: "Do exame de marcha ao plano de treino, com o caso do Trovão. [duração] · início em [data a confirmar].",
  cta: "Inscrições abertas",
};

export const EXEMPLO_DECK: Deck = {
  slides: [
    { tipo: "capa", titulo: "Introdução à biomecânica do posterior", bullets: ["Aula 1 · [nome do curso]", "Dra. Gabriela Guenka"] },
    { tipo: "conteudo", titulo: "Por que começar pelo posterior", bullets: ["É o motor da locomoção", "Concentra boa parte das claudicações em atletas", "Compensações aparecem no anterior e no dorso"] },
    { tipo: "conteudo", titulo: "Anatomia funcional", bullets: ["Quadril, joelho e jarrete trabalham em conjunto", "Aparelho recíproco: joelho e jarrete fletem juntos", "Tarso distal: pouca mobilidade, muita carga"] },
    { tipo: "conteudo", titulo: "Como avaliar a marcha", bullets: ["Passo e trote em linha reta e em círculo", "Assimetria de pelve na subida e na descida", "Espaço para o vídeo de marcha do Trovão"] },
    { tipo: "conteudo", titulo: "Flexão de jarrete na prática", bullets: ["Flexão, depois trote imediato", "Compare sempre com o outro membro", "Resultado positivo orienta, não fecha diagnóstico"] },
    { tipo: "fechamento", titulo: "Na próxima aula", bullets: ["Bloqueios anestésicos do posterior", "Traga um vídeo de marcha de um paciente"] },
  ],
};
