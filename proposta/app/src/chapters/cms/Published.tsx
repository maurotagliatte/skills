"use client";

import { motion } from "motion/react";
import { IconLock, IconSearch, IconWorld } from "@tabler/icons-react";
import { BrandLogo } from "@/kit";
import type { PostGerado } from "./agent";

export function Published({ p, show }: { p: Partial<PostGerado>; show: boolean }) {
  const primeiro = (p.corpo ?? "").split(/\n{2,}/).find((b) => b.trim() && !b.trim().startsWith("#")) ?? "";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fff",
          borderRadius: "var(--r-xl)",
          border: "1px solid rgba(0,0,0,.12)",
          boxShadow: "var(--shadow-window)",
          overflow: "hidden",
          display: "grid",
          gridTemplateRows: "34px 60px 1fr",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", background: "#f1f1f1", borderBottom: "1px solid var(--border)" }}>
          <span style={{ display: "flex", gap: 5 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 9, height: 9, borderRadius: 9, background: "#d6d6d6" }} />
            ))}
          </span>
          <span style={{ margin: "0 auto", display: "flex", alignItems: "center", gap: 6, padding: "3px 12px", borderRadius: 6, background: "#fff", color: "var(--text-2)", fontSize: 12 }}>
            <IconLock size={12} /> gabrielaguenka.com.br/blog/{p.slug}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "0 40px", borderBottom: "1px solid var(--border)" }}>
          <BrandLogo brand="guenka" height={30} />
          <span style={{ marginLeft: "auto", display: "flex", gap: 20, color: "var(--text-2)" }}>
            <span>Atendimento</span>
            <span>Cursos</span>
            <b style={{ color: "var(--text-1)", fontWeight: 500 }}>Blog</b>
            <span>Contato</span>
          </span>
        </div>
        <div style={{ padding: "34px 40px", maxWidth: 720 }}>
          <div className="eyebrow" style={{ color: "var(--gg-wine)", marginBottom: 10 }}>
            Blog · Claudicação
          </div>
          <div className="display" style={{ fontSize: 34, lineHeight: 1.12, marginBottom: 12 }}>
            {p.titulo}
          </div>
          <div style={{ color: "var(--text-3)", marginBottom: 18 }}>Dra. Gabriela Guenka · Médica-veterinária · 6 min de leitura</div>
          <div style={{ height: 190, borderRadius: 12, backgroundImage: "url(/bg/icm-dourado.webp)", backgroundSize: "cover", backgroundPosition: "center", marginBottom: 18 }} />
          <p style={{ margin: 0, lineHeight: 1.65, fontSize: 14, color: "var(--text-2)" }}>{primeiro}</p>
        </div>
      </div>

      {/* prévia no resultado de busca (genérica, sem marca de buscador) */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.7, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          right: -24,
          bottom: 70,
          width: 480,
          padding: "16px 20px 18px",
          background: "#fff",
          borderRadius: 14,
          border: "1px solid var(--border)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,.45)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "6px 10px", borderRadius: 99, border: "1px solid var(--border)", color: "var(--text-2)" }}>
          <IconSearch size={14} /> {p.palavra_chave}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ width: 24, height: 24, borderRadius: 99, background: "#f1f1f1", display: "grid", placeItems: "center" }}>
            <IconWorld size={13} color="var(--text-2)" />
          </span>
          <span style={{ lineHeight: 1.25 }}>
            <span style={{ display: "block", fontSize: 12 }}>Gabriela Guenka</span>
            <span style={{ display: "block", fontSize: 11, color: "var(--text-3)" }}>gabrielaguenka.com.br › blog › {p.slug}</span>
          </span>
        </div>
        <div style={{ fontSize: 18, color: "#2a4fbf", margin: "6px 0 4px", lineHeight: 1.3 }}>{p.titulo}</div>
        <div style={{ color: "var(--text-2)", lineHeight: 1.5 }}>{p.meta_descricao}</div>
        <div className="mono" style={{ marginTop: 10, fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Prévia do resultado de busca
        </div>
      </motion.div>
    </div>
  );
}
