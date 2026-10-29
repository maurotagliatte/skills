"use client";

import { useEffect, useMemo, useState } from "react";
import { IconBold, IconItalic, IconCurrencyReal, IconAlignLeft, IconTable, IconPercentage } from "@tabler/icons-react";
import { usePlayback } from "@/engine/playback";

/** Planilha genérica (sem marca) sendo digitada à mão, célula a célula, com um erro corrigido. */

const COLS = ["Data", "Fornecedor", "Descrição", "Vencimento", "Valor (R$)", "Pago?"];
const WIDTHS = [86, 210, 250, 104, 112, 70];
const ROWS: string[][] = [
  ["03/10", "VetPharma Distrib.", "anti-inflam. + seringas", "05/11", "1.642,30", "sim"],
  ["08/10", "Energia", "baias/galpão out", "13/11", "1.118,40", "não"],
  ["12/10", "Aluguel consult.", "nov", "20/11", "3.200,00", "não"],
  ["21/10", "Contab. Prado&Lima", "honorários out", "25/11", "890,00", "não"],
];

type Frame = { cell: number; value: string; error?: boolean };

/** a fita de digitação: um quadro por tecla */
function tape(): Frame[] {
  const out: Frame[] = [];
  const typed = ["", "", "", "", "", ""];
  const type = (cell: number, text: string, error?: boolean) => {
    for (const ch of text) {
      typed[cell] += ch;
      out.push({ cell, value: typed[cell], error });
    }
  };
  const hold = (cell: number, n: number, error?: boolean) => {
    for (let i = 0; i < n; i++) out.push({ cell, value: typed[cell], error });
  };
  const erase = (cell: number, n: number) => {
    for (let i = 0; i < n; i++) {
      typed[cell] = typed[cell].slice(0, -1);
      out.push({ cell, value: typed[cell], error: true });
    }
  };
  type(0, "30/10");
  hold(0, 3);
  type(1, "Casa do Cavalo Agrop.");
  hold(1, 3);
  type(2, "ração 18sc + suplem.");
  hold(2, 3);
  type(3, "13/11");
  hold(3, 3);
  type(4, "2.430,00");
  hold(4, 8, true);
  erase(4, 6);
  type(4, "340,00");
  hold(4, 4);
  type(5, "não");
  hold(5, 30);
  return out;
}

