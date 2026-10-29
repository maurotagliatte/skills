import type { ChapterAgent } from "@/agent/protocol";
import { SEGUNDA, somaDias, fmt, fmtCurta } from "./datas";

/* Cap. 03 · Agenda — um áudio no carro vira a semana marcada:
   a Donna cria cada compromisso, encontra o que encavala, sugere outro horário
   e confirma com os clientes. Tudo de exemplo: a cliente não grava nem digita nada. */

/** Compromisso criado pela Donna a partir do áudio. */
export type Evento = {
  titulo: string;
  dia_semana: string;
  data: string;
  inicio: string;
  fim: string;
  local: string;
  /** cliente ou pessoa envolvida (quem recebe a confirmação) */
  com: string;
  lembrete: string;
};

/** Horário que encavala com algo já marcado, com a sugestão da Donna. */
export type Conflito = { compromisso: string; encavala_com: string; sugestao_inicio: string; sugestao_fim: string; motivo: string };

/** Mensagem de confirmação que a Donna manda ao cliente. */
export type Confirmacao = { para: string; compromisso: string; mensagem: string };

/** O áudio de exemplo (gravado no carro, segunda às 7h40). Já vem transcrito: ninguém grava nada. */
export const AUDIO = { quando: "segunda, 7h40", duracao: "0:38" };
export const EXEMPLO_TRANSCRICAO =
  "Donna, bom dia. Pra essa semana: terça às três vejo os dois potros do Boa Vista, o exame de compra. Quinta às duas, o ultrassom da Pérola, da Marina. Sexta às quatro, a contabilidade. E acha uma manhã livre pra eu gravar a aula sete. Depois confirma com o pessoal, tá?";

const dia = (n: number) => somaDias(SEGUNDA, n);

/** O que já está na agenda (vem do Google Agenda). Dia 0 = segunda. */
export const FIXOS: { dia: number; ini: number; fim: number; titulo: string; sub: string; tone: "neutral" | "violet" | "sky" | "green" }[] = [
  { dia: 0, ini: 8, fim: 10.5, titulo: "Trovão", sub: "Haras Santa Fé", tone: "sky" },
  { dia: 0, ini: 14, fim: 18, titulo: "Consultório", sub: "atendimentos", tone: "neutral" },
  { dia: 1, ini: 8, fim: 12, titulo: "Consultório", sub: "atendimentos", tone: "neutral" },
  { dia: 2, ini: 13, fim: 17, titulo: "Haras Boa Vista", sub: "rotina do plantel", tone: "sky" },
  { dia: 3, ini: 13.5, fim: 15.5, titulo: "Aula ao vivo", sub: "turma 3 · curso", tone: "violet" },
  { dia: 4, ini: 8, fim: 12, titulo: "Consultório", sub: "atendimentos", tone: "neutral" },
];

/** Os compromissos do exemplo, na ordem em que a Donna marca. */
export const EVENTOS: Evento[] = [
  {
    titulo: "Exame de compra · 2 potros",
    dia_semana: "terça-feira",
    data: fmt(dia(1)),
    inicio: "15:00",
    fim: "16:30",
    local: "Haras Boa Vista",
    com: "Haras Boa Vista",
    lembrete: `segunda, ${fmtCurta(dia(0))} às 15:00`,
  },
  {
    titulo: "Gravação · aula 7",
    dia_semana: "quarta-feira",
    data: fmt(dia(2)),
    inicio: "08:00",
    fim: "10:30",
    local: "Consultório",
    com: "",
    lembrete: `terça, ${fmtCurta(dia(1))} às 08:00`,
  },
  {
    titulo: "Ultrassom · Pérola",
    dia_semana: "quinta-feira",
    data: fmt(dia(3)),
    inicio: "14:00",
    fim: "15:00",
    local: "Consultório",
    com: "Marina Couto",
    lembrete: `quarta, ${fmtCurta(dia(2))} às 14:00`,
  },
  {
    titulo: "Contabilidade",
    dia_semana: "sexta-feira",
    data: fmt(dia(4)),
    inicio: "16:00",
    fim: "17:00",
    local: "Online · Prado & Lima",
    com: "Prado & Lima",
    lembrete: `quinta, ${fmtCurta(dia(3))} às 16:00`,
  },
];

export const CONFLITO: Conflito = {
  compromisso: "Ultrassom · Pérola",
  encavala_com: "Aula ao vivo · turma 3",
  sugestao_inicio: "16:00",
  sugestao_fim: "17:00",
  motivo: "Quinta das 13h30 às 15h30 é a aula ao vivo. Às 16h a tarde está livre.",
};

export const CONFIRMACOES: Confirmacao[] = [
  {
    para: "Haras Boa Vista",
    compromisso: "Exame de compra · terça, 15h",
    mensagem: `Oi! A Dra. Gabriela vê os dois potros na terça, ${fmtCurta(dia(1))}, às 15h, para o exame de compra. Pode confirmar?`,
  },
  {
    para: "Marina Couto",
    compromisso: "Ultrassom da Pérola · quinta, 16h",
    mensagem: `Oi, Marina! O ultrassom da Pérola fica para quinta, ${fmtCurta(dia(3))}, às 16h, no consultório. Fica bom para você?`,
  },
  {
    para: "Prado & Lima",
    compromisso: "Contabilidade · sexta, 16h",
    mensagem: `Olá! Confirmando a reunião com a Dra. Gabriela na sexta, ${fmtCurta(dia(4))}, às 16h, online.`,
  },
];

