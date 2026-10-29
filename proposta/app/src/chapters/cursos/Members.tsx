"use client";

import { motion } from "motion/react";
import { IconLock, IconPlayerPlayFilled, IconCircleCheckFilled, IconCircle, IconBell, IconWorld } from "@tabler/icons-react";
import { BrandLogo, Chip, Avatar } from "@/kit";

/** A aula do caso do Trovão, publicada no Módulo 3 (a mesma que o capítulo 06 edita). */
const AULA = {
  titulo: "Claudicação posterior: o caso do Trovão",
  descricao:
    "Como conduzir a avaliação de um membro posterior do início ao fim: o trote em linha reta e no círculo, a flexão e o bloqueio. Com o caso do Trovão, Quarto de Milha de 8 anos (paciente de exemplo).",
  capitulos: [
    { tempo: "00:00", titulo: "O que a queixa já conta" },
    { tempo: "04:12", titulo: "Trote em linha reta e no círculo" },
    { tempo: "11:38", titulo: "Flexão de jarrete: quando confiar" },
    { tempo: "18:05", titulo: "Bloqueios: sequência e leitura" },
    { tempo: "25:40", titulo: "Caso Trovão: do exame à conduta" },
  ],
};

const MODULO = [
  { t: "Anatomia funcional do posterior", d: "24 min", ok: true },
  { t: "Cinemática do trote", d: "28 min", ok: true },
  { t: "Exame em estação", d: "19 min", ok: false },
];

export function Members({ show }: { show: boolean }) {
  const aula = AULA;
  const caps = aula.capitulos;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fbfaf8",
        borderRadius: "var(--r-xl)",
        border: "1px solid rgba(0,0,0,.12)",
        boxShadow: "var(--shadow-window)",
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "34px 72px 1fr",
        color: "var(--text-1)",
      }}
    >
      {/* barra de endereço */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", background: "#f1f1f1", borderBottom: "1px solid var(--border)" }}>
        <span style={{ display: "flex", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ width: 9, height: 9, borderRadius: 9, background: "#d6d6d6" }} />
          ))}
        </span>
        <span
          style={{
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 12px",
            borderRadius: 6,
            background: "#fff",
            color: "var(--text-2)",
            fontSize: 12,
          }}
        >
          <IconLock size={12} /> cursos.gabrielaguenka.com.br/modulo-3
        </span>
      </div>
      {/* cabeçalho com a marca dela */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "0 24px", borderBottom: "1px solid var(--border)", background: "#fff" }}>
        <BrandLogo brand="guenka" height={50} />
        <span style={{ fontWeight: 600 }}>Curso online</span>
        <Chip tone="amber">nome a confirmar</Chip>
        <span style={{ display: "flex", gap: 16, marginLeft: 8, color: "var(--text-2)" }}>
          <b style={{ color: "var(--text-1)", fontWeight: 500 }}>Módulos</b>
          <span>Materiais</span>
          <span>Comunidade</span>
          <span>Certificado</span>
        </span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <IconBell size={16} color="var(--text-2)" />
          <Avatar name="Marina Lopes" color="#7b2a2e" size={26} />
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", minHeight: 0 }}>
        <div style={{ borderRight: "1px solid var(--border)", padding: "16px 14px", background: "#fff" }}>
          <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>MÓDULO 3</div>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Membros posteriores</div>
          {MODULO.map((m) => (
            <div key={m.t} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 6px", color: "var(--text-2)" }}>
              {m.ok ? <IconCircleCheckFilled size={16} color="var(--green)" /> : <IconCircle size={16} color="var(--border-strong)" />}
              <span style={{ flex: 1 }}>{m.t}</span>
              <span style={{ fontSize: 11, color: "var(--text-3)" }}>{m.d}</span>
            </div>
          ))}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={show ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 6px", borderRadius: 8, background: "rgba(123,42,46,.07)", color: "var(--text-1)" }}
          >
            <IconPlayerPlayFilled size={14} color="var(--gg-wine)" style={{ marginTop: 2, flex: "none" }} />
            <span style={{ flex: 1, fontWeight: 500, lineHeight: 1.35 }}>{aula.titulo}</span>
            <Chip tone="red">Nova</Chip>
          </motion.div>
        </div>

        <div style={{ padding: "18px 26px", minWidth: 0, overflow: "hidden" }}>
          <div
            style={{
              position: "relative",
              height: 286,
              borderRadius: 12,
              overflow: "hidden",
              backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,.5)), url(/bg/icm-musgo.webp)",
              backgroundSize: "cover",
              backgroundPosition: "center 40%",
            }}
          >
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <span style={{ width: 56, height: 56, borderRadius: 99, background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center" }}>
                <IconPlayerPlayFilled size={22} color="var(--gg-wine)" />
              </span>
            </div>
            <div style={{ position: "absolute", left: 14, right: 14, bottom: 12, display: "flex", gap: 4 }}>
              {caps.map((c, i) => (
                <span key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i === 0 ? "#fff" : "rgba(255,255,255,.4)" }} />
              ))}
            </div>
            <span style={{ position: "absolute", right: 14, top: 12 }}>
              <Chip tone="dark" icon={IconWorld}>
                Legendas PT-BR
              </Chip>
            </span>
          </div>
          <div className="display" style={{ fontSize: 24, margin: "16px 0 6px" }}>
            {aula.titulo}
          </div>
          <p style={{ margin: "0 0 14px", color: "var(--text-2)", lineHeight: 1.55, maxWidth: 620 }}>{aula.descricao}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px", maxWidth: 640 }}>
            {caps.map((c, i) => (
              <motion.div
                key={c.tempo}
                initial={{ opacity: 0, y: 4 }}
                animate={show ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.6 + i * 0.08 }}
                style={{ display: "flex", gap: 10, padding: "6px 0", borderTop: "1px solid var(--border)" }}
              >
                <span className="mono" style={{ fontSize: 11, color: "var(--gg-wine)", paddingTop: 1 }}>
                  {c.tempo}
                </span>
                <span>{c.titulo}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
