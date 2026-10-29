/**
 * Simulador de taxas — Hotmart × plataforma própria.
 * Hotmart: fonte em proposta/referencias/REFERENCIAS.md.
 * Plataforma própria: estimativa Khard de ≈ 6,5% por venda, sem taxa fixa — já inclui as taxas de
 * pagamento negociadas no mercado, a operação e os impostos do meio de campo.
 * Tudo determinístico, sem agente.
 */
export const TAXAS = {
  hotmart: { pct: 0.099, fixo: 2.49 },
  propria: { pct: 0.065, fixo: 0 },
};

/** Estimativa de custo mensal da plataforma própria (hospedagem, vídeo, área de membros, antifraude). */
export const PLATAFORMA_MENSAL_PADRAO = 1500;

/** Enquadramento comercial: a plataforma própria fica pelo menos 2,5 p.p. abaixo. */
export const META_PP = 2.5;

export type Cenario = { faturamento: number; ticket: number; plataformaMensal: number };

export const CENARIO_PADRAO: Cenario = { faturamento: 600_000, ticket: 997, plataformaMensal: PLATAFORMA_MENSAL_PADRAO };

export function calcular(c: Cenario) {
  const vendas = c.faturamento / c.ticket;
  const hotPct = c.faturamento * TAXAS.hotmart.pct;
  const hotFixo = vendas * TAXAS.hotmart.fixo;
  const hotmart = hotPct + hotFixo;

  const taxa = c.faturamento * TAXAS.propria.pct;
  const fixo = vendas * TAXAS.propria.fixo;
  const gateway = taxa + fixo;
  const plataforma = c.plataformaMensal * 12;
  const propria = gateway + plataforma;

  const bruta = hotmart - gateway;
  const liquida = hotmart - propria;
  return {
    vendas,
    hotPct,
    hotFixo,
    hotmart,
    taxa,
    fixo,
    gateway,
    plataforma,
    propria,
    bruta,
    liquida,
    efHotmart: (hotmart / c.faturamento) * 100,
    efGateway: (gateway / c.faturamento) * 100,
    efPropria: (propria / c.faturamento) * 100,
    ppBruta: (bruta / c.faturamento) * 100,
    ppLiquida: (liquida / c.faturamento) * 100,
  };
}

export type Resultado = ReturnType<typeof calcular>;

const brlFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
export const brl = (v: number) => brlFmt.format(Math.round(v)).replace(/ /g, " ");
export const brlCents = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 }).format(v).replace(/ /g, " ");
export const num = (v: number, d = 0) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
export const pct = (v: number, d = 2) => `${num(v, d)}%`;
export const milhar = (v: number) => (v >= 1_000_000 ? `R$ ${num(v / 1_000_000, v % 1_000_000 ? 2 : 0)} mi` : `R$ ${num(v / 1000)} mil`);
