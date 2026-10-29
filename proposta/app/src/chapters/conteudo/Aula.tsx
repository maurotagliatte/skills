"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconPlayerPlayFilled, IconScissors, IconCheck } from "@tabler/icons-react";
import { AgentRow, Chip, Cursor } from "@/kit";
import type { Aula } from "./agent";

const BRUTO = 42 * 60; // s
/** trechos que a Donna corta (fração da gravação bruta) */
export const CUTS = [
  { a: 0.1, b: 0.16, motivo: "pausa longa" },
  { a: 0.33, b: 0.41, motivo: "repetição" },
  { a: 0.58, b: 0.64, motivo: "erro de gravação" },
  { a: 0.8, b: 0.86, motivo: "silêncio" },
];
const CORTADO = CUTS.reduce((s, c) => s + (c.b - c.a), 0) * BRUTO;
const EDITADO = BRUTO - CORTADO;

/** passos da cena: 1..4 cortes · 5 colapsa e gera legendas · 6 legendas prontas */
export const EDIT_STEPS = 7;

const TW_PADRAO = 506; // largura da trilha (px)
const LABEL = 60;

const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const toSec = (t: string) => {
  const [m, s] = t.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
};

type Piece = { a: number; b: number; cut?: number };
const PIECES: Piece[] = (() => {
  const out: Piece[] = [];
  let at = 0;
  CUTS.forEach((c, i) => {
    out.push({ a: at, b: c.a });
    out.push({ a: c.a, b: c.b, cut: i });
    at = c.b;
  });
  out.push({ a: at, b: 1 });
  return out;
})();

