"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconStethoscope,
  IconHorse,
  IconCash,
  IconMessageCircle,
  IconSchool,
  IconSparkles,
  IconMicrophone,
  IconCalendarPlus,
  IconBell,
  IconChecks,
  IconUsersGroup,
  IconUser,
} from "@tabler/icons-react";
import { AppWindow, Chip, V, type NavEntry } from "@/kit";
import AnimatedList, { type AnimatedListEntry } from "@/kit/rb/AnimatedList/AnimatedList";
import GradualBlur from "@/kit/rb/GradualBlur/GradualBlur";
import { PERGUNTA_RICARDO, type Resposta } from "./agent";

export const NAV: NavEntry[] = [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda" },
  { icon: IconMessageCircle, label: "Conversas", active: true },
  { section: "Clínica" },
  { icon: IconStethoscope, label: "Atendimentos" },
  { icon: IconHorse, label: "Clientes e animais" },
  { section: "Gestão" },
  { icon: IconCash, label: "Contas" },
  { icon: IconSchool, label: "Cursos" },
];

type Status = "voce" | "donna" | "ok" | "quinta";
type Conversa = { id: string; nome: string; ligado: string; texto: string; hora: string; status: Status; grupo?: boolean };

const CLIENTES: Conversa[] = [
  { id: "ricardo", nome: "Ricardo Alves · Haras Santa Fé", ligado: "Trovão", texto: PERGUNTA_RICARDO, hora: "08:12", status: "voce" },
  { id: "boavista", nome: "Haras Boa Vista", ligado: "Estrela Dalva", texto: "Dra., consegue ver a Estrela segunda à tarde?", hora: "08:40", status: "voce" },
  { id: "marina", nome: "Marina Couto", ligado: "Pérola", texto: "Quinta 13h30 então. Obrigada, doutora!", hora: "ontem", status: "ok" },
];
const ALUNOS: Conversa[] = [
  { id: "lucas", nome: "Lucas Prado", ligado: "Curso online", texto: "Qual o valor do curso? Tem turma este mês?", hora: "09:05", status: "donna" },
  { id: "ana", nome: "Ana Ribeiro", ligado: "Curso online", texto: "Consigo assistir as aulas pelo celular?", hora: "ontem", status: "donna" },
];
const INTERNACAO: Conversa[] = [
  { id: "zarco", nome: "Grupo · internação Zarco", ligado: "Zarco · dia 5", texto: "Como ele passou a noite?", hora: "09:31", status: "quinta", grupo: true },
];

const STATUS: Record<Status, ReactNode> = {
  voce: <Chip tone="amber">aguarda você</Chip>,
  donna: (
    <Chip tone="red" icon={IconSparkles}>
      respondido pela Donna
    </Chip>
  ),
  ok: <Chip tone="green">respondida</Chip>,
  quinta: <Chip tone="sky">atualização na quinta</Chip>,
};

const LIST_VARS = {
  "--al-tile": "#fff",
  "--al-tile-shadow": "none",
  "--al-tile-edge": "var(--border)",
  "--al-tile-highlight": "transparent",
  "--al-hover": "none",
  "--al-active": "none",
  "--al-press": "none",
} as CSSProperties;

/** Estado da resposta ao Ricardo: rascunho chegando, para ela aprovar, enviada. */
export type EstadoResposta = "escrevendo" | "aprovar" | "enviada";

