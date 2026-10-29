/**
 * Simulador de taxas — Hotmart × plataforma própria (gateway Asaas).
 * Fontes em proposta/referencias/REFERENCIAS.md. Tudo determinístico, sem agente.
 */
export const TAXAS = {
  hotmart: { pct: 0.099, fixo: 2.49 },
  asaasVista: { pct: 0.0299, fixo: 0.49 },
  asaasParcelado: { pct: 0.0349, fixo: 0.49 },
};

/** Estimativa de custo mensal da plataforma própria (hospedagem, vídeo, área de membros, antifraude). */
export const PLATAFORMA_MENSAL_PADRAO = 1500;

/** Enquadramento comercial: a plataforma própria fica pelo menos 2,5 p.p. abaixo. */
export const META_PP = 2.5;

export type Cenario = { faturamento: number; ticket: number; parcelado: number; plataformaMensal: number };

export const CENARIO_PADRAO: Cenario = { faturamento: 600_000, ticket: 997, parcelado: 60, plataformaMensal: PLATAFORMA_MENSAL_PADRAO };

export function calcular(c: Cenario) {
  const vendas = c.faturamento / c.ticket;
  const share = c.parcelado / 100;
  const hotPct = c.faturamento * TAXAS.hotmart.pct;
  const hotFixo = vendas * TAXAS.hotmart.fixo;
  const hotmart = hotPct + hotFixo;

  const baseVista = c.faturamento * (1 - share);
  const baseParc = c.faturamento * share;
  const vista = baseVista * TAXAS.asaasVista.pct;
  const parc = baseParc * TAXAS.asaasParcelado.pct;
  const fixo = vendas * TAXAS.asaasVista.fixo;
  const gateway = vista + parc + fixo;
  const plataforma = c.plataformaMensal * 12;
  const propria = gateway + plataforma;

  const bruta = hotmart - gateway;
  const liquida = hotmart - propria;
  return {
    vendas,
    hotPct,
    hotFixo,
    hotmart,
    baseVista,
    baseParc,
    vista,
    parc,
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
