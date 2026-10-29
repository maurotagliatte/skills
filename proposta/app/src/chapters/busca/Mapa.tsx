"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CLUSTERS, CORPUS, byId, type ClusterId, type Tipo } from "./corpus";
import type { Resultado } from "./agent";

export const MAP_W = 700;
export const MAP_H = 730;
const PAD = 34;

export const GLYPH: Record<Tipo, string> = { prontuario: "#", aula: "@", documento: "%", financeiro: "$" };
export const TIPO_LABEL: Record<Tipo, string> = { prontuario: "Prontuário", aula: "Aula", documento: "Documento", financeiro: "Financeiro" };

const px = (x: number) => PAD + (x / 100) * (MAP_W - PAD * 2);
const py = (y: number) => PAD + (y / 100) * (MAP_H - PAD * 2);

/** pseudo-aleatório determinístico */
function rand(seed: number) {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/** Poeira de caracteres em volta de cada assunto (eco das ilustrações ASCII das LPs da Plane). */
const DUST = (Object.keys(CLUSTERS) as ClusterId[]).flatMap((id, ci) =>
  Array.from({ length: 64 }).map((_, k) => {
    const c = CLUSTERS[id];
    const a = rand(ci * 97 + k) * Math.PI * 2;
    const r = Math.pow(rand(ci * 31 + k * 7), 0.85) * 14;
    const core = r < 6;
    return {
      key: `${id}-${k}`,
      x: c.x + Math.cos(a) * r,
      y: c.y + Math.sin(a) * r * 0.8,
      ch: (core ? "+*=:" : ".:·-")[Math.floor(rand(k * 3 + ci) * 4)],
      o: (core ? 0.55 : 0.3) + rand(k + ci * 5) * 0.4,
      size: core ? 15 : 13,
    };
  }),
);

/** Onde a busca cai: média ponderada dos 3 resultados mais parecidos. */
export function queryPoint(itens: Resultado[]) {
  const top = itens.filter((r) => byId[r.id]).slice(0, 3);
  if (!top.length) return { x: 50, y: 50 };
  const w = top.reduce((s, r) => s + (r.score || 0.5), 0);
  const x = top.reduce((s, r) => s + byId[r.id].x * (r.score || 0.5), 0) / w;
  const y = top.reduce((s, r) => s + byId[r.id].y * (r.score || 0.5), 0) / w;
  return { x: x + 1.5, y: y - 2.5 };
}

export function Mapa({ formed, itens, shown, query, hover }: { formed: boolean; itens: Resultado[]; shown: number; query?: string; hover?: string | null }) {
  const visible = itens.slice(0, shown).filter((r) => byId[r.id]);
  const rank = new Map(visible.map((r, i) => [r.id, i + 1]));
  const q = useMemo(() => queryPoint(itens), [itens]);
  const qx = px(q.x);
  const qy = py(q.y);

  return (
    <div
      style={{
        position: "relative",
        width: MAP_W,
        height: MAP_H,
        borderRadius: 12,
        background: "#f4f1ea",
        border: "1px solid #e6e0d4",
        overflow: "hidden",
        fontFamily: "var(--font-mono)",
      }}
    >
      {/* poeira */}
      {DUST.map((d, i) => (
        <motion.span
          key={d.key}
          initial={false}
          animate={formed ? { opacity: d.o, x: 0, y: 0 } : { opacity: 0, x: -px(d.x) - 40 + rand(i) * 30, y: (rand(i * 9) - 0.5) * 300 }}
          transition={{ duration: 1.4, delay: formed ? 0.2 + rand(i * 2) * 1.6 : 0, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: "absolute", left: px(d.x), top: py(d.y), fontSize: d.size, color: "#a99c84", lineHeight: 1, translate: "-50% -50%" }}
        >
          {d.ch}
        </motion.span>
      ))}

      {/* rótulos dos assuntos */}
      {(Object.keys(CLUSTERS) as ClusterId[]).map((id) => {
        const c = CLUSTERS[id];
        const n = CORPUS.filter((it) => it.cluster === id).length;
        return (
          <motion.div
            key={id}
            initial={false}
            animate={{ opacity: formed ? 1 : 0, y: formed ? 0 : 6 }}
            transition={{ duration: 0.6, delay: formed ? 2 : 0 }}
            style={{
              position: "absolute",
              left: px(c.x),
              top: py(c.y) - 72,
              translate: "-50% 0",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#6f6656",
              whiteSpace: "nowrap",
              background: "rgba(244,241,234,.85)",
              padding: "1px 4px",
            }}
          >
            {c.label} <span style={{ color: "#a99f8c" }}>{n}</span>
          </motion.div>
        );
      })}

      {/* linhas até os vizinhos */}
      <svg width={MAP_W} height={MAP_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {visible.map((r) => {
          const it = byId[r.id];
          return (
            <motion.path
              key={r.id}
              d={`M ${qx} ${qy} L ${px(it.x)} ${py(it.y)}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: hover && hover !== r.id ? 0.25 : 0.75 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              stroke="var(--k-red)"
              strokeWidth={hover === r.id ? 2 : 1.2}
              fill="none"
            />
          );
        })}
      </svg>

      {/* itens do acervo */}
      {CORPUS.map((it, i) => {
        const k = rank.get(it.id);
        const hot = k !== undefined;
        return (
          <motion.span
            key={it.id}
            initial={false}
            animate={formed ? { opacity: visible.length && !hot ? 0.45 : 1, x: 0, y: 0, scale: hover === it.id ? 1.5 : 1 } : { opacity: 0, x: -px(it.x) - 60, y: (rand(i * 13) - 0.5) * 360, scale: 1 }}
            transition={{ duration: 1.5, delay: formed && !visible.length ? 0.1 + rand(i * 4) * 1.4 : 0, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              left: px(it.x),
              top: py(it.y),
              translate: "-50% -50%",
              fontSize: 20,
              fontWeight: 600,
              lineHeight: 1,
              color: hot ? "var(--k-red)" : "#3b352b",
              zIndex: hot ? 3 : 1,
            }}
            title={it.titulo}
          >
            {GLYPH[it.tipo]}
            {hot && (
              <span
                style={{
                  position: "absolute",
                  left: 13,
                  top: -9,
                  fontSize: 9,
                  fontWeight: 600,
                  color: "#fff",
                  background: "var(--k-red)",
                  borderRadius: 4,
                  padding: "1px 4px",
                  fontFamily: "var(--font-ui)",
                }}
              >
                {k}
              </span>
            )}
          </motion.span>
        );
      })}

      {/* a busca */}
      <AnimatePresence>
        {visible.length > 0 && (
          <motion.div
            key={query}
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", left: qx, top: qy, zIndex: 4 }}
          >
            <motion.span
              animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              style={{ position: "absolute", left: -9, top: -9, width: 18, height: 18, borderRadius: 99, background: "var(--k-red)" }}
            />
            <span style={{ position: "absolute", left: -6, top: -6, width: 12, height: 12, borderRadius: 99, background: "var(--k-red)", border: "2px solid #fff" }} />
            <span
              style={{
                position: "absolute",
                left: 10,
                top: -32,
                padding: "3px 8px",
                borderRadius: 6,
                background: "var(--k-red)",
                color: "#fff",
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: "nowrap",
                maxWidth: 240,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {query}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* legenda */}
      <div style={{ position: "absolute", left: 14, bottom: 12, display: "flex", gap: 14, fontSize: 10, color: "#7d7362" }}>
        {(Object.keys(GLYPH) as Tipo[]).map((t) => (
          <span key={t}>
            <b style={{ color: "#3b352b" }}>{GLYPH[t]}</b> {TIPO_LABEL[t].toLowerCase()}
          </span>
        ))}
      </div>
    </div>
  );
}
