/** Dataset de exemplo (últimos 30 dias). Vai no prompt do agente e alimenta o painel. */
export type OrigemId = "whatsapp" | "indicacao" | "anuncio_a" | "anuncio_b";

export type Origem = {
  id: OrigemId;
  nome: string;
  detalhe: string;
  leads: number;
  qualificados: number;
  vendas: number;
  /** verba no período (R$); 0 = orgânico */
  verba: number;
};

export const ORIGENS: Origem[] = [
  { id: "whatsapp", nome: "WhatsApp", detalhe: "orgânico · perfil e site", leads: 64, qualificados: 33, vendas: 9, verba: 0 },
  { id: "indicacao", nome: "Indicação", detalhe: "alunos e colegas", leads: 22, qualificados: 17, vendas: 7, verba: 0 },
  { id: "anuncio_a", nome: "Anúncio A", detalhe: "Meta · “Curso Biomecânica”", leads: 180, qualificados: 49, vendas: 4, verba: 4200 },
  { id: "anuncio_b", nome: "Anúncio B", detalhe: "Google · “Avaliação de claudicação”", leads: 60, qualificados: 45, vendas: 7, verba: 2700 },
];

export const metricas = (o: Origem) => ({
  pctQualificado: (o.qualificados / o.leads) * 100,
  pctDesqualificado: ((o.leads - o.qualificados) / o.leads) * 100,
  conversao: (o.vendas / o.leads) * 100,
  cpl: o.verba ? o.verba / o.leads : undefined,
  cplq: o.verba ? o.verba / o.qualificados : undefined,
  custoVenda: o.verba ? o.verba / o.vendas : undefined,
});

/** amostra de leads que chegam na cena */
export type Lead = { nome: string; origem: OrigemId; interesse: string; quando: string; qualificado: boolean; motivo?: string };

export const LEADS: Lead[] = [
  { nome: "Dr. Felipe Arruda", origem: "anuncio_b", interesse: "Avaliação · posterior", quando: "agora", qualificado: true },
  { nome: "Larissa M.", origem: "anuncio_a", interesse: "Curso Biomecânica", quando: "agora", qualificado: false, motivo: "estudante de zootecnia" },
  { nome: "Haras Santa Fé", origem: "whatsapp", interesse: "Consulta no haras", quando: "2 min", qualificado: true },
  { nome: "Bruno C.", origem: "anuncio_a", interesse: "Curso Biomecânica", quando: "4 min", qualificado: false, motivo: "procura curso gratuito" },
  { nome: "Dra. Aline Souza", origem: "indicacao", interesse: "Mentoria clínica", quando: "6 min", qualificado: true },
  { nome: "Pedro L.", origem: "anuncio_a", interesse: "Curso Biomecânica", quando: "9 min", qualificado: false, motivo: "sem cavalo / fora do público" },
  { nome: "Rancho Dois Irmãos", origem: "anuncio_b", interesse: "Claudicação · tambor", quando: "12 min", qualificado: true },
  { nome: "Dra. Renata Galvão", origem: "anuncio_a", interesse: "Curso Biomecânica", quando: "15 min", qualificado: true },
  { nome: "Marcos V.", origem: "whatsapp", interesse: "Preço do curso", quando: "18 min", qualificado: false, motivo: "sem retorno" },
  { nome: "Juliana T.", origem: "anuncio_a", interesse: "Curso Biomecânica", quando: "21 min", qualificado: false, motivo: "clicou por engano" },
  { nome: "Dr. Caio Mendes", origem: "indicacao", interesse: "Curso Biomecânica", quando: "25 min", qualificado: true },
  { nome: "Centro Hípico Vale", origem: "whatsapp", interesse: "Avaliação de lote", quando: "31 min", qualificado: true },
];

export const TOTAL_LEADS = ORIGENS.reduce((s, o) => s + o.leads, 0);

/** texto do dataset que vai no prompt */
export function datasetTexto() {
  const linhas = ORIGENS.map((o) => {
    const m = metricas(o);
    return {
      origem: o.id,
      nome: `${o.nome} (${o.detalhe})`,
      leads: o.leads,
      qualificados: o.qualificados,
      pct_qualificado: +m.pctQualificado.toFixed(1),
      vendas: o.vendas,
      conversao_pct: +m.conversao.toFixed(1),
      verba_reais: o.verba,
      custo_por_lead: m.cpl ? +m.cpl.toFixed(2) : null,
      custo_por_lead_qualificado: m.cplq ? +m.cplq.toFixed(2) : null,
      custo_por_venda: m.custoVenda ? +m.custoVenda.toFixed(2) : null,
    };
  });
  const amostra = LEADS.map((l) => ({ origem: l.origem, interesse: l.interesse, qualificado: l.qualificado, motivo: l.motivo ?? null }));
  return JSON.stringify({ periodo: "últimos 30 dias", origens: linhas, amostra_de_leads: amostra }, null, 1);
}
