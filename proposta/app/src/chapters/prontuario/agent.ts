import type { ChapterAgent } from "@/agent/protocol";

/**
 * Modelo "Exame Locomotor" da Dra. Gabriela Guenka (do documento que ela usa hoje no iPad):
 * informações pessoais, animal, histórico, análise do casco, inspeção dinâmica, flexões,
 * radiografia, ultrassonografia, resumo do exame, check-list e procedimentos.
 */
export type Membro = "MTE" | "MTD" | "MPE" | "MPD";
export type Flexao = { membro: Membro; articulacao: string; resultado: string };
export type AchadoImagem = { estrutura: string; achado: string };

export type Prontuario = {
  informacoes: { proprietario: string; documento: string; endereco: string; cep: string; propriedade: string; contato: string };
  animal: { nome: string; raca: string; sexo: string; esporte: string; idade: string; pelagem: string };
  historico: string;
  analiseCasco: string;
  inspecaoDinamica: string;
  flexoes: Flexao[];
  radiografia: { quantidade: string; achados: AchadoImagem[] };
  ultrassonografia: AchadoImagem[];
  resumo: string[];
  checklist: { materiais: string[]; medicamentos: string[] };
  procedimentos: string[];
};

/** Articulações das colunas da tabela de flexões (anteriores como no modelo; posteriores a confirmar). */
export const ARTICULACOES = {
  anteriores: ["ombro", "cotovelo", "carpo", "dígito"],
  posteriores: ["quadril", "soldra", "jarrete", "dígito"],
} as const;

const str = { type: "string" };
const strs = { type: "array", items: str };
const achado = { type: "object", properties: { estrutura: str, achado: str }, required: ["estrutura", "achado"] };

export const prontuarioAgent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente clínica da Dra. Gabriela Guenka, médica veterinária de equinos especialista em biomecânica.",
    "Recebe a transcrição de um áudio gravado durante um exame locomotor e preenche o modelo de prontuário da clínica chamando a ferramenta registrar_prontuario.",
    "Preencha só o que foi dito ou é inferência clínica óbvia; deixe string vazia ou lista vazia quando não houver informação.",
    "Flexões: uma entrada por articulação testada, membro em MTE/MTD (torácicos) ou MPE/MPD (pélvicos); resultado curto como 'positiva +2/5' ou 'negativa'.",
    "Resumo do exame: 2 a 4 tópicos objetivos. Português do Brasil, linguagem técnica e concisa.",
  ].join(" "),
  tools: [
    {
      name: "registrar_prontuario",
      description: "Preenche o modelo Exame Locomotor da clínica e salva no prontuário do paciente.",
      parameters: {
        type: "object",
        properties: {
          informacoes: {
            type: "object",
            properties: { proprietario: str, documento: { type: "string", description: "CPF/RG/CNPJ" }, endereco: str, cep: str, propriedade: str, contato: str },
            required: ["proprietario", "documento", "endereco", "cep", "propriedade", "contato"],
          },
          animal: {
            type: "object",
            properties: { nome: str, raca: str, sexo: str, esporte: str, idade: str, pelagem: str },
            required: ["nome", "raca", "sexo", "esporte", "idade", "pelagem"],
          },
          historico: str,
          analiseCasco: str,
          inspecaoDinamica: str,
          flexoes: {
            type: "array",
            items: {
              type: "object",
              properties: { membro: { type: "string", enum: ["MTE", "MTD", "MPE", "MPD"] }, articulacao: str, resultado: str },
              required: ["membro", "articulacao", "resultado"],
            },
          },
          radiografia: { type: "object", properties: { quantidade: str, achados: { type: "array", items: achado } }, required: ["quantidade", "achados"] },
          ultrassonografia: { type: "array", items: achado },
          resumo: strs,
          checklist: { type: "object", properties: { materiais: strs, medicamentos: strs }, required: ["materiais", "medicamentos"] },
          procedimentos: strs,
        },
        required: [
          "informacoes",
          "animal",
          "historico",
          "analiseCasco",
          "inspecaoDinamica",
          "flexoes",
          "radiografia",
          "ultrassonografia",
          "resumo",
          "checklist",
          "procedimentos",
        ],
      },
    },
  ],
  prompt: (req) => `Transcrição do áudio do exame:\n\n"""${req.text ?? EXEMPLO_TRANSCRICAO}"""`,
  demo: () => [
    { kind: "wait", ms: 500 },
    { kind: "tool", name: "registrar_prontuario", args: EXEMPLO_PRONTUARIO },
    { kind: "text", text: "Prontuário preenchido no seu modelo. Mandei para você conferir no WhatsApp antes de ir ao tutor." },
  ],
};

