"use client";

import { motion } from "motion/react";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconArticle,
  IconFileText,
  IconPhoto,
  IconChartLine,
  IconPlus,
  IconCircleFilled,
  IconCircleDashed,
} from "@tabler/icons-react";
import { AppWindow, Chip, type NavEntry, CountUp } from "@/kit";
import { PERFORMANCE, POSTS } from "./data";

export const navCms = (active: string): NavEntry[] => [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda" },
  { section: "Site" },
  ...[
    { icon: IconArticle, label: "Posts" },
    { icon: IconFileText, label: "Páginas" },
    { icon: IconPhoto, label: "Mídia" },
    { icon: IconChartLine, label: "Orgânico" },
  ].map((n) => ({ ...n, active: n.label === active })),
];

const num = (v: number) => Math.round(v).toLocaleString("pt-BR");

export function Posts({ show }: { show: boolean }) {
  return (
    <AppWindow nav={navCms("Posts")}>
      <div style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span className="display" style={{ fontSize: 24 }}>
            Posts
          </span>
          <span style={{ color: "var(--text-2)" }}>gabrielaguenka.com.br/blog</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, height: 28, padding: "0 10px", borderRadius: 6, background: "var(--text-1)", color: "#fff", fontWeight: 500 }}>
            <IconPlus size={14} /> Novo post
          </span>
        </div>
        <div style={{ display: "flex", gap: 18, borderBottom: "1px solid var(--border)", marginBottom: 4 }}>
          {["Todos 8", "Publicados 7", "Rascunhos 1"].map((t, i) => (
            <span key={t} style={{ padding: "6px 0", color: i === 0 ? "var(--text-1)" : "var(--text-3)", borderBottom: i === 0 ? "2px solid var(--text-1)" : "2px solid transparent", fontWeight: i === 0 ? 500 : 400 }}>
              {t}
            </span>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 96px 64px 84px", color: "var(--text-3)", fontSize: 12, height: 30, alignItems: "center" }}>
          <span>Título</span>
          <span>Tema</span>
          <span>Formato</span>
          <span>Data</span>
          <span style={{ textAlign: "right" }}>Cliques/mês</span>
        </div>
        {POSTS.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 6 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.08 }}
            style={{ display: "grid", gridTemplateColumns: "1fr 110px 96px 64px 84px", alignItems: "center", height: 44, borderTop: "1px solid var(--border)" }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              {p.status === "publicado" ? <IconCircleFilled size={9} color="var(--green)" /> : <IconCircleDashed size={11} color="var(--text-3)" />}
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.titulo}</span>
            </span>
            <span>
              <Chip>{p.tema}</Chip>
            </span>
            <span style={{ color: "var(--text-2)" }}>{p.formato}</span>
            <span style={{ color: "var(--text-3)" }}>{p.data}</span>
            <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{p.cliques ? <CountUp v={show ? p.cliques : 0} fmt={num} ms={1200} /> : <Chip tone="amber">rascunho</Chip>}</span>
          </motion.div>
        ))}
      </div>
    </AppWindow>
  );
}

const MAXV = 1200;

export function Organic({ show }: { show: boolean }) {
  return (
    <AppWindow nav={navCms("Orgânico")}>
      <div style={{ padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
          <span className="display" style={{ fontSize: 24 }}>
            Desempenho orgânico
          </span>
          <span style={{ color: "var(--text-2)" }}>últimos 90 dias · busca</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
          {[
            ["Cliques orgânicos", 5230, "/mês"],
            ["Impressões", 182000, "/mês"],
            ["Posição média", 9.8, ""],
            ["Posts publicados", 1.2, "/mês"],
          ].map(([k, v, u]) => (
            <div key={k as string} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)" }}>{k}</div>
              <div className="display" style={{ fontSize: 24, marginTop: 2 }}>
                <CountUp v={show ? (v as number) : 0} fmt={(n) => (Number(v) < 20 ? n.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) : num(n))} ms={1300} />
                <span style={{ fontSize: 13, color: "var(--text-3)", letterSpacing: 0 }}> {u}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ fontWeight: 500, marginBottom: 4 }}>O que performa no seu blog</div>
        <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 12 }}>média de cliques orgânicos por post, por mês</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Group title="Formato" rows={PERFORMANCE.formato} show={show} />
          <Group title="Tamanho" rows={PERFORMANCE.tamanho} show={show} />
          <Group title="Tema" rows={PERFORMANCE.tema} show={show} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.4 }}
          style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "#f7f7f7", lineHeight: 1.5 }}
        >
          <b style={{ fontWeight: 600 }}>Leitura:</b> guias e casos clínicos de 1.500 a 2.500 palavras sobre claudicação trazem cerca de 7× mais visitas que
          textos curtos de opinião. É esse o padrão que a Donna usa para sugerir pautas.
        </motion.div>
      </div>
    </AppWindow>
  );
}

function Group({ title, rows, show }: { title: string; rows: { k: string; v: number }[]; show: boolean }) {
  const top = Math.max(...rows.map((r) => r.v));
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 8 }}>{title}</div>
      {rows.map((r) => (
        <div key={r.k} style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
            <span style={{ color: r.v === top ? "var(--text-1)" : "var(--text-2)", fontWeight: r.v === top ? 600 : 400 }}>{r.k}</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{num(r.v)}</span>
          </div>
          <div style={{ height: 6, borderRadius: 4, background: "#eef0f0" }}>
            <div
              style={{
                height: "100%",
                borderRadius: 4,
                width: show ? `${(r.v / MAXV) * 100}%` : 0,
                background: r.v === top ? "var(--k-red)" : "#9aa0a6",
                transition: "width 1.2s cubic-bezier(.22,1,.36,1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
