import gsap from "gsap";

/**
 * Relógio da proposta: pausar congela tudo o que anda sozinho, não só a câmera.
 * - timelines e tweens do GSAP (câmera, celular do Atendimento, ondas) pela timeline global;
 * - as etapas com hora marcada (`later`/`every`), que substituem setTimeout/setInterval nos capítulos;
 * - a chegada dos eventos da Donna (useAgent segura e entrega ao retomar).
 * Animações curtas do motion e transições CSS não param: duram menos que um toque.
 */

type Timer = { fn: () => void; due: number; left: number; handle: ReturnType<typeof setTimeout> | null; every?: number };

let paused = false;
let seq = 0;
const timers = new Map<number, Timer>();
const listeners = new Set<(paused: boolean) => void>();

function arm(id: number, t: Timer) {
  t.due = performance.now() + t.left;
  t.handle = setTimeout(() => {
    if (t.every) {
      t.left = t.every;
      arm(id, t);
    } else timers.delete(id);
    t.fn();
  }, t.left);
}

/** setTimeout que respeita a pausa da proposta. */
export function later(fn: () => void, ms: number) {
  const id = ++seq;
  const t: Timer = { fn, due: 0, left: Math.max(0, ms), handle: null };
  timers.set(id, t);
  if (!paused) arm(id, t);
  return id;
}

/** setInterval que respeita a pausa da proposta. */
export function every(fn: () => void, ms: number) {
  const id = ++seq;
  const t: Timer = { fn, due: 0, left: ms, handle: null, every: ms };
  timers.set(id, t);
  if (!paused) arm(id, t);
  return id;
}

export function cancel(id: number | undefined) {
  if (id === undefined) return;
  const t = timers.get(id);
  if (t?.handle) clearTimeout(t.handle);
  timers.delete(id);
}

/** Espera `ms` no relógio da proposta (para fluxos async). */
export const wait = (ms: number) => new Promise<void>((r) => later(r, ms));

export function setPaused(p: boolean) {
  if (p === paused) return;
  paused = p;
  const now = performance.now();
  timers.forEach((t, id) => {
    if (p) {
      if (t.handle) clearTimeout(t.handle);
      t.handle = null;
      t.left = Math.max(0, t.due - now);
    } else arm(id, t);
  });
  if (p) gsap.globalTimeline.pause();
  else gsap.globalTimeline.resume();
  listeners.forEach((l) => l(p));
}

export const isPaused = () => paused;

export function onPauseChange(fn: (paused: boolean) => void) {
  listeners.add(fn);
  return () => void listeners.delete(fn);
}