export function AulaView({ aula, step, agentDone, published, tw: TW = TW_PADRAO }: { aula: Partial<Aula>; step: number; agentDone: boolean; published: boolean; tw?: number }) {
  const collapsed = step >= 5;
  const captions = step >= 6;
  const cutsShown = Math.min(step, 4);
  const legendas = (aula.legenda_amostra ?? []).filter(Boolean);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!captions) return;
    const id = setInterval(() => setTick((t) => t + 1), 2200);
    return () => clearInterval(id);
  }, [captions]);
  const legenda = captions && legendas.length ? legendas[tick % legendas.length] : undefined;
  const caps = (aula.capitulos ?? []).filter((c) => c?.tempo && c?.titulo);

  // cursor: sobre cada corte; depois na trilha de legenda
  const cut = CUTS[Math.max(0, cutsShown - 1)];
  const cursor =
    step === 0
      ? { x: LABEL + 30, y: 34 }
      : step <= 4
        ? { x: LABEL + ((cut.a + cut.b) / 2) * TW, y: 34 }
        : { x: LABEL + TW * 0.55, y: 106 };

  const aside = (
    <div style={{ padding: 16, display: "grid", gap: 12, alignContent: "start", height: "100%" }}>
      <div style={{ fontWeight: 600 }}>Aula</div>
      <Field label="Título">
        <Fill v={aula.titulo} w={200} big />
      </Field>
      <Field label="Descrição">
        <div style={{ color: "var(--text-2)", lineHeight: 1.5, maxHeight: 118, overflow: "hidden" }}>
          <Fill v={aula.descricao} w={220} lines={3} />
        </div>
      </Field>
      <Field label="Capítulos">
        <div style={{ display: "grid", gap: 4 }}>
          {caps.length ? (
            caps.map((c) => (
              <motion.div key={c.tempo + c.titulo} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", gap: 8 }}>
                <span className="mono" style={{ color: "var(--text-3)", fontSize: 11, paddingTop: 1 }}>
                  {c.tempo}
                </span>
                <span>{c.titulo}</span>
              </motion.div>
            ))
          ) : (
            <Fill w={180} lines={3} />
          )}
        </div>
      </Field>
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8, marginTop: 2 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>Atividade</div>
        {step >= 1 && (
          <AgentRow status={collapsed ? "concluído" : "trabalhando…"} done={collapsed}>
            {collapsed ? `4 cortes · ${mmss(CORTADO)} removidos` : `Cortando pausas e repetições (${cutsShown}/4)`}
          </AgentRow>
        )}
        {collapsed && (
          <AgentRow status={captions ? "concluído" : "trabalhando…"} done={captions}>
            {captions ? "Legendas em português geradas" : "Gerando legendas…"}
          </AgentRow>
        )}
        {aula.titulo && (
          <AgentRow status={agentDone ? "concluído" : "escrevendo…"} done={agentDone}>
            Título, descrição e capítulos
          </AgentRow>
        )}
        {published && (
          <AgentRow status="publicado" done>
            Na área de membros · Módulo 3
          </AgentRow>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", height: "100%", minHeight: 0 }}>
      <div style={{ padding: "16px 22px", height: "100%", overflow: "hidden", minWidth: 0 }}>
        <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 8 }}>Aulas › Curso online › Módulo 3</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span className="display" style={{ fontSize: 22 }}>
            aula_trovao_bruta.mp4
          </span>
          {published ? (
            <Chip tone="green" icon={IconCheck}>
              Publicada
            </Chip>
          ) : step > 0 ? (
            <Chip tone="amber">Em edição pela Donna</Chip>
          ) : (
            <Chip>Bruto</Chip>
          )}
        </div>

        {/* preview */}
        <div
          style={{
            position: "relative",
            height: 236,
            borderRadius: 10,
            overflow: "hidden",
            backgroundImage: "linear-gradient(180deg, rgba(0,0,0,.05), rgba(0,0,0,.55)), url(/bg/icm-musgo.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center 40%",
          }}
        >
          <div style={{ position: "absolute", left: 14, top: 12, color: "#fff", opacity: 0.85 }} className="mono">
            {collapsed ? `${mmss(EDITADO * 0.37)} / ${mmss(EDITADO)}` : `${mmss(BRUTO * 0.37)} / ${mmss(BRUTO)}`}
          </div>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
            <span style={{ width: 46, height: 46, borderRadius: 99, background: "rgba(255,255,255,.9)", display: "grid", placeItems: "center" }}>
              <IconPlayerPlayFilled size={18} />
            </span>
          </div>
          <AnimatePresence mode="wait">
            {legenda && (
              <motion.div
                key={legenda}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: 16,
                  translate: "-50% 0",
                  maxWidth: "86%",
                  textAlign: "center",
                  background: "rgba(0,0,0,.72)",
                  color: "#fff",
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontSize: 14,
                }}
              >
                {legenda}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 0 8px" }}>
          <span style={{ fontWeight: 500 }}>Linha do tempo</span>
          <span style={{ color: "var(--text-2)", fontSize: 12 }}>
            Bruto {mmss(BRUTO)}
            {collapsed && (
              <>
                {" "}
                → <b style={{ color: "var(--text-1)", fontWeight: 600 }}>editado {mmss(EDITADO)}</b>
              </>
            )}
          </span>
        </div>

        {/* timeline */}
        <div style={{ position: "relative", width: LABEL + TW, userSelect: "none" }}>
          {/* régua + capítulos */}
          <div style={{ position: "relative", height: 22, marginLeft: LABEL, borderBottom: "1px solid var(--border)" }}>
            {[0, 0.25, 0.5, 0.75].map((f) => (
              <span key={f} className="mono" style={{ position: "absolute", left: f * TW, fontSize: 10, color: "var(--text-3)" }}>
                {mmss(f * (collapsed ? EDITADO : BRUTO))}
              </span>
            ))}
            {collapsed &&
              caps.map((c) => (
                <motion.span
                  key={c.tempo}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  title={c.titulo}
                  style={{ position: "absolute", left: Math.min(0.98, toSec(c.tempo) / EDITADO) * TW, top: 12, width: 2, height: 10, background: "var(--k-red)" }}
                />
              ))}
          </div>
          <Track label="Vídeo" tw={TW}>
            {PIECES.map((p, i) => (
              <div
                key={i}
                style={{
                  flexGrow: p.cut !== undefined && collapsed ? 0.0001 : p.b - p.a,
                  flexBasis: 0,
                  minWidth: 0,
                  transition: "flex-grow .9s cubic-bezier(.65,0,.35,1)",
                  height: "100%",
                  padding: "0 1px",
                }}
              >
                {p.cut === undefined ? (
                  <div style={{ height: "100%", borderRadius: 4, background: "#dfe7f0", border: "1px solid #c3d2e2" }} />
                ) : (
                  <CutBlock on={cutsShown > p.cut} label={CUTS[p.cut].motivo} hide={collapsed} />
                )}
              </div>
            ))}
          </Track>
          <Track label="Áudio" tw={TW}>
            {PIECES.map((p, i) => (
              <div
                key={i}
                style={{
                  flexGrow: p.cut !== undefined && collapsed ? 0.0001 : p.b - p.a,
                  flexBasis: 0,
                  minWidth: 0,
                  overflow: "hidden",
                  transition: "flex-grow .9s cubic-bezier(.65,0,.35,1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  height: "100%",
                  opacity: p.cut !== undefined && cutsShown > p.cut ? 0.3 : 1,
                }}
              >
                {Array.from({ length: Math.round((p.b - p.a) * TW * 0.22) }).map((_, k) => (
                  <span
                    key={k}
                    style={{
                      flex: "none",
                      width: 2,
                      height: p.cut !== undefined ? 3 : 6 + (((i * 31 + k * 17) % 13) * 18) / 13,
                      borderRadius: 2,
                      background: "#9aa3ad",
                    }}
                  />
                ))}
              </div>
            ))}
          </Track>
          <Track label="Legenda" tw={TW}>
            <div style={{ display: "flex", gap: 3, width: "100%", height: "100%", alignItems: "center" }}>
              {Array.from({ length: 16 }).map((_, k) => (
                <motion.span
                  key={k}
                  initial={false}
                  animate={{ opacity: step >= 5 ? 1 : 0, scaleX: step >= 5 ? 1 : 0.2 }}
                  transition={{ delay: step >= 5 ? k * 0.06 : 0 }}
                  style={{ flex: 1 + ((k * 7) % 5) / 4, height: 16, borderRadius: 3, background: "var(--violet-soft)", border: "1px solid #d4ccf7", originX: 0 }}
                />
              ))}
            </div>
          </Track>
          {step < EDIT_STEPS && step > 0 && <Cursor x={cursor.x} y={cursor.y} label="Donna · Editora" />}
        </div>

        {/* lista de cortes */}
        <div style={{ marginTop: 12, display: "grid", gap: 2 }}>
          {CUTS.slice(0, cutsShown).map((c) => (
            <motion.div
              key={c.motivo}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: "flex", gap: 10, alignItems: "center", color: "var(--text-2)", height: 22 }}
            >
              <IconScissors size={13} color="var(--k-red)" />
              <span className="mono" style={{ fontSize: 11 }}>
                {mmss(c.a * BRUTO)}–{mmss(c.b * BRUTO)}
              </span>
              <span>{c.motivo}</span>
              <span style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: 12 }}>−{mmss((c.b - c.a) * BRUTO)}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <aside style={{ borderLeft: "1px solid var(--border)", background: "#fcfcfc", minWidth: 0, overflow: "hidden" }}>{aside}</aside>
    </div>
  );
}

