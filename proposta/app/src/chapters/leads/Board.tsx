"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconUsersGroup,
  IconChartBar,
  IconSchool,
  IconMessageCircle,
  IconHeartHandshake,
  IconSpeakerphone,
  IconSearch,
  type Icon,
} from "@tabler/icons-react";
import { AppWindow, Chip, type NavEntry } from "@/kit";
import { N } from "./anim";
import { LEADS, ORIGENS, TOTAL_LEADS, type OrigemId } from "./data";

export const NAV: NavEntry[] = [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda" },
  { section: "Comercial" },
  { icon: IconUsersGroup, label: "Leads", active: true },
  { icon: IconChartBar, label: "Painel por origem" },
  { icon: IconSchool, label: "Alunos" },
];

export const ICONS: Record<OrigemId, Icon> = {
  whatsapp: IconMessageCircle,
  indicacao: IconHeartHandshake,
  anuncio_a: IconSpeakerphone,
  anuncio_b: IconSearch,
};

/** `chegaram`: quantos leads da amostra já entraram no quadro */
export function Board({ chegaram }: { chegaram: number }) {
  const vis = LEADS.slice(0, chegaram);
  const total = TOTAL_LEADS - LEADS.length + vis.length;
  return (
    <AppWindow nav={NAV}>
      <div style={{ padding: "18px 22px", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
          <span className="display" style={{ fontSize: 24 }}>
            Leads
          </span>
          <span style={{ color: "var(--text-2)" }}>
            <N v={total} fmt={(n) => Math.round(n).toString()} /> nos últimos 30 dias · por origem
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, flex: 1, minHeight: 0 }}>
          {ORIGENS.map((o) => {
            const I = ICONS[o.id];
            const col = vis.filter((l) => l.origem === o.id).reverse();
            const n = o.leads - LEADS.filter((l) => l.origem === o.id).length + col.length;
            return (
              <div key={o.id} style={{ background: "#f7f7f7", borderRadius: 10, padding: 8, minWidth: 0, overflow: "hidden" }}>
                <div style={{ padding: "4px 4px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <I size={15} color="var(--text-2)" />
                    <b style={{ fontWeight: 600 }}>{o.nome}</b>
                    <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", color: "var(--text-2)" }}>
                      <N v={n} fmt={(x) => Math.round(x).toString()} />
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{o.detalhe}</div>
                </div>
                <div style={{ display: "grid", gap: 6 }}>
                  <AnimatePresence initial={false}>
                    {col.map((l) => (
                      <motion.div
                        key={l.nome}
                        layout
                        initial={{ opacity: 0, y: -14, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px", boxShadow: "var(--shadow-card)" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                          <b style={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.nome}</b>
                          <span style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap" }}>{l.quando}</span>
                        </div>
                        <div style={{ color: "var(--text-2)", fontSize: 12, margin: "2px 0 6px" }}>{l.interesse}</div>
                        {l.qualificado ? <Chip tone="green">qualificado</Chip> : <Chip>sem perfil</Chip>}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppWindow>
  );
}
