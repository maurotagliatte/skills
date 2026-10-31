"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled, IconLayoutList, IconX } from "@tabler/icons-react";
import { chapters } from "@/chapters";
import { BrandLogo } from "@/kit";
import { PlaybackContext, onSceneProgress, setSceneProgress, type PlayState } from "./playback";
import { setPaused as setClockPaused } from "./clock";

/** Toques nisto não pausam: são controles (botões, abas, a pilha de modelos…). */
const INTERACTIVE = "button, a, input, textarea, select, label, [role=slider], [role=tab], .stack-card, [data-interactive]";
import { PASSAGE, TONE_BG, TransitionContext, type ChapterTransition, type Tone } from "./transition";

/** Casca da proposta: cabeçalho, índice (barra + menu), teclado e a passagem entre capítulos. */
export function Proposal() {
  const [index, setIndex] = useState(0);
  const [tone, setTone] = useState<Tone>("dark");
  // ?c=<id> abre direto num capítulo (útil para revisar e para QA)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("c");
    const i = chapters.findIndex((c) => c.id === id);
    if (i > 0) setIndex(i);
  }, []);
  // telas baixas (celular deitado, notebook pequeno): os cards sobre o palco encolhem um pouco
  useEffect(() => {
    const fit = () => {
      const k = Math.min(window.innerHeight / 760, window.innerWidth / 1000, 1);
      document.documentElement.style.setProperty("--ui-scale", Math.max(0.82, k).toFixed(3));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);

  // botões de avanço visíveis (a Donna pedindo): com algum, a proposta está esperando por ela
  const asks = useRef(new Set<HTMLElement>()).current;
  const [askCount, setAskCount] = useState(0);
  const registerAsk = useCallback(
    (el: HTMLElement) => {
      asks.add(el);
      setAskCount(asks.size);
      return () => {
        asks.delete(el);
        setAskCount(asks.size);
      };
    },
    [asks],
  );
  const state: PlayState = paused ? "paused" : askCount > 0 ? "waiting" : "playing";
  useEffect(() => setClockPaused(paused), [paused]);

  // tocou fora do botão pedido: o botão reage (nunca "nada acontece")
  const nudge = useCallback(() => {
    asks.forEach((el) => {
      el.classList.remove("k-nudge");
      void el.offsetWidth;
      el.classList.add("k-nudge");
    });
  }, [asks]);

  // pausar/retomar mostra um ícone rápido no centro
  const [flash, setFlash] = useState<{ n: number; paused: boolean } | null>(null);
  const togglePause = useCallback(() => {
    setPaused((p) => {
      setFlash((f) => ({ n: (f?.n ?? 0) + 1, paused: !p }));
      return !p;
    });
  }, []);
  const chapter = chapters[index];

  // objeto estável acima do AnimatePresence: o capítulo que sai lê a direção atual
  const passage = useRef<ChapterTransition>({ dir: 1, first: true, setTone }).current;
  useEffect(() => {
    // filhos montam antes do pai: o primeiro capítulo já viu first = true
    passage.first = false;
  }, [passage]);

  const indexRef = useRef(index);
  indexRef.current = index;
  const go = useCallback(
    (i: number) => {
      const next = Math.max(0, Math.min(chapters.length - 1, i));
      const cur = indexRef.current;
      if (next !== cur) {
        passage.dir = next > cur ? 1 : -1;
        // capítulo sem Stage (em produção) volta ao escuro; o Stage do próximo ajusta se for claro
        setTone("dark");
        setSceneProgress(0);
        setIndex(next);
      }
      setMenu(false);
      setPaused(false);
    },
    [passage],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, [role=slider]")) return;
      // setas dentro de um componente com foco (pilha de modelos, abas) não trocam de capítulo
      if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && (e.target as HTMLElement) !== document.body) return;
      if (e.key === " ") {
        e.preventDefault();
        togglePause();
      } else if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go, togglePause]);

  // toque no palco: rodando → pausa/retoma; esperando → o botão pedido pulsa. Arrastar/rolar não conta.
  const down = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    down.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = down.current;
    down.current = null;
    if (!d || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || menu) return;
    const t = e.target as HTMLElement;
    if (t.closest(INTERACTIVE)) return;
    if (state === "waiting") nudge();
    else if (!t.closest(".k-overlay")) togglePause();
  };

  const light = tone === "light";
  const ink2 = light ? "var(--text-2)" : "var(--text-inv-2)";
  const playback = useMemo(() => ({ paused, state, registerAsk }), [paused, state, registerAsk]);
  // o cartão "Isso entra no projeto" fecha o capítulo: o trecho da barra fica cheio
  const closing = askCount > 0 && [...asks].some((el) => el.dataset.advance === "chapter");

  return (
    <PlaybackContext.Provider value={playback}>
      <TransitionContext.Provider value={passage}>
        <div
          data-chapter={chapter.id}
          data-tone={tone}
          data-play={state}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          style={{ position: "fixed", inset: 0, background: TONE_BG[tone], transition: "background-color .6s var(--ease-cam)", overflow: "hidden" }}
        >
          <AnimatePresence initial={false}>
            <ChapterLayer key={chapter.id}>
              <chapter.Component onNext={() => go(index + 1)} />
            </ChapterLayer>
          </AnimatePresence>

          <header
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 56,
              padding: "env(safe-area-inset-top) max(28px, env(safe-area-inset-right)) 0 max(28px, env(safe-area-inset-left))",
              display: "flex",
              alignItems: "center",
              zIndex: 40,
              pointerEvents: "none",
            }}
          >
            {/* a abertura já traz os dois logos na composição */}
            <span style={{ opacity: index === 0 ? 0 : 1, transition: "opacity .4s" }}>
              <BrandLogo brand="khard" height={24} />
            </span>
          </header>

          {/* índice funcional: nome do capítulo em tamanho de UI, junto da barra, e os controles */}
          <footer
            style={{
              position: "absolute",
              left: "max(28px, env(safe-area-inset-left))",
              right: "max(28px, env(safe-area-inset-right))",
              bottom: "calc(18px + env(safe-area-inset-bottom))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 40,
              pointerEvents: "none",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={chapter.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ fontSize: 14, color: ink2, transition: "color .6s" }}
              >
                {chapter.title}
              </motion.span>
            </AnimatePresence>
            <div style={{ display: "flex", gap: 8, pointerEvents: "auto" }}>
              <RoundBtn light={light} label="Capítulos" onClick={() => setMenu(true)}>
                <IconLayoutList size={16} />
              </RoundBtn>
            </div>
          </footer>

          {/* barra de progresso: cada trecho leva ao capítulo */}
          <nav aria-label="Progresso" className="k-progress" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, display: "flex", gap: 2, zIndex: 41 }}>
            {chapters.map((c, i) => (
              <button
                key={c.id}
                aria-label={`${c.number} · ${c.title}`}
                aria-current={i === index ? "step" : undefined}
                title={c.title}
                onClick={() => go(i)}
                style={{ flex: 1, height: "100%", padding: 0, border: 0, background: "none", display: "flex", alignItems: "flex-end" }}
              >
                <span
                  className="k-seg"
                  style={{ display: "block", position: "relative", width: "100%", height: 3, background: i < index ? "var(--k-red)" : light ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.1)" }}
                >
                  {i === index && <Fill key={c.id} state={state} closing={closing} />}
                </span>
              </button>
            ))}
          </nav>

          {/* pausou/retomou: ícone rápido no centro */}
          <AnimatePresence>
            {flash && (
              <motion.div
                key={flash.n}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.15 }}
                transition={{ duration: 0.22 }}
                onAnimationComplete={() => setFlash((f) => (f?.n === flash.n ? null : f))}
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  translate: "-50% -50%",
                  zIndex: 45,
                  width: 72,
                  height: 72,
                  borderRadius: 99,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(5,5,5,.55)",
                  color: "#fff",
                  pointerEvents: "none",
                }}
              >
                {flash.paused ? <IconPlayerPauseFilled size={28} /> : <IconPlayerPlayFilled size={28} />}
              </motion.div>
            )}
          </AnimatePresence>
          {/* pausado: fica dito na tela até ela retomar */}
          <AnimatePresence>
            {paused && (
              <motion.div
                role="status"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "calc(24px + env(safe-area-inset-bottom))",
                  translate: "-50% 0",
                  zIndex: 45,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: 99,
                  background: "rgba(5,5,5,.72)",
                  border: "1px solid var(--border-dark)",
                  color: "var(--text-inv)",
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                <IconPlayerPauseFilled size={13} /> Pausado · toque para continuar
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMenu(false)}
                style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(5,5,5,.94)", display: "flex", overflowY: "auto", padding: "16px 0" }}
              >
                {/* margin auto centraliza sem cortar o topo quando a lista não cabe (celular): aí ela rola */}
                <div role="dialog" aria-label="Capítulos" onClick={(e) => e.stopPropagation()} style={{ width: "min(880px, calc(100vw - 32px))", margin: "auto", color: "var(--text-inv)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <span className="display" style={{ fontSize: 22 }}>
                      Capítulos
                    </span>
                    <RoundBtn label="Fechar" onClick={() => setMenu(false)}>
                      <IconX size={16} />
                    </RoundBtn>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(200px, 40vw), 1fr))", gap: 10 }}>
                    {chapters.map((c, i) => (
                      <button
                        key={c.id}
                        onClick={() => go(i)}
                        aria-current={i === index ? "true" : undefined}
                        style={{
                          textAlign: "left",
                          padding: 16,
                          borderRadius: 14,
                          border: `1px solid ${i === index ? "var(--k-red)" : "var(--border-dark)"}`,
                          background: "var(--dark-1)",
                          color: "inherit",
                        }}
                      >
                        <div style={{ fontSize: 12, color: "var(--text-inv-2)", marginBottom: 8, fontVariantNumeric: "tabular-nums" }}>{c.number}</div>
                        <div className="display" style={{ fontSize: 20, marginBottom: 4 }}>
                          {c.title}
                        </div>
                        <div style={{ color: "var(--text-inv-2)" }}>{c.summary}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </TransitionContext.Provider>
    </PlaybackContext.Provider>
  );
}

/**
 * Camada de um capítulo. Na troca, o que sai e o que entra ficam montados juntos por ~0,5 s:
 * o Stage de cada um move a câmera (saída continua o movimento, entrada chega andando) e aqui
 * só cruzamos a opacidade. Sem desfoque e sem passar pelo preto.
 */
function ChapterLayer({ children }: { children: React.ReactNode }) {
  const present = useIsPresent();
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: reduce ? 0.2 : 0.5, delay: reduce ? 0 : 0.16, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, transition: { duration: reduce ? 0.2 : PASSAGE.exit * 0.75, ease: [0.33, 0, 0.67, 1] } }}
      inert={!present}
      style={{ position: "absolute", inset: 0, zIndex: present ? 2 : 1, pointerEvents: present ? "auto" : "none" }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Preenchimento do trecho do capítulo atual. Durante o roteiro de câmera ele anda com o roteiro
 * (até 60% do trecho); depois, enquanto a proposta roda sem duração conhecida, um brilho corre;
 * quando a Donna pede, para com um ponto pulsando; no cartão de escopo, fica cheio.
 */
const SCENE_SHARE = 0.6;
function Fill({ state, closing }: { state: PlayState; closing: boolean }) {
  const bar = useRef<HTMLSpanElement>(null);
  const [known, setKnown] = useState(true);
  const max = useRef(0);
  const last = useRef(-1);
  useEffect(
    () =>
      onSceneProgress((p) => {
        const el = bar.current;
        if (!el) return;
        if (p !== null) max.current = Math.max(max.current, p);
        setKnown(p !== null);
        const v = p === null ? SCENE_SHARE : max.current * SCENE_SHARE;
        // escreve só quando muda o bastante para aparecer (menos trabalho por quadro)
        if (Math.abs(v - last.current) < 0.002 && p !== null) return;
        last.current = v;
        el.style.transform = `scaleX(${(p === null ? SCENE_SHARE : max.current * SCENE_SHARE).toFixed(4)})`;
      }),
    [],
  );
  return (
    <>
      <span ref={bar} className={closing ? "k-fill k-full" : "k-fill"} />
      {state === "playing" && !known && !closing && <span className="k-run" />}
      {state === "waiting" && <span className="k-wait" style={{ left: closing ? "100%" : `${SCENE_SHARE * 100}%` }} />}
    </>
  );
}

function RoundBtn({ label, onClick, children, light }: { label: string; onClick: () => void; children: React.ReactNode; light?: boolean }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="k-round"
      style={{
        width: 38,
        height: 38,
        borderRadius: 99,
        display: "grid",
        placeItems: "center",
        background: light ? "rgba(0,0,0,.04)" : "rgba(255,255,255,.06)",
        border: `1px solid ${light ? "var(--border-strong)" : "var(--border-dark)"}`,
        color: light ? "var(--text-1)" : "var(--text-inv)",
        transition: "background-color .2s, transform .12s",
      }}
    >
      {children}
    </button>
  );
}
