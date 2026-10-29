"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconStethoscope,
  IconHorse,
  IconCash,
  IconFiles,
  IconSchool,
  IconMapPin,
  IconClock,
  IconBell,
  IconCalendar,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { AppWindow, AgentRow, Chip, Prop, Cursor, type NavEntry } from "@/kit";
import { DIAS, fmtCurta, somaDias, diaIndex, hora } from "./datas";
import type { Evento } from "./agent";

export const NAV: NavEntry[] = [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda", active: true },
  { section: "Clínica" },
  { icon: IconStethoscope, label: "Prontuários" },
  { icon: IconHorse, label: "Pacientes" },
  { section: "Gestão" },
  { icon: IconCash, label: "Financeiro" },
  { icon: IconSchool, label: "Cursos" },
  { icon: IconFiles, label: "Documentos" },
];

export type Activity = { label: string; done: boolean }[];

/** Semana dela (dia 0 = segunda). Quinta de manhã fica livre para o pedido. */
const FIXOS: { dia: number; ini: number; fim: number; titulo: string; sub: string; tone: "neutral" | "violet" | "sky" | "green" }[] = [
  { dia: 0, ini: 8, fim: 12, titulo: "Consultório", sub: "atendimentos", tone: "neutral" },
  { dia: 0, ini: 14, fim: 15.5, titulo: "Estrela Dalva", sub: "retorno · Boa Vista", tone: "sky" },
  { dia: 1, ini: 9, fim: 11, titulo: "Gravação", sub: "aula 7 · curso", tone: "violet" },
  { dia: 1, ini: 15, fim: 17, titulo: "Exame de compra", sub: "Zarco", tone: "sky" },
  { dia: 2, ini: 13, fim: 17, titulo: "Haras Boa Vista", sub: "rotina do plantel", tone: "sky" },
  { dia: 3, ini: 13.5, fim: 15, titulo: "Pérola", sub: "ultrassom", tone: "sky" },
  { dia: 4, ini: 8, fim: 10, titulo: "Consultório", sub: "atendimentos", tone: "neutral" },
  { dia: 4, ini: 16, fim: 17, titulo: "Contabilidade", sub: "fechamento do mês", tone: "green" },
];
const TONES = {
  neutral: { bg: "#f2f3f3", bar: "#b8bbbe", fg: "var(--text-1)" },
  violet: { bg: "var(--violet-soft)", bar: "var(--violet)", fg: "#3d2f80" },
  sky: { bg: "var(--sky-soft)", bar: "var(--sky)", fg: "#06506d" },
  green: { bg: "var(--green-soft)", bar: "var(--green)", fg: "#125430" },
};

const H0 = 7;
const H1 = 18;
const ROW = 57;

