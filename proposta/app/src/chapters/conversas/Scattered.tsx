"use client";

import { motion } from "motion/react";
import { IconMessageCircle, IconPhoneX, IconMicrophone } from "@tabler/icons-react";

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
  { x: 0, y: 0, w: 400, r: -1.5, delay: 0.1, node: <Msg from="Ricardo · Haras Santa Fé" time="08:12" text="Doutora, quando a gente reavalia o Trovão depois da infiltração?" /> },
  { x: 440, y: 22, w: 330, r: 2, delay: 0.3, node: <Msg from="Haras Boa Vista" time="08:40" text="Dra., consegue ver a Estrela segunda à tarde?" /> },
  { x: 20, y: 178, w: 330, r: 1.5, delay: 0.5, node: <Msg from="Lucas Prado" time="09:05" text="Qual o valor do curso? Tem turma este mês?" /> },
  { x: 390, y: 196, w: 330, r: -2, delay: 0.7, node: <Msg from="Grupo · internação Zarco" time="09:31" text="Como ele passou a noite?" /> },
  {
    x: 740,
    y: 168,
    w: 170,
    r: 4,
    delay: 0.9,
    node: (
      <div style={{ ...card, background: "#fde9a6", borderRadius: 4, padding: "16px 16px 20px", fontSize: 16, lineHeight: 1.5, color: "#4a3b06" }}>
        Pérola qui
        <br />
        ultrassom??
      </div>
    ),
  },
  {
    x: 40,
    y: 350,
    w: 300,
    r: -2,
    delay: 1.1,
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
    x: 380,
    y: 372,
    w: 320,
    r: 1.5,
    delay: 1.3,
    node: (
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 10 }}>
        <IconMicrophone size={16} color="var(--text-3)" />
        <span style={{ color: "var(--text-2)" }}>Áudio de 0:48 · Haras Boa Vista</span>
      </div>
    ),
  },
  {
    x: 730,
    y: 360,
    w: 170,
    r: -3,
    delay: 1.5,
    node: (
      <div style={{ ...card, textAlign: "center" }}>
        <div className="display" style={{ fontSize: 30, color: "var(--k-red)" }}>
          23
        </div>
        <div style={{ color: "var(--text-2)" }}>mensagens sem resposta</div>
      </div>
    ),
  },
];

export function Scattered() {
  return (
    <div style={{ position: "absolute", left: 20, top: 40, width: 910, height: 480, transform: "scale(1.16)", transformOrigin: "0 0" }}>
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
