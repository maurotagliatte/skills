"use client";

import { Fragment } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconCircleCheckFilled, IconCircleDashed, IconLink, IconKey, IconCheck } from "@tabler/icons-react";
import { AppWindow, AgentRow, Chip } from "@/kit";
import { navCms } from "./Posts";
import type { PostGerado } from "./agent";

type P = Partial<PostGerado>;

/** Markdown mínimo: ## subtítulos, parágrafos, **negrito**, [links](url). */
export function Markdown({ md, size = 13 }: { md: string; size?: number }) {
  const blocks = md.split(/\n{2,}/).filter((b) => b.trim());
  return (
    <>
      {blocks.map((b, i) => {
        const t = b.trim();
        if (t.startsWith("#")) {
          const h = t.replace(/^#+\s*/, "");
          return (
            <div key={i} className="display" style={{ fontSize: size + 5, margin: "14px 0 4px" }}>
              {h}
            </div>
          );
        }
        if (/^[-*] /m.test(t))
          return (
            <ul key={i} style={{ margin: "0 0 8px", paddingLeft: 18 }}>
              {t.split("\n").map((l, k) => (
                <li key={k}>{inline(l.replace(/^[-*]\s*/, ""))}</li>
              ))}
            </ul>
          );
        return (
          <p key={i} style={{ margin: "0 0 8px", lineHeight: 1.6, fontSize: size }}>
            {inline(t)}
          </p>
        );
      })}
    </>
  );
}

function inline(s: string) {
  const parts = s.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <b key={i}>{p.slice(2, -2)}</b>;
    const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (m)
      return (
        <span key={i} style={{ textDecoration: "underline", textUnderlineOffset: 2, color: "var(--sky)" }}>
          {m[1]}
        </span>
      );
    return <Fragment key={i}>{p}</Fragment>;
  });
}

const words = (s?: string) => (s ? s.split(/\s+/).filter((w) => /\w/.test(w)).length : 0);

export function Editor({ p, working, done, published }: { p: P; working: boolean; done: boolean; published: boolean }) {
  const check = (p.checklist_seo ?? []).filter((c) => c && c.item);
  const links = (p.links_internos ?? []).filter(Boolean);
  const heads = (p.headings ?? []).filter(Boolean);
  const meta = p.meta_descricao ?? "";
  const metaOk = meta.length >= 120 && meta.length <= 160;

  const aside = (
    <div style={{ padding: 16, display: "grid", gap: 12, alignContent: "start" }}>
      <div style={{ fontWeight: 600 }}>SEO</div>
      <Field icon={IconKey} label="Palavra-chave">
        {p.palavra_chave ? <Chip tone="violet">{p.palavra_chave}</Chip> : <Skel w={150} />}
      </Field>
      <Field label={`Meta descrição${meta ? ` · ${meta.length}/155` : ""}`}>
        {meta ? <span style={{ color: "var(--text-2)", lineHeight: 1.45 }}>{meta}</span> : <Skel w={220} lines={2} />}
        {meta && !working && (
          <span style={{ display: "block", fontSize: 11, marginTop: 3, color: metaOk ? "var(--green)" : "var(--amber)" }}>{metaOk ? "tamanho ideal" : "ajustar tamanho"}</span>
        )}
      </Field>
      <Field label="Estrutura">
        {heads.length ? (
          heads.map((h) => (
            <div key={h} style={{ display: "flex", gap: 6, lineHeight: 1.6 }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", paddingTop: 2 }}>
                H2
              </span>
              {h}
            </div>
          ))
        ) : (
          <Skel w={170} lines={3} />
        )}
      </Field>
      <Field icon={IconLink} label="Links internos">
        {links.length ? (
          links.map((l) => (
            <div key={l} style={{ color: "var(--sky)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.6 }}>
              {l}
            </div>
          ))
        ) : (
          <Skel w={180} lines={2} />
        )}
      </Field>
      <Field label="Checklist">
        <div style={{ display: "grid", gap: 4 }}>
          <AnimatePresence initial={false}>
            {check.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} style={{ display: "flex", gap: 6, alignItems: "flex-start", lineHeight: 1.4 }}>
                <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.15 }} style={{ flex: "none", marginTop: 1 }}>
                  {c.ok ? <IconCircleCheckFilled size={15} color="var(--green)" /> : <IconCircleDashed size={15} color="var(--amber)" />}
                </motion.span>
                <span style={{ color: c.ok ? "var(--text-1)" : "var(--text-2)" }}>{c.item}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {!check.length && <Skel w={190} lines={3} />}
        </div>
      </Field>
      {(working || done) && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 6 }}>
          <AgentRow status={published ? "publicado" : done ? "pronto" : "escrevendo…"} done={done}>
            {published ? "No ar em /blog/" + (p.slug ?? "") : p.titulo ? "Rascunho, SEO e links internos" : "Pesquisando o tema no seu blog…"}
          </AgentRow>
        </div>
      )}
    </div>
  );

  return (
    <AppWindow nav={navCms("Posts")} aside={aside}>
      <div style={{ padding: "18px 30px", height: "100%", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-3)", fontSize: 12, marginBottom: 14 }}>
          Posts › Novo post
          <span style={{ marginLeft: "auto" }}>
            {published ? (
              <Chip tone="green" icon={IconCheck}>
                Publicado
              </Chip>
            ) : done ? (
              <Chip tone="sky">Pronto para revisão</Chip>
            ) : working ? (
              <Chip tone="amber">Donna escrevendo</Chip>
            ) : (
              <Chip>Rascunho</Chip>
            )}
          </span>
        </div>
        <div className="display" style={{ fontSize: 30, lineHeight: 1.15, minHeight: 36, marginBottom: 6 }}>
          {p.titulo || <span style={{ color: "#c4c7ca" }}>Título do post</span>}
        </div>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 16 }}>
          gabrielaguenka.com.br/blog/{p.slug || "…"}
          {p.corpo && <span style={{ marginLeft: 12 }}>{words(p.corpo)} palavras</span>}
        </div>
        <div style={{ color: "var(--text-1)", maxWidth: 560 }}>
          {p.corpo ? (
            <Markdown md={p.corpo} />
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <span style={{ color: "#c4c7ca" }}>Comece a escrever, ou peça para a Donna…</span>
              {working && <Skel w={520} lines={6} />}
            </div>
          )}
        </div>
      </div>
    </AppWindow>
  );
}

function Field({ label, icon: I, children }: { label: string; icon?: typeof IconKey; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--text-3)", marginBottom: 5, fontWeight: 500 }}>
        {I && <I size={12} />}
        {label}
      </div>
      {children}
    </div>
  );
}

function Skel({ w, lines = 1 }: { w: number; lines?: number }) {
  return (
    <span style={{ display: "grid", gap: 6 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <span key={i} style={{ display: "block", width: i === lines - 1 && lines > 1 ? w * 0.65 : w, maxWidth: "100%", height: 10, borderRadius: 4, background: "#eef0f0" }} />
      ))}
    </span>
  );
}
