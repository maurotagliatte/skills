"use client";

import { motion } from "motion/react";
import { AppWindow, AgentRow, Chip, Cursor } from "@/kit";
import { N } from "./anim";
import { NAV, ICONS } from "./Board";
import { ORIGENS, TOTAL_LEADS, metricas, type OrigemId } from "./data";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/ /g, " ");
const pct = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%`;

const COLS = "1.75fr 0.5fr 1.15fr 0.8fr 0.8fr 0.8fr 1.1fr";
const ROW_H = 46;
const HEAD_H = 30;
const MAX = 180;

export type PanelState = {
  /** origem destacada pela Donna */
  destaque?: OrigemId;
  /** origem do insight que está sendo escrito agora (cursor) */
  apontando?: OrigemId;
  /** status da análise */
  status?: "idle" | "lendo" | "escrevendo" | "pronto";
  /** cena: números animando */
  show: boolean;
};

export function Panel({ destaque, apontando, status = "idle", show }: PanelState) {
  const idx = (id?: OrigemId) => ORIGENS.findIndex((o) => o.id === id);
  const focusCplq = status === "escrevendo" || status === "pronto";
  const cur = idx(apontando);
  return (
    <AppWindow nav={NAV.map((n) => ("label" in n ? { ...n, active: n.label === "Painel por origem" } : n))}>
      <div style={{ padding: "18px 24px", height: "100%", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <span className="display" style={{ fontSize: 24 }}>
            Painel por origem
          </span>
          <span style={{ color: "var(--text-2)" }}>últimos 30 dias · {TOTAL_LEADS} leads</span>
        </div>
        <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 16 }}>
          Qualificado = perfil e interesse confirmados no primeiro contato. Venda = matrícula em curso ou consulta fechada.
        </div>

        {/* tabela */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "grid", gridTemplateColumns: COLS, height: HEAD_H, alignItems: "center", color: "var(--text-3)", fontSize: 12 }}>
            <span>Origem</span>
            <span style={{ textAlign: "right" }}>Leads</span>
            <span style={{ paddingLeft: 16 }}>% qualificado</span>
            <span style={{ textAlign: "right" }}>Conversão</span>
            <span style={{ textAlign: "right" }}>Verba</span>
            <span style={{ textAlign: "right" }}>Custo/lead</span>
            <span style={{ textAlign: "right", color: focusCplq ? "var(--k-red)" : undefined, fontWeight: focusCplq ? 600 : 400, transition: "color .4s" }}>
              Custo/qualificado
            </span>
          </div>
          {ORIGENS.map((o) => {
            const m = metricas(o);
            const I = ICONS[o.id];
            const hot = destaque === o.id;
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
                  transition: "background .5s",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <I size={15} color={hot ? "var(--k-red)" : "var(--text-2)"} />
                  <span style={{ minWidth: 0 }}>
                    <b style={{ fontWeight: 500 }}>{o.nome}</b>
                    <span style={{ display: "block", fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.detalhe}</span>
                  </span>
                </span>
                <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  <N v={show ? o.leads : 0} fmt={(n) => Math.round(n).toString()} ms={1200} />
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 16 }}>
                  <span style={{ flex: 1, height: 6, borderRadius: 4, background: "#eef0f0", overflow: "hidden" }}>
                    <span
                      style={{
                        display: "block",
                        height: "100%",
                        width: show ? `${m.pctQualificado}%` : 0,
                        background: m.pctQualificado < 40 ? "#d9a27d" : "var(--green)",
                        transition: "width 1.2s cubic-bezier(.22,1,.36,1)",
                      }}
                    />
                  </span>
                  <span style={{ width: 34, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{pct(m.pctQualificado)}</span>
                </span>
                <span style={{ textAlign: "right" }}>{m.conversao.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%</span>
                <span style={{ textAlign: "right", color: o.verba ? undefined : "var(--text-3)" }}>{o.verba ? brl(o.verba).replace(",00", "") : "orgânico"}</span>
                <span style={{ textAlign: "right", color: m.cpl ? undefined : "var(--text-3)" }}>{m.cpl ? brl(m.cpl) : "—"}</span>
                <span style={{ textAlign: "right", fontWeight: focusCplq && m.cplq ? 600 : 400, color: hot && focusCplq ? "#a32202" : m.cplq ? undefined : "var(--text-3)" }}>
                  {m.cplq ? brl(m.cplq) : "—"}
                </span>
              </div>
            );
          })}
          {/* contorno da origem destacada */}
          <motion.div
            initial={false}
            animate={{ opacity: destaque ? 1 : 0, top: HEAD_H + Math.max(0, idx(destaque)) * ROW_H }}
            transition={{ duration: 0.5 }}
            style={{ position: "absolute", left: -8, right: -8, height: ROW_H, border: "1.5px solid var(--k-red)", borderRadius: 8, pointerEvents: "none" }}
          />
          {cur >= 0 && status !== "pronto" && <Cursor x={560} y={HEAD_H + cur * ROW_H + 26} label="Donna" />}
        </div>

        {/* gráficos */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 14, marginTop: 22 }}>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 500 }}>Volume e qualificação</span>
              <span style={{ display: "flex", gap: 10, fontSize: 11, color: "var(--text-3)" }}>
                <Legend c="var(--text-1)">qualificados</Legend>
                <Legend c="#dcdedf">sem perfil</Legend>
              </span>
            </div>
            {ORIGENS.map((o) => (
              <div key={o.id} style={{ display: "grid", gridTemplateColumns: "78px 1fr", alignItems: "center", gap: 8, height: 26 }}>
                <span style={{ color: destaque === o.id ? "var(--k-red)" : "var(--text-2)", fontWeight: destaque === o.id ? 600 : 400 }}>{o.nome}</span>
                <span style={{ display: "flex", height: 12, width: show ? `${(o.leads / MAX) * 100}%` : 0, transition: "width 1.2s cubic-bezier(.22,1,.36,1)", borderRadius: 3, overflow: "hidden" }}>
                  <span style={{ flex: o.qualificados, background: destaque === o.id ? "var(--k-red)" : "var(--text-1)" }} />
                  <span style={{ flex: o.leads - o.qualificados, background: destaque === o.id ? "rgba(235,49,2,.25)" : "#dcdedf" }} />
                </span>
              </div>
            ))}
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontWeight: 500, marginBottom: 10 }}>Custo por lead × por lead qualificado</div>
            {ORIGENS.filter((o) => o.verba).map((o) => {
              const m = metricas(o);
              return (
                <div key={o.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12, color: destaque === o.id ? "var(--k-red)" : "var(--text-2)", fontWeight: destaque === o.id ? 600 : 400, marginBottom: 3 }}>{o.nome}</div>
                  <Pair label="por lead" v={m.cpl!} show={show} c="#c9cbcd" />
                  <Pair label="qualificado" v={m.cplq!} show={show} c={focusCplq ? (destaque === o.id ? "var(--k-red)" : "var(--text-1)") : "#8a8d90"} />
                </div>
              );
            })}
          </div>
        </div>

        {/* atividade */}
        <div style={{ marginTop: 14, minHeight: 50 }}>
          {status === "lendo" && <AgentRow status="lendo os dados…">Cruzando {TOTAL_LEADS} leads com origem, perfil e venda</AgentRow>}
          {status === "escrevendo" && <AgentRow status="escrevendo análise…">Comparando custo por lead qualificado entre as origens</AgentRow>}
          {status === "pronto" && (
            <AgentRow status="concluído" done>
              Análise pronta · origem em destaque: <Chip tone="red">{ORIGENS[Math.max(0, idx(destaque))].nome}</Chip>
            </AgentRow>
          )}
        </div>
      </div>
    </AppWindow>
  );
}

function Pair({ label, v, show, c }: { label: string; v: number; show: boolean; c: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 70px", alignItems: "center", gap: 8, height: 18 }}>
      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</span>
      <span style={{ height: 8, borderRadius: 3, background: c, width: show ? `${(v / 90) * 100}%` : 0, transition: "width 1.2s cubic-bezier(.22,1,.36,1), background .4s" }} />
      <span style={{ textAlign: "right", fontSize: 12, fontVariantNumeric: "tabular-nums" }}>{brl(v)}</span>
    </div>
  );
}

function Legend({ c, children }: { c: string; children: React.ReactNode }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
      {children}
    </span>
  );
}
