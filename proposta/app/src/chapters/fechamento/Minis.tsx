"use client";

import { motion } from "motion/react";
import {
  IconMicrophone,
  IconReceipt,
  IconMessages,
  IconChartBar,
  IconSchool,
  IconPhoto,
  IconPlayerPlayFilled,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Chip, AgentRow, PhotoGrain } from "@/kit";
import { MODULOS } from "./escopo";

/** Miniaturas dos 6 módulos no canvas (eco da abertura). Posições em coordenadas do mundo. */
export const MINI_W = 460;
export const MINI_H = 280;
export const MINI_POS = [
  { x: 260, y: 400 },
  { x: 790, y: 400 },
  { x: 1320, y: 400 },
  { x: 260, y: 740 },
  { x: 790, y: 740 },
  { x: 1320, y: 740 },
];
const PHOTOS = ["icm-dourado", "icm-areia", "icm-oliva", "icm-musgo", "icm-pessego", "icm-noite"];
const ICONS: Icon[] = [IconMicrophone, IconReceipt, IconMessages, IconChartBar, IconSchool, IconPhoto];

const row: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderTop: "1px solid var(--border)" };

function Body({ i }: { i: number }) {
  switch (i) {
    case 0:
      return (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <Chip>Relatório · Trovão</Chip>
            <Chip tone="green">enviado ao Ricardo</Chip>
          </div>
          <AgentRow status="pronto" done>
            Montado a partir de um áudio de 1min12s
          </AgentRow>
        </>
      );
    case 1:
      return (
        <>
          {[
            ["Ferrador Silva", "R$ 680,00"],
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
        <>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
            <IconBrandWhatsapp size={16} color="var(--green)" style={{ flex: "none", marginTop: 2 }} />
            <span style={{ background: "#f3f4f4", borderRadius: "4px 10px 10px 10px", padding: "6px 10px" }}>
              <b style={{ fontWeight: 600, display: "block", fontSize: 12 }}>Ricardo</b>
              Quando reavalia o Trovão?
            </span>
          </div>
          <Chip tone="sky">Reavaliação · Trovão · qui, 9h</Chip>
        </>
      );
    case 3:
      return (
        <div style={{ display: "grid", gap: 6 }}>
          {(
            [
              ["Indicação", 77],
              ["Anúncio B", 75],
              ["Anúncio A", 27],
            ] as const
          ).map(([k, v]) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "84px 1fr 34px", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--text-2)" }}>{k}</span>
              <span style={{ height: 10, borderRadius: 4, background: "#eef0f0" }}>
                <span style={{ display: "block", width: `${v}%`, height: "100%", borderRadius: 4, background: v === 27 ? "var(--k-red)" : "#c9cccf" }} />
              </span>
              <span style={{ fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{v}%</span>
            </div>
          ))}
          <span style={{ color: "var(--text-3)", fontSize: 12 }}>com perfil de cliente, por origem · exemplo</span>
        </div>
      );
    case 4:
      return (
        <>
          <div style={row}>
            <span>Na plataforma atual</span>
            <span style={{ color: "var(--k-red)", fontVariantNumeric: "tabular-nums" }}>− R$ 101,19</span>
          </div>
          <div style={row}>
            <span>Na sua plataforma</span>
            <span>só a taxa do cartão</span>
          </div>
          <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 6 }}>numa venda de R$ 997 · exemplo</div>
        </>
      );
    default:
      return (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ width: 64, height: 40, borderRadius: 6, background: "var(--dark-2)", display: "grid", placeItems: "center", color: "#fff", flex: "none" }}>
              <IconPlayerPlayFilled size={14} />
            </span>
            <span>
              <b style={{ fontWeight: 600 }}>Módulo 3 · Claudicação posterior: o caso do Trovão</b>
            </span>
          </div>
          <div style={{ color: "var(--text-2)" }}>Post: Claudicação posterior em cavalos: como identificar cedo</div>
        </>
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
            }}
          >
            <PhotoGrain photo={PHOTOS[i]} position={`${(i * 23) % 100}% center`} />
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
