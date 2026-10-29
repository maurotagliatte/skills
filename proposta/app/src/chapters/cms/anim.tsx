"use client";

import { useEffect, useRef, useState } from "react";

/** Número que desliza até o alvo (easeOutCubic) — usado nos totais do simulador. */
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

export function N({ v, fmt, ms }: { v: number; fmt: (n: number) => string; ms?: number }) {
  const a = useCountUp(v, ms);
  return <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(a)}</span>;
}

/** Texto que se escreve caractere a caractere (para quando o valor chega inteiro). */
export function useTyped(text: string | undefined, cps = 60) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!text) {
      setN(0);
      return;
    }
    const id = setInterval(() => setN((k) => (k >= text.length ? k : k + 2)), 1000 / cps);
    return () => clearInterval(id);
  }, [text, cps]);
  return text ? text.slice(0, n) : "";
}

/** Contador de passos com intervalo fixo enquanto `on`. */
export function useSteps(on: boolean, total: number, ms: number) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!on) return;
    if (step >= total) return;
    const t = setTimeout(() => setStep((s) => s + 1), ms);
    return () => clearTimeout(t);
  }, [on, step, total, ms]);
  return step;
}
