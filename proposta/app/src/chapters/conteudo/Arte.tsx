"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Icon } from "@tabler/icons-react";
import { IconPhoto, IconLetterT, IconAlignLeft, IconClick, IconBadge, IconFrame, IconArrowRight, IconCheck } from "@tabler/icons-react";
import { Avatar, BrandLogo, Chip, Cursor } from "@/kit";
import type { Arte } from "./agent";
import { EQUIPE, type Membro, type Status } from "./equipe";
import css from "./conteudo.module.css";

type A = Partial<Arte>;
type LayerId = "foto" | "headline" | "subtitulo" | "cta" | "logo";

const LAYERS: { id: LayerId; name: string; icon: Icon; by: Membro }[] = [
  { id: "foto", name: "Foto de fundo", icon: IconPhoto, by: "Designer" },
  { id: "headline", name: "Título", icon: IconLetterT, by: "Redatora" },
  { id: "subtitulo", name: "Subtítulo", icon: IconAlignLeft, by: "Redatora" },
  { id: "cta", name: "Botão · CTA", icon: IconClick, by: "Diagramadora" },
  { id: "logo", name: "Logo", icon: IconBadge, by: "Designer" },
];

const AB_W = 1080;
const AB_H = 1350;

/** Camadas disponíveis em sequência (a próxima só entra quando a anterior chegou nos args). */
export function arteAvailable(a: A) {
  const has = [!!a.foto, !!a.headline, !!a.subtitulo, !!a.cta, !!a.cta];
  const i = has.indexOf(false);
  return i === -1 ? has.length : i;
}

export function arteStatus(a: A, n: number, done: boolean): Status[] {
  const fin = done && n >= 5;
  return [
    { who: "Designer", text: n >= 1 ? `Foto “${a.foto}” e logo da clínica` : "Escolhendo a foto no banco da marca", state: fin || n >= 5 ? "pronto" : "trabalhando" },
    { who: "Redatora", text: n >= 2 ? "Título, subtítulo e chamada" : "Esperando a foto para escrever", state: n >= 4 ? "pronto" : n >= 1 ? "trabalhando" : "aguardando" },
    { who: "Diagramadora", text: `Layout ${a.layout ?? "…"} · grid 1080 × 1350`, state: fin ? "pronto" : n >= 3 ? "trabalhando" : "aguardando" },
  ];
}

type Rect = { x: number; y: number; w: number; h: number };

