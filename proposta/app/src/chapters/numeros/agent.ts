import type { AgentRequest, ChapterAgent, DemoStep } from "@/agent/protocol";
import { datasetTexto } from "./data";

/** Uma barra do gráfico da resposta. */
export type Ponto = { rotulo: string; valor: number; nota?: string };

export type Resposta = {
  pergunta: string;
  /** a resposta em uma frase */
  resposta: string;
  /** rótulo da barra que a frase destaca */
  destaque: string;
  /** o que o gráfico mede (título curto) */
  medida: string;
  /** como mostrar o valor: % ou R$ */
  unidade: "pct" | "brl" | "num";
  serie: Ponto[];
  /** sugestão da Donna, em forma de pergunta para ela aprovar */
  sugestao: string;
};

export type PerguntaId = "alunos" | "curioso" | "clientes";

export const PERGUNTAS: { id: PerguntaId; texto: string }[] = [
  { id: "alunos", texto: "De onde vêm os alunos que compram?" },
  { id: "curioso", texto: "Qual anúncio só traz curioso?" },
  { id: "clientes", texto: "De onde vêm os meus melhores clientes da clínica?" },
];

const str = { type: "string" };

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, médica veterinária de equinos (biomecânica) que atende haras e vende cursos para veterinários.",
    "Ela faz uma pergunta sobre os números dela. Responda chamando a ferramenta responder_pergunta, uma vez.",
    "Use só os números do dataset (são dados de exemplo). resposta: UMA frase, até 160 caracteres, com os números que provam.",
    "serie: 3 a 5 barras que provam a frase, todas na mesma unidade (pct, brl ou num); rotulo curto (até 22 caracteres); nota opcional curta, ex. '7 de 22'.",
    "destaque: o rotulo exato da barra que a frase aponta. medida: título curto do gráfico (ex.: '% de quem chegou e comprou').",
    "sugestao: uma ação concreta para as próximas semanas, em forma de pergunta para ela aprovar.",
    "Português do Brasil, sem jargão: nada de lead, CRM, CPL, funil, conversão; diga 'quem chegou', 'quem comprou', 'custo por aluno'.",
  ].join(" "),
  tools: [
    {
      name: "responder_pergunta",
      description: "Mostra no painel a resposta da Donna: uma frase, um gráfico de barras com a barra em destaque e uma sugestão.",
      parameters: {
        type: "object",
        properties: {
          pergunta: str,
          resposta: str,
          destaque: str,
          medida: str,
          unidade: { type: "string", enum: ["pct", "brl", "num"] },
          serie: {
            type: "array",
            items: { type: "object", properties: { rotulo: str, valor: { type: "number" }, nota: str }, required: ["rotulo", "valor"] },
          },
          sugestao: str,
        },
        required: ["pergunta", "resposta", "destaque", "medida", "unidade", "serie", "sugestao"],
      },
    },
  ],
  prompt: (req) => `Pergunta da Dra.:\n"""${(req.text ?? PERGUNTAS[0].texto).slice(0, 300)}"""\n\nDados (exemplo):\n${datasetTexto()}`,
  demo: (req) => demoPara(req),
};

/** qual roteiro de exemplo responde melhor ao pedido */
export function perguntaDe(req: Pick<AgentRequest, "text" | "options">): PerguntaId {
  const opt = req.options?.pergunta as PerguntaId | undefined;
  if (opt && EXEMPLOS[opt]) return opt;
  const t = (req.text ?? "").toLowerCase();
  if (/curios|anúncio|anuncio|perfil|verba/.test(t)) return "curioso";
  if (/client|clínica|clinica|haras|consult/.test(t)) return "clientes";
  return "alunos";
}

function demoPara(req: AgentRequest): DemoStep[] {
  const id = perguntaDe(req);
  return [
    { kind: "wait", ms: 2600 },
    { kind: "tool", name: "responder_pergunta", args: EXEMPLOS[id] },
    { kind: "text", text: FALAS[id] },
  ];
}

const FALAS: Record<PerguntaId, string> = {
  alunos: "Deixei a indicação destacada no painel.",
  curioso: "Deixei o anúncio A destacado no painel.",
  clientes: "O Ricardo, do Haras Santa Fé, chegou assim.",
};

export const EXEMPLOS: Record<PerguntaId, Resposta> = {
  alunos: {
    pergunta: PERGUNTAS[0].texto,
    resposta: "Indicação é o que mais vira aluno: 7 de 22 compraram, sem verba. Entre os anúncios, o B vendeu 7 com R$ 2.700; o A vendeu 4 com R$ 4.200.",
    destaque: "Indicação",
    medida: "% de quem chegou e comprou",
    unidade: "pct",
    serie: [
      { rotulo: "Indicação", valor: 31.8, nota: "7 de 22" },
      { rotulo: "Instagram e site", valor: 14.1, nota: "9 de 64" },
      { rotulo: "Anúncio B", valor: 11.7, nota: "7 de 60" },
      { rotulo: "Anúncio A", valor: 2.2, nota: "4 de 180" },
    ],
    sugestao: "Sugiro passar parte da verba do A para o B por 30 dias e comparar. Quer que eu monte a divisão para você aprovar?",
  },
  curioso: {
    pergunta: PERGUNTAS[1].texto,
    resposta: "O anúncio A traz mais da metade das pessoas, mas 3 em cada 4 não têm perfil para o curso. Por aluno que comprou, sai R$ 1.050; o B, R$ 386.",
    destaque: "Anúncio A",
    medida: "% de quem chegou sem perfil para o curso",
    unidade: "pct",
    serie: [
      { rotulo: "Anúncio A", valor: 72.8, nota: "131 de 180" },
      { rotulo: "Instagram e site", valor: 48.4, nota: "31 de 64" },
      { rotulo: "Anúncio B", valor: 25, nota: "15 de 60" },
      { rotulo: "Indicação", valor: 22.7, nota: "5 de 22" },
    ],
    sugestao: "Sugiro mostrar o A só para veterinários e fazer uma pergunta antes da conversa. Quer que eu prepare a mudança para você aprovar?",
  },
  clientes: {
    pergunta: PERGUNTAS[2].texto,
    resposta: "Os clientes que mais voltam chegam por indicação de outro cliente: 18 dos 44 do ano, com gasto médio de R$ 9.400, mais de quatro vezes o do Instagram.",
    destaque: "Indicação de cliente",
    medida: "Gasto médio por cliente da clínica no ano",
    unidade: "brl",
    serie: [
      { rotulo: "Indicação de cliente", valor: 9400, nota: "18 clientes" },
      { rotulo: "Colega veterinário", valor: 7800, nota: "9 clientes" },
      { rotulo: "Google e site", valor: 3300, nota: "6 clientes" },
      { rotulo: "Instagram", valor: 2100, nota: "11 clientes" },
    ],
    sugestao: "Sugiro uma mensagem de agradecimento a quem indicou, depois de cada atendimento. Quer que eu escreva o modelo para você aprovar?",
  },
};