export const EXEMPLO_TRANSCRICAO =
  "Exame locomotor do Trovão, Quarto de Milha, macho castrado, oito anos, alazão, atleta de tambor. Proprietário Ricardo Alves, Haras Santa Fé. " +
  "Histórico: claudicação no posterior esquerdo há três semanas, piora depois do treino. " +
  "Casco: aprumos corretos, sem sensibilidade à pinça, ferrageamento há trinta dias. " +
  "Inspeção dinâmica: claudicação grau três de cinco no posterior esquerdo, mais evidente no círculo para a esquerda em piso duro. " +
  "Flexões: jarrete posterior esquerdo positiva mais dois, soldra posterior esquerdo negativa, jarrete direito negativa, carpos negativos. " +
  "Radiografia, quatro projeções do tarso esquerdo: proliferação óssea nas articulações intertársica distal e tarsometatarsiana. " +
  "Ultrassom do ligamento suspensório sem alterações. " +
  "Fiz bloqueio intra-articular tarsometatarsiano com melhora de oitenta por cento e infiltração com triancinolona. Usei mepivacaína e triancinolona, agulha 25 por 7.";

export const EXEMPLO_PRONTUARIO: Prontuario = {
  informacoes: {
    proprietario: "Ricardo Alves",
    documento: "",
    endereco: "",
    cep: "",
    propriedade: "Haras Santa Fé",
    contato: "",
  },
  animal: { nome: "Trovão", raca: "Quarto de Milha", sexo: "Macho castrado", esporte: "Tambor", idade: "8 anos", pelagem: "Alazão" },
  historico: "Claudicação em membro pélvico esquerdo há 3 semanas, piora após treino.",
  analiseCasco: "Aprumos corretos. Sem sensibilidade à pinça de casco. Ferrageamento há 30 dias.",
  inspecaoDinamica: "Claudicação 3/5 (AAEP) em MPE, mais evidente no círculo à esquerda em piso duro.",
  flexoes: [
    { membro: "MTE", articulacao: "carpo", resultado: "negativa" },
    { membro: "MTD", articulacao: "carpo", resultado: "negativa" },
    { membro: "MPE", articulacao: "soldra", resultado: "negativa" },
    { membro: "MPE", articulacao: "jarrete", resultado: "positiva +2/5" },
    { membro: "MPD", articulacao: "jarrete", resultado: "negativa" },
  ],
  radiografia: {
    quantidade: "4 projeções — tarso esquerdo",
    achados: [{ estrutura: "Intertársica distal e tarsometatarsiana", achado: "Proliferação óssea periarticular" }],
  },
  ultrassonografia: [{ estrutura: "Ligamento suspensório (MPE)", achado: "Sem alterações" }],
  resumo: [
    "Claudicação 3/5 em MPE com flexão de jarrete positiva",
    "Bloqueio tarsometatarsiano: 80% de melhora",
    "Compatível com osteoartrite distal do tarso",
  ],
  checklist: { materiais: ["Agulha 25×7", "Luvas estéreis"], medicamentos: ["Mepivacaína", "Triancinolona"] },
  procedimentos: ["Bloqueio intra-articular tarsometatarsiano", "Infiltração intra-articular com triancinolona"],
};
