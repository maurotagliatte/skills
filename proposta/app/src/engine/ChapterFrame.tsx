"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import SplitText from "@/kit/rb/SplitText/SplitText";

/**
 * Camada fixa sobre o palco para os cards de interação, ao vivo e escopo (lado direito).
 * Em telas baixas o card encolhe (--ui-scale) e rola por dentro; no celular em pé vira uma
 * folha presa embaixo, na largura da tela (ver .k-overlay em globals.css).
 */
export function Overlay({ show, children, side = "right" }: { show: boolean; children: ReactNode; side?: "right" | "center" }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="k-overlay"
          data-side={side}
          style={{
            position: "absolute",
            zIndex: 30,
            top: "50%",
            ...(side === "right" ? { right: "max(40px, 4vw)" } : { left: "50%" }),
            translate: side === "right" ? "0 -50%" : "-50% -50%",
          }}
        >
          <div className="k-overlay-body">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* Entrada do título: cada linha sobe de dentro de uma máscara com um leve giro 3D (cilindro curto). */
const LINE_FROM = { yPercent: 105, rotationX: -38, transformPerspective: 700, transformOrigin: "50% 0%" };
const LINE_TO = { yPercent: 0, rotationX: 0 };
const LINE_DUR = 0.65;
const LINE_STAGGER = 0.09;

/**
 * Título de cena que entra linha a linha (máscara + giro, 650 ms, 90 ms entre linhas).
 * Quebras explícitas com "\n"; linhas longas que quebram sozinhas também entram uma a uma.
 * Só para títulos: o corpo entra depois, só com opacidade.
 */
export function SceneTitle({ text, show = true, size = 56, delay = 0, className = "display" }: { text: string; show?: boolean; size?: number; delay?: number; className?: string }) {
  const lines = text.split("\n");
  // cada vez que volta a aparecer, a entrada recomeça
  const [round, setRound] = useState(0);
  const was = useRef(show);
  useEffect(() => {
    if (show && !was.current) setRound((r) => r + 1);
    was.current = show;
  }, [show]);
  return (
    <div className={className} style={{ fontSize: size, lineHeight: 1.08 }}>
      {lines.map((line, i) =>
        show ? (
          <div key={`${round}-${i}`} style={{ display: "flex" }}>
            <SplitText
              text={line}
              tag="span"
              textAlign="left"
              splitType="lines"
              mask
              trigger="load"
              from={LINE_FROM}
              to={LINE_TO}
              duration={LINE_DUR}
              ease="expo.out"
              delay={LINE_STAGGER * 1000}
              startDelay={delay + i * LINE_STAGGER}
            />
          </div>
        ) : (
          <div key={`h-${i}`} style={{ opacity: 0 }}>
            {line}
          </div>
        ),
      )}
    </div>
  );
}

/** Quanto o título leva para assentar (s) — para encadear o corpo e outros elementos. */
export const titleDuration = (text: string) => LINE_DUR + (text.split("\n").length - 1) * LINE_STAGGER;

/** Texto grande no mundo (régua das LPs da Plane): um título dominante, corpo de 17 px logo abaixo. */
export function Caption({
  x,
  y,
  w = 900,
  eyebrow,
  title,
  sub,
  show = true,
  light,
  size = 56,
}: {
  x: number;
  y: number;
  w?: number;
  /** no máximo um rótulo pequeno por cena */
  eyebrow?: string;
  title: string;
  sub?: string;
  show?: boolean;
  light?: boolean;
  /** tamanho do título (px no mundo); régua 44–64 */
  size?: number;
}) {
  const settle = titleDuration(title);
  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: show ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{ position: "absolute", left: x, top: y, width: w, color: light ? "var(--text-1)" : "var(--text-inv)" }}
    >
      {eyebrow && (
        <motion.div
          className="eyebrow"
          initial={false}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 16, fontSize: 13 }}
        >
          {eyebrow}
        </motion.div>
      )}
      <SceneTitle text={title} show={show} size={size} />
      {sub && (
        <motion.div
          initial={false}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: 0.5, delay: show ? settle * 0.6 + 0.12 : 0 }}
          style={{ marginTop: 18, fontSize: 17, lineHeight: 1.5, color: light ? "var(--text-2)" : "var(--text-inv-2)", maxWidth: 640 }}
        >
          {sub}
        </motion.div>
      )}
    </motion.div>
  );
}