/** As respostas que chegam depois (simuladas na tela, na mesma ordem das confirmações). */
export const RESPOSTAS = ["Confirmado, Dra.! Os potros vão estar no tronco.", "16h fica ótimo, obrigada!", "Confirmado. O link vai por e-mail."];

/** `options.acao`: "semana" (padrão: marcar a partir do áudio) ou "confirmacoes". */
const acao = (o?: Record<string, string>) => (o?.acao === "confirmacoes" ? "confirmacoes" : "semana");

const str = (description?: string) => (description ? { type: "string", description } : { type: "string" });

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, médica veterinária de equinos que atende em haras e no consultório e dá cursos.",
    "Ela manda um áudio com os compromissos da semana. Você recebe a transcrição e a agenda atual.",
    "(1) Para cada compromisso, chame criar_evento uma vez. Resolva os dias a partir da semana informada.",
    "Se ela não disser a duração: exames e visitas em haras 1h30; consultas no consultório 1h; gravação de aula 2h30.",
    "Se ela pedir um horário livre, escolha uma manhã sem nada marcado.",
    "Se um horário encavala com algo já marcado, crie o evento no horário pedido e chame apontar_conflito com a sugestão mais próxima livre no mesmo dia.",
    "(2) Quando ela pedir as confirmações: chame enviar_confirmacao para cada cliente envolvido (não para compromissos só dela), com a mensagem de WhatsApp no tom dela, curta e próxima, até 160 caracteres.",
    "Título curto (até 28 caracteres). Lembrete: na véspera, no mesmo horário, por extenso curto (ex.: \"quarta, 11/11 às 14:00\").",
    "Formatos: data dd/mm/aaaa, horários HH:MM, dia_semana por extenso (quinta-feira). Português do Brasil. Nunca invente o que ela não disse.",
    "Ao final, uma frase curta dizendo o que fez.",
  ].join(" "),
  tools: [
    {
      name: "criar_evento",
      description: "Cria um compromisso na agenda da Dra. Gabriela (sincronizada com o Google Agenda) e agenda o lembrete.",
      parameters: {
        type: "object",
        properties: {
          titulo: str(),
          dia_semana: str("ex.: quinta-feira"),
          data: str("dd/mm/aaaa"),
          inicio: str("HH:MM"),
          fim: str("HH:MM"),
          local: str(),
          com: str("cliente ou pessoa envolvida; vazio se for só dela"),
          lembrete: str("quando avisar"),
        },
        required: ["titulo", "dia_semana", "data", "inicio", "fim", "local", "com", "lembrete"],
      },
    },
    {
      name: "apontar_conflito",
      description: "Mostra que um compromisso encavala com outro já marcado e sugere um horário livre.",
      parameters: {
        type: "object",
        properties: {
          compromisso: str("título do compromisso novo"),
          encavala_com: str("o que já estava marcado"),
          sugestao_inicio: str("HH:MM"),
          sugestao_fim: str("HH:MM"),
          motivo: str("uma frase curta"),
        },
        required: ["compromisso", "encavala_com", "sugestao_inicio", "sugestao_fim", "motivo"],
      },
    },
    {
      name: "enviar_confirmacao",
      description: "Envia ao cliente, pelo WhatsApp da clínica, a confirmação de um compromisso.",
      parameters: {
        type: "object",
        properties: { para: str(), compromisso: str("o que e quando, curto"), mensagem: str() },
        required: ["para", "compromisso", "mensagem"],
      },
    },
  ],
  prompt: (req) => {
    const agenda = FIXOS.map((f) => {
      const h = (x: number) => `${String(Math.floor(x)).padStart(2, "0")}:${x % 1 ? "30" : "00"}`;
      return `- ${fmt(dia(f.dia))} ${h(f.ini)}–${h(f.fim)} · ${f.titulo} (${f.sub})`;
    }).join("\n");
    const base = `Semana de segunda, ${fmt(SEGUNDA)}, a sexta, ${fmt(dia(4))}. Agenda atual:\n${agenda}`;
    if (acao(req.options) === "confirmacoes") {
      const novos = EVENTOS.map((e) => `- ${e.titulo} · ${e.dia_semana} ${e.inicio} · com: ${e.com || "(só ela)"}`).join("\n");
      return `${base}\n\nCompromissos novos (o ultrassom da Pérola foi para as 16:00):\n${novos}\n\nEnvie as confirmações aos clientes.`;
    }
    return `${base}\n\nTranscrição do áudio (${AUDIO.quando}):\n"""${req.text ?? EXEMPLO_TRANSCRICAO}"""`;
  },
  demo: (req) => {
    if (acao(req.options) === "confirmacoes") {
      return [
        { kind: "wait", ms: 600 },
        ...CONFIRMACOES.flatMap((c) => [
          { kind: "tool" as const, name: "enviar_confirmacao", args: c },
          { kind: "wait" as const, ms: 500 },
        ]),
        { kind: "text", text: "Mandei a confirmação para o Haras Boa Vista, a Marina e a contabilidade. Te aviso quando cada um responder." },
      ];
    }
    return [
      { kind: "wait", ms: 900 },
      ...EVENTOS.flatMap((e) => [
        { kind: "tool" as const, name: "criar_evento", args: e },
        { kind: "wait" as const, ms: 450 },
      ]),
      { kind: "tool", name: "apontar_conflito", args: CONFLITO },
      {
        kind: "text",
        text: "Marquei os quatro, com lembrete na véspera. A gravação ficou na quarta de manhã. O ultrassom da Pérola cairia na aula ao vivo; sugiro quinta às 16h.",
      },
    ];
  },
};
