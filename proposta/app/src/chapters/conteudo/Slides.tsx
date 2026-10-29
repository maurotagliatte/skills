"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrandLogo } from "@/kit";
import type { Deck, Slide } from "./agent";
import type { Status } from "./equipe";
import css from "./conteudo.module.css";

type Dk = Partial<Deck>;
const SW = 1280;
const SH = 720;
const FOTOS = ["dourado", "oliva", "areia", "musgo", "pessego", "noite"];

export function slidesAvailable(d: Dk) {
  return (d.slides ?? []).filter((s) => s?.titulo).length;
}

export function slidesStatus(d: Dk, n: number, done: boolean): Status[] {
  const total = slidesAvailable(d);
  const fin = done && n >= total;
  const cur = (d.slides ?? [])[Math.max(0, n - 1)];
  return [
    { who: "Redatora", text: fin ? `${total} slides com roteiro da aula` : cur?.titulo ? `Roteiro: “${cur.titulo}”` : "Estruturando a aula", state: fin ? "pronto" : "trabalhando" },
    { who: "Designer", text: "Capa, fotos e cores da sua identidade", state: fin ? "pronto" : n >= 1 ? "trabalhando" : "aguardando" },
    { who: "Diagramadora", text: "Grid 16:9, hierarquia e numeração", state: fin ? "pronto" : n >= 2 ? "trabalhando" : "aguardando" },
  ];
}

