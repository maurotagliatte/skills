"use client";

import { motion } from "motion/react";
import { IconPlayerPlayFilled, IconMicrophone, IconSparkles } from "@tabler/icons-react";
import { AUDIO, EXEMPLO_TRANSCRICAO } from "./agent";

/** Forma de onda fixa (áudio de exemplo, já gravado): alturas de 0 a 1. */
const BARS = Array.from({ length: 46 }, (_, i) => 0.22 + 0.78 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.43 + 0.6)));

/**
 * O áudio de exemplo: bolha de mensagem de voz com a forma de onda e a transcrição.
 * Nada é gravado: `playing` só anima a barra de progresso e a transcrição entra palavra a palavra.
 */
export function VoiceNote({ playing, dark, compact, seconds = 6 }: { playing: boolean; dark?: boolean; compact?: boolean; seconds?: number }) {
  const fg = dark ? "var(--text-inv)" : "var(--text-1)";
  const fg2 = dark ? "var(--text-inv-2)" : "var(--text-2)";
  const idle = dark ? "rgba(255,255,255,.22)" : "#cfd2d4";
  const words = EXEMPLO_TRANSCRICAO.split(" ");
  const h = compact ? 26 : 40;

  return (
    <div style={{ color: fg }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: compact ? 10 : 14,
          padding: compact ? "8px 12px" : "14px 18px",
          borderRadius: compact ? 12 : 18,
          background: dark ? "rgba(255,255,255,.06)" : "#fff",
          border: dark ? "1px solid var(--border-dark)" : undefined,
          boxShadow: dark ? undefined : "var(--shadow-window)",
        }}
      >
        <span
          style={{
            width: compact ? 30 : 44,
            height: compact ? 30 : 44,
            borderRadius: 99,
            background: "var(--k-red)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            flex: "none",
          }}
        >
          <IconPlayerPlayFilled size={compact ? 14 : 18} />
        </span>
        <div style={{ position: "relative", flex: 1, height: h, display: "flex", alignItems: "center", gap: compact ? 2 : 3 }}>
          {BARS.map((b, i) => (
            <span key={i} style={{ flex: 1, height: `${Math.round(b * 100)}%`, borderRadius: 2, background: idle }} />
          ))}
          {/* progresso: a mesma onda, pintada, revelada da esquerda para a direita */}
          <motion.div
            initial={false}
            animate={{ clipPath: playing ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
            transition={{ duration: playing ? seconds : 0.3, ease: "linear" }}
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: compact ? 2 : 3 }}
          >
            {BARS.map((b, i) => (
              <span key={i} style={{ flex: 1, height: `${Math.round(b * 100)}%`, borderRadius: 2, background: "var(--k-red)" }} />
            ))}
          </motion.div>
        </div>
        <span style={{ fontSize: compact ? 12 : 14, color: fg2, fontVariantNumeric: "tabular-nums", flex: "none" }}>{AUDIO.duracao}</span>
      </div>

      {!compact && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "10px 4px 0", fontSize: 13, color: "rgba(255,255,255,.92)", textShadow: "0 1px 6px rgba(0,0,0,.35)" }}>
          <IconMicrophone size={14} /> Áudio para a Donna · {AUDIO.quando}, no carro
        </div>
      )}

      <div
        style={{
          marginTop: compact ? 10 : 18,
          padding: compact ? 0 : "16px 18px",
          borderRadius: 14,
          background: compact ? undefined : dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.92)",
          lineHeight: compact ? 1.5 : 1.55,
          fontSize: compact ? 13.5 : 19,
          color: fg,
        }}
      >
        {!compact && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: 12, fontFamily: "var(--font-mono)", letterSpacing: ".06em", textTransform: "uppercase", color: "var(--k-red)" }}>
            <IconSparkles size={13} /> Transcrição
          </div>
        )}
        “
        {words.map((w, i) => (
          <motion.span
            key={i}
            initial={false}
            animate={{ opacity: playing ? 1 : 0.18 }}
            transition={{ delay: playing ? (i / words.length) * seconds : 0, duration: 0.25 }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        ))}
        ”
      </div>
    </div>
  );
}
