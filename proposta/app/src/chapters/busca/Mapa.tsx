"use client";

import { motion, AnimatePresence } from "motion/react";
import { Cursor } from "@/kit";
import { CLUSTERS, CORPUS, TROVAO, byId, type ClusterId, type Tipo } from "./corpus";
import type { Resultado } from "./agent";

export const MAP_W = 700;
export const MAP_H = 730;
const PAD = 34;

/** Marcas de texto do mapa (eco das ilustrações em caracteres das LPs da Plane). */
export const GLYPH: Record<Tipo, string> = { relatorio: "#", aula: "@", documento: "%" };
export const TIPO_LABEL: Record<Tipo, string> = { relatorio: "Relatório", aula: "Aula", documento: "Documento" };

const px = (x: number) => PAD + (x / 100) * (MAP_W - PAD * 2);
const py = (y: number) => PAD + (y / 100) * (MAP_H - PAD * 2);

/** pseudo-aleatório determinístico */
function rand(seed: number) {
  const s = Math.sin(seed * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/** Poeira de caracteres em volta de cada assunto. */
const DUST = (Object.keys(CLUSTERS) as ClusterId[]).flatMap((id, ci) =>
  Array.from({ length: 64 }).map((_, k) => {
    const c = CLUSTERS[id];
    const a = rand(ci * 97 + k) * Math.PI * 2;
    const r = Math.pow(rand(ci * 31 + k * 7), 0.85) * (id === "tarso" ? 21 : 14);
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

/**
 * O mapa dos casos: cada relatório, laudo e aula é um ponto, perto dos que falam do mesmo assunto.
 * `asked` = a pergunta já foi feita (o Trovão se acende); `itens`/`shown` = casos achados, revelados um a um.
 */
export function Mapa({ formed, asked, itens, shown, cited }: { formed: boolean; asked: boolean; itens: Resultado[]; shown: number; cited?: number[] }) {
  const visible = itens.slice(0, shown).filter((r) => byId[r.id]);
  const rank = new Map(visible.map((r, i) => [r.id, i + 1]));
  const qx = px(TROVAO.x);
  const qy = py(TROVAO.y);
  const last = visible[visible.length - 1];
  const citing = cited && cited.length > 0;
  const lit = (k: number) => !citing || cited!.includes(k);

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
        const membros = CORPUS.filter((it) => it.cluster === id);
        const n = membros.length;
        // rótulo logo acima do item mais alto do grupo
        const topo = Math.min(py(c.y) - 72, ...membros.map((it) => py(it.y) - 34));
        return (
          <motion.div
            key={id}
            initial={false}
            animate={{ opacity: formed ? 1 : 0, y: formed ? 0 : 6 }}
            transition={{ duration: 0.6, delay: formed ? 2 : 0 }}
            style={{
              position: "absolute",
              left: px(c.x),
              top: topo,
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

      {/* linhas do Trovão até os casos achados */}
      <svg width={MAP_W} height={MAP_H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {visible.map((r, i) => {
          const it = byId[r.id];
          return (
            <motion.path
              key={r.id}
              d={`M ${qx} ${qy} L ${px(it.x)} ${py(it.y)}`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: lit(i + 1) ? 0.8 : 0.18 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              stroke="var(--k-red)"
              strokeWidth={citing && lit(i + 1) ? 2 : 1.2}
              fill="none"
            />
          );
        })}
      </svg>

      {/* itens do acervo */}
      {CORPUS.map((it, i) => {
        if (it.id === TROVAO.id) return null;
        const k = rank.get(it.id);
        const hot = k !== undefined;
        return (
          <motion.span
            key={it.id}
            initial={false}
            animate={
              formed
                ? { opacity: visible.length && !hot ? 0.4 : hot && !lit(k) ? 0.5 : 1, x: 0, y: 0, scale: hot && citing && lit(k) ? 1.35 : 1 }
                : { opacity: 0, x: -px(it.x) - 60, y: (rand(i * 13) - 0.5) * 360, scale: 1 }
            }
            transition={{ duration: formed && !visible.length ? 1.5 : 0.5, delay: formed && !visible.length ? 0.1 + rand(i * 4) * 1.4 : 0, ease: [0.22, 1, 0.36, 1] }}
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
          >
            {GLYPH[it.tipo]}
            {hot && (
              <span style={{ position: "absolute", left: 13, top: -9, display: "flex", gap: 4, alignItems: "center", whiteSpace: "nowrap", fontFamily: "var(--font-ui)" }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: "#fff", background: "var(--k-red)", borderRadius: 4, padding: "1px 4px" }}>{k}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "#3b352b", background: "rgba(244,241,234,.9)", padding: "0 3px", borderRadius: 3 }}>{it.nome}</span>
              </span>
            )}
          </motion.span>
        );
      })}

      {/* o caso de hoje: o Trovão */}
      <motion.div
        initial={false}
        animate={{ opacity: formed ? 1 : 0 }}
        transition={{ duration: 0.8, delay: formed ? 1.2 : 0 }}
        style={{ position: "absolute", left: qx, top: qy, zIndex: 4 }}
      >
        {asked && (
          <motion.span
            animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ position: "absolute", left: -9, top: -9, width: 18, height: 18, borderRadius: 99, background: "var(--k-red)" }}
          />
        )}
        <span
          style={{
            position: "absolute",
            left: -6,
            top: -6,
            width: 12,
            height: 12,
            borderRadius: 99,
            background: asked ? "var(--k-red)" : "#3b352b",
            border: "2px solid #fff",
            transition: "background .4s",
          }}
        />
        <AnimatePresence>
          {asked && (
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                left: 12,
                top: 8,
                padding: "3px 8px",
                borderRadius: 6,
                background: "var(--k-red)",
                color: "#fff",
                fontFamily: "var(--font-ui)",
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              Trovão · hoje
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* a Donna passando pelos casos que acha */}
      {asked && last && !citing && <Cursor x={px(byId[last.id].x) + 6} y={py(byId[last.id].y) + 10} label="Donna" />}

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
