"use client";

import { motion } from "motion/react";
import { IconMessageCircle, IconPhoneX, IconNote, IconMicrophone } from "@tabler/icons-react";

/** Horários espalhados: mensagens soltas, ligação perdida, post-it, notas. Sem marcas de aplicativo. */

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
  { x: 10, y: 10, w: 350, r: -2, delay: 0.1, node: <Msg from="Haras Boa Vista" time="14:12" text="Dra., consegue ver a Estrela segunda à tarde?" /> },
  { x: 410, y: 34, w: 420, r: 1.5, delay: 0.35, node: <Msg from="Ricardo · tutor do Trovão" time="ontem" text="Doutora, dá pra reavaliar o Trovão essa semana? Ele voltou a mancar." /> },
  {
    x: 30,
    y: 210,
    w: 240,
    r: -4,
    delay: 0.6,
    node: (
      <div style={{ ...card, background: "#fde9a6", borderRadius: 4, padding: "18px 18px 22px", fontFamily: "var(--font-mono)", fontSize: 15, lineHeight: 1.5, color: "#4a3b06" }}>
        ter 15h
        <br />
        exame de compra
        <br />
        Zarco — confirmar!!
      </div>
    ),
  },
  {
    x: 320,
    y: 240,
    w: 300,
    r: 2,
    delay: 0.85,
    node: (
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: 99, background: "var(--k-red-soft)", color: "var(--k-red)", display: "grid", placeItems: "center" }}>
          <IconPhoneX size={18} />
        </span>
        <span>
          <b style={{ fontWeight: 600 }}>Haras Santa Fé</b>
          <span style={{ display: "block", color: "var(--text-3)", fontSize: 12 }}>2 chamadas perdidas · 07:40</span>
        </span>
      </div>
    ),
  },
  {
    x: 660,
    y: 200,
    w: 210,
    r: -1,
    delay: 1.1,
    node: (
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, marginBottom: 6 }}>
          <IconNote size={15} /> Notas
        </div>
        <div style={{ color: "var(--text-2)", lineHeight: 1.55 }}>
          gravar aula 7 (ter manhã?)
          <br />
          contabilidade sex 16h
          <br />
          <s>Pérola qui</s> → qui 13h30
        </div>
      </div>
    ),
  },
  {
    x: 280,
    y: 390,
    w: 300,
    r: -2.5,
    delay: 1.35,
    node: (
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 10 }}>
        <IconMicrophone size={16} color="var(--text-3)" />
        <span style={{ color: "var(--text-2)" }}>Áudio de 0:48 · Haras Boa Vista</span>
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
