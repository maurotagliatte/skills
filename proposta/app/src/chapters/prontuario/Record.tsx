"use client";

import { motion, AnimatePresence } from "motion/react";
import {
  IconCalendarEvent,
  IconHorse,
  IconLayoutDashboard,
  IconCash,
  IconStethoscope,
  IconUsers,
  IconFiles,
  IconUser,
  IconScale,
  IconPalette,
  IconGenderBigender,
  IconTag,
  IconMicrophone,
  IconCheck,
} from "@tabler/icons-react";
import { AppWindow, Chip, Prop, AgentRow, type NavEntry } from "@/kit";
import type { Prontuario } from "./agent";

/** args parciais: chegam aos poucos via TOOL_CALL_ARGS */
type P = Partial<Prontuario>;

export const NAV: NavEntry[] = [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda" },
  { section: "Clínica" },
  { icon: IconStethoscope, label: "Prontuários", active: true },
  { icon: IconHorse, label: "Pacientes" },
  { icon: IconUsers, label: "Tutores" },
  { section: "Gestão" },
  { icon: IconCash, label: "Financeiro" },
  { icon: IconFiles, label: "Documentos" },
];

/** Valor que aparece com fade + desfoque quando chega do agente. */
function V({ v, w = 120 }: { v?: string; w?: number }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {v ? (
        <motion.span
          key="v"
          initial={{ opacity: 0, filter: "blur(6px)", y: 3 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {v}
        </motion.span>
      ) : (
        <motion.span
          key="s"
          exit={{ opacity: 0 }}
          style={{ display: "inline-block", width: w, height: 10, borderRadius: 4, background: "#eef0f0", verticalAlign: "middle" }}
        />
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "14px 0", borderTop: "1px solid var(--border)" }}>
      <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 8, fontWeight: 500 }}>{title}</div>
      {children}
    </div>
  );
}

export type Activity = { label: string; done: boolean }[];

export function Record({ p, activity, recording }: { p: P; activity: Activity; recording?: string }) {
  const pac: Partial<Prontuario["paciente"]> = p.paciente ?? {};
  const ef: Partial<Prontuario["exameFisico"]> = p.exameFisico ?? {};
  const lo: Partial<Prontuario["locomotor"]> = p.locomotor ?? {};
  const aside = (
    <div style={{ padding: 16, display: "grid", gap: 2 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Propriedades</div>
      <Prop icon={IconUser} label="Tutor">
        <V v={p.tutor} w={90} />
      </Prop>
      <Prop icon={IconGenderBigender} label="Sexo">
        <V v={pac.sexo} w={90} />
      </Prop>
      <Prop icon={IconPalette} label="Pelagem">
        <V v={pac.pelagem} w={60} />
      </Prop>
      <Prop icon={IconScale} label="Peso">
        <V v={pac.peso} w={50} />
      </Prop>
      <Prop icon={IconCalendarEvent} label="Retorno">
        <V v={p.retorno} w={110} />
      </Prop>
      <Prop icon={IconTag} label="Etiquetas">
        <span style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {(p.tags ?? []).filter(Boolean).map((t) => (
            <Chip key={t} tone="violet">
              {t}
            </Chip>
          ))}
          {!p.tags?.length && <V w={80} />}
        </span>
      </Prop>
      <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Atividade</div>
        {recording && (
          <div style={{ display: "flex", gap: 8, padding: "8px 12px", color: "var(--text-2)" }}>
            <IconMicrophone size={15} />
            <span>{recording}</span>
          </div>
        )}
        {activity.map((a) => (
          <AgentRow key={a.label} status={a.done ? "concluído" : "trabalhando…"} done={a.done}>
            {a.label}
          </AgentRow>
        ))}
      </div>
    </div>
  );

  return (
    <AppWindow nav={NAV} aside={aside}>
      <div style={{ padding: "18px 26px", height: "100%", overflow: "hidden" }}>
        <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 10 }}>Prontuários › {pac.nome || "Novo exame"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span className="display" style={{ fontSize: 26 }}>
            <V v={pac.nome ? `${pac.nome}` : undefined} w={160} />
          </span>
          {p.tags?.length ? (
            <Chip tone="green" icon={IconCheck}>
              Estruturado pela Donna
            </Chip>
          ) : null}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <Chip>
            <V v={pac.raca} w={70} />
          </Chip>
          <Chip>
            <V v={pac.idade} w={40} />
          </Chip>
          <Chip tone="red">
            <V v={lo.membro ? `Claudicação ${lo.grauAAEP ?? ""}`.trim() : undefined} w={70} />
          </Chip>
        </div>
        <Section title="Queixa principal">
          <V v={p.queixa} w={420} />
        </Section>
        <Section title="Exame físico">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {(
              [
                ["FC", ef.fc],
                ["FR", ef.fr],
                ["Temp.", ef.temperatura],
                ["Mucosas", ef.mucosas],
                ["TPC", ef.tpc],
                ["Hidratação", ef.hidratacao],
              ] as const
            ).map(([k, v]) => (
              <div key={k} style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{k}</div>
                <div style={{ fontWeight: 500, marginTop: 2 }}>
                  <V v={v} w={44} />
                </div>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Exame locomotor">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px" }}>
            <span>
              <b style={{ fontWeight: 500 }}>Flexão: </b>
              <V v={lo.flexao} w={160} />
            </span>
            <span>
              <b style={{ fontWeight: 500 }}>Palpação: </b>
              <V v={lo.palpacao} w={160} />
            </span>
            <span style={{ gridColumn: "1 / -1" }}>
              <b style={{ fontWeight: 500 }}>Bloqueios: </b>
              <V v={lo.bloqueios} w={260} />
            </span>
          </div>
        </Section>
        <Section title="Diagnóstico presuntivo">
          <V v={p.diagnostico} w={360} />
        </Section>
        <Section title="Conduta">
          <div style={{ display: "grid", gap: 6 }}>
            {(p.conduta?.length ? p.conduta : [undefined, undefined]).map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "var(--k-red)" }}>●</span>
                <span>
                  <b style={{ fontWeight: 500 }}>
                    <V v={c?.item} w={120} />
                  </b>{" "}
                  <span style={{ color: "var(--text-2)" }}>{c?.detalhe}</span>
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppWindow>
  );
}
