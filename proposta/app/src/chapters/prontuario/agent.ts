import type { ChapterAgent } from "@/agent/protocol";

/**
 * Prontuário equino por voz. Schema provisório (clínica geral + locomotor);
 * troca pelos modelos reais da Dra. Gabriela quando chegarem.
 */
export type Prontuario = {
  paciente: { nome: string; raca: string; idade: string; sexo: string; pelagem: string; peso: string };
  tutor: string;
  queixa: string;
  anamnese: string;
  exameFisico: { fc: string; fr: string; temperatura: string; mucosas: string; tpc: string; hidratacao: string };
  locomotor: { membro: string; grauAAEP: string; flexao: string; palpacao: string; bloqueios: string };
  diagnostico: string;
  conduta: { item: string; detalhe: string }[];
  retorno: string;
  tags: string[];
};

const str = { type: "string" };

export const prontuarioAgent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente clínica da Dra. Gabriela Guenka, médica veterinária de equinos especialista em biomecânica.",
    "Recebe a transcrição de um áudio gravado durante um exame e estrutura um prontuário chamando a ferramenta registrar_prontuario.",
    "Preencha só o que foi dito ou é inferência clínica óbvia; deixe string vazia quando não houver informação. Use unidades (bpm, mpm, °C, kg).",
    "Grau de claudicação na escala AAEP (0–5). Português do Brasil, linguagem técnica e concisa.",
  ].join(" "),
  tools: [
    {
      name: "registrar_prontuario",
      description: "Registra o prontuário estruturado do exame no sistema.",
      parameters: {
        type: "object",
        properties: {
          paciente: {
            type: "object",
            properties: { nome: str, raca: str, idade: str, sexo: str, pelagem: str, peso: str },
            required: ["nome", "raca", "idade", "sexo", "pelagem", "peso"],
          },
          tutor: str,
          queixa: str,
          anamnese: str,
          exameFisico: {
            type: "object",
            properties: { fc: str, fr: str, temperatura: str, mucosas: str, tpc: str, hidratacao: str },
            required: ["fc", "fr", "temperatura", "mucosas", "tpc", "hidratacao"],
          },
          locomotor: {
            type: "object",
            properties: { membro: str, grauAAEP: str, flexao: str, palpacao: str, bloqueios: str },
            required: ["membro", "grauAAEP", "flexao", "palpacao", "bloqueios"],
          },
          diagnostico: str,
          conduta: { type: "array", items: { type: "object", properties: { item: str, detalhe: str }, required: ["item", "detalhe"] } },
          retorno: str,
          tags: { type: "array", items: str, description: "2 a 4 etiquetas curtas para busca" },
        },
        required: ["paciente", "tutor", "queixa", "anamnese", "exameFisico", "locomotor", "diagnostico", "conduta", "retorno", "tags"],
      },
    },
  ],
  prompt: (req) => `Transcrição do áudio do exame:\n\n"""${req.text ?? EXEMPLO_TRANSCRICAO}"""`,
  demo: () => [
    { kind: "wait", ms: 500 },
    { kind: "tool", name: "registrar_prontuario", args: EXEMPLO_PRONTUARIO },
    { kind: "text", text: "Prontuário salvo na ficha do Trovão. Marquei o retorno em 15 dias na agenda." },
  ],
};

export const EXEMPLO_TRANSCRICAO =
  "Paciente Trovão, Quarto de Milha, macho castrado, oito anos, alazão, uns quatrocentos e oitenta quilos. Tutor Ricardo Alves. " +
  "Queixa de claudicação no posterior esquerdo há três semanas, piora depois do treino de tambor. " +
  "Frequência cardíaca trinta e seis, respiratória doze, temperatura trinta e sete e oito, mucosas róseas, TPC dois segundos, hidratado. " +
  "Claudicação grau três de cinco no posterior esquerdo, flexão de jarrete positiva, dor à palpação na região do tarso. " +
  "Bloqueio intra-articular tarsometatarsiano com melhora de oitenta por cento. Suspeita de osteoartrite distal do tarso. " +
  "Conduta: infiltração intra-articular com triancinolona, repouso com caminhada controlada quinze minutos por dia por duas semanas, " +
  "fisioterapia com laser. Retorno em quinze dias para reavaliação e raio-x.";

export const EXEMPLO_PRONTUARIO: Prontuario = {
  paciente: { nome: "Trovão", raca: "Quarto de Milha", idade: "8 anos", sexo: "Macho castrado", pelagem: "Alazão", peso: "480 kg" },
  tutor: "Ricardo Alves",
  queixa: "Claudicação em membro posterior esquerdo há 3 semanas, piora após treino de tambor.",
  anamnese: "Atleta de tambor, treino 5×/semana. Sem histórico de trauma. Sem medicação prévia.",
  exameFisico: { fc: "36 bpm", fr: "12 mpm", temperatura: "37,8 °C", mucosas: "Róseas", tpc: "2 s", hidratacao: "Hidratado" },
  locomotor: {
    membro: "Posterior esquerdo",
    grauAAEP: "3/5",
    flexao: "Flexão de jarrete positiva",
    palpacao: "Dor à palpação em região de tarso",
    bloqueios: "Intra-articular tarsometatarsiano: 80% de melhora",
  },
  diagnostico: "Suspeita de osteoartrite distal do tarso (esparavão ósseo).",
  conduta: [
    { item: "Infiltração intra-articular", detalhe: "Triancinolona, articulação tarsometatarsiana" },
    { item: "Repouso controlado", detalhe: "Caminhada 15 min/dia por 2 semanas" },
    { item: "Fisioterapia", detalhe: "Laserterapia em região de tarso" },
  ],
  retorno: "15 dias — reavaliação e radiografia",
  tags: ["claudicação", "tarso", "osteoartrite", "atleta de tambor"],
};
