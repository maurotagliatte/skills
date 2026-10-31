"use client";

import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { useIsPresent } from "motion/react";
import gsap from "gsap";
import { setSceneProgress, usePlayback } from "./playback";
import { PASSAGE, TONE_BG, prefersReducedMotion, useChapterTransition, type Tone } from "./transition";

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
  /** fundo do palco: "dark" (padrão, o preto da casca) ou "light" (#eff0f0, cromo escuro) */
  tone?: Tone;
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

/** Motion blur da câmera só onde há GPU folgada: ponteiro fino (desktop) e sem "reduzir movimento". */
const canMotionBlur = () =>
  typeof window !== "undefined" && !prefersReducedMotion() && !!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

export const Stage = forwardRef<StageHandle, Props>(function Stage(
  { width, height, shots, running, onCue, onEnd, tone = "dark", children },
  ref,
) {
  const passage = useChapterTransition();
  const present = useIsPresent();
  // entrada pendente: decidida uma vez na montagem (resiste ao duplo efeito do StrictMode)
  const entry = useRef<boolean | null>(null);
  if (entry.current === null) entry.current = !passage.first && !prefersReducedMotion();
  const viewport = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const cam = useRef({ x: shots[0]?.x ?? width / 2, y: shots[0]?.y ?? height / 2, zoom: shots[0]?.zoom ?? 1 });
  const tl = useRef<gsap.core.Timeline | null>(null);
  const last = useRef({ x: 0, y: 0 });
  // intensidade do motion blur (px de blur por px/quadro); menor na saída do capítulo
  const blurK = useRef(0.06);
  // o desfoque refaz a rasterização do mundo inteiro a cada quadro: só em desktop (mouse), nunca no toque
  const blurOn = useRef<boolean | null>(null);
  if (blurOn.current === null) blurOn.current = canMotionBlur();
  // último estilo escrito: o ticker roda a cada quadro e não deve reescrever o mesmo valor
  const written = useRef({ transform: "", filter: "" });
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
    // celular em pé: o mundo ocupa só uma faixa; sobe para o card (folha embaixo) não cobri-lo
    const ty = (vw <= 640 && vh > vw ? vh * 0.36 : vh / 2) - cam.current.y * s;
    // motion blur proporcional à velocidade, como no vídeo de referência
    const speed = Math.hypot(tx - last.current.x, ty - last.current.y);
    last.current = { x: tx, y: ty };
    const blur = blurOn.current ? Math.min(speed * blurK.current, 10) : 0;
    const transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
    const filter = blur > 0.4 ? `blur(${blur.toFixed(1)}px)` : "none";
    if (transform !== written.current.transform) w.style.transform = written.current.transform = transform;
    if (filter !== written.current.filter) w.style.filter = written.current.filter = filter;
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

  // a casca troca o cromo (logo, textos, botões) para o tom deste capítulo
  useLayoutEffect(() => {
    passage.setTone(tone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tone]);

  // saída: a câmera continua andando na direção da passagem (o capítulo seguinte entra pelo outro lado)
  useLayoutEffect(() => {
    if (present || prefersReducedMotion()) return;
    tl.current?.kill();
    blurK.current = 0.02;
    const zoom = cam.current.zoom;
    gsap.killTweensOf(cam.current);
    gsap.to(cam.current, {
      x: cam.current.x + (passage.dir * DESIGN_W * 0.34) / zoom,
      zoom: zoom * 1.05,
      duration: PASSAGE.exit,
      ease: "power2.in",
      onUpdate: apply,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present]);

  useLayoutEffect(() => {
    // entrada: o capítulo chega já em movimento, vindo do lado para onde o anterior foi
    const entering = !!entry.current && shots.length > 0;
    const done = () => {
      entry.current = false;
    };
    const s0 = shots[0];
    const offset = entering ? { x: s0.x - (passage.dir * DESIGN_W * 0.34) / s0.zoom, y: s0.y, zoom: s0.zoom * 0.95 } : null;
    if (!running) {
      setSceneProgress(null);
      if (offset) {
        Object.assign(cam.current, offset);
        apply();
        gsap.to(cam.current, { x: s0.x, y: s0.y, zoom: s0.zoom, duration: PASSAGE.enter, ease: "power3.out", onUpdate: apply, onComplete: done });
      }
      return;
    }
    const reduce = prefersReducedMotion();
    const t = gsap.timeline({
      // a barra do capítulo anda com o roteiro; depois dele, a duração é desconhecida
      onUpdate: () => setSceneProgress(t.progress()),
      onComplete: () => {
        setSceneProgress(null);
        cbs.current.onEnd?.();
      },
    });
    shots.forEach((shot, i) => {
      if (shot.cue) t.call(() => cbs.current.onCue?.(shot.cue!));
      if (i === 0) {
        if (offset) {
          Object.assign(cam.current, offset);
          apply();
          t.to(cam.current, { x: shot.x, y: shot.y, zoom: shot.zoom, duration: PASSAGE.enter, ease: "power3.out", onUpdate: apply, onComplete: done });
        } else {
          Object.assign(cam.current, { x: shot.x, y: shot.y, zoom: shot.zoom });
          apply();
        }
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
      // parada sem congelar: a câmera continua se aproximando bem devagar
      if (shot.hold) {
        if (reduce) t.to({}, { duration: shot.hold });
        else t.to(cam.current, { zoom: shot.zoom * (1 + 0.012 * Math.min(shot.hold, 4)), duration: shot.hold, ease: "sine.inOut", onUpdate: apply });
      }
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
    <div ref={viewport} style={{ position: "absolute", inset: 0, overflow: "hidden", background: tone === "light" ? TONE_BG.light : undefined }}>
      <div
        ref={world}
        style={{ position: "absolute", left: 0, top: 0, width, height, transformOrigin: "0 0", willChange: "transform" }}
      >
        {children}
      </div>
      <div className="k-stage-dim" />
    </div>
  );
});
