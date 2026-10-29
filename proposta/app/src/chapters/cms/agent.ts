import type { ChapterAgent } from "@/agent/protocol";
import { contextoSite } from "./data";

export type PostGerado = {
  titulo: string;
  slug: string;
  meta_descricao: string;
  palavra_chave: string;
  headings: string[];
  corpo: string;
  links_internos: string[];
  checklist_seo: { item: string; ok: boolean }[];
};

export const PEDIDO_EXEMPLO = "Um post sobre como identificar claudicação posterior cedo, para tutores e treinadores de cavalos atletas.";
export const SUGESTOES = [
  PEDIDO_EXEMPLO,
  "Caso clínico: reabilitação de um cavalo de laço depois de desmite",
  "gabrielaguenka.com.br/servicos/avaliacao-biomecanica",
];

export const URL_RE = /(https?:\/\/|www\.)\S+|\b[\w-]+(\.[\w-]+)+\.(com|br|net|org)(\.br)?(\/\S*)?/i;

const str = { type: "string" };

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, editora do blog da Dra. Gabriela Guenka, médica veterinária de equinos especialista em biomecânica.",
    "Escreve posts que ranqueiam em busca orgânica no Brasil, com rigor técnico e linguagem clara para tutores, treinadores e colegas.",
    "Use o painel de desempenho do site: casos clínicos e guias de 1.500 a 2.500 palavras sobre claudicação performam melhor.",
    "Chame a ferramenta gerar_post. titulo até 60 caracteres com a palavra-chave; slug curto sem acentos; meta_descricao entre 140 e 155 caracteres;",
    "headings: 3 a 5 subtítulos H2; corpo: markdown curto de 3 a 5 parágrafos (pode usar ## nos subtítulos), sem inventar estudos ou números de pesquisa;",
    "links_internos: 2 a 4 URLs relativas que existem no site (use só as da lista); checklist_seo: 5 a 7 itens com ok verdadeiro ou falso honesto.",
    "Se o pedido trouxer um link, você NÃO tem acesso ao conteúdo da página: use só o endereço como pista de tema e não afirme que leu a página.",
    "Português do Brasil.",
  ].join(" "),
  tools: [
    {
      name: "gerar_post",
      description: "Preenche o editor do CMS com o post pronto para revisão e publicação.",
      parameters: {
        type: "object",
        properties: {
          titulo: str,
          slug: str,
          meta_descricao: str,
          palavra_chave: str,
          headings: { type: "array", items: str },
          corpo: str,
          links_internos: { type: "array", items: str },
          checklist_seo: { type: "array", items: { type: "object", properties: { item: str, ok: { type: "boolean" } }, required: ["item", "ok"] } },
        },
        required: ["titulo", "slug", "meta_descricao", "palavra_chave", "headings", "corpo", "links_internos", "checklist_seo"],
      },
    },
  ],
  prompt: (req) => {
    const t = (req.text ?? PEDIDO_EXEMPLO).slice(0, 600);
    const link = URL_RE.test(t) ? "\n\nObservação: o pedido contém um link. Você não consegue abrir a página; use apenas o endereço como pista de tema." : "";
    return `Pedido da Dra.:\n"""${t}"""${link}\n\nContexto do site:\n${contextoSite()}`;
  },
  demo: () => [
    { kind: "wait", ms: 900 },
    { kind: "tool", name: "gerar_post", args: EXEMPLO_POST },
    { kind: "text", text: "Post pronto para revisão. Formato de guia, como os que mais trazem visita no seu blog." },
  ],
};

export const EXEMPLO_POST: PostGerado = {
  titulo: "Claudicação posterior em cavalos: como identificar cedo",
  slug: "claudicacao-posterior-cavalos",
  meta_descricao: "Quadril que sobe, passada curta, piora no círculo: os sinais de claudicação posterior em cavalos atletas e quando é hora de chamar o veterinário.",
  palavra_chave: "claudicação posterior em cavalos",
  headings: ["Os sinais no trote", "O que o exame confirma", "Quando chamar o veterinário"],
  corpo: [
    "A claudicação posterior é mais difícil de ver do que a anterior. O cavalo compensa com o dorso e o pescoço, e a passada só muda de verdade quando a dor já está instalada.",
    "## Os sinais no trote",
    "Observe o cavalo trotando em linha reta, de trás. O quadril do lado dolorido sobe mais e desce menos — é a assimetria pélvica. No círculo, em piso duro, a diferença costuma aparecer.",
    "## O que o exame confirma",
    "No exame, o teste de flexão e os bloqueios anestésicos localizam a origem da dor. Em atletas de tambor, o tarso é um dos pontos mais comuns.",
    "## Quando chamar o veterinário",
    "Se a queda de rendimento durar mais de uma semana, ou se a assimetria aparecer no trote em linha reta, vale marcar uma avaliação. Quanto antes, mais simples a conduta.",
  ].join("\n\n"),
  links_internos: ["/blog/teste-de-flexao-em-equinos", "/blog/bloqueios-anestesicos-diagnosticos", "/cursos/biomecanica-equina-aplicada"],
  checklist_seo: [
    { item: "Palavra-chave no título e no primeiro parágrafo", ok: true },
    { item: "Meta descrição entre 140 e 155 caracteres", ok: true },
    { item: "Subtítulos H2 com variações da palavra-chave", ok: true },
    { item: "3 links internos para posts e curso", ok: true },
    { item: "Imagem com texto alternativo", ok: false },
    { item: "Tamanho: guia curto — ampliar para 1.500 palavras", ok: false },
  ],
};
