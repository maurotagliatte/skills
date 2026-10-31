"use client";

import type { AgentState } from "@/kit";

/** Especialistas que a Donna chama. Cores dos cursores (Plane real-time grid / pen.dev Swarm). */
export const EQUIPE = {
  Donna: { color: "var(--k-red)", papel: "orquestra" },
  Designer: { color: "#6e56cf", papel: "foto, cores e marca" },
  Redatora: { color: "#0b7fab", papel: "títulos e textos" },
  Diagramadora: { color: "#c77c02", papel: "grid, página e hierarquia" },
} as const;
export type Membro = keyof typeof EQUIPE;

export type Status = { who: Membro; text: string; state: AgentState };
