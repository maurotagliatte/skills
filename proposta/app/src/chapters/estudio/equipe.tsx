"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/kit";

/** Especialistas que a Donna chama. Cores dos cursores (Plane real-time grid / pen.dev Swarm). */
export const EQUIPE = {
  Donna: { color: "var(--k-red)", papel: "orquestra" },
  Designer: { color: "#6e56cf", papel: "foto, cores e marca" },
  Redatora: { color: "#0b7fab", papel: "títulos e textos" },
  Diagramadora: { color: "#c77c02", papel: "grid, página e hierarquia" },
} as const;
export type Membro = keyof typeof EQUIPE;

/**
 * Revela itens um a um (camadas, seções, slides), mesmo quando os args chegam rápido.
 * `available` = quantos itens já existem nos args; o contador avança um a cada `ms`.
 */
export function useReveal(available: number, ms: number, active = true, key: string | number = 0) {
  const [st, setSt] = useState({ key, n: 0 });
  const n = st.key === key ? st.n : 0;
  useEffect(() => {
    if (!active || n >= available) return;
    const t = setTimeout(() => setSt({ key, n: n + 1 }), n === 0 ? ms * 0.4 : ms);
    return () => clearTimeout(t);
  }, [n, available, ms, active, key]);
  return active ? Math.min(n, available) : 0;
}

export type Status = { who: Membro; text: string; state: "aguardando" | "trabalhando" | "pronto" };

/** Linha de agente especialista (mesma gramática do AgentRow do kit, com a cor do cursor). */
export function SpecRow({ s, dark }: { s: Status; dark?: boolean }) {
  const st = { aguardando: { c: dark ? "var(--text-inv-2)" : "var(--text-3)", t: "na fila" }, trabalhando: { c: "var(--amber)", t: "trabalhando…" }, pronto: { c: dark ? "#7ee2a8" : "var(--green)", t: "pronto" } }[
    s.state
  ];
  return (
    <div style={{ display: "flex", gap: 10, padding: "8px 0", opacity: s.state === "aguardando" ? 0.6 : 1, transition: "opacity .4s" }}>
      <Avatar name={s.who} color={EQUIPE[s.who].color} size={22} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <b style={{ fontWeight: 600 }}>{s.who}</b>
          <span
            className="mono"
            style={{
              fontSize: 9,
              letterSpacing: "0.06em",
              padding: "1px 5px",
              borderRadius: 4,
              background: dark ? "var(--dark-3)" : "#f1f1f1",
              color: dark ? "var(--text-inv-2)" : "var(--text-2)",
              border: `1px solid ${dark ? "var(--border-dark)" : "var(--border)"}`,
            }}
          >
            AGENTE
          </span>
          <span style={{ color: st.c, fontWeight: 500, marginLeft: "auto", whiteSpace: "nowrap" }}>{st.t}</span>
        </div>
        <div style={{ marginTop: 2, color: dark ? "var(--text-inv-2)" : "var(--text-2)" }}>{s.text}</div>
      </div>
    </div>
  );
}