function V({ v, w = 100 }: { v?: string; w?: number }) {
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

export function Week({ segunda, hoje, ev, done, activity }: { segunda: Date; hoje: Date; ev: Partial<Evento>; done: boolean; activity: Activity }) {
  const dia = diaIndex(ev.dia_semana);
  const ini = hora(ev.inicio);
  const fim = hora(ev.fim) ?? (ini !== undefined ? ini + 1.5 : undefined);
  const placed = dia !== undefined && ini !== undefined && ini >= H0 && ini < H1;
  const sexta = somaDias(segunda, 4);
  const hojeIdx = Math.round((hoje.getTime() - segunda.getTime()) / 86400000);

  const aside = (
    <div style={{ padding: 16, display: "grid", gap: 2 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Novo compromisso</div>
      <div className="display" style={{ fontSize: 20, marginBottom: 8, minHeight: 26 }}>
        <V v={ev.titulo} w={170} />
      </div>
      <Prop icon={IconCalendar} label="Dia">
        <V v={ev.dia_semana && ev.data ? `${ev.dia_semana.split("-")[0]}, ${ev.data.slice(0, 5)}` : undefined} w={90} />
      </Prop>
      <Prop icon={IconClock} label="Horário">
        <V v={ev.inicio && ev.fim ? `${ev.inicio} – ${ev.fim}` : undefined} w={80} />
      </Prop>
      <Prop icon={IconMapPin} label="Local">
        <V v={ev.local} w={100} />
      </Prop>
      <Prop icon={IconHorse} label="Paciente">
        {ev.paciente ? <Chip tone="red">{ev.paciente}</Chip> : <V w={60} />}
      </Prop>
      <Prop icon={IconBell} label="Lembrete">
        <V v={ev.lembrete} w={110} />
      </Prop>
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Atividade</div>
        {activity.map((a) => (
          <AgentRow key={a.label} status={a.done ? "concluído" : "trabalhando…"} done={a.done}>
            {a.label}
          </AgentRow>
        ))}
        {!activity.length && <div style={{ color: "var(--text-3)", padding: "8px 0" }}>Aguardando o seu pedido.</div>}
      </div>
    </div>
  );

  return (
    <AppWindow nav={NAV} aside={aside}>
      <div style={{ padding: "16px 18px", height: "100%", overflow: "hidden", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span className="display" style={{ fontSize: 24 }}>
            Agenda
          </span>
          <span style={{ display: "inline-flex", gap: 2, color: "var(--text-3)", marginLeft: 6 }}>
            <IconChevronLeft size={16} />
            <IconChevronRight size={16} />
          </span>
          <span style={{ color: "var(--text-2)" }}>
            {fmtCurta(segunda)} a {fmtCurta(sexta)}
          </span>
          <span style={{ marginLeft: "auto" }}>
            <Chip tone="green" icon={IconRefresh}>
              Google Agenda
            </Chip>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: `36px repeat(5, 1fr)`, borderBottom: "1px solid var(--border)" }}>
          <span />
          {DIAS.map((d, i) => (
            <span key={d} style={{ padding: "0 6px 8px", color: i === hojeIdx ? "var(--k-red)" : "var(--text-2)", fontWeight: i === hojeIdx ? 600 : 500 }}>
              {d.slice(0, 3)} <span style={{ color: i === hojeIdx ? "var(--k-red)" : "var(--text-3)", fontWeight: 400 }}>{fmtCurta(somaDias(segunda, i)).slice(0, 2)}</span>
            </span>
          ))}
        </div>

        <div style={{ position: "relative", display: "grid", gridTemplateColumns: `36px repeat(5, 1fr)`, height: (H1 - H0) * ROW }}>
          <div style={{ position: "relative" }}>
            {Array.from({ length: H1 - H0 }).map((_, k) => (
              <span key={k} style={{ position: "absolute", top: k * ROW - 7, right: 6, fontSize: 11, color: "var(--text-3)" }}>
                {k === 0 ? "" : `${H0 + k}h`}
              </span>
            ))}
          </div>
          {DIAS.map((d, i) => (
            <div
              key={d}
              style={{
                position: "relative",
                borderLeft: "1px solid var(--border)",
                background: i === hojeIdx ? "rgba(235,49,2,0.025)" : undefined,
                backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${ROW - 1}px, var(--border) ${ROW - 1}px ${ROW}px)`,
              }}
            >
              {FIXOS.filter((f) => f.dia === i).map((f) => (
                <Block key={f.titulo + f.ini} top={(f.ini - H0) * ROW} h={(f.fim - f.ini) * ROW} tone={TONES[f.tone]} title={f.titulo} sub={f.sub} />
              ))}
              {/* lembrete na véspera, mesmo horário */}
              {done && placed && i === dia - 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  style={{
                    position: "absolute",
                    left: 3,
                    right: 3,
                    top: (ini - H0) * ROW + 3,
                    height: 26,
                    borderRadius: 6,
                    border: "1px dashed var(--k-red)",
                    color: "#a32202",
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "0 6px",
                    fontSize: 11.5,
                    fontWeight: 500,
                    zIndex: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  <IconBell size={12} style={{ flex: "none" }} /> Lembrete
                </motion.div>
              )}
              <AnimatePresence>
                {placed && i === dia && (
                  <motion.div
                    key="novo"
                    initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    style={{
                      position: "absolute",
                      left: 3,
                      right: 3,
                      top: (ini - H0) * ROW + 2,
                      height: Math.max(((fim ?? ini + 1.5) - ini) * ROW - 4, 40),
                      borderRadius: 7,
                      background: "var(--k-red-soft)",
                      borderLeft: "3px solid var(--k-red)",
                      padding: "6px 7px",
                      color: "#7d1a01",
                      boxShadow: "0 8px 20px -10px rgba(235,49,2,.6)",
                      zIndex: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.25 }}>{ev.paciente || ev.titulo}</div>
                    <div style={{ fontSize: 11.5, marginTop: 2, lineHeight: 1.3 }}>{ev.local}</div>
                    <div style={{ fontSize: 11.5, opacity: 0.8 }}>{ev.inicio}</div>
                  </motion.div>
                )}
              </AnimatePresence>
              {placed && i === dia && <Cursor x={76} y={(ini - H0) * ROW + 58} label="Donna" />}
            </div>
          ))}
        </div>

        <AnimatePresence>
          {done && ev.lembrete && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              style={{
                position: "absolute",
                left: "50%",
                translate: "-50% 0",
                bottom: 18,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 10,
                background: "var(--text-1)",
                color: "#fff",
                boxShadow: "0 12px 30px -12px rgba(0,0,0,.5)",
                whiteSpace: "nowrap",
              }}
            >
              <IconBell size={15} color="#ff9b80" />
              Lembrete agendado · {ev.lembrete}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppWindow>
  );
}

function Block({ top, h, tone, title, sub }: { top: number; h: number; tone: (typeof TONES)[keyof typeof TONES]; title: string; sub: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 3,
        right: 3,
        top: top + 2,
        height: h - 4,
        borderRadius: 7,
        background: tone.bg,
        borderLeft: `3px solid ${tone.bar}`,
        padding: "5px 7px",
        color: tone.fg,
        overflow: "hidden",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 12, lineHeight: 1.25 }}>{title}</div>
      {h > 60 && <div style={{ fontSize: 11.5, opacity: 0.8, lineHeight: 1.3 }}>{sub}</div>}
    </div>
  );
}
