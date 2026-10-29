"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

/** Camada fixa sobre o palco para os cards de interação, ao vivo e escopo (lado direito). */
export function Overlay({ show, children, side = "right" }: { show: boolean; children: ReactNode; side?: "right" | "center" }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            zIndex: 30,
            top: "50%",
            ...(side === "right" ? { right: "max(40px, 4vw)" } : { left: "50%" }),
            translate: side === "right" ? "0 -50%" : "-50% -50%",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Texto grande no mundo (estilo seção escura das LPs da Plane). */
export function Caption({
  x,
  y,
  w = 900,
  eyebrow,
  title,
  sub,
  show = true,
  light,
}: {
  x: number;
  y: number;
  w?: number;
  eyebrow?: string;
  title: string;
  sub?: string;
  show?: boolean;
  light?: boolean;
}) {
  return (
    <motion.div
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 20 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "absolute", left: x, top: y, width: w, color: light ? "var(--text-1)" : "var(--text-inv)" }}
    >
      {eyebrow && (
        <div className="eyebrow" style={{ marginBottom: 14, fontSize: 13 }}>
          {eyebrow}
        </div>
      )}
      <div className="display" style={{ fontSize: 58, whiteSpace: "pre-line" }}>
        {title}
      </div>
      {sub && <div style={{ marginTop: 16, fontSize: 18, lineHeight: 1.5, color: light ? "var(--text-2)" : "var(--text-inv-2)", maxWidth: 640 }}>{sub}</div>}
    </motion.div>
  );
}

/** Etiqueta "Ao vivo" / "Exemplo" — sempre honesta sobre o que está rodando. */
export function ModeTag({ mode }: { mode: "live" | "demo" | undefined }) {
  if (!mode) return null;
  const live = mode === "live";
  return (
    <span
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: live ? "#7ee2a8" : "var(--text-inv-2)",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 9, background: live ? "#2fd27a" : "var(--k-gray)" }} />
      {live ? "Agente ao vivo" : "Resposta de exemplo"}
    </span>
  );
}
