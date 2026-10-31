"use client";

import { createContext, useContext } from "react";

/** Fundo do palco. "light" = campo claro da régua Plane (#eff0f0), para pelo menos um capítulo. */
export type Tone = "dark" | "light";

export const TONE_BG: Record<Tone, string> = { dark: "var(--stage)", light: "var(--canvas-light)" };

/**
 * Passagem entre capítulos (lida pelo Stage). O objeto é estável e mora acima do AnimatePresence,
 * então o capítulo que está saindo lê a direção atual, não a do momento em que montou.
 * dir: 1 = avançando, -1 = voltando. first: true só no primeiro capítulo da sessão (sem entrada).
 */
export type ChapterTransition = {
  dir: 1 | -1;
  first: boolean;
  /** o Stage avisa a casca qual é o tom do capítulo (cromo claro ou escuro) */
  setTone: (tone: Tone) => void;
};

export const TransitionContext = createContext<ChapterTransition>({ dir: 1, first: true, setTone: () => {} });

export const useChapterTransition = () => useContext(TransitionContext);

/** Duração da passagem (s). A saída e a entrada se sobrepõem; não há tela vazia entre elas. */
export const PASSAGE = { exit: 0.55, enter: 0.85 };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
