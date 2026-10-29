"use client";

import { motion } from "motion/react";
import { IconMessageCircle, IconPhoneCall, IconNote } from "@tabler/icons-react";

/** Os pedidos da semana, de onde vierem: mensagens, uma ligação, um bilhete e as notas. Sem marcas de aplicativo. */

type Item = { x: number; y: number; w: number; r: number; delay: number; node: React.ReactNode };

const card: React.CSSProperties = { background: "#fff", borderRadius: 14, boxShadow: "var(--shadow-window)", padding: "12px 14px", color: "var(--text-1)" };

function Msg({ from, text, time }: { from: string; text: string; time: string }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-3)", fontSize: 12, marginBottom: 6 }}>
        <IconMessageCircle size={14} /> <b style={{ color: "var(--text-1)", fontWeight: 600 }}>{from}</b>
        <span style={{ marginLeft: "auto" }}>{time}</span>
      </div>
      <div style={{ background: "#f2f3f3", borderRadius: "4px 12px 12px 12px", padding: "8px 10px", lineHeight: 1.45, fontSize: 14 }}>{text}</div>
    </div>
  );
}

const ITEMS: Item[] = [
  { x: 10, y: 10, w: 380, r: -2, delay: 0.1, node: <Msg from="Haras Boa Vista" time="sex 17:20" text="Dra., consegue ver os dois potros na terça à tarde? É o exame de compra." /> },
  { x: 430, y: 30, w: 400, r: 1.5, delay: 0.35, node: <Msg from="Marina Couto" time="sáb 10:05" text="Doutora, dá pra fazer o ultrassom da Pérola essa semana? Quinta à tarde seria ótimo." /> },
  {
    x: 30,
    y: 220,
    w: 240,
    r: -4,
    delay: 0.6,
    node: (
      <div style={{ ...card, background: "#fde9a6", borderRadius: 4, padding: "18px 18px 22px", fontFamily: "var(--font-mono)", fontSize: 15, lineHeight: 1.5, color: "#4a3b06" }}>
        contabilidade
        <br />
        sex 16h
        <br />
        fechamento do mês
      </div>
    ),
  },
  {
    x: 320,
    y: 250,
    w: 300,
    r: 2,
    delay: 0.85,
    node: (
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 99, background: "var(--sky-soft)", color: "var(--sky)", display: "grid", placeItems: "center" }}>
          <IconPhoneCall size={18} />
        </span>
        <span>
          <b style={{ fontWeight: 600 }}>Prado & Lima</b>
          <span style={{ display: "block", color: "var(--text-3)", fontSize: 12 }}>ligação · sex 11:30 · 3 min</span>
        </span>
      </div>
    ),
  },
  {
    x: 660,
    y: 230,
    w: 210,
    r: -1,
    delay: 1.1,
    node: (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, marginBottom: 6 }}>
          <IconNote size={15} /> Notas
        </div>
        <div style={{ color: "var(--text-2)", lineHeight: 1.55 }}>
          gravar aula 7
          <br />
          (uma manhã livre)
          <br />
          roteiro: tarso
        </div>
      </div>
    ),
  },
];

export function Scattered() {
  return (
    <div style={{ position: "absolute", left: 20, top: 40, width: 880, height: 480, transform: "scale(1.18)", transformOrigin: "0 0" }}>
      {ITEMS.map((it, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 24, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: it.r }}
          transition={{ delay: it.delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "absolute", left: it.x, top: it.y, width: it.w }}
        >
          {it.node}
        </motion.div>
      ))}
    </div>
  );
}
