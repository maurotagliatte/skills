"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconStethoscope,
  IconHorse,
  IconCash,
  IconFiles,
  IconReportMoney,
  IconSparkles,
  IconPaperclip,
  IconFilter,
  IconPlus,
  IconArrowsExchange,
} from "@tabler/icons-react";
import { AppWindow, Chip, AgentRow, type NavEntry } from "@/kit";
import { CONTAS_EXISTENTES, HOJE_CENA, type Comprovante } from "./agent";

export const NAV: NavEntry[] = [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda" },
  { section: "Clínica" },
  { icon: IconStethoscope, label: "Prontuários" },
  { icon: IconHorse, label: "Pacientes" },
  { section: "Gestão" },
  { icon: IconCash, label: "Contas a pagar", active: true },
  { icon: IconReportMoney, label: "Contas a receber" },
  { icon: IconFiles, label: "Documentos" },
];

export type Activity = { label: string; done: boolean }[];

const AMANHA = "13/11/2026";
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const num = (s?: string) => {
  const m = s?.replace(/[^\d,]/g, "").replace(",", ".");
  const n = m ? Number(m) : NaN;
  return Number.isFinite(n) ? n : 0;
};
const curta = (d?: string) => (d && /^\d{2}\/\d{2}/.test(d) ? d.slice(0, 5) : d);

/** Valor que aparece com fade + desfoque quando chega do agente (mesmo efeito do prontuário). */
function V({ v, w = 80 }: { v?: string; w?: number }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {v ? (
        <motion.span key="v" initial={{ opacity: 0, filter: "blur(6px)", y: 3 }} animate={{ opacity: 1, filter: "blur(0px)", y: 0 }} transition={{ duration: 0.45 }}>
          {v}
        </motion.span>
      ) : (
        <motion.span key="s" exit={{ opacity: 0 }} style={{ display: "inline-block", width: w, height: 10, borderRadius: 4, background: "#eceeee", verticalAlign: "middle" }} />
      )}
    </AnimatePresence>
  );
}

const GRID = "minmax(0,1fr) 128px 84px 70px 104px 104px";

function Status({ venc, pago }: { venc?: string; pago?: boolean }) {
  if (pago) return <Chip tone="green">pago</Chip>;
  if (venc === AMANHA) return <Chip tone="amber">vence amanhã</Chip>;
  return <Chip>em aberto</Chip>;
}

