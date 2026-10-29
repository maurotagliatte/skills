"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconMessageCircle,
  IconChartBar,
  IconSchool,
  IconHeartHandshake,
  IconBrandInstagram,
  IconSpeakerphone,
  IconSearch,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";
import { AppWindow, Chip, type NavEntry, CountUp } from "@/kit";
import { ORIGENS, PESSOAS, TOTAL, type OrigemId } from "./data";

export const navNumeros = (active: string): NavEntry[] => [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda" },
  { icon: IconMessageCircle, label: "Conversas" },
  { section: "Números" },
  ...[
    { icon: IconUsers, label: "Quem chegou" },
    { icon: IconChartBar, label: "Painel por origem" },
    { icon: IconSchool, label: "Alunos" },
  ].map((n) => ({ ...n, active: n.label === active })),
];

export const ICONS: Record<OrigemId, Icon> = {
  indicacao: IconHeartHandshake,
  instagram: IconBrandInstagram,
  anuncio_a: IconSpeakerphone,
  anuncio_b: IconSearch,
};

/** Cena 1: gente chegando de todo lado, cada um com o selo da origem. `chegaram` = quantos da amostra já entraram. */
export function Board({ chegaram }: { chegaram: number }) {
  const vis = PESSOAS.slice(0, chegaram);
  const total = TOTAL - PESSOAS.length + vis.length;
  return (
    <AppWindow nav={navNumeros("Quem chegou")}>
      <div style={{ padding: "18px 22px", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
          <span className="display" style={{ fontSize: 24 }}>
            Quem chegou
          </span>
          <span style={{ color: "var(--text-2)" }}>
            <CountUp v={total} fmt={(n) => Math.round(n).toString()} /> pessoas nos últimos 30 dias
          </span>
          <span style={{ marginLeft: "auto" }}>
            <Chip tone="amber">Dados de exemplo</Chip>
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, flex: 1, minHeight: 0 }}>
          {ORIGENS.map((o) => {
            const I = ICONS[o.id];
            const col = vis.filter((l) => l.origem === o.id).reverse();
            const n = o.chegaram - PESSOAS.filter((l) => l.origem === o.id).length + col.length;
            return (
              <div key={o.id} style={{ background: "#f7f7f7", borderRadius: 10, padding: 8, minWidth: 0, overflow: "hidden" }}>
                <div style={{ padding: "4px 4px 10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <I size={15} color="var(--text-2)" />
                    <b style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{o.nome}</b>
                    <span style={{ marginLeft: "auto", fontVariantNumeric: "tabular-nums", color: "var(--text-2)" }}>
                      <CountUp v={n} fmt={(x) => Math.round(x).toString()} />
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
                        {l.perfil ? <Chip tone="green">com perfil</Chip> : <Chip>sem perfil</Chip>}
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
