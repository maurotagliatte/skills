import type { ChapterAgent, DemoStep } from "@/agent/protocol";
import { CORPUS, byId } from "./corpus";

/**
 * Busca semântica — PRÉVIA.
 *
 * Aqui o Claude re-ranqueia um acervo pequeno que vai inteiro no prompt (re-ranqueamento por LLM).
 * É só para a proposta mostrar a experiência. No projeto, a busca é feita com embeddings:
 * cada prontuário, aula e documento é vetorizado ao ser salvo, guardado num banco vetorial
 * e a consulta faz busca por vizinhos mais próximos (o LLM pode, no máximo, re-ranquear o topo).
 */

export type Resultado = { id: string; score: number; porque: string };
export type Resultados = { itens: Resultado[] };

export const EXEMPLOS = ["potro com claudicação no posterior", "aula sobre flexão de jarrete", "cavalo de salto perdendo impulsão"];

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, veterinária de equinos especialista em biomecânica.",
    "Você recebe uma busca escrita em linguagem natural e o acervo da clínica (prontuários, aulas e documentos).",
    "Ranqueie os itens por semelhança de SENTIDO com a busca (não só palavras iguais: potro ≈ potra, jarrete ≈ tarso, mancando ≈ claudicação).",
    "Chame a ferramenta resultados com 3 a 5 itens, do mais parecido ao menos parecido, score entre 0 e 1,",
    "e em 'porque' uma frase curta dizendo o que o item tem em comum com a busca e, se for o caso, o que difere.",
    "Use só ids que existem no acervo. Português do Brasil.",
  ].join(" "),
  tools: [
    {
      name: "resultados",
      description: "Mostra os itens do acervo mais parecidos com a busca.",
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
  ],
  prompt: (req) => {
    const acervo = CORPUS.map((c) => ({ id: c.id, tipo: c.tipo, titulo: c.titulo, resumo: c.resumo }));
    return `Busca: """${req.text ?? EXEMPLOS[0]}"""\n\nAcervo (JSON):\n${JSON.stringify(acervo)}`;
  },
  demo: (req) => {
    const q = req.text ?? EXEMPLOS[0];
    const itens = rankDemo(q);
    const steps: DemoStep[] = [{ kind: "wait", ms: 700 }, { kind: "tool", name: "resultados", args: { itens } }];
    steps.push({
      kind: "text",
      text: itens.length
        ? `Encontrei ${itens.length} itens parecidos. O mais próximo é “${byId[itens[0].id].titulo.split(" · ")[0]}”.`
        : "Não achei nada parecido neste acervo de exemplo. Tente descrever o caso com outras palavras.",
    });
    return steps;
  },
};

/* ——— modo de exemplo: roteiro para as buscas sugeridas + palavras-chave para o resto ——— */

