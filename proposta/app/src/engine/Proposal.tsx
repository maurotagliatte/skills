"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconPlayerPauseFilled, IconPlayerPlayFilled, IconLayoutList, IconX } from "@tabler/icons-react";
import { chapters } from "@/chapters";
import { BrandLogo } from "@/kit";
import { PlaybackContext } from "./playback";

/** Casca da proposta: cabeçalho, título do capítulo, índice, teclado e troca de capítulos. */
export function Proposal() {
  const [index, setIndex] = useState(0);
  // ?c=<id> abre direto num capítulo (útil para revisar e para QA)
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("c");
    const i = chapters.findIndex((c) => c.id === id);
    if (i > 0) setIndex(i);
  }, []);
  const [paused, setPaused] = useState(false);
  const [menu, setMenu] = useState(false);
  const chapter = chapters[index];

  const go = useCallback((i: number) => {
    setIndex(Math.max(0, Math.min(chapters.length - 1, i)));
    setMenu(false);
    setPaused(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea")) return;
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

  return (
    <PlaybackContext.Provider value={{ paused }}>
      <div style={{ position: "fixed", inset: 0, background: "var(--stage)", overflow: "hidden" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, scale: 1.04, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.97, filter: "blur(14px)" }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
            style={{ position: "absolute", inset: 0 }}
          >
            <chapter.Component onNext={() => go(index + 1)} />
          </motion.div>
        </AnimatePresence>

        {/* cabeçalho, como no vídeo de referência */}
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
            justifyContent: "space-between",
            color: "var(--text-inv-2)",
            zIndex: 40,
            pointerEvents: "none",
          }}
        >
          <BrandLogo brand="khard" height={24} />
          <span className="mono" style={{ fontSize: 11 }}>
            Proposta · Gabriela Guenka
          </span>
          <span className="mono" style={{ fontSize: 11 }}>
            {chapter.number} / {chapters[chapters.length - 1].number}
          </span>
        </header>

        {/* título grande do capítulo + controles */}
        <footer
          style={{
            position: "absolute",
            left: 28,
            right: 28,
            bottom: 22,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            zIndex: 40,
            pointerEvents: "none",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="display"
              style={{ fontSize: 44, color: "var(--text-inv)" }}
            >
              {chapter.title}
              <sup style={{ fontSize: 15, marginLeft: 6, verticalAlign: "super", fontFamily: "var(--font-ui)", letterSpacing: 0 }}>({chapter.number})</sup>
            </motion.div>
          </AnimatePresence>
          <div style={{ display: "flex", gap: 8, pointerEvents: "auto" }}>
            <RoundBtn label={paused ? "Continuar" : "Pausar"} onClick={() => setPaused((p) => !p)}>
              {paused ? <IconPlayerPlayFilled size={15} /> : <IconPlayerPauseFilled size={15} />}
            </RoundBtn>
            <RoundBtn label="Capítulos" onClick={() => setMenu(true)}>
              <IconLayoutList size={16} />
            </RoundBtn>
          </div>
        </footer>

        {/* barra de progresso por capítulo */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 2, display: "flex", gap: 2, zIndex: 40 }}>
          {chapters.map((c, i) => (
            <div key={c.id} style={{ flex: 1, background: i <= index ? "var(--k-red)" : "rgba(255,255,255,.08)" }} />
          ))}
        </div>

        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenu(false)}
              style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(0,0,0,.6)", backdropFilter: "blur(16px)", display: "grid", placeItems: "center" }}
            >
              <div onClick={(e) => e.stopPropagation()} style={{ width: "min(880px, 92vw)", color: "var(--text-inv)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span className="eyebrow">Capítulos</span>
                  <RoundBtn label="Fechar" onClick={() => setMenu(false)}>
                    <IconX size={16} />
                  </RoundBtn>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                  {chapters.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => go(i)}
                      style={{
                        textAlign: "left",
                        padding: 16,
                        borderRadius: 14,
                        border: `1px solid ${i === index ? "var(--k-red)" : "var(--border-dark)"}`,
                        background: "var(--dark-1)",
                        color: "inherit",
                      }}
                    >
                      <div className="mono" style={{ fontSize: 11, color: "var(--k-red)", marginBottom: 8 }}>
                        K♠ {c.number}
                      </div>
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
    </PlaybackContext.Provider>
  );
}

function RoundBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        width: 38,
        height: 38,
        borderRadius: 99,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,255,255,.06)",
        border: "1px solid var(--border-dark)",
        color: "var(--text-inv)",
      }}
    >
      {children}
    </button>
  );
}
