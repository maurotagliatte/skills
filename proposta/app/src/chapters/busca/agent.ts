import type { ChapterAgent, DemoStep } from "@/agent/protocol";
import { CORPUS, byId } from "./corpus";

/**
 * Perguntar sobre seus casos. Duas etapas (AgentRequest.options.etapa):
 * - "casos": a Donna acha, no acervo, os casos mais parecidos com a pergunta (tool casos_parecidos);
 * - "resposta": responde à pergunta citando de quais casos veio cada frase (tool resposta).
 * Na proposta o acervo é pequeno e vai inteiro no prompt; o roteiro de exemplo é o mesmo que a UI mostra.
 */

export type Resultado = { id: string; score: number; porque: string };
export type Frase = { texto: string; casos: number[] };

export const PERGUNTA = "Casos parecidos com o Trovão: claudicação no posterior";

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, veterinária de equinos especialista em biomecânica.",
    "Você recebe uma pergunta dela e o acervo da clínica (relatórios, laudos, documentos e aulas).",
    "Na etapa 'casos', chame casos_parecidos com 4 ou 5 itens do acervo parecidos com a pergunta pelo sentido",
    "(jarrete ≈ tarso, mancando ≈ claudicação), do mais ao menos parecido, score entre 0 e 1, e em 'porque' uma frase curta",
    "dizendo o que o item tem em comum e, se for o caso, o que difere. Não inclua o próprio caso da pergunta.",
    "Na etapa 'resposta', chame resposta com 3 a 4 frases curtas que respondem à pergunta; em 'casos', os números (1, 2, …)",
    "dos itens citados, na ordem da lista recebida. Só afirme o que está nos itens. Português do Brasil, tom de colega.",
  ].join(" "),
  tools: [
    {
      name: "casos_parecidos",
      description: "Mostra os itens do acervo mais parecidos com a pergunta.",
      parameters: {
        type: "object",
        properties: {
          itens: {
            type: "array",
            items: {
              type: "object",
              properties: { id: { type: "string" }, score: { type: "number" }, porque: { type: "string" } },
              required: ["id", "score", "porque"],
            },
          },
        },
        required: ["itens"],
      },
    },
    {
      name: "resposta",
      description: "Mostra a resposta à pergunta, frase a frase, com os casos citados em cada uma.",
      parameters: {
        type: "object",
        properties: {
          frases: {
            type: "array",
            items: {
              type: "object",
              properties: { texto: { type: "string" }, casos: { type: "array", items: { type: "number" } } },
              required: ["texto", "casos"],
            },
          },
        },
        required: ["frases"],
      },
    },
  ],
  prompt: (req) => {
    const pergunta = req.text ?? PERGUNTA;
    if (req.options?.etapa === "resposta") {
      const ids = (req.options.casos ?? CASOS.map((c) => c.id).join(",")).split(",").filter((id) => byId[id]);
      const lista = ids.map((id, i) => ({ n: i + 1, ...byId[id] }));
      return `Etapa: resposta\nPergunta: """${pergunta}"""\n\nCaso de hoje: ${JSON.stringify(byId["p-trovao"])}\n\nCasos encontrados (JSON):\n${JSON.stringify(lista)}`;
    }
    const acervo = CORPUS.map((c) => ({ id: c.id, tipo: c.tipo, nome: c.nome, titulo: c.titulo, data: c.data, resumo: c.resumo }));
    return `Etapa: casos\nPergunta: """${pergunta}"""\n\nAcervo (JSON):\n${JSON.stringify(acervo)}`;
  },
  demo: (req) => {
    if (req.options?.etapa === "resposta") {
      const steps: DemoStep[] = [{ kind: "wait", ms: 900 }];
      steps.push({ kind: "tool", name: "resposta", args: { frases: RESPOSTA } });
      steps.push({ kind: "text", text: "Cada frase traz o número do caso de onde veio. É só abrir para ver o relatório inteiro." });
      return steps;
    }
    return [
      { kind: "wait", ms: 700 },
      { kind: "tool", name: "casos_parecidos", args: { itens: CASOS } },
      { kind: "text", text: "Achei cinco casos parecidos nos seus relatórios. O mais próximo é o Pampa, também de tambor." },
    ];
  },
};

/* ——— roteiro de exemplo ——— */

export const CASOS: Resultado[] = [
  { id: "p-pampa", score: 0.94, porque: "Também Quarto de Milha de tambor, posterior esquerdo, flexão do jarrete positiva e desgaste no tarso." },
  { id: "p-zorro", score: 0.88, porque: "Mesma infiltração no jarrete; no retorno de 30 dias foi de 3/5 para 1/5." },
  { id: "p-estrela", score: 0.81, porque: "Dor à flexão do jarrete esquerdo depois de prova, em égua de laço." },
  { id: "p-faisca", score: 0.72, porque: "Posterior com efusão no jarrete, mas em potra: ali a causa era outra." },
  { id: "a-bloq", score: 0.66, porque: "Sua aula de bloqueios do posterior mostra um caso como este." },
];

export const RESPOSTA: Frase[] = [
  { texto: "Três casos seus têm o mesmo quadro do Trovão: posterior, flexão do jarrete positiva e desgaste no tarso.", casos: [1, 2, 3] },
  { texto: "O Pampa, também de tambor, recebeu a mesma infiltração e voltou às provas em oito semanas.", casos: [1] },
  { texto: "No Zorro, a claudicação foi de 3/5 para 1/5 na reavaliação de 30 dias.", casos: [2] },
  { texto: "A Faísca parece, mas é outro caso: potra, e o raio-x mostrou osteocondrose.", casos: [4] },
];
