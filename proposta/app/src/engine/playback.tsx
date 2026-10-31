"use client";

import { createContext, useContext, useEffect, type RefObject } from "react";

/**
 * Estado da reprodução, um de três (ver docs/superpowers/specs/2026-10-30-…-design.md):
 * playing → a proposta anda sozinha (a barra enche);
 * waiting → a Donna pede algo: há um botão de avanço (`data-advance`) visível e ativo;
 * paused  → ela pausou (toque no palco ou espaço).
 */
export type PlayState = "playing" | "waiting" | "paused";

export type Playback = {
  paused: boolean;
  state: PlayState;
  /** registra um botão de avanço visível; devolve a função que o retira */
  registerAsk: (el: HTMLElement) => () => void;
};

export const PlaybackContext = createContext<Playback>({ paused: false, state: "playing", registerAsk: () => () => {} });

export const usePlayback = () => useContext(PlaybackContext);

/** Um botão de avanço ativo põe a proposta em "waiting" enquanto estiver montado. */
export function useAsk(ref: RefObject<HTMLElement | null>, active: boolean) {
  const { registerAsk } = usePlayback();
  useEffect(() => {
    const el = ref.current;
    if (!active || !el) return;
    return registerAsk(el);
  }, [active, ref, registerAsk]);
}

/* ——— Progresso do roteiro do capítulo (fora do React: muda a cada quadro) ——— */

/** 0…1 durante o roteiro de câmera do capítulo; null = sem duração conhecida (Donna, etapas). */
let sceneProgress: number | null = 0;
const progressListeners = new Set<(p: number | null) => void>();

export function setSceneProgress(p: number | null) {
  sceneProgress = p;
  progressListeners.forEach((l) => l(p));
}

export function onSceneProgress(fn: (p: number | null) => void) {
  progressListeners.add(fn);
  fn(sceneProgress);
  return () => void progressListeners.delete(fn);
}
