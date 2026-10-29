import type { ChapterAgent } from "@/agent/protocol";
import { datasetTexto, type OrigemId } from "./data";

export type Insight = { titulo: string; evidencia: string; acao: string; origem: OrigemId };
export type Analise = { resumo: string; insights: Insight[]; origem_destaque: OrigemId };

const str = { type: "string" };
const origem = { type: "string", enum: ["whatsapp", "indicacao", "anuncio_a", "anuncio_b"] };

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, analista do CRM da Dra. Gabriela Guenka, médica veterinária de equinos (biomecânica) que vende cursos para veterinários e atende haras.",
    "Recebe as métricas de leads por origem dos últimos 30 dias e chama a ferramenta analisar_leads.",
    "Use só os números do dataset; cite-os na evidência (com R$ e %). Compare custo por lead com custo por lead qualificado e custo por venda.",
    "resumo: 1 a 2 frases. insights: 3 ou 4, cada um com título curto (até 60 caracteres), evidência numérica e uma ação concreta para as próximas semanas.",
    "origem_destaque: a origem que mais merece atenção. Português do Brasil, direto, sem jargão de marketing.",
  ].join(" "),
  tools: [
    {
      name: "analisar_leads",
      description: "Mostra no painel a análise das origens de lead, destacando a origem que merece atenção.",
      parameters: {
        type: "object",
        properties: {
          resumo: str,
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: { titulo: str, evidencia: str, acao: str, origem },
              required: ["titulo", "evidencia", "acao", "origem"],
            },
          },
          origem_destaque: origem,
        },
        required: ["resumo", "insights", "origem_destaque"],
      },
    },
  ],
  prompt: () => `Dados do CRM:\n\n${datasetTexto()}\n\nQual origem traz o lead bom, qual engana, e o que fazer com a verba?`,
  demo: () => [
    { kind: "wait", ms: 1100 },
    { kind: "tool", name: "analisar_leads", args: EXEMPLO_ANALISE },
    { kind: "text", text: "Deixei o Anúncio A destacado no painel. Se quiser, preparo a nova divisão de verba para você aprovar." },
  ],
};

export const EXEMPLO_ANALISE: Analise = {
  resumo:
    "O Anúncio A traz mais da metade dos leads, mas 73% não têm perfil — quase 3× a taxa de desqualificados do Anúncio B. Por lead qualificado, ele é o mais caro.",
  insights: [
    {
      titulo: "Custo por lead baixo engana",
      evidencia: "A: R$ 23,33 por lead, mas R$ 85,71 por lead qualificado. B: R$ 45,00 por lead e R$ 60,00 por qualificado.",
      acao: "Comparar campanhas pelo custo por lead qualificado, não pelo custo por lead.",
      origem: "anuncio_a",
    },
    {
      titulo: "3× mais leads desqualificados no A",
      evidencia: "73% dos leads do A sem perfil (estudantes de outras áreas, curso gratuito, clique por engano), contra 25% no B.",
      acao: "Restringir o público do A a médicos-veterinários e incluir uma pergunta de qualificação no formulário.",
      origem: "anuncio_a",
    },
    {
      titulo: "Mesma verba, resultado diferente",
      evidencia: "Com R$ 2.700, o B gerou 7 vendas (R$ 386 cada). Com R$ 4.200, o A gerou 4 (R$ 1.050 cada).",
      acao: "Mover 35% da verba do A para o B por 30 dias e comparar de novo.",
      origem: "anuncio_b",
    },
    {
      titulo: "Indicação converte melhor que tudo",
      evidencia: "32% dos leads de indicação viram venda, sem verba.",
      acao: "Criar um convite de indicação para ex-alunos ao fim de cada turma.",
      origem: "indicacao",
    },
  ],
  origem_destaque: "anuncio_a",
};
