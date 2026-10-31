/** Datas da agenda (usadas no servidor, pelo roteiro de exemplo, e no navegador, pela grade). */

export const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"] as const;
const SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const zero = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const somaDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** "na quinta" = a próxima quinta-feira (se hoje é quinta, a da semana que vem). */
export function proximaQuinta(hoje = new Date()) {
  const d = zero(hoje);
  const falta = (4 - d.getDay() + 7) % 7 || 7;
  return somaDias(d, falta);
}

/** segunda-feira da semana de `d` */
export const segundaDa = (d: Date) => somaDias(zero(d), -((d.getDay() + 6) % 7));

export const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
export const fmtCurta = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
export const diaDaSemana = (d: Date) => SEMANA[d.getDay()];

export function parseData(s?: string) {
  const m = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : undefined;
}

/** índice 0–4 (segunda–sexta) a partir de "quinta", "Quinta-feira", "qui"… */
export function diaIndex(dia?: string) {
  const k = dia?.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").slice(0, 3);
  const i = ["seg", "ter", "qua", "qui", "sex"].indexOf(k ?? "");
  return i < 0 ? undefined : i;
}

/** "09:00" / "9h30" → 9.5 */
export function hora(s?: string) {
  const m = s?.match(/^(\d{1,2})(?:[:h](\d{2}))?/);
  if (!m) return undefined;
  return Number(m[1]) + (m[2] ? Number(m[2]) / 60 : 0);
}
