"use client";

import { motion } from "motion/react";
import {
  IconMicrophone,
  IconReceipt,
  IconCalendarEvent,
  IconSchool,
  IconUsersGroup,
  IconWorldSearch,
  IconPalette,
  IconSearch,
  IconTargetArrow,
  IconFileText,
  IconPhoto,
  IconPresentation,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Chip, AgentRow } from "@/kit";
import { MODULOS } from "./escopo";

/** Miniaturas dos 9 módulos no canvas (eco da abertura). Posições em coordenadas do mundo. */
export const MINI_W = 460;
export const MINI_H = 280;
export const MINI_POS = [
  { x: 260, y: 300 },
  { x: 790, y: 260 },
  { x: 1320, y: 320 },
  { x: 240, y: 650 },
  { x: 770, y: 610 },
  { x: 1300, y: 670 },
  { x: 280, y: 1000 },
  { x: 810, y: 960 },
  { x: 1340, y: 1020 },
];
const PHOTOS = ["icm-dourado", "icm-areia", "icm-oliva", "icm-musgo", "icm-noite", "icm-pessego", "icm-oliva", "icm-dourado", "icm-areia"];
const ICONS: Icon[] = [IconMicrophone, IconReceipt, IconCalendarEvent, IconSchool, IconUsersGroup, IconWorldSearch, IconPalette, IconSearch, IconTargetArrow];

const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: "1px solid var(--border)" };

function Body({ i }: { i: number }) {
  switch (i) {
    case 0:
      return (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <Chip>Trovão</Chip>
            <Chip tone="red">AAEP 3/5</Chip>
            <Chip tone="violet">tarso</Chip>
          </div>
          <AgentRow status="concluído" done>
            Estruturado a partir de um áudio
          </AgentRow>
        </>
      );
    case 1:
      return (
        <>
          {[
            ["Casa do Cavalo", "R$ 2.340,00"],
            ["Energia elétrica", "R$ 1.118,40"],
          ].map(([a, b]) => (
            <div key={a} style={row}>
              <span>{a}</span>
              <span>
                {b} <Chip tone="amber">amanhã</Chip>
              </span>
            </div>
          ))}
        </>
      );
    case 2:
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, height: 92 }}>
          {[0, 1, 2, 3, 4].map((d) => (
            <div key={d} style={{ position: "relative", background: "#f5f6f6", borderRadius: 6 }}>
              {d === 3 && <div style={{ position: "absolute", left: 3, right: 3, top: 14, height: 30, borderRadius: 4, background: "var(--k-red-soft)", borderLeft: "3px solid var(--k-red)" }} />}
              {d === 1 && <div style={{ position: "absolute", left: 3, right: 3, top: 40, height: 34, borderRadius: 4, background: "var(--violet-soft)" }} />}
              {d === 0 && <div style={{ position: "absolute", left: 3, right: 3, top: 6, height: 40, borderRadius: 4, background: "var(--sky-soft)" }} />}
            </div>
          ))}
        </div>
      );
    case 3:
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ width: 64, height: 40, borderRadius: 6, background: "var(--dark-2)", display: "grid", placeItems: "center", color: "#fff" }}>
              <IconPlayerPlayFilled size={14} />
            </span>
            <span>
              <b style={{ fontWeight: 600 }}>Aula 7 · Biomecânica do tarso</b>
              <span style={{ display: "block", color: "var(--text-3)", fontSize: 12 }}>legenda e descrição prontas</span>
            </span>
          </div>
          <Chip tone="green">publicada na sua plataforma</Chip>
        </>
      );
    case 4:
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {[
            ["Indicação", 86],
            ["Anúncio B", 64],
            ["Anúncio A", 28],
          ].map(([k, v]) => (
            <div key={k as string} style={{ display: "grid", gridTemplateColumns: "84px 1fr", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--text-2)" }}>{k}</span>
              <span style={{ height: 10, borderRadius: 4, background: "#eef0f0" }}>
                <span style={{ display: "block", width: `${v}%`, height: "100%", borderRadius: 4, background: v === 28 ? "var(--k-red)" : "#c9cccf" }} />
              </span>
            </div>
          ))}
        </div>
      );
    case 5:
      return (
        <>
          <b style={{ fontWeight: 600, display: "block", marginBottom: 4 }}>Esparavão: sinais, diagnóstico e manejo</b>
          <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 8 }}>meta · headings · links internos</div>
          <div style={{ display: "flex", gap: 6 }}>
            <Chip tone="green">publicado</Chip>
            <Chip>SEO 92</Chip>
          </div>
        </>
      );
    case 6:
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            [IconFileText, "Laudo"],
            [IconPhoto, "Arte"],
            [IconPresentation, "Slides"],
          ].map(([I, l]) => {
            const C = I as Icon;
            return (
              <div key={l as string} style={{ height: 78, borderRadius: 8, border: "1px solid var(--border)", display: "grid", placeItems: "center", alignContent: "center", gap: 4, color: "var(--text-2)" }}>
                <C size={20} />
                <span style={{ fontSize: 12 }}>{l as string}</span>
              </div>
            );
          })}
        </div>
      );
    case 7:
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, height: 30, padding: "0 10px", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-2)", marginBottom: 8 }}>
            <IconSearch size={14} /> claudicação posterior em potro
          </div>
          {[
            ["Estrela Dalva · 2025", "0,91"],
            ["Zarco · 2024", "0,87"],
          ].map(([a, b]) => (
            <div key={a} style={row}>
              <span>{a}</span>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                {b}
              </span>
            </div>
          ))}
        </>
      );
    default:
      return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 92 }}>
          {[92, 80, 70, 58, 50, 42, 36].map((h, k) => (
            <span key={k} style={{ flex: 1, height: h, borderRadius: 4, background: k === 6 ? "var(--k-red)" : "#e5e7e8" }} />
          ))}
        </div>
      );
  }
}

export function Minis({ show }: { show: boolean }) {
  return (
    <>
      {MODULOS.map((m, i) => {
        const I = ICONS[i];
        const p = MINI_POS[i];
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: show ? 1 : 0, y: show ? 0 : 30 }}
            transition={{ delay: 0.08 * i, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "absolute",
              left: p.x,
              top: p.y,
              width: MINI_W,
              height: MINI_H,
              borderRadius: 22,
              overflow: "hidden",
              backgroundImage: `url(/bg/${PHOTOS[i]}.webp)`,
              backgroundSize: "cover",
              backgroundPosition: `${(i * 23) % 100}% center`,
            }}
          >
            <div style={{ position: "absolute", inset: "9% 7% -6% 7%", background: "#fff", borderRadius: 12, boxShadow: "var(--shadow-window)", padding: "14px 16px", color: "var(--text-1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <I size={16} />
                <b style={{ fontWeight: 600 }}>{m.titulo}</b>
                <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--k-red)" }}>
                  {m.capitulo}
                </span>
              </div>
              <Body i={i} />
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
