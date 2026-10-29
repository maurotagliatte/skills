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
  IconMicrophone,
  IconCheck,
  IconBrandWhatsapp,
  IconFileDescription,
} from "@tabler/icons-react";
import { AppWindow, Chip, AgentRow, type NavEntry } from "@/kit";
import { ARTICULACOES, type Membro, type Prontuario } from "./agent";

/** args parciais: chegam aos poucos via TOOL_CALL_ARGS */
type P = Partial<Prontuario>;

export const NAV: NavEntry[] = [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda" },
  { section: "Clínica" },
  { icon: IconStethoscope, label: "Prontuários", active: true },
  { icon: IconFileDescription, label: "Relatórios" },
  { icon: IconHorse, label: "Pacientes" },
  { icon: IconUsers, label: "Clientes" },
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
          style={{ display: "inline-block", width: w, height: 9, borderRadius: 4, background: "#eef0f0", verticalAlign: "middle" }}
        />
      )}
    </AnimatePresence>
  );
}

/** Título de seção no estilo do modelo dela (etiqueta em pílula). */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, color: "var(--gg-wine)", background: "#f5ebe9", borderRadius: 99, padding: "2px 9px", marginBottom: 6 }}>
        {title}
      </span>
      <div style={{ color: "var(--text-1)", lineHeight: 1.45 }}>{children}</div>
    </div>
  );
}

function Bullets({ items, w = 200 }: { items?: string[]; w?: number }) {
  const list = items?.filter(Boolean) ?? [];
  if (!list.length) return <V w={w} />;
  return (
    <ul style={{ margin: 0, paddingLeft: 16, display: "grid", gap: 2 }}>
      {list.map((i) => (
        <motion.li key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {i}
        </motion.li>
      ))}
    </ul>
  );
}