const ROTEIRO: Record<string, Resultado[]> = {
  "potro com claudicacao no posterior": [
    { id: "p-faisca", score: 0.94, porque: "Potra de 14 meses com claudicação no posterior — mesma faixa de idade e mesmo membro." },
    { id: "p-bento", score: 0.91, porque: "Potro em crescimento com claudicação leve no posterior; ali a causa foi epifisite." },
    { id: "p-trovao", score: 0.82, porque: "Claudicação no posterior esquerdo, mas em adulto de 8 anos (osteoartrite de tarso)." },
    { id: "a-claud", score: 0.74, porque: "Aula sobre como avaliar claudicação — o roteiro de exame que vale para o potro." },
    { id: "d-dieta", score: 0.66, porque: "Plano alimentar de potros em crescimento, ligado aos casos de epifisite." },
  ],
  "aula sobre flexao de jarrete": [
    { id: "a-flexao", score: 0.96, porque: "É a aula do teste de flexão do jarrete, passo a passo." },
    { id: "a-intro", score: 0.85, porque: "Explica o aparelho recíproco: joelho e jarrete fletem juntos." },
    { id: "a-bloq", score: 0.79, porque: "Aula do passo seguinte à flexão: bloqueios do membro posterior." },
    { id: "p-trovao", score: 0.76, porque: "Caso real com flexão de jarrete positiva — bom exemplo para mostrar na aula." },
    { id: "p-estrela", score: 0.7, porque: "Dor à flexão do jarrete depois de prova de laço." },
  ],
  "cavalo de salto perdendo impulsao": [
    { id: "p-rubi", score: 0.95, porque: "Mesma queixa: perda de impulsão no salto, com dor sacroilíaca." },
    { id: "a-salto", score: 0.86, porque: "Aula sobre o papel do posterior na impulsão do salto." },
    { id: "p-lua", score: 0.77, porque: "Análise de vídeo do salto; mostra como medir a assimetria." },
    { id: "p-atlas", score: 0.72, porque: "Cavalo de salto com queda de rendimento por dor lombar." },
    { id: "d-retorno", score: 0.64, porque: "Plano de treino para voltar a saltar depois de lesão." },
  ],
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** sinônimos e termos próximos (peso menor) — só para o modo de exemplo */
const PERTO: Record<string, string[]> = {
  potra: ["potro"],
  potros: ["potro"],
  jovem: ["potro"],
  mancando: ["claudicacao"],
  manca: ["claudicacao"],
  mancar: ["claudicacao"],
  claudicando: ["claudicacao"],
  traseira: ["posterior"],
  traseiro: ["posterior"],
  dianteira: ["anterior"],
  dianteiro: ["anterior"],
  jarrete: ["tarso"],
  tarso: ["jarrete"],
  pulo: ["salto"],
  saltar: ["salto"],
  dentes: ["dente"],
  comida: ["dieta", "racao"],
  alimentacao: ["dieta", "nutricao"],
  pagamentos: ["pagamento"],
  raiox: ["raio-x"],
  radiografia: ["raio-x", "laudo"],
  artrose: ["osteoartrite"],
  video: ["video"],
};
const STOP = new Set(["com", "sem", "para", "pra", "que", "uma", "uns", "das", "dos", "nos", "nas", "sobre", "cavalo", "egua", "caso", "casos", "quando", "como", "esta", "esse", "essa", "meu", "minha"]);

export function rankDemo(query: string): Resultado[] {
  const q = norm(query);
  if (ROTEIRO[q]) return ROTEIRO[q];
  const toks = q.split(" ").filter((t) => t.length >= 3 && !STOP.has(t));
  if (!toks.length) return [];
  const wantAula = toks.includes("aula") || toks.includes("aulas");
  const scored = CORPUS.map((it) => {
    const kws = it.kw.map(norm);
    const hay = norm(`${it.titulo} ${it.resumo}`);
    const hit: string[] = [];
    let s = 0;
    for (const t of toks) {
      const exact = kws.find((k) => k === t || (t.length >= 5 && (k.startsWith(t.slice(0, 5)) || t.startsWith(k.slice(0, 5)))));
      if (exact) {
        s += 1;
        hit.push(exact);
        continue;
      }
      const near = (PERTO[t] ?? []).find((n) => kws.includes(n));
      if (near) {
        s += 0.6;
        hit.push(near);
      } else if (t.length >= 4 && hay.includes(t)) s += 0.4;
    }
    if (wantAula && it.tipo === "aula") s += 0.4;
    return { it, s, hit };
  })
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 5);
  if (!scored.length) return [];
  const max = scored[0].s;
  return scored.map(({ it, s, hit }) => ({
    id: it.id,
    score: Math.round((0.55 + 0.4 * (s / max)) * 100) / 100,
    porque: hit.length ? `Fala de ${listar([...new Set(hit)].map(legivel))}, como a sua busca.` : "Tem termos parecidos com os da sua busca.",
  }));
}

const LEG: Record<string, string> = {
  claudicacao: "claudicação",
  flexao: "flexão",
  nutricao: "nutrição",
  impulsao: "impulsão",
  infiltracao: "infiltração",
  biomecanica: "biomecânica",
  racao: "ração",
  odontologia: "odontologia",
  reabilitacao: "reabilitação",
  avaliacao: "avaliação",
  extracao: "extração",
  colica: "cólica",
  inscricoes: "inscrições",
};
const legivel = (k: string) => LEG[k] ?? k;
const listar = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} e ${xs[xs.length - 1]}`);
