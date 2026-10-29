"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled, IconLayoutList, IconX } from "@tabler/icons-react";
import { chapters } from "@/chapters";
import { BrandLogo } from "@/kit";
import { PlaybackContext } from "./playback";
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
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
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
        setPaused((p) => !p);
      } else if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const light = tone === "light";
  const ink2 = light ? "var(--text-2)" : "var(--text-inv-2)";
  const playback = useMemo(() => ({ paused }), [paused]);

  return (
    <PlaybackContext.Provider value={playback}>
      <TransitionContext.Provider value={passage}>
        <div
          data-chapter={chapter.id}
          data-tone={tone}
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
              padding: "0 28px",
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
              left: 28,
              right: 28,
              bottom: 18,
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
              <RoundBtn light={light} label={paused ? "Continuar" : "Pausar"} onClick={() => setPaused((p) => !p)}>
                {paused ? <IconPlayerPlayFilled size={15} /> : <IconPlayerPauseFilled size={15} />}
              </RoundBtn>
              <RoundBtn light={light} label="Capítulos" onClick={() => setMenu(true)}>
                <IconLayoutList size={16} />
              </RoundBtn>
            </div>
          </footer>

          {/* barra de progresso: cada trecho leva ao capítulo */}
          <nav aria-label="Progresso" style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 10, display: "flex", gap: 2, zIndex: 41 }}>
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
                  style={{
                    display: "block",
                    width: "100%",
                    height: 2,
                    background: i <= index ? "var(--k-red)" : light ? "rgba(0,0,0,.1)" : "rgba(255,255,255,.08)",
                    transition: "background-color .4s",
                  }}
                />
              </button>
            ))}
          </nav>

          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMenu(false)}
                style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(5,5,5,.94)", display: "grid", placeItems: "center" }}
              >
                <div role="dialog" aria-label="Capítulos" onClick={(e) => e.stopPropagation()} style={{ width: "min(880px, calc(100vw - 32px))", color: "var(--text-inv)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <span className="display" style={{ fontSize: 22 }}>
                      Capítulos
                    </span>
                    <RoundBtn label="Fechar" onClick={() => setMenu(false)}>
                      <IconX size={16} />
                    </RoundBtn>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
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
