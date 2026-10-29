import type { ChapterAgent } from "@/agent/protocol";
import { proximaQuinta, somaDias, fmt, fmtCurta, diaDaSemana } from "./datas";

/** Compromisso criado pela Donna a partir de um áudio. */
export type Evento = {
  titulo: string;
  dia_semana: string;
  data: string;
  inicio: string;
  fim: string;
  local: string;
  paciente: string;
  lembrete: string;
};

export const EXEMPLO_TRANSCRICAO =
  "Marca pra mim uma visita ao Haras Santa Fé na quinta às nove da manhã para reavaliar o Trovão, e me lembra um dia antes";

/** O evento do exemplo, resolvido a partir de hoje (a "quinta" é a próxima quinta-feira). */
export function eventoExemplo(hoje = new Date()): Evento {
  const quinta = proximaQuinta(hoje);
  const vespera = somaDias(quinta, -1);
  return {
    titulo: "Reavaliação do Trovão",
    dia_semana: "quinta-feira",
    data: fmt(quinta),
    inicio: "09:00",
    fim: "10:30",
    local: "Haras Santa Fé",
    paciente: "Trovão",
    lembrete: `${diaDaSemana(vespera)}, ${fmtCurta(vespera)} às 09:00`,
  };
}

const str = (description?: string) => (description ? { type: "string", description } : { type: "string" });

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, médica veterinária de equinos que atende em haras e no consultório.",
    "Ela pede por áudio para marcar compromissos. Você recebe a transcrição e chama criar_evento uma vez.",
    "Resolva datas relativas (\"quinta\", \"amanhã\", \"semana que vem\") a partir da data de hoje informada; \"na quinta\" é a próxima quinta-feira.",
    "Se ela não disser a duração, visitas e exames em haras duram 1h30; consultas no consultório, 1h.",
    "Título curto (até 28 caracteres), começando pela ação (ex.: Reavaliação do Trovão). Paciente = nome do cavalo, se houver.",
    "Lembrete: quando avisar, por extenso e curto (ex.: \"quarta, 11/11 às 09:00\"); se ela não pedir, use 1 dia antes no mesmo horário.",
    "Formatos: data dd/mm/aaaa, horários HH:MM, dia_semana por extenso (quinta-feira). Português do Brasil.",
    "Depois, uma frase curta confirmando.",
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
          paciente: str("nome do cavalo, se houver"),
          lembrete: str("quando avisar"),
        },
        required: ["titulo", "dia_semana", "data", "inicio", "fim", "local", "paciente", "lembrete"],
      },
    },
  ],
  prompt: (req) => {
    const hoje = new Date();
    const data = hoje.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
    return `Hoje é ${data}.\n\nTranscrição do áudio:\n"""${req.text ?? EXEMPLO_TRANSCRICAO}"""`;
  },
  demo: () => {
    const e = eventoExemplo();
    return [
      { kind: "wait", ms: 700 },
      { kind: "tool", name: "criar_evento", args: e },
      { kind: "text", text: `Marquei a reavaliação do Trovão no Haras Santa Fé, ${e.dia_semana} (${e.data.slice(0, 5)}) às 9h. Te lembro na véspera.` },
    ];
  },
};
