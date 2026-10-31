"use client";

import { AnimatePresence, motion } from "motion/react";
import { IconSparkles } from "@tabler/icons-react";
import { AppWindow, Chip, CountUp } from "@/kit";
import ThoughtLine from "@/kit/rb/ThoughtLine/ThoughtLine";
import { navNumeros, ICONS } from "./Board";
import { ORIGENS, TOTAL, brl, custoAluno, num } from "./data";
import type { Ponto, Resposta } from "./agent";

const COLS = "1.7fr 0.8fr 1.3fr 0.9fr 1.1fr";
const ROW_H = 46;

export type PainelStatus = "idle" | "lendo" | "pronto";

/** Painel com três números por origem, em palavras, e a área onde a resposta da Donna aparece. */
export function Painel({ show, r, status, passos }: { show: boolean; r: Partial<Resposta>; status: PainelStatus; passos: string[] }) {
  const serie = (r.serie ?? []).filter((p): p is Ponto => !!p && !!p.rotulo && typeof p.valor === "number");
  const destaqueOrigem = ORIGENS.find((o) => o.nome === r.destaque)?.id;
  return (
    <AppWindow nav={navNumeros("Painel por origem")}>
      <div style={{ padding: "18px 24px", height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
          <span className="display" style={{ fontSize: 24 }}>
            Painel por origem
          </span>
          <span style={{ color: "var(--text-2)" }}>últimos 30 dias · {TOTAL} pessoas</span>
          <span style={{ marginLeft: "auto" }}>
            <Chip tone="amber">Dados de exemplo</Chip>
          </span>
        </div>

        {/* tabela: três números por origem */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: COLS, height: 28, alignItems: "center", color: "var(--text-3)", fontSize: 12 }}>
            <span>De onde veio</span>
            <span style={{ textAlign: "right" }}>Chegaram</span>
            <span style={{ paddingLeft: 22 }}>Com perfil</span>
            <span style={{ textAlign: "right" }}>Compraram</span>
            <span style={{ textAlign: "right" }}>Custo por quem comprou</span>
          </div>
          {ORIGENS.map((o) => {
            const I = ICONS[o.id];
            const hot = destaqueOrigem === o.id;
            const c = custoAluno(o);
            return (
              <div
                key={o.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: COLS,
                  height: ROW_H,
                  alignItems: "center",
                  borderTop: "1px solid var(--border)",
                  background: hot ? "rgba(235,49,2,.05)" : "transparent",
                  boxShadow: hot ? "inset 2px 0 0 var(--k-red)" : "none",
                  transition: "background .5s, box-shadow .5s",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, paddingLeft: 6 }}>
                  <I size={15} color={hot ? "var(--k-red)" : "var(--text-2)"} />
                  <span style={{ minWidth: 0 }}>
                    <b style={{ fontWeight: 500 }}>{o.nome}</b>
                    <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.detalhe}</span>
                  </span>
                </span>
                <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  <CountUp v={show ? o.chegaram : 0} fmt={(n) => Math.round(n).toString()} ms={1200} />
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 22 }}>
                  <span style={{ flex: 1, height: 6, borderRadius: 4, background: "#eef0f0", overflow: "hidden" }}>
                    <span
                      style={{
                        display: "block",
                        height: "100%",
                        width: show ? `${(o.comPerfil / o.chegaram) * 100}%` : 0,
                        background: "#8a8d90",
                        transition: "width 1.2s cubic-bezier(.22,1,.36,1)",
                      }}
                    />
                  </span>
                  <span style={{ width: 34, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text-2)" }}>{num((o.comPerfil / o.chegaram) * 100)}%</span>
                </span>
                <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  <CountUp v={show ? o.compraram : 0} fmt={(n) => Math.round(n).toString()} ms={1200} />
                </span>
                <span style={{ textAlign: "right", paddingRight: 6, color: c ? "var(--text-1)" : "var(--text-3)", fontWeight: c ? 500 : 400 }}>{c ? brl(c) : "sem verba"}</span>
              </div>
            );
          })}
        </div>

        {/* resposta da Donna */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            marginTop: 18,
            borderRadius: 12,
            border: status === "idle" ? "1px dashed var(--border-strong)" : "1px solid var(--border)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <IconSparkles size={15} color="var(--k-red)" />
            <b style={{ fontWeight: 600 }}>Resposta da Donna</b>
            {r.pergunta && <span style={{ color: "var(--text-2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>· “{r.pergunta}”</span>}
          </div>
          {status === "idle" && <div style={{ color: "var(--text-3)", margin: "auto", fontSize: 14 }}>Pergunte em português. A resposta aparece aqui, com o gráfico.</div>}
          {status === "lendo" && !r.resposta && (
            <div style={{ marginTop: 6 }}>
              <ThoughtLine label={passos[passos.length - 1] ?? "Lendo quem chegou e quem comprou…"} color="var(--text-2)" glyphColor="var(--k-red)" fontSize={14} collapsible={false} showTimer={false} />
            </div>
          )}
          <AnimatePresence>
            {r.resposta && (
              <motion.div key={r.pergunta ?? "r"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
                <p className="display" style={{ margin: "0 0 16px", fontSize: 21, lineHeight: 1.3, maxWidth: 760, textWrap: "pretty" }}>
                  {r.resposta}
                </p>
                {serie.length > 0 && <Barras serie={serie} destaque={r.destaque} unidade={r.unidade ?? "num"} medida={r.medida} />}
                {status === "pronto" && r.sugestao && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Chip tone="red">Sugestão</Chip>
                    <span style={{ color: "var(--text-2)", lineHeight: 1.5 }}>{r.sugestao}</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppWindow>
  );
}

const fmtV = (v: number, u: Resposta["unidade"]) => (u === "pct" ? `${num(v, v < 10 ? 1 : 0)}%` : u === "brl" ? brl(v) : num(v));

/** Barras horizontais: uma mensagem, rótulo direto, cor só na barra que a frase aponta. */
export function Barras({ serie, destaque, unidade, medida }: { serie: Ponto[]; destaque?: string; unidade: Resposta["unidade"]; medida?: string }) {
  const max = Math.max(...serie.map((p) => p.valor), 1);
  return (
    <div role="img" aria-label={`${medida ?? ""}: ${serie.map((p) => `${p.rotulo} ${fmtV(p.valor, unidade)}`).join(", ")}`}>
      {medida && <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 10 }}>{medida}</div>}
      <div style={{ display: "grid", gap: 14 }}>
        {serie.map((p, i) => {
          const hot = p.rotulo === destaque;
          return (
            <div key={p.rotulo} title={`${p.rotulo}: ${fmtV(p.valor, unidade)}${p.nota ? ` (${p.nota})` : ""}`} style={{ display: "grid", gridTemplateColumns: "150px 1fr", alignItems: "center", gap: 12, minHeight: 28 }}>
              <span style={{ color: hot ? "var(--text-1)" : "var(--text-2)", fontWeight: hot ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.rotulo}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(1.5, (p.valor / max) * 78)}%` }}
                  transition={{ duration: 0.9, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  style={{ height: 18, borderRadius: "0 4px 4px 0", background: hot ? "var(--k-red)" : "#c9cbcd", flex: "none" }}
                />
                <span style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                  <b style={{ fontWeight: hot ? 600 : 500 }}>{fmtV(p.valor, unidade)}</b>
                  {p.nota && <span style={{ color: "var(--text-3)", marginLeft: 6 }}>{p.nota}</span>}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