/** A arte em tamanho real (1080×1350), desenhada com camadas reais de DOM. */
function Artboard({ a, n, refs }: { a: A; n: number; refs: React.MutableRefObject<Partial<Record<LayerId, HTMLElement | null>>> }) {
  const on = (id: LayerId) => LAYERS.findIndex((l) => l.id === id) < n;
  const layout = a.layout ?? "base";
  const shade =
    layout === "topo"
      ? "linear-gradient(to bottom, rgba(32,10,12,.88) 0%, rgba(32,10,12,.35) 48%, rgba(32,10,12,0) 70%)"
      : layout === "centro"
        ? "linear-gradient(rgba(32,10,12,.55), rgba(32,10,12,.55))"
        : "linear-gradient(to top, rgba(32,10,12,.92) 0%, rgba(32,10,12,.45) 45%, rgba(32,10,12,0) 72%)";
  const enter = { initial: { opacity: 0, filter: "blur(10px)", y: 14 }, animate: { opacity: 1, filter: "blur(0px)", y: 0 }, transition: { duration: 0.6 } };
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#f6f5f3" }}>
      {!on("foto") && (
        <div className="mono" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 30, color: "#b9b6b0" }}>
          1080 × 1350
        </div>
      )}
      <AnimatePresence>
        {on("foto") && (
          <motion.div
            ref={(el) => {
              refs.current.foto = el;
            }}
            key={a.foto}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            style={{ position: "absolute", inset: 0, backgroundImage: `url(/bg/icm-${a.foto}.webp)`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            <div style={{ position: "absolute", inset: 0, background: shade }} />
          </motion.div>
        )}
      </AnimatePresence>
      {on("logo") && (
        <motion.div
          {...enter}
          ref={(el) => {
            refs.current.logo = el;
          }}
          style={{ position: "absolute", left: 84, top: 84 }}
        >
          <BrandLogo brand="guenka" height={104} plate />
        </motion.div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: layout === "topo" ? "230px 84px 84px" : "84px 84px 120px",
          display: "flex",
          flexDirection: "column",
          justifyContent: layout === "topo" ? "flex-start" : layout === "centro" ? "center" : "flex-end",
        }}
      >
        <div style={{ position: "relative", color: "#fff" }}>
          {on("headline") && (
            <motion.div
              {...enter}
              ref={(el) => {
                refs.current.headline = el;
              }}
              className="display"
              style={{ fontSize: 96, lineHeight: 1.02, maxWidth: 880, width: "fit-content" }}
            >
              {a.headline}
            </motion.div>
          )}
          {on("subtitulo") && (
            <motion.div
              {...enter}
              ref={(el) => {
                refs.current.subtitulo = el;
              }}
              style={{ fontSize: 36, lineHeight: 1.35, marginTop: 30, maxWidth: 780, width: "fit-content", color: "rgba(255,255,255,.85)" }}
            >
              {a.subtitulo}
            </motion.div>
          )}
          {on("cta") && (
            <motion.div
              {...enter}
              ref={(el) => {
                refs.current.cta = el;
              }}
              style={{
                marginTop: 48,
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
                padding: "24px 42px",
                borderRadius: 999,
                background: "var(--gg-wine)",
                border: "2px solid rgba(255,255,255,.22)",
                fontSize: 32,
                fontWeight: 600,
              }}
            >
              {a.cta}
              <IconArrowRight size={32} stroke={2} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function measure(el: HTMLElement | null | undefined, root: HTMLElement | null): Rect | null {
  if (!el || !root) return null;
  // offset* ignora transforms: coordenadas nativas da arte (1080×1350)
  let x = 0;
  let y = 0;
  let cur: HTMLElement | null = el;
  while (cur && cur !== root) {
    x += cur.offsetLeft;
    y += cur.offsetTop;
    cur = cur.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** Editor estilo pen.dev: Camadas | canvas | Propriedades, com cursores dos especialistas. */
export function ArteEditor({ a, n, done, scale = 0.55 }: { a: A; n: number; done: boolean; scale?: number }) {
  const refs = useRef<Partial<Record<LayerId, HTMLElement | null>>>({});
  const root = useRef<HTMLDivElement>(null);
  const [rects, setRects] = useState<Partial<Record<LayerId, Rect>>>({});
  const active = n > 0 ? LAYERS[n - 1] : undefined;
  const finished = done && n >= 5;

  useLayoutEffect(() => {
    const t = setTimeout(() => {
      const r: Partial<Record<LayerId, Rect>> = {};
      for (const l of LAYERS) {
        const m = measure(refs.current[l.id], root.current);
        if (m) r[l.id] = m;
      }
      setRects(r);
    }, 30);
    return () => clearTimeout(t);
  }, [n, a.headline, a.subtitulo, a.cta, a.layout]);

  const S = scale;
  const sel: Rect | undefined = finished ? { x: 0, y: 0, w: AB_W, h: AB_H } : active ? rects[active.id] : undefined;
  const selColor = finished ? "var(--k-red)" : active ? EQUIPE[active.by].color : "transparent";

  // cursores: entram a partir da Donna e vão até a camada em que estão trabalhando
  const donna = { x: AB_W * S * 0.55, y: -40 };
  const park: Record<Exclude<Membro, "Donna">, { x: number; y: number }> = {
    Designer: { x: 18, y: AB_H * S * 0.3 },
    Redatora: { x: AB_W * S - 120, y: AB_H * S * 0.16 },
    Diagramadora: { x: AB_W * S - 150, y: AB_H * S * 0.42 },
  };
  const joined = (m: Membro) => LAYERS.findIndex((l) => l.by === m) < n;
  const target = (m: Exclude<Membro, "Donna">) => {
    if (!finished && active?.by === m && sel) return { x: (sel.x + sel.w * 0.78) * S, y: (sel.y + sel.h * 0.62) * S };
    return park[m];
  };

  const layerRows = LAYERS.slice(0, n).reverse();
  const props = propsFor(active?.id, a, active ? rects[active.id] : undefined, finished);

  return (
    <div className={css.editor}>
      <div className={css.panel}>
        <div className={css.panelTitle}>
          Camadas <span style={{ color: "var(--text-3)", fontWeight: 400 }}>{n}</span>
        </div>
        <div className={css.layer} style={{ color: "var(--text-1)", fontWeight: 500 }}>
          <IconFrame size={15} stroke={1.6} />
          Post · Instagram
        </div>
        <AnimatePresence initial={false}>
          {layerRows.map((l) => {
            const isActive = !finished && active?.id === l.id;
            return (
              <motion.div
                key={l.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={css.layer}
                style={{ paddingLeft: 24, background: isActive ? `color-mix(in srgb, ${EQUIPE[l.by].color} 12%, transparent)` : undefined, color: isActive ? "var(--text-1)" : undefined }}
              >
                <l.icon size={15} stroke={1.6} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{l.name}</span>
                <Avatar name={l.by} color={EQUIPE[l.by].color} size={16} />
              </motion.div>
            );
          })}
        </AnimatePresence>
        {n === 0 && <div style={{ color: "var(--text-3)", padding: "10px 8px 0 24px" }}>Nenhuma camada ainda</div>}
      </div>

      <div className={css.canvas} style={{ display: "grid", placeItems: "center" }}>
        <div style={{ position: "relative", width: AB_W * S, height: AB_H * S }}>
          <div className="mono" style={{ position: "absolute", left: 0, top: -20, fontSize: 10, color: "var(--text-3)", whiteSpace: "nowrap" }}>
            Post · Instagram — 1080 × 1350
          </div>
          <div style={{ position: "absolute", inset: 0, boxShadow: "0 1px 2px rgba(0,0,0,.08), 0 14px 34px -14px rgba(0,0,0,.35)" }}>
            <div ref={root} style={{ position: "absolute", left: 0, top: 0, width: AB_W, height: AB_H, transform: `scale(${S})`, transformOrigin: "0 0" }}>
              <Artboard a={a} n={n} refs={refs} />
            </div>
          </div>
          {sel && (
            <div className={css.selection} style={{ left: sel.x * S - 2, top: sel.y * S - 2, width: sel.w * S + 4, height: sel.h * S + 4, borderColor: selColor }}>
              {[
                { left: -4, top: -4 },
                { right: -4, top: -4 },
                { left: -4, bottom: -4 },
                { right: -4, bottom: -4 },
              ].map((p, i) => (
                <span key={i} className={css.handle} style={{ ...p, borderColor: selColor }} />
              ))}
              <span className={css.dims} style={{ background: selColor, bottom: finished ? -26 : -24 }}>
                {finished ? "Pronto · 1080 × 1350" : `${Math.round(sel.w)} × ${Math.round(sel.h)}`}
              </span>
            </div>
          )}
          <Cursor x={donna.x} y={donna.y} label="Donna" />
          {(["Designer", "Redatora", "Diagramadora"] as const).map((m) => {
            const p = joined(m) ? target(m) : donna;
            return (
              <div key={m} style={{ opacity: joined(m) ? 1 : 0, transition: "opacity .4s" }}>
                <Cursor x={p.x} y={p.y} label={m} color={EQUIPE[m].color} />
              </div>
            );
          })}
        </div>
        <div className="mono" style={{ position: "absolute", right: 12, bottom: 10, fontSize: 10, color: "var(--text-3)" }}>
          {Math.round(S * 100)}%
        </div>
      </div>

      <div className={`${css.panel} ${css.panelRight}`}>
        <div className={css.panelTitle}>Propriedades</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px 6px", fontWeight: 500 }}>
          {props.icon && <props.icon size={15} stroke={1.6} />}
          {props.title}
        </div>
        <div className={css.sectionLabel}>Posição e tamanho</div>
        <div className={css.propRow}>
          <Field k="X" v={props.r ? Math.round(props.r.x) : "—"} />
          <Field k="Y" v={props.r ? Math.round(props.r.y) : "—"} />
          <Field k="L" v={props.r ? Math.round(props.r.w) : "—"} />
          <Field k="A" v={props.r ? Math.round(props.r.h) : "—"} />
        </div>
        {props.rows.length > 0 && <div className={css.sectionLabel}>{props.section}</div>}
        {props.rows.map(([k, v, sw]) => (
          <div key={k} className={css.field} style={{ marginBottom: 6 }}>
            <span className={css.fieldLabel}>{k}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden", textOverflow: "ellipsis" }}>
              {sw && <span className={css.swatch} style={{ background: sw }} />}
              {v}
            </span>
          </div>
        ))}
        <div className={css.sectionLabel}>Marca</div>
        <div style={{ display: "grid", gap: 6 }}>
          {[
            ["Vinho", "#7B2A2E"],
            ["Tinta", "#2B2B2B"],
          ].map(([k, c]) => (
            <div key={k} className={css.field}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className={css.swatch} style={{ background: c }} />
                {k}
              </span>
              <span className="mono" style={{ fontSize: 10, color: "var(--text-3)" }}>
                {c}
              </span>
            </div>
          ))}
        </div>
        {finished && (
          <div style={{ marginTop: 14 }}>
            <Chip tone="green" icon={IconCheck}>
              Pronta para postar
            </Chip>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string | number }) {
  return (
    <div className={css.field}>
      <span className={css.fieldLabel}>{k}</span>
      <span>{v}</span>
    </div>
  );
}

function propsFor(id: LayerId | undefined, a: A, r: Rect | undefined, finished: boolean) {
  type Row = [string, string, string?];
  if (finished || !id)
    return { title: "Post · Instagram", icon: IconFrame, r: { x: 0, y: 0, w: AB_W, h: AB_H }, section: "Quadro", rows: [["Formato", "Retrato 4:5"], ["Layout", a.layout ?? "—"]] as Row[] };
  const L = LAYERS.find((l) => l.id === id)!;
  const rows: Record<LayerId, Row[]> = {
    foto: [
      ["Imagem", `ICM · ${a.foto ?? ""}`],
      ["Ajuste", "Preencher"],
      ["Sobreposição", "Vinho 88%", "#200a0c"],
    ],
    headline: [
      ["Tamanho", "96"],
      ["Entrelinha", "102%"],
      ["Cor", "Branco", "#ffffff"],
    ],
    subtitulo: [
      ["Tamanho", "36"],
      ["Cor", "Branco 85%", "rgba(255,255,255,.85)"],
    ],
    cta: [
      ["Preenchimento", "Vinho", "#7b2a2e"],
      ["Raio", "999"],
      ["Texto", "32 · Semibold"],
    ],
    logo: [
      ["Arquivo", "Logo oficial"],
      ["Altura", "104 · placa clara"],
    ],
  };
  return { title: L.name, icon: L.icon, r, section: id === "foto" ? "Imagem" : id === "cta" || id === "logo" ? "Estilo" : "Texto", rows: rows[id] };
}
