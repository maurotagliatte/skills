/** Datas da agenda (usadas no servidor, pelo roteiro de exemplo, e no navegador, pela grade). */

export const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"] as const;
const SEMANA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

export const somaDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

/** A semana da cena: a mesma do atendimento do Trovão (segunda, 09/11/2026). */
export const SEGUNDA = new Date(2026, 10, 9);

export const fmt = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
export const fmtCurta = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
export const diaDaSemana = (d: Date) => SEMANA[d.getDay()];

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

/** "14:00" → "14h", "09:30" → "9h30" */
export const horaCurta = (s?: string) => (s ? s.replace(/^0/, "").replace(":00", "h").replace(":", "h") : "");
