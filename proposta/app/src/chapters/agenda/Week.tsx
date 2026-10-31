"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconMessageCircle,
  IconStethoscope,
  IconHorse,
  IconCash,
  IconSchool,
  IconRefresh,
  IconChevronLeft,
  IconChevronRight,
  IconAlertTriangle,
  IconCircleCheckFilled,
  IconMicrophone,
  IconClock,
} from "@tabler/icons-react";
import { AppWindow, AgentRow, Chip, Cursor, type NavEntry } from "@/kit";
import { DIAS, SEGUNDA, fmtCurta, somaDias, diaIndex, hora, horaCurta } from "./datas";
import { FIXOS, CONFIRMACOES, AUDIO, type Evento, type Conflito } from "./agent";

export const NAV: NavEntry[] = [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda", active: true },
  { icon: IconMessageCircle, label: "Conversas" },
  { section: "Clínica" },
  { icon: IconStethoscope, label: "Atendimentos" },
  { icon: IconHorse, label: "Clientes e animais" },
  { section: "Gestão" },
  { icon: IconCash, label: "Contas" },
  { icon: IconSchool, label: "Cursos" },
];

const TONES = {
  neutral: { bg: "#f2f3f3", bar: "#b8bbbe", fg: "var(--text-1)" },
  violet: { bg: "var(--violet-soft)", bar: "var(--violet)", fg: "#3d2f80" },
  sky: { bg: "var(--sky-soft)", bar: "var(--sky)", fg: "#06506d" },
  green: { bg: "var(--green-soft)", bar: "var(--green)", fg: "#125430" },
};

const H0 = 7;
const H1 = 18;
const ROW = 58;

/** Estado de cada compromisso novo, na grade e na lista ao lado. */
export type EstadoEvento = "marcando" | "marcado" | "encavala" | "aguardando" | "confirmado" | "so-voce";

export type WeekProps = {
  /** compromissos que a Donna está criando (args parciais chegando) */
  novos: Partial<Evento>[];
  conflito?: Partial<Conflito>;
  /** o ultrassom já foi para o horário sugerido */
  movido: boolean;
  /** quantas confirmações já saíram e quantas respostas chegaram (na ordem de CONFIRMACOES) */
  enviadas: number;
  respostas: number;
  /** a Donna está trabalhando: status da linha de atividade */
  atividade?: { label: string; done: boolean };
  /** resumo final no rodapé da grade */
  pronta: boolean;
};

export function estadoDe(e: Partial<Evento>, i: number, total: number, p: Pick<WeekProps, "conflito" | "movido" | "enviadas" | "respostas">): EstadoEvento {
  if (i === total - 1 && !e.lembrete) return "marcando";
  const k = CONFIRMACOES.findIndex((c) => !!e.com && c.para === e.com);
  if (p.conflito?.compromisso && p.conflito.compromisso === e.titulo && !p.movido) return "encavala";
  if (!e.com) return "so-voce";
  if (k >= 0 && k < p.respostas) return "confirmado";
  if (k >= 0 && k < p.enviadas) return "aguardando";
  return "marcado";
}

const CHIP: Record<EstadoEvento, { tone: "neutral" | "amber" | "green" | "sky" | "red"; label: string }> = {
  marcando: { tone: "neutral", label: "marcando…" },
  marcado: { tone: "sky", label: "marcado" },
  encavala: { tone: "amber", label: "encavala" },
  aguardando: { tone: "neutral", label: "aguarda resposta" },
  confirmado: { tone: "green", label: "confirmado" },
  "so-voce": { tone: "sky", label: "só você" },
};