function Track({ label, children, tw }: { label: string; children: React.ReactNode; tw: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", height: 36, borderBottom: "1px solid var(--border)" }}>
      <span style={{ width: LABEL, flex: "none", color: "var(--text-3)", fontSize: 12 }}>{label}</span>
      <div style={{ width: tw, height: 24, display: "flex" }}>{children}</div>
    </div>
  );
}

function CutBlock({ on, label, hide }: { on: boolean; label: string; hide: boolean }) {
  return (
    <div
      style={{
        height: "100%",
        borderRadius: 4,
        transition: "background .4s, border-color .4s, opacity .4s",
        opacity: hide ? 0 : 1,
        background: on ? "repeating-linear-gradient(135deg, rgba(235,49,2,.18) 0 4px, rgba(235,49,2,.05) 4px 8px)" : "#dfe7f0",
        border: `1px solid ${on ? "var(--k-red)" : "#c3d2e2"}`,
        position: "relative",
      }}
      title={label}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4, fontWeight: 500 }}>{label}</div>
      {children}
    </div>
  );
}

/** valor chegando do agente, com marcador cinza enquanto vazio */
function Fill({ v, w = 120, lines = 1, big }: { v?: string; w?: number; lines?: number; big?: boolean }) {
  if (v)
    return (
      <motion.span initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} style={big ? { fontWeight: 600, fontSize: 14, lineHeight: 1.35 } : undefined}>
        {v}
      </motion.span>
    );
  return (
    <span style={{ display: "grid", gap: 6 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <span key={i} style={{ display: "block", width: i === lines - 1 && lines > 1 ? w * 0.6 : w, height: 10, borderRadius: 4, background: "#eef0f0" }} />
      ))}
    </span>
  );
}