function FlexoesTable({ p }: { p: P }) {
  const find = (m: Membro, a: string) => p.flexoes?.find((f) => f?.membro === m && f?.articulacao === a)?.resultado;
  const grid = (membros: Membro[], cols: readonly string[]) => (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 6 }}>
      <thead>
        <tr>
          <th style={{ width: 40 }} />
          {cols.map((c) => (
            <th key={c} style={{ fontWeight: 500, color: "var(--text-3)", textAlign: "left", padding: "3px 6px", borderBottom: "1px solid var(--border)" }}>
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {membros.map((m) => (
          <tr key={m}>
            <td className="mono" style={{ fontSize: 11, color: "var(--text-2)", padding: "4px 0" }}>
              {m}
            </td>
            {cols.map((c) => {
              const r = find(m, c);
              return (
                <td key={c} style={{ padding: "4px 6px", borderBottom: "1px solid var(--border)", color: r?.startsWith("positiva") ? "var(--k-red)" : "var(--text-1)", fontWeight: r?.startsWith("positiva") ? 600 : 400 }}>
                  {r ? <V v={r} /> : <span style={{ color: "var(--text-3)" }}>—</span>}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
  return (
    <>
      {grid(["MTE", "MTD"], ARTICULACOES.anteriores)}
      {grid(["MPE", "MPD"], ARTICULACOES.posteriores)}
    </>
  );
}

function Achados({ items }: { items?: { estrutura: string; achado: string }[] }) {
  const list = items?.filter((i) => i?.estrutura) ?? [];
  if (!list.length) return <V w={220} />;
  return (
    <div style={{ display: "grid", gap: 3 }}>
      {list.map((i) => (
        <div key={i.estrutura} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
          <span style={{ color: "var(--text-2)" }}>{i.estrutura}</span>
          <V v={i.achado} />
        </div>
      ))}
    </div>
  );
}

export type Activity = { label: string; done: boolean }[];

/** Fluxo de status pedido pela Dra.: em andamento → conferência no WhatsApp → aprovado → enviado ao cliente. */
export type Status = "rascunho" | "conferencia" | "aprovado";

const STATUS_STEPS: { id: Status; label: string; detail: string }[] = [
  { id: "rascunho", label: "Em andamento", detail: "A Donna preenche o modelo" },
  { id: "conferencia", label: "Em conferência", detail: "Vai para o seu WhatsApp" },
  { id: "aprovado", label: "Aprovado", detail: "Segue direto para o WhatsApp do cliente" },
];

function StatusFlow({ status }: { status: Status }) {
  const idx = STATUS_STEPS.findIndex((s) => s.id === status);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {STATUS_STEPS.map((s, i) => {
        const on = i <= idx;
        return (
          <div key={s.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <motion.span
              animate={{ background: on ? (i === 2 ? "var(--green)" : "var(--k-red)") : "#e7e8e9", scale: i === idx ? [1, 1.25, 1] : 1 }}
              transition={{ duration: 0.5 }}
              style={{ marginTop: 3, width: 10, height: 10, borderRadius: 99, flex: "none" }}
            />
            <div>
              <div style={{ fontWeight: 500, color: on ? "var(--text-1)" : "var(--text-3)" }}>{s.label}</div>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>{s.detail}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Record({ p, activity, recording, status }: { p: P; activity: Activity; recording?: string; status: Status }) {
  const inf: Partial<Prontuario["informacoes"]> = p.informacoes ?? {};
  const an: Partial<Prontuario["animal"]> = p.animal ?? {};
  const rx: Partial<Prontuario["radiografia"]> = p.radiografia ?? {};
  const ck: Partial<Prontuario["checklist"]> = p.checklist ?? {};

  const aside = (
    <div style={{ padding: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 10 }}>Status do relatório</div>
      <StatusFlow status={status} />
      <AnimatePresence>
        {status !== "rascunho" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 14, padding: 10, borderRadius: 10, background: "#eef8f1", border: "1px solid #cfe9d8", fontSize: 12 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600, color: "#146136", marginBottom: 4 }}>
              <IconBrandWhatsapp size={14} />
              {status === "aprovado" ? "Enviado a Ricardo Alves" : "Enviado a Dra. Gabriela"}
            </div>
            <div style={{ color: "var(--text-2)" }}>
              {status === "aprovado"
                ? "Relatório de atendimento do Trovão em PDF, com o resumo e as orientações."
                : "Relatório do Trovão pronto para conferir. Responda “ok” para aprovar ou edite no app."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      <div style={{ padding: "16px 22px", height: "100%", overflow: "hidden", fontSize: 12.5 }}>
        <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 8 }}>Prontuários › Exame locomotor › {an.nome || "Novo exame"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span className="display" style={{ fontSize: 24 }}>
            <V v={an.nome} w={150} />
          </span>
          {p.procedimentos?.length ? (
            <Chip tone="green" icon={IconCheck}>
              Preenchido pela Donna
            </Chip>
          ) : null}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {(["raca", "sexo", "esporte", "idade", "pelagem"] as const).map((k) => (
            <Chip key={k}>
              <V v={an[k]} w={46} />
            </Chip>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          <div>
            <Section title="Informações pessoais">
              <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", rowGap: 2 }}>
                <span style={{ color: "var(--text-3)" }}>Proprietário</span>
                <V v={inf.proprietario} w={110} />
                <span style={{ color: "var(--text-3)" }}>Propriedade</span>
                <V v={inf.propriedade} w={110} />
                <span style={{ color: "var(--text-3)" }}>CPF/RG/CNPJ</span>
                <span style={{ color: "var(--text-3)" }}>{inf.documento || "do cadastro do cliente"}</span>
              </div>
            </Section>
            <Section title="Histórico">
              <V v={p.historico} w={240} />
            </Section>
            <Section title="Análise do casco">
              <V v={p.analiseCasco} w={240} />
            </Section>
            <Section title="Inspeção dinâmica">
              <V v={p.inspecaoDinamica} w={240} />
            </Section>
            <Section title="Resumo do exame">
              <Bullets items={p.resumo} w={220} />
            </Section>
          </div>
          <div>
            <Section title="Flexões">
              <FlexoesTable p={p} />
            </Section>
            <Section title={`Radiografia${rx.quantidade ? ` · ${rx.quantidade}` : ""}`}>
              <Achados items={rx.achados} />
            </Section>
            <Section title="Ultrassonografia">
              <Achados items={p.ultrassonografia} />
            </Section>
            <Section title="Procedimentos">
              <Bullets items={p.procedimentos} w={200} />
            </Section>
            <Section title="Check-list">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                <div>
                  <div style={{ color: "var(--text-3)" }}>materiais</div>
                  <Bullets items={ck.materiais} w={80} />
                </div>
                <div>
                  <div style={{ color: "var(--text-3)" }}>medicamentos</div>
                  <Bullets items={ck.medicamentos} w={80} />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </AppWindow>
  );
}
