"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimate, useInView, useReducedMotion } from "motion/react";
import { IconBrandCloudflare, IconTag } from "@tabler/icons-react";

/**
 * Ícone Cloudflare (Tabler) com uma etiqueta de preço pendurada.
 * Entra balançando 1x ao aparecer e dá um leve balanço quando `pulse` muda.
 */
export function PriceTag({ label, pulse }: { label: string; pulse: unknown }) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const anchor = useRef<HTMLDivElement>(null);
  const inView = useInView(anchor, { once: true, amount: 0.5 });
  const entrou = useRef(false);

  // entrada: cai do prego e assenta com uma mola suave
  useEffect(() => {
    if (!inView || entrou.current || !scope.current) return;
    entrou.current = true;
    if (reduce) {
      animate(scope.current, { opacity: 1, rotate: 0, y: 0 }, { duration: 0 });
      return;
    }
    animate(scope.current, { opacity: [0, 1], y: [-6, 0], rotate: [-18, 0] }, { type: "spring", stiffness: 140, damping: 7, mass: 0.7 });
  }, [inView, reduce, animate, scope]);

  // sliders mudaram: um balanço curtinho
  const primeiro = useRef(true);
  useEffect(() => {
    if (primeiro.current) {
      primeiro.current = false;
      return;
    }
    if (reduce || !entrou.current || !scope.current) return;
    animate(scope.current, { rotate: [0, 7, -4, 2, 0] }, { duration: 0.9, ease: "easeOut" });
  }, [pulse, reduce, animate, scope]);

  return (
    <div ref={anchor} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 120 }} aria-label={`Cloudflare, ${label}`}>
      <IconBrandCloudflare size={46} stroke={1.4} color="var(--text-1)" aria-hidden />
      <motion.div
        ref={scope}
        initial={{ opacity: 0, rotate: -18, y: -6 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", transformOrigin: "50% 0%" }}
      >
        <span style={{ width: 1, height: 12, background: "var(--border-strong)" }} />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 12px 5px 9px",
            border: "1px solid var(--border-strong)",
            borderRadius: 8,
            background: "#fff",
            fontSize: 16,
            fontWeight: 500,
            color: "var(--text-1)",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
            boxShadow: "0 1px 2px rgba(0,0,0,.06)",
          }}
        >
          <IconTag size={16} stroke={2} color="var(--k-red)" aria-hidden />
          {label}
        </span>
      </motion.div>
    </div>
  );
}
