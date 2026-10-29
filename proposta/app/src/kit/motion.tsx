"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/* ——— Valores que chegam do agente ——— */

export type VProps = {
  /** valor; enquanto não chega, mostra uma barra de espera */
  v?: string;
  /** largura da barra de espera (px) */
  w?: number;
  /** altura da barra de espera (px) */
  h?: number;
  /** cor da barra de espera */
  bg?: string;
};

/** Valor que aparece com fade + desfoque quando chega do agente (args parciais). */
export function V({ v, w = 100, h = 10, bg = "#eceeee" }: VProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {v ? (
        <motion.span key="v" initial={{ opacity: 0, filter: "blur(6px)", y: 3 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.45 }}>
          {v}
        </motion.span>
      ) : (
        <motion.span key="s" exit={{ opacity: 0 }} style={{ display: "inline-block", width: w, height: h, borderRadius: 4, background: bg, verticalAlign: "middle" }} />
      )}
    </AnimatePresence>
  );
}

/* ——— Contador animado ——— */

/** Número que desliza do valor anterior até o alvo (easeOutCubic). */
export function useCountUp(target: number, ms = 520) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  const cur = useRef(target);
  useEffect(() => {
    from.current = cur.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      cur.current = from.current + (target - from.current) * e;
      setV(cur.current);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

/** Número animado, em algarismos tabulares. `fmt` recebe o valor intermediário (não arredondado). */
export function CountUp({ v, fmt, ms }: { v: number; fmt: (n: number) => string; ms?: number }) {
  const a = useCountUp(v, ms);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(a)}</span>;
}

/* ——— Revelar um a um ——— */

export type RevealOptions = {
  /** false = não avança e devolve 0 (default true) */
  active?: boolean;
  /** trocar a chave recomeça do zero (ex.: um novo pedido ao agente) */
  key?: string | number;
  /** fração de `ms` antes do primeiro item (default 1) */
  lead?: number;
};

/**
 * Revela itens um a um (linhas, camadas, slides, resultados), num ritmo fixo de `ms`,
 * mesmo quando os args do agente chegam todos de uma vez.
 * `available` = quantos itens já existem; devolve quantos mostrar (0…available).
 */
export function useReveal(available: number, ms: number, { active = true, key = 0, lead = 1 }: RevealOptions = {}) {
  const [st, setSt] = useState({ key, n: 0 });
  const n = st.key === key ? st.n : 0;
  useEffect(() => {
    if (!active || n >= available) return;
    const t = setTimeout(() => setSt({ key, n: n + 1 }), n === 0 ? ms * lead : ms);
    return () => clearTimeout(t);
  }, [n, available, ms, active, key, lead]);
  return active ? Math.min(n, available) : 0;
}
