import type { ChapterAgent } from "@/agent/protocol";

/** Agente de produção de aula: a partir do tema, monta título, descrição, capítulos e legenda. */
export type Aula = {
  titulo: string;
  descricao: string;
  capitulos: { tempo: string; titulo: string }[];
  legenda_amostra: string[];
};

export const TEMA_EXEMPLO = "Avaliação de claudicação posterior: flexão, bloqueios e o que observar no trote";
export const SUGESTOES_TEMA = [TEMA_EXEMPLO, "Ferrageamento corretivo e o eixo podofalângico", "Reabilitação do cavalo de tambor depois de uma lesão de tendão"];

const str = { type: "string" };

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, editora de vídeo e produtora dos cursos da Dra. Gabriela Guenka, médica veterinária de equinos especialista em biomecânica.",
    "Os alunos são médicos-veterinários e estudantes de veterinária. A Dra. gravou uma aula bruta de 42 minutos;",
    "depois dos cortes (silêncios, repetições, erros de gravação) a aula editada tem cerca de 31 minutos.",
    "A partir do tema, chame a ferramenta gerar_aula com título, descrição, capítulos e uma amostra de legendas.",
    "Título até 70 caracteres, direto e técnico. Descrição com 2 a 3 frases dizendo o que o aluno vai saber fazer.",
    "4 a 6 capítulos com tempo mm:ss crescente começando em 00:00 e terminando antes de 31:00.",
    "legenda_amostra: 3 ou 4 falas curtas (até 90 caracteres cada), em primeira pessoa, como a Dra. falaria na aula.",
    "Português do Brasil. Não invente dados de estudos nem números de pesquisa.",
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
          capitulos: {
            type: "array",
            items: { type: "object", properties: { tempo: { type: "string", description: "mm:ss" }, titulo: str }, required: ["tempo", "titulo"] },
          },
          legenda_amostra: { type: "array", items: str },
        },
        required: ["titulo", "descricao", "capitulos", "legenda_amostra"],
      },
    },
  ],
  prompt: (req) => `Tema da aula que a Dra. gravou:\n\n"""${(req.text ?? TEMA_EXEMPLO).slice(0, 400)}"""`,
  demo: () => [
    { kind: "wait", ms: 900 },
    { kind: "tool", name: "gerar_aula", args: EXEMPLO_AULA },
    { kind: "text", text: "Cortei 11 minutos de pausas e repetições, gerei as legendas e deixei a aula pronta no Módulo 3." },
  ],
};

export const EXEMPLO_AULA: Aula = {
  titulo: "Claudicação posterior: flexão, bloqueios e leitura do trote",
  descricao:
    "Como conduzir a avaliação de um membro posterior do início ao fim: o que observar no trote em linha reta e no círculo, quando a flexão ajuda e como interpretar o bloqueio. Com o caso do Trovão, Quarto de Milha de 8 anos.",
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
    "O bloqueio tarsometatarsiano deu 80% de melhora. Isso localiza a dor.",
  ],
};
