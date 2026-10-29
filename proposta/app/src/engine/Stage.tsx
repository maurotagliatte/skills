"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { usePlayback } from "./playback";

/** Um enquadramento da câmera: centro (x, y) no mundo e zoom relativo ao "fit" 1440×900. */
export type Shot = {
  x: number;
  y: number;
  zoom: number;
  /** duração do movimento até este enquadramento (s) */
  dur?: number;
  /** tempo parado depois de chegar (s) */
  hold?: number;
  ease?: string;
  /** disparado quando a câmera começa a ir para este enquadramento */
  cue?: string;
};

export type StageHandle = {
  /** move a câmera fora do roteiro (fases ao vivo) */
  goTo: (shot: Shot) => Promise<void>;
};

type Props = {
  width: number;
  height: number;
  shots: Shot[];
  /** roda o roteiro de câmera; false = câmera parada no primeiro enquadramento */
  running: boolean;
  onCue?: (cue: string) => void;
  onEnd?: () => void;
  children: React.ReactNode;
};

const DESIGN_W = 1440;
const DESIGN_H = 900;

type Box = { x: number; y: number; w: number; h: number };

/**
 * Enquadra uma caixa do mundo. `region` reserva o lado direito da tela para os cards
 * (a caixa ocupa os 68% da esquerda), como nas fases de interação.
 */
export function frame(box: Box, opts: Omit<Shot, "x" | "y" | "zoom"> & { pad?: number; region?: "full" | "left" } = {}): Shot {
  const { pad = 80, region = "full", ...rest } = opts;
  const areaW = region === "left" ? DESIGN_W * 0.68 : DESIGN_W;
  const zoom = Math.min((areaW - pad) / box.w, (DESIGN_H - pad - 100) / box.h);
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  // desloca o centro para a caixa cair no centro da área útil
  const offset = region === "left" ? (DESIGN_W / 2 - areaW / 2 - 20) / zoom : 0;
  return { x: cx + offset, y: cy, zoom, ...rest };
}

export const Stage = forwardRef<StageHandle, Props>(function Stage(
  { width, height, shots, running, onCue, onEnd, children },
  ref,
) {
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const cam = useRef({ x: shots[0]?.x ?? width / 2, y: shots[0]?.y ?? height / 2, zoom: shots[0]?.zoom ?? 1 });
  const tl = useRef<gsap.core.Timeline | null>(null);
  const last = useRef({ x: 0, y: 0 });
  const { paused } = usePlayback();
  const cbs = useRef({ onCue, onEnd });
  cbs.current = { onCue, onEnd };

  const apply = () => {
    const vp = viewport.current;
    const w = world.current;
    if (!vp || !w) return;
    const vw = vp.clientWidth;
    const vh = vp.clientHeight;
    const fit = Math.min(vw / DESIGN_W, vh / DESIGN_H);
    const s = cam.current.zoom * fit;
    const tx = vw / 2 - cam.current.x * s;
    const ty = vh / 2 - cam.current.y * s;
    // motion blur proporcional à velocidade, como no vídeo de referência
    const speed = Math.hypot(tx - last.current.x, ty - last.current.y);
    last.current = { x: tx, y: ty };
    const blur = Math.min(speed * 0.06, 10);
    w.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`;
    w.style.filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "none";
  };

  useLayoutEffect(() => {
    apply();
    const ro = new ResizeObserver(apply);
    if (viewport.current) ro.observe(viewport.current);
    const ticker = () => {
      // zera o blur quando a câmera para
      if (world.current && !gsap.isTweening(cam.current)) apply();
    };
    gsap.ticker.add(ticker);
    return () => {
      ro.disconnect();
      gsap.ticker.remove(ticker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!running) return;
    const t = gsap.timeline({ onComplete: () => cbs.current.onEnd?.() });
    shots.forEach((shot, i) => {
      if (shot.cue) t.call(() => cbs.current.onCue?.(shot.cue!));
      if (i === 0) {
        Object.assign(cam.current, { x: shot.x, y: shot.y, zoom: shot.zoom });
        apply();
      } else {
        t.to(cam.current, {
          x: shot.x,
          y: shot.y,
          zoom: shot.zoom,
          duration: shot.dur ?? 1.6,
          ease: shot.ease ?? "power3.inOut",
          onUpdate: apply,
        });
      }
      if (shot.hold) t.to({}, { duration: shot.hold });
    });
    tl.current = t;
    return () => {
      t.kill();
      tl.current = null;
    };
    // o roteiro é estático por capítulo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useLayoutEffect(() => {
    if (paused) tl.current?.pause();
    else tl.current?.resume();
  }, [paused]);

  useImperativeHandle(ref, () => ({
    goTo: (shot) =>
      new Promise<void>((resolve) => {
        gsap.to(cam.current, {
          x: shot.x,
          y: shot.y,
          zoom: shot.zoom,
          duration: shot.dur ?? 1.4,
          ease: shot.ease ?? "power3.inOut",
          onUpdate: apply,
          onComplete: () => resolve(),
        });
      }),
  }));

  return (
    <div ref={viewport} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        ref={world}
        style={{ position: "absolute", left: 0, top: 0, width, height, transformOrigin: "0 0", willChange: "transform, filter" }}
      >
        {children}
      </div>
    </div>
  );
});