export function Payables({ novo, showNew, activity }: { novo: Partial<Comprovante>; showNew: boolean; activity: Activity }) {
  const abertas = CONTAS_EXISTENTES.filter((c) => c.status === "aberto");
  const totalAberto = abertas.reduce((s, c) => s + num(c.valor), 0) + (showNew ? num(novo.valor) : 0);
  const amanha = abertas.filter((c) => c.vencimento === AMANHA).length + (showNew && novo.vencimento === AMANHA ? 1 : 0);

  return (
    <AppWindow nav={NAV}>
      <div style={{ padding: "18px 24px", height: "100%", overflow: "hidden" }}>
        <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 10 }}>Financeiro › Contas a pagar</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span className="display" style={{ fontSize: 26 }}>
            Contas a pagar
          </span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 8, color: "var(--text-2)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 6 }}>
              <IconFilter size={14} /> Novembro
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 10px", borderRadius: 6, background: "var(--text-1)", color: "#fff" }}>
              <IconPlus size={14} /> Lançar
            </span>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          <Stat label="Em aberto" value={brl(totalAberto)} />
          <Stat label="Vencem amanhã" value={`${amanha} ${amanha === 1 ? "conta" : "contas"}`} tone={amanha > 1 ? "amber" : undefined} />
          <Stat label="Hoje" value={`qui, ${HOJE_CENA.slice(0, 5)}`} />
        </div>

        <AnimatePresence>
          {activity.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              style={{ border: "1px solid var(--border)", borderRadius: 10, marginBottom: 12, background: "#fcfcfc", display: "grid", gridTemplateColumns: activity.length > 1 ? "1fr 1fr" : "1fr" }}
            >
              {activity.map((a) => (
                <AgentRow key={a.label} status={a.done ? "concluído" : "trabalhando…"} done={a.done}>
                  {a.label}
                </AgentRow>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, padding: "0 10px 8px", color: "var(--text-3)", fontSize: 12, borderBottom: "1px solid var(--border)" }}>
          <span>Fornecedor</span>
          <span>Categoria</span>
          <span>Vencimento</span>
          <span>Forma</span>
          <span style={{ textAlign: "right" }}>Valor</span>
          <span>Status</span>
        </div>

        <AnimatePresence initial={false}>
          {showNew && (
            <motion.div
              key="novo"
              initial={{ opacity: 0, height: 0, backgroundColor: "rgba(235,49,2,0.08)" }}
              animate={{ opacity: 1, height: 62, backgroundColor: novo.descricao ? "rgba(235,49,2,0.035)" : "rgba(235,49,2,0.08)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden", borderBottom: "1px solid var(--border)", borderLeft: "2px solid var(--k-red)" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, alignItems: "center", height: 62, padding: "0 10px" }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                    <V v={novo.fornecedor} w={150} />
                    {novo.fornecedor && (
                      <Chip tone="red" icon={IconSparkles}>
                        Donna
                      </Chip>
                    )}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-3)", fontSize: 12, marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    <IconPaperclip size={12} style={{ flex: "none" }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      <V v={novo.descricao} w={200} />
                    </span>
                  </span>
                </span>
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <V v={novo.categoria} w={90} />
                </span>
                <span>
                  <V v={curta(novo.vencimento)} w={44} />
                </span>
                <span>
                  <V v={novo.forma_pagamento} w={44} />
                </span>
                <span style={{ textAlign: "right", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>
                  <V v={novo.valor} w={70} />
                </span>
                <span>{novo.vencimento ? <Status venc={novo.vencimento} /> : <V w={70} />}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {CONTAS_EXISTENTES.map((c) => (
          <div key={c.fornecedor} style={{ display: "grid", gridTemplateColumns: GRID, gap: 12, alignItems: "center", height: 56, padding: "0 10px", borderBottom: "1px solid var(--border)", color: c.status === "pago" ? "var(--text-3)" : undefined }}>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontWeight: 500, color: c.status === "pago" ? "var(--text-2)" : undefined }}>{c.fornecedor}</span>
              <span style={{ display: "block", color: "var(--text-3)", fontSize: 12, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.descricao}</span>
            </span>
            <span>{c.categoria}</span>
            <span>{curta(c.vencimento)}</span>
            <span>{c.forma}</span>
            <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{c.valor}</span>
            <span>
              <Status venc={c.vencimento} pago={c.status === "pago"} />
            </span>
          </div>
        ))}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, marginBottom: 8 }}>
              <IconArrowsExchange size={15} color="var(--text-3)" /> Conciliação · extrato de outubro
            </div>
            <div style={{ height: 6, borderRadius: 6, background: "#eef0f0", overflow: "hidden" }}>
              <div style={{ width: "78%", height: "100%", background: "var(--green)" }} />
            </div>
            <div style={{ marginTop: 6, color: "var(--text-3)", fontSize: 12 }}>14 de 18 lançamentos conferidos com o banco</div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 500, marginBottom: 8 }}>
              <IconReportMoney size={15} color="var(--text-3)" /> Contas a receber · novembro
            </div>
            <div className="display" style={{ fontSize: 20 }}>R$ 18.420,00</div>
            <div style={{ marginTop: 2, color: "var(--text-3)", fontSize: 12 }}>atendimentos em haras e vendas de cursos</div>
          </div>
        </div>
      </div>
    </AppWindow>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "amber" }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", background: tone ? "var(--amber-soft)" : undefined, transition: "background .4s" }}>
      <div style={{ fontSize: 11, color: tone ? "#8a5300" : "var(--text-3)" }}>{label}</div>
      <motion.div key={value} initial={{ opacity: 0.2, y: 3 }} animate={{ opacity: 1, y: 0 }} className="display" style={{ fontSize: 20, marginTop: 2, color: tone ? "#8a5300" : undefined }}>
        {value}
      </motion.div>
    </div>
  );
}
