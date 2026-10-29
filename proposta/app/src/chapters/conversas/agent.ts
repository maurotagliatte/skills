import type { ChapterAgent } from "@/agent/protocol";
import { proximaQuinta, somaDias, fmt, fmtCurta, diaDaSemana } from "./datas";

/* Cap. 03 · Conversas — a Dra. responde o Ricardo por áudio; a Donna escreve no tom dela
   e marca a reavaliação do Trovão na agenda. */

export type Evento = { titulo: string; dia: string; hora: string; local: string };
export type Resposta = { para: string; resposta: string; evento?: Partial<Evento>; lembrete?: string };

/** Terça da semana da cena (o atendimento foi na segunda, 09/11). */
export const HOJE_CENA = new Date(2026, 10, 10);

export const PERGUNTA_RICARDO = "Doutora, quando a gente reavalia o Trovão depois da infiltração?";

export const EXEMPLO_TRANSCRICAO =
  "Responde que pode ser quinta às nove no haras, e marca pra mim a reavaliação do Trovão com lembrete na véspera";

/** A resposta do exemplo, com "quinta" resolvida a partir do dia da cena. */
export function respostaExemplo(hoje = HOJE_CENA): Resposta {
  const quinta = proximaQuinta(hoje);
  const vespera = somaDias(quinta, -1);
  return {
    para: "Ricardo Alves · Haras Santa Fé",
    resposta: `Oi, Ricardo! Dá sim. Reavalio o Trovão na quinta, ${fmtCurta(quinta)}, às 9h, aí no haras. Se puder, deixa ele na baia de manhã, sem trabalhar. Até quinta!`,
    evento: { titulo: "Reavaliação do Trovão", dia: `quinta-feira, ${fmt(quinta)}`, hora: "09:00", local: "Haras Santa Fé" },
    lembrete: `${diaDaSemana(vespera)}, ${fmtCurta(vespera)} às 09:00`,
  };
}

const str = (description?: string) => (description ? { type: "string", description } : { type: "string" });

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, médica veterinária de equinos que atende em haras e no consultório.",
    "Ela responde clientes por áudio. Você recebe a transcrição e a mensagem do cliente, e chama responder_conversa uma vez.",
    "A resposta sai no tom dela, em primeira pessoa (é ela quem fala): próxima, direta, sem formalidade, frases curtas, até 260 caracteres. Não use emoji.",
    "Se ela pedir para marcar algo, preencha evento. Resolva datas relativas (\"quinta\", \"amanhã\") a partir da data de hoje informada; \"na quinta\" é a próxima quinta-feira.",
    "evento.titulo curto (até 28 caracteres), começando pela ação (ex.: Reavaliação do Trovão); evento.dia como \"quinta-feira, dd/mm/aaaa\"; evento.hora HH:MM; evento.local, o haras ou o consultório.",
    "lembrete: quando avisar, curto (ex.: \"quarta, 11/11 às 09:00\"); se ela pedir \"na véspera\", 1 dia antes no mesmo horário.",
    "Nunca invente o que ela não disse. Português do Brasil. Depois, uma frase curta para ela dizendo o que fez e perguntando se envia.",
  ].join(" "),
  tools: [
    {
      name: "responder_conversa",
      description: "Escreve a resposta para um cliente no WhatsApp da clínica (fica como rascunho até ela aprovar) e, se pedido, marca o compromisso na agenda com lembrete.",
      parameters: {
        type: "object",
        properties: {
          para: str("nome do cliente e do haras"),
          resposta: str("texto da mensagem, no tom dela"),
          evento: {
            type: "object",
            properties: { titulo: str(), dia: str("ex.: quinta-feira, 12/11/2026"), hora: str("HH:MM"), local: str() },
            required: ["titulo", "dia", "hora", "local"],
          },
          lembrete: str("quando avisar a Dra., ex.: quarta, 11/11 às 09:00"),
        },
        required: ["para", "resposta"],
      },
    },
  ],
  prompt: (req) => {
    const data = HOJE_CENA.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
    return [
      `Hoje é ${data}.`,
      `Mensagem do cliente Ricardo Alves (Haras Santa Fé, dono do Trovão, que teve atendimento e infiltração ontem): "${PERGUNTA_RICARDO}"`,
      `Áudio da Dra. Gabriela, transcrito:\n"""${req.text ?? EXEMPLO_TRANSCRICAO}"""`,
    ].join("\n\n");
  },
  demo: () => {
    const r = respostaExemplo();
    const dia = r.evento?.dia?.split(", ")[1]?.slice(0, 5);
    return [
      { kind: "wait", ms: 800 },
      { kind: "tool", name: "responder_conversa", args: r },
      { kind: "text", text: `Escrevi a resposta e marquei a reavaliação na quinta (${dia}), às 9h, no Haras Santa Fé. Envio para o Ricardo?` },
    ];
  },
};
