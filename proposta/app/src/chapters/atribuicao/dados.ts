/**
 * Dados ILUSTRATIVOS (simulação) — os números reais vêm do painel dela depois da integração.
 * Verba fixa de R$ 3.000/semana nos dois cenários.
 */

export const VERBA_SEMANA = 3000;

/** 8 semanas: conversas iniciadas pelo anúncio (o "lead" que o Meta conta) × vendas fechadas no CRM */
export const SEMANAS_DOR = [
  { s: "S1", conversas: 162, vendas: 8 },
  { s: "S2", conversas: 171, vendas: 7 },
  { s: "S3", conversas: 158, vendas: 9 },
  { s: "S4", conversas: 184, vendas: 7 },
  { s: "S5", conversas: 176, vendas: 8 },
  { s: "S6", conversas: 190, vendas: 6 },
  { s: "S7", conversas: 149, vendas: 10 },
  { s: "S8", conversas: 152, vendas: 9 },
];

/** custo por aquisição (venda real), 12 semanas */
export const CPA = {
  clique: [372, 368, 380, 375, 361, 378, 384, 370, 376, 381, 369, 374],
  venda: [372, 395, 388, 352, 318, 291, 268, 246, 231, 219, 212, 205],
};

export type Modo = keyof typeof CPA;

export const brl = (v: number, dec = 0) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: dec, maximumFractionDigits: dec });

/**
 * Exemplo de evento — formato da Meta Conversions API para conversas iniciadas por anúncio de clique
 * para o WhatsApp (action_source "business_messaging"). Hashes SHA-256 reais dos valores normalizados:
 *   sha256("aluna@exemplo.com.br") e sha256("5511987654321").
 */
export const EMAIL = "aluna@exemplo.com.br";
export const FONE_EXIBIDO = "+55 (11) 98765-4321";
export const FONE_NORM = "5511987654321";
export const EM_HASH = "1083725db8579fe42238271c66396c52ffe016d6c322135cbd46835f9036ee5c";
export const PH_HASH = "029c7290f14c4516673508635f0519db95f7daf42057fd0e4ad1de84c5408a66";