/** Um slide em tamanho real (1280×720) com o manual da marca aplicado. */
export function SlideCanvas({ s, i, total, deckTitle }: { s: Partial<Slide>; i: number; total: number; deckTitle?: string }) {
  const bullets = (s.bullets ?? []).filter(Boolean);
  const footer = (light: boolean) => (
    <div
      style={{
        position: "absolute",
        left: 72,
        right: 72,
        bottom: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 18,
        color: light ? "rgba(255,255,255,.7)" : "#8a8584",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <BrandLogo brand="guenka" height={light ? 34 : 52} plate={light} />
        <span style={{ color: light ? "rgba(255,255,255,.7)" : "#8a8584" }}>{deckTitle}</span>
      </span>
      <span className="mono">
        {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
  );

  if (s.tipo === "capa") {
    return (
      <div style={{ position: "absolute", inset: 0, background: "var(--gg-wine)", color: "#fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "40%", backgroundImage: "url(/bg/icm-dourado.webp)", backgroundSize: "cover" }} />
        <div style={{ position: "absolute", left: 72, top: 60 }}>
          <BrandLogo brand="guenka" height={92} plate />
        </div>
        <div style={{ position: "absolute", left: 72, bottom: 120, width: "52%" }}>
          <div className="mono" style={{ fontSize: 18, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.75, marginBottom: 22 }}>
            {bullets[0]}
          </div>
          <div className="display" style={{ fontSize: 76, lineHeight: 1.02 }}>
            {s.titulo}
          </div>
          {bullets[1] && <div style={{ fontSize: 24, marginTop: 30, opacity: 0.85 }}>{bullets[1]}</div>}
        </div>
      </div>
    );
  }
  if (s.tipo === "fechamento") {
    return (
      <div style={{ position: "absolute", inset: 0, background: "var(--gg-ink)", color: "#fff" }}>
        <div style={{ position: "absolute", left: 72, top: 0, width: 120, height: 10, background: "var(--gg-wine)" }} />
        <div style={{ position: "absolute", left: 72, top: 150, right: 72 }}>
          <div className="display" style={{ fontSize: 64 }}>
            {s.titulo}
          </div>
          <div style={{ marginTop: 40, display: "grid", gap: 20 }}>
            {bullets.map((b, k) => (
              <div key={k} style={{ display: "flex", gap: 22, fontSize: 30, alignItems: "baseline" }}>
                <span className="mono" style={{ fontSize: 20, color: "#d79a9d" }}>
                  {String(k + 1).padStart(2, "0")}
                </span>
                {b}
              </div>
            ))}
          </div>
        </div>
        {footer(true)}
      </div>
    );
  }
  return (
    <div style={{ position: "absolute", inset: 0, background: "#fff", color: "var(--gg-ink)" }}>
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "34%", backgroundImage: `url(/bg/icm-${FOTOS[i % FOTOS.length]}.webp)`, backgroundSize: "cover" }} />
      <div style={{ position: "absolute", left: 72, top: 72, width: "56%" }}>
        <div className="mono" style={{ fontSize: 18, letterSpacing: "0.1em", color: "var(--gg-wine)", marginBottom: 18 }}>
          {String(i).padStart(2, "0")}
        </div>
        <div className="display" style={{ fontSize: 54, lineHeight: 1.06 }}>
          {s.titulo}
        </div>
        <div style={{ marginTop: 40, display: "grid", gap: 22 }}>
          {bullets.map((b, k) => (
            <div key={k} style={{ display: "flex", gap: 20, fontSize: 28, lineHeight: 1.3 }}>
              <span style={{ flex: "none", width: 12, height: 12, marginTop: 13, background: "var(--gg-wine)" }} />
              {b}
            </div>
          ))}
        </div>
      </div>
      {footer(false)}
    </div>
  );
}

function Scaled({ w, children }: { w: number; children: React.ReactNode }) {
  const k = w / SW;
  return (
    <div style={{ position: "relative", width: w, height: SH * k, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH, transform: `scale(${k})`, transformOrigin: "0 0" }}>{children}</div>
    </div>
  );
}

const SWATCHES = [
  { k: "Vinho", c: "#7B2A2E", use: "Primária · capas e destaques" },
  { k: "Tinta", c: "#2B2B2B", use: "Texto e fechamento" },
  { k: "Papel", c: "#FFFFFF", use: "Fundo dos slides de conteúdo" },
];

export function SlidesView({ d, n, done }: { d: Dk; n: number; done: boolean }) {
  const slides = (d.slides ?? []).filter((s) => s?.titulo);
  const shown = slides.slice(0, n);
  const [pick, setPick] = useState<number | null>(null);
  const finished = done && n >= slides.length && slides.length > 0;
  // terminou: volta para a capa
  useEffect(() => {
    if (!finished) {
      setPick(null);
      return;
    }
    const t = setTimeout(() => setPick((p) => p ?? 0), 1400);
    return () => clearTimeout(t);
  }, [finished]);
  const cur = pick ?? Math.max(0, shown.length - 1);
  const deckTitle = slides[0]?.titulo;
  const total = Math.max(slides.length, shown.length);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "188px 1fr", height: "100%", minHeight: 0 }}>
      <div style={{ borderRight: "1px solid var(--border)", background: "#fcfcfc", padding: "12px 8px", overflow: "hidden" }}>
        <div style={{ fontWeight: 600, padding: "0 6px 10px", display: "flex", justifyContent: "space-between" }}>
          Slides <span style={{ color: "var(--text-3)", fontWeight: 400 }}>{shown.length}</span>
        </div>
        <AnimatePresence initial={false}>
          {shown.map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${css.thumb} ${i === cur ? css.thumbActive : ""}`}
              onClick={() => finished && setPick(i)}
              style={{ cursor: finished ? "pointer" : "default" }}
            >
              <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", paddingTop: 2 }}>
                {i + 1}
              </span>
              <span className={css.thumbFrame}>
                <Scaled w={140}>
                  <SlideCanvas s={s} i={i} total={total} deckTitle={deckTitle} />
                </Scaled>
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
        {shown.length === 0 &&
          [0, 1, 2].map((i) => (
            <div key={i} style={{ margin: "6px 6px 10px 30px", height: 79, borderRadius: 4, background: "#eef0f0" }} />
          ))}
      </div>

      <div style={{ padding: "22px 26px", minWidth: 0, overflow: "hidden", background: "#f3f3f2" }}>
        <div style={{ boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 14px 34px -16px rgba(0,0,0,.35)", width: "fit-content", background: "#fff" }}>
          <AnimatePresence mode="wait">
            <motion.div key={shown.length ? cur : "vazio"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <Scaled w={880}>
                {shown[cur] ? (
                  <SlideCanvas s={shown[cur]} i={cur} total={total} deckTitle={deckTitle} />
                ) : (
                  <div className="mono" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 26, color: "#b9b6b0" }}>
                    16:9 · 1280 × 720
                  </div>
                )}
              </Scaled>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ marginTop: 18, width: 880, background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>Identidade visual aplicada</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
              {finished ? "conferido pela Designer" : "aplicando…"}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 18 }}>
            <div style={{ display: "grid", gap: 8 }}>
              {SWATCHES.map((s) => (
                <div key={s.k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className={css.swatch} style={{ width: 26, height: 26, borderRadius: 6, background: s.c }} />
                  <span style={{ display: "grid" }}>
                    <span>
                      <b style={{ fontWeight: 500 }}>{s.k}</b> <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>{s.c}</span>
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>{s.use}</span>
                  </span>
                </div>
              ))}
            </div>
            <div>
              <div className={css.fieldLabel} style={{ marginBottom: 8 }}>
                Logo
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ padding: 8, border: "1px solid var(--border)", borderRadius: 8 }}>
                  <BrandLogo brand="guenka" height={44} />
                </span>
                <span style={{ padding: 8, borderRadius: 8, background: "var(--gg-wine)" }}>
                  <BrandLogo brand="guenka" height={32} plate />
                </span>
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>Original sobre claro · placa clara sobre cor</div>
            </div>
            <div>
              <div className={css.fieldLabel} style={{ marginBottom: 8 }}>
                Fotografia e tipo
              </div>
              <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                {FOTOS.slice(0, 4).map((f) => (
                  <span key={f} style={{ width: 34, height: 34, borderRadius: 6, backgroundImage: `url(/bg/icm-${f}.webp)`, backgroundSize: "cover" }} />
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>Fonte da marca: entra com o manual oficial</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