export function Week({ novos, conflito, movido, enviadas, respostas, atividade, pronta }: WeekProps) {
  const sexta = somaDias(SEGUNDA, 4);
  const estados = novos.map((e, i) => estadoDe(e, i, novos.length, { conflito, movido, enviadas, respostas }));
  const confirmados = estados.filter((s) => s === "confirmado").length;

  // posição de cada compromisso novo na grade (o ultrassom anda para a sugestão)
  const pos = novos.map((e) => {
    const mover = movido && conflito?.compromisso === e.titulo;
    const ini = hora(mover ? conflito?.sugestao_inicio : e.inicio);
    const fimTxt = mover ? conflito?.sugestao_fim : e.fim;
    const fim = hora(fimTxt) ?? (ini !== undefined ? ini + 1 : undefined);
    const dia = diaIndex(e.dia_semana);
    const ok = dia !== undefined && ini !== undefined && ini >= H0 && ini < H1;
    return { dia, ini: ini ?? 0, fim: fim ?? 0, ok, inicio: mover ? conflito?.sugestao_inicio : e.inicio };
  });
  const ultimo = [...pos].reverse().find((p) => p.ok);

  const aside = (
    <div style={{ padding: 16, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
        <IconMicrophone size={15} color="var(--k-red)" /> Do áudio de {AUDIO.quando}
      </div>
      <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 12 }}>{novos.length ? `${novos.length} compromissos` : "esperando a Donna"}</div>
      <div style={{ display: "grid", gap: 8 }}>
        <AnimatePresence initial={false}>
          {novos.map((e, i) => {
            const st = estados[i];
            const p = pos[i];
            const c = CHIP[st];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  padding: "9px 10px",
                  borderRadius: 10,
                  border: `1px solid ${st === "encavala" ? "var(--amber)" : "var(--border)"}`,
                  background: st === "encavala" ? "var(--amber-soft)" : "#fff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-3)" }}>
                  <IconClock size={13} />
                  {e.dia_semana ? e.dia_semana.split("-")[0] : "…"}
                  {p.inicio ? `, ${horaCurta(p.inicio)}` : ""}
                  <span style={{ marginLeft: "auto" }}>
                    <Chip tone={c.tone} icon={st === "confirmado" ? IconCircleCheckFilled : st === "encavala" ? IconAlertTriangle : undefined}>
                      {c.label}
                    </Chip>
                  </span>
                </div>
                <div style={{ fontWeight: 600, marginTop: 4, lineHeight: 1.3 }}>{e.titulo ?? "…"}</div>
                {st === "encavala" && conflito?.encavala_com && (
                  <div style={{ fontSize: 12, color: "#7a4b00", marginTop: 3, lineHeight: 1.4 }}>
                    Bate com {conflito.encavala_com.toLowerCase()}. Sugestão: {horaCurta(conflito.sugestao_inicio)}.
                  </div>
                )}
                {e.com && st !== "encavala" && <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>com {e.com}</div>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        {atividade ? (
          <AgentRow status={atividade.done ? "concluído" : "trabalhando…"} done={atividade.done}>
            {atividade.label}
          </AgentRow>
        ) : (
          <div style={{ color: "var(--text-3)", padding: "6px 0" }}>A semana que já estava marcada.</div>
        )}
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
            {fmtCurta(SEGUNDA)} a {fmtCurta(sexta)}
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
            <span key={d} style={{ padding: "0 6px 8px", color: i === 0 ? "var(--k-red)" : "var(--text-2)", fontWeight: i === 0 ? 600 : 500 }}>
              {d.slice(0, 3)} <span style={{ color: i === 0 ? "var(--k-red)" : "var(--text-3)", fontWeight: 400 }}>{fmtCurta(somaDias(SEGUNDA, i)).slice(0, 2)}</span>
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
                background: i === 0 ? "rgba(235,49,2,0.025)" : undefined,
                backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${ROW - 1}px, var(--border) ${ROW - 1}px ${ROW}px)`,
              }}
            >
              {FIXOS.filter((f) => f.dia === i).map((f) => (
                <Block key={f.titulo + f.ini} top={(f.ini - H0) * ROW} h={(f.fim - f.ini) * ROW} tone={TONES[f.tone]} title={f.titulo} sub={f.sub} />
              ))}
              {novos.map((e, k) => {
                const p = pos[k];
                if (!p.ok || p.dia !== i) return null;
                const st = estados[k];
                const alerta = st === "encavala";
                return (
                  <motion.div
                    key={`novo-${k}`}
                    initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)", top: (p.ini - H0) * ROW + 2 }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)", top: (p.ini - H0) * ROW + 2 }}
                    transition={{ type: "spring", stiffness: 200, damping: 22 }}
                    style={{
                      position: "absolute",
                      left: alerta ? 14 : 3,
                      right: 3,
                      height: Math.max((p.fim - p.ini) * ROW - 4, 40),
                      borderRadius: 7,
                      background: alerta ? "var(--amber-soft)" : st === "confirmado" ? "var(--green-soft)" : "var(--k-red-soft)",
                      border: alerta ? "1.5px dashed var(--amber)" : undefined,
                      borderLeft: alerta ? undefined : `3px solid ${st === "confirmado" ? "var(--green)" : "var(--k-red)"}`,
                      padding: "6px 7px",
                      color: alerta ? "#6b4200" : st === "confirmado" ? "#125430" : "#7d1a01",
                      boxShadow: "0 8px 20px -10px rgba(235,49,2,.55)",
                      zIndex: 3,
                      overflow: "hidden",
                      transition: "background .4s, color .4s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 4, fontWeight: 600, fontSize: 12, lineHeight: 1.25 }}>
                      {alerta && <IconAlertTriangle size={12} style={{ flex: "none", marginTop: 1 }} />}
                      {st === "confirmado" && <IconCircleCheckFilled size={12} style={{ flex: "none", marginTop: 1 }} />}
                      <span style={{ minWidth: 0 }}>{e.titulo}</span>
                    </div>
                    {(p.fim - p.ini) * ROW > 60 && <div style={{ fontSize: 11.5, marginTop: 2, lineHeight: 1.3, opacity: 0.85 }}>{e.local}</div>}
                  </motion.div>
                );
              })}
            </div>
          ))}
          {ultimo && ultimo.dia !== undefined && !pronta && (
            <div style={{ position: "absolute", inset: "0 0 0 36px", pointerEvents: "none", zIndex: 5 }}>
              <div
                style={{
                  position: "absolute",
                  left: `${ultimo.dia * 20 + 11}%`,
                  top: (ultimo.ini - H0) * ROW + 30,
                  transition: "left 0.9s var(--ease-cam), top 0.9s var(--ease-cam)",
                }}
              >
                <Cursor x={0} y={0} label="Donna" />
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {pronta && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                position: "absolute",
                left: "50%",
                translate: "-50% 0",
                bottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 10,
                background: "var(--text-1)",
                color: "#fff",
                boxShadow: "0 12px 30px -12px rgba(0,0,0,.5)",
                whiteSpace: "nowrap",
                zIndex: 6,
              }}
            >
              <IconCircleCheckFilled size={15} color="#5fd28f" />
              Semana pronta · {novos.length} compromissos novos · {confirmados} confirmados · lembrete na véspera
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