export function Sheet({ playing }: { playing: boolean }) {
  const frames = useMemo(tape, []);
  const [i, setI] = useState(0);
  const { paused } = usePlayback();

  useEffect(() => {
    if (!playing || paused) return;
    const t = setInterval(() => setI((n) => Math.min(n + 1, frames.length - 1)), 52);
    return () => clearInterval(t);
  }, [playing, paused, frames.length]);

  // valores de cada célula da linha nova até o quadro atual
  const current = frames[i];
  const row = ["", "", "", "", "", ""];
  for (let k = 0; k <= i; k++) row[frames[k].cell] = frames[k].value;
  const fixed = current.cell === 4 && !current.error && row[4] === "2.340,00";
  const ref = `${"ABCDEF"[current.cell]}6`;

  const grid = WIDTHS.map((w) => `${w}px`).join(" ");
  const cell = (c: number, active: boolean, error?: boolean): React.CSSProperties => ({
    height: 34,
    padding: "0 8px",
    display: "flex",
    alignItems: "center",
    justifyContent: c === 4 ? "flex-end" : "flex-start",
    borderRight: "1px solid #e3e3e3",
    borderBottom: "1px solid #e3e3e3",
    whiteSpace: "nowrap",
    overflow: "hidden",
    position: "relative",
    outline: active ? `2px solid ${error ? "var(--k-red)" : "#3a3d40"}` : undefined,
    outlineOffset: -2,
    background: error ? "var(--k-red-soft)" : active ? "#fafafa" : undefined,
    fontVariantNumeric: "tabular-nums",
  });

  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "var(--shadow-window)", display: "grid", gridTemplateRows: "40px 38px 34px 1fr 32px", color: "var(--text-1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px", borderBottom: "1px solid #ececec", background: "#f7f7f7" }}>
        <IconTable size={16} color="var(--text-3)" />
        <span style={{ fontWeight: 500 }}>contas_a_pagar_2026_FINAL (2).xlsx</span>
        <span style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: 12 }}>alterações não salvas</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 14px", borderBottom: "1px solid #ececec", color: "var(--text-3)" }}>
        {[IconBold, IconItalic, IconAlignLeft, IconCurrencyReal, IconPercentage].map((I, k) => (
          <I key={k} size={15} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "56px 1fr", alignItems: "center", borderBottom: "1px solid #ececec", fontSize: 12 }}>
        <span className="mono" style={{ textAlign: "center", color: "var(--text-2)", borderRight: "1px solid #ececec", height: "100%", display: "grid", placeItems: "center" }}>
          {ref}
        </span>
        <span style={{ padding: "0 10px", color: "var(--text-2)" }}>
          <i style={{ color: "var(--text-3)", marginRight: 8 }}>fx</i>
          {current.value}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `36px ${grid}`, alignContent: "start", fontSize: 13 }}>
        <span style={{ ...cell(-1, false), background: "#f3f3f3" }} />
        {"ABCDEF".split("").map((l) => (
          <span key={l} style={{ ...cell(-1, false), background: "#f3f3f3", justifyContent: "center", color: "var(--text-3)", fontSize: 11 }}>
            {l}
          </span>
        ))}
        <span style={{ ...cell(-1, false), background: "#f3f3f3", justifyContent: "center", color: "var(--text-3)", fontSize: 11 }}>1</span>
        {COLS.map((c, k) => (
          <span key={c} style={{ ...cell(k, false), fontWeight: 600 }}>
            {c}
          </span>
        ))}
        {ROWS.map((r, n) => (
          <Row key={n} n={n + 2} values={r} cell={cell} />
        ))}
        <span style={{ ...cell(-1, false), background: "#f3f3f3", justifyContent: "center", color: "var(--text-3)", fontSize: 11 }}>6</span>
        {row.map((v, k) => {
          const active = k === current.cell;
          return (
            <span key={k} style={cell(k, active, active && current.error)}>
              {v}
              {active && <span className="caret" style={{ width: 1.5, height: 16, background: "var(--text-1)", marginLeft: 1, animation: "sheetCaret 1s steps(2) infinite" }} />}
              {k === 4 && fixed && <span style={{ position: "absolute", left: 8, color: "var(--text-3)", fontSize: 11 }}>corrigido</span>}
            </span>
          );
        })}
        {[7, 8, 9, 10].map((n) => (
          <Row key={n} n={n} values={["", "", "", "", "", ""]} cell={cell} />
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 14px", borderTop: "1px solid #ececec", background: "#f7f7f7", color: "var(--text-3)", fontSize: 12 }}>
        <span style={{ color: "var(--text-1)", fontWeight: 500, borderBottom: "2px solid var(--text-1)", height: "100%", display: "flex", alignItems: "center" }}>Outubro</span>
        <span>Setembro</span>
        <span>Agosto</span>
        <span style={{ marginLeft: "auto" }}>37 lançamentos digitados este mês</span>
      </div>
      <style>{`@keyframes sheetCaret { 0% { opacity: 1 } 100% { opacity: 0 } }`}</style>
    </div>
  );
}

function Row({ n, values, cell }: { n: number; values: string[]; cell: (c: number, a: boolean, e?: boolean) => React.CSSProperties }) {
  return (
    <>
      <span style={{ ...cell(-1, false), background: "#f3f3f3", justifyContent: "center", color: "var(--text-3)", fontSize: 11 }}>{n}</span>
      {values.map((v, k) => (
        <span key={k} style={cell(k, false)}>
          {v}
        </span>
      ))}
    </>
  );
}