export function Inbox({ resposta, estado }: { resposta?: Partial<Resposta>; estado?: EstadoResposta }) {
  const aberta = !!estado;
  return (
    <AppWindow nav={NAV}>
      <div style={{ padding: "16px 18px", height: "100%", overflow: "hidden", display: "grid", gridTemplateRows: "auto 1fr", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span className="display" style={{ fontSize: 26 }}>
            Conversas
          </span>
          <span style={{ color: "var(--text-3)" }}>terça, 10/11 · um WhatsApp, três filas</span>
          <span style={{ marginLeft: "auto" }}>
            <Chip>exemplo</Chip>
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr", gap: 14, minHeight: 0 }}>
          <Coluna titulo="Clientes" n={CLIENTES.length} icon={<IconUser size={15} />}>
            <Lista
              itens={CLIENTES}
              render={(c) => (c.id === "ricardo" && aberta ? <Thread resposta={resposta ?? {}} estado={estado!} /> : <Tile c={c} />)}
            />
          </Coluna>
          <Coluna titulo="Alunos" n={ALUNOS.length} icon={<IconSchool size={15} />}>
            <Lista itens={ALUNOS} render={(c) => <Tile c={c} />} />
            <p style={{ margin: "4px 4px 0", color: "var(--text-3)", fontSize: 12, lineHeight: 1.45 }}>Preço, datas e acesso: a Donna responde com o texto que você liberou.</p>
          </Coluna>
          <Coluna titulo="Internação" n={INTERNACAO.length} icon={<IconUsersGroup size={15} />}>
            <Lista itens={INTERNACAO} render={(c) => <Tile c={c} />} />
            <p style={{ margin: "4px 4px 0", color: "var(--text-3)", fontSize: 12, lineHeight: 1.45 }}>Conferência na quinta, conta na sexta.</p>
          </Coluna>
        </div>
      </div>
    </AppWindow>
  );
}

function Coluna({ titulo, n, icon, children }: { titulo: string; n: number; icon: ReactNode; children: ReactNode }) {
  return (
    <section style={{ minWidth: 0, display: "grid", gridTemplateRows: "auto 1fr", gap: 6, borderRadius: 12, background: "#f5f6f6", padding: "10px 8px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 4px", color: "var(--text-2)" }}>
        {icon}
        <b style={{ fontWeight: 600, color: "var(--text-1)", fontSize: 14 }}>{titulo}</b>
        <span>{n}</span>
      </div>
      <div style={{ position: "relative", minHeight: 0, overflow: "hidden" }}>
        {children}
        <GradualBlur position="bottom" height="3.2rem" strength={1.2} layers={6} zIndex={3} />
      </div>
    </section>
  );
}

function Lista({ itens, render }: { itens: Conversa[]; render: (c: Conversa) => ReactNode }) {
  const entries: AnimatedListEntry[] = itens.map((c) => ({ id: c.id, title: c.nome }));
  return (
    <AnimatedList
      items={entries}
      frame={false}
      theme="light"
      width="100%"
      maxHeight={640}
      gap={6}
      radius={10}
      animation="slide"
      stagger={0.09}
      showGradients={false}
      displayScrollbar={false}
      selectOnHover={false}
      enableArrowNavigation={false}
      style={{ ...LIST_VARS, margin: "0 -6px" }}
      renderItem={(it) => {
        const id = typeof it === "string" ? it : it.id;
        return render(itens.find((c) => c.id === id)!);
      }}
    />
  );
}

function Cabeca({ c }: { c: Conversa }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
      <b style={{ fontWeight: 600, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nome}</b>
      <span style={{ marginLeft: "auto", color: "var(--text-3)", fontSize: 12, flex: "none" }}>{c.hora}</span>
    </div>
  );
}

function Tile({ c }: { c: Conversa }) {
  return (
    <div style={{ display: "grid", gap: 6, width: "100%", minWidth: 0 }}>
      <Cabeca c={c} />
      <div style={{ color: "var(--text-2)", lineHeight: 1.4 }}>{c.texto}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Chip icon={c.ligado.startsWith("Curso") ? IconSchool : IconHorse}>{c.ligado}</Chip>
        {STATUS[c.status]}
      </div>
    </div>
  );
}

/** A conversa do Ricardo aberta: a pergunta dele, o seu áudio, o rascunho da Donna e o compromisso. */
function Thread({ resposta, estado }: { resposta: Partial<Resposta>; estado: EstadoResposta }) {
  const ev = resposta.evento;
  const msgs: AnimatedListEntry[] = [
    { id: "pergunta", title: "pergunta" },
    { id: "audio", title: "audio" },
    ...(resposta.resposta ? [{ id: "rascunho", title: "rascunho" }] : []),
    ...(ev?.titulo ? [{ id: "evento", title: "evento" }] : []),
  ];
  return (
    <div style={{ width: "100%", minWidth: 0, display: "grid", gap: 8 }}>
      <Cabeca c={CLIENTES[0]} />
      <div style={{ display: "flex", gap: 6 }}>
        <Chip icon={IconHorse}>Trovão</Chip>
        {estado === "enviada" ? (
          <Chip tone="green" icon={IconChecks}>
            respondida
          </Chip>
        ) : (
          <Chip tone="amber">aguarda você</Chip>
        )}
      </div>
      <AnimatedList
        items={msgs}
        frame={false}
        theme="light"
        width="100%"
        maxHeight={560}
        gap={8}
        radius={12}
        animation="pop"
        showGradients={false}
        displayScrollbar={false}
        selectOnHover={false}
        enableArrowNavigation={false}
        style={{ "--al-tile": "transparent", "--al-tile-shadow": "none", "--al-tile-edge": "transparent", "--al-tile-highlight": "transparent", "--al-hover": "none", "--al-active": "none", "--al-press": "none", margin: "0 -6px" } as CSSProperties}
        renderItem={(it) => {
          const id = typeof it === "string" ? it : it.id;
          if (id === "pergunta")
            return (
              <Bolha lado="esq" meta="Ricardo · 08:12">
                {PERGUNTA_RICARDO}
              </Bolha>
            );
          if (id === "audio")
            return (
              <Bolha lado="dir" meta="você · agora" tom="audio">
                <span style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <IconMicrophone size={14} style={{ flex: "none", marginTop: 2 }} />
                  <span>Áudio para a Donna</span>
                </span>
              </Bolha>
            );
          if (id === "rascunho")
            return (
              <Bolha lado="dir" meta={estado === "enviada" ? "enviada · 10:02" : "rascunho da Donna · no seu tom"} tom={estado === "enviada" ? "enviada" : "rascunho"}>
                {resposta.resposta}
              </Bolha>
            );
          return (
            <div style={{ width: "100%", borderRadius: 10, background: "var(--k-red-soft)", padding: "8px 10px", color: "#7d1a01" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                <IconCalendarPlus size={14} /> <V v={ev?.titulo} w={120} />
              </div>
              <div style={{ marginTop: 2 }}>
                <V v={ev?.dia && ev?.hora ? `${ev.dia.split(",")[0]}, ${ev.dia.split(", ")[1]?.slice(0, 5) ?? ""} · ${ev.hora} · ${ev.local ?? ""}` : undefined} w={160} bg="#f8cdbd" />
              </div>
              {resposta.lembrete && (
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontSize: 12 }}>
                  <IconBell size={12} /> lembrete {resposta.lembrete}
                </div>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}

function Bolha({ lado, meta, tom, children }: { lado: "esq" | "dir"; meta: string; tom?: "audio" | "rascunho" | "enviada"; children: ReactNode }) {
  const bg = tom === "enviada" ? "#e3f4e8" : tom === "rascunho" ? "#fff" : tom === "audio" ? "#ecedee" : "#f3f4f4";
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: lado === "dir" ? "flex-end" : "flex-start" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={tom ?? "x"}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: 1 }}
          style={{
            maxWidth: "92%",
            padding: "8px 10px",
            borderRadius: lado === "dir" ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
            background: bg,
            border: tom === "rascunho" ? "1px dashed var(--k-red)" : "1px solid transparent",
            lineHeight: 1.45,
            color: "var(--text-1)",
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
      <span style={{ fontSize: 11.5, color: tom === "rascunho" ? "#a32202" : "var(--text-3)", marginTop: 3 }}>{meta}</span>
    </div>
  );
}
