/**
 * Dados de EXEMPLO do capítulo 04 (últimos 30 dias). Os reais vêm do painel dela depois da integração.
 * Base única de verba: R$ 6.900 em 30 dias nos dois anúncios (A + B) — a mesma da simulação.
 */
export type OrigemId = "indicacao" | "instagram" | "anuncio_a" | "anuncio_b";

export type Origem = {
  id: OrigemId;
  nome: string;
  detalhe: string;
  chegaram: number;
  comPerfil: number;
  compraram: number;
  /** verba no período (R$); 0 = sem verba */
  verba: number;
};

export const ORIGENS: Origem[] = [
  { id: "indicacao", nome: "Indicação", detalhe: "clientes, alunos e colegas", chegaram: 22, comPerfil: 17, compraram: 7, verba: 0 },
  { id: "instagram", nome: "Instagram e site", detalhe: "perfil, site e blog", chegaram: 64, comPerfil: 33, compraram: 9, verba: 0 },
  { id: "anuncio_a", nome: "Anúncio A", detalhe: "Meta · curso online", chegaram: 180, comPerfil: 49, compraram: 4, verba: 4200 },
  { id: "anuncio_b", nome: "Anúncio B", detalhe: "Google · avaliação de claudicação", chegaram: 60, comPerfil: 45, compraram: 7, verba: 2700 },
];

export const TOTAL = ORIGENS.reduce((s, o) => s + o.chegaram, 0);
export const VERBA_MES = ORIGENS.reduce((s, o) => s + o.verba, 0);

export const pctCompra = (o: Origem) => (o.compraram / o.chegaram) * 100;
export const pctSemPerfil = (o: Origem) => ((o.chegaram - o.comPerfil) / o.chegaram) * 100;
export const custoAluno = (o: Origem) => (o.verba ? o.verba / o.compraram : undefined);

/** clientes da clínica nos últimos 12 meses, por como chegaram (exemplo a criar com ela) */
export const CLINICA = [
  { id: "indicacao_cliente", nome: "Indicação de cliente", clientes: 18, ticket: 9400 },
  { id: "veterinario", nome: "Colega veterinário", clientes: 9, ticket: 7800 },
  { id: "site", nome: "Google e site", clientes: 6, ticket: 3300 },
  { id: "instagram", nome: "Instagram", clientes: 11, ticket: 2100 },
];

/** pessoas que chegam na cena */
export type Pessoa = { nome: string; origem: OrigemId; interesse: string; quando: string; perfil: boolean };

export const PESSOAS: Pessoa[] = [
  { nome: "Ricardo Alves · Haras Santa Fé", origem: "indicacao", interesse: "Reavaliação no haras", quando: "agora", perfil: true },
  { nome: "Larissa M.", origem: "anuncio_a", interesse: "Curso online", quando: "agora", perfil: false },
  { nome: "Dr. Felipe Arruda", origem: "anuncio_b", interesse: "Avaliação · posterior", quando: "2 min", perfil: true },
  { nome: "Bruno C.", origem: "anuncio_a", interesse: "Curso online", quando: "4 min", perfil: false },
  { nome: "Dra. Aline Souza", origem: "indicacao", interesse: "Mentoria", quando: "6 min", perfil: true },
  { nome: "Centro Hípico Vale", origem: "instagram", interesse: "Avaliação de lote", quando: "9 min", perfil: true },
  { nome: "Pedro L.", origem: "anuncio_a", interesse: "Curso online", quando: "12 min", perfil: false },
  { nome: "Rancho Dois Irmãos", origem: "anuncio_b", interesse: "Claudicação · tambor", quando: "15 min", perfil: true },
  { nome: "Marcos V.", origem: "instagram", interesse: "Preço do curso", quando: "18 min", perfil: false },
  { nome: "Juliana T.", origem: "anuncio_a", interesse: "Curso online", quando: "21 min", perfil: false },
];

/* ——— Simulação: o anúncio aprendendo com quem comprou ——— */

/** custo por aluno que comprou (R$), 12 semanas, mesma verba (R$ 6.900/mês). ILUSTRATIVO. */
export const SIM = {
  conversa: [628, 622, 641, 633, 610, 638, 648, 625, 635, 643, 623, 631],
  venda: [628, 667, 655, 594, 537, 491, 452, 415, 390, 370, 358, 346],
};
export type Modo = keyof typeof SIM;
export type Periodo = "semana" | "mes";

/** pontos do gráfico no período escolhido (mês = média de 4 semanas) */
export function serieSim(modo: Modo, periodo: Periodo) {
  const s = SIM[modo];
  if (periodo === "semana") return s.map((v, i) => ({ rotulo: `S${i + 1}`, valor: v }));
  return [0, 1, 2].map((m) => ({ rotulo: `Mês ${m + 1}`, valor: s.slice(m * 4, m * 4 + 4).reduce((a, b) => a + b, 0) / 4 }));
}

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).replace(/ /g, " ");
export const num = (v: number, d = 0) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

/** texto do dataset que vai no prompt do agente */
export function datasetTexto() {
  return JSON.stringify(
    {
      aviso: "dados de exemplo",
      periodo: "últimos 30 dias",
      origens: ORIGENS.map((o) => ({
        id: o.id,
        nome: `${o.nome} (${o.detalhe})`,
        chegaram: o.chegaram,
        com_perfil: o.comPerfil,
        compraram: o.compraram,
        verba_reais: o.verba,
        pct_que_comprou: +pctCompra(o).toFixed(1),
        pct_sem_perfil: +pctSemPerfil(o).toFixed(1),
        custo_por_aluno_que_comprou: custoAluno(o) ? Math.round(custoAluno(o)!) : null,
      })),
      clientes_da_clinica_12_meses: CLINICA.map((c) => ({ id: c.id, como_chegou: c.nome, clientes: c.clientes, gasto_medio_por_cliente_reais: c.ticket })),
    },
    null,
    1,
  );
}
