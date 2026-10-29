"use client";

import { motion, AnimatePresence } from "motion/react";
import { IconCash, IconStethoscope } from "@tabler/icons-react";
import type { Alerta } from "./agent";

/** Celular na tela de bloqueio recebendo o push agendado pela Donna. */
export function LockScreen({ alerta }: { alerta?: Partial<Alerta> }) {
  const hora = alerta?.quando?.match(/(\d{1,2}:\d{2})/)?.[1] ?? "08:00";
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: 46, background: "#0b0b0b", padding: 12, boxShadow: "var(--shadow-window)" }}>
      <div
        style={{
          position: "relative",
          height: "100%",
          borderRadius: 36,
          overflow: "hidden",
          backgroundImage: "linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.05) 40%, rgba(0,0,0,.45)), url(/bg/icm-noite.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
          padding: "60px 16px 20px",
        }}
      >
        <div style={{ textAlign: "center", fontSize: 15, opacity: 0.85 }}>quinta-feira, 12 de novembro</div>
        <div className="display" style={{ textAlign: "center", fontSize: 88, lineHeight: 1, margin: "6px 0 34px", fontWeight: 500 }}>
          {hora}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <AnimatePresence>
            {alerta?.titulo && (
              <motion.div
                key="push"
                initial={{ opacity: 0, y: -40, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
              >
                <Notif icon={<IconCash size={18} />} app="Financeiro" when="agora" title={alerta.titulo} text={alerta.mensagem} strong />
              </motion.div>
            )}
          </AnimatePresence>
          <Notif icon={<IconStethoscope size={18} />} app="Prontuários" when="ontem" title="Prontuário do Trovão salvo" text="Retorno marcado para 26/11 na agenda." />
        </div>
      </div>
    </div>
  );
}

function Notif({ icon, app, when, title, text, strong }: { icon: React.ReactNode; app: string; when: string; title: string; text?: string; strong?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "38px 1fr",
        gap: 10,
        padding: "12px 14px",
        borderRadius: 20,
        background: strong ? "rgba(250,250,250,.86)" : "rgba(250,250,250,.55)",
        backdropFilter: "blur(18px)",
        color: "var(--text-1)",
        boxShadow: strong ? "0 12px 30px -12px rgba(0,0,0,.5)" : undefined,
      }}
    >
      <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--k-red)", color: "#fff", display: "grid", placeItems: "center" }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-2)" }}>
          <span>Clínica · {app}</span>
          <span>{when}</span>
        </span>
        <b style={{ display: "block", fontWeight: 600, fontSize: 15, margin: "2px 0" }}>{title}</b>
        {text && <span style={{ display: "block", fontSize: 13, lineHeight: 1.4, color: "var(--text-1)" }}>{text}</span>}
      </span>
    </div>
  );
}
