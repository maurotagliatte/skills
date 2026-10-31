"use client";

import type { CSSProperties, ReactNode } from "react";
import type { Icon } from "@tabler/icons-react";
import d from "./dark.module.css";

/* Controles para os cards escuros ("Sua vez" e ao vivo), sobre o palco. */

/** Card escuro da fase ao vivo (transcrição, pedido, resposta da Donna). */
export function LiveCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={d.liveCard} style={style}>
      {children}
    </div>
  );
}

/** Slider com rótulo, valor formatado e limites (fundo escuro). */
export function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  fmt,
  disabled,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  fmt: (v: number) => string;
  disabled?: boolean;
}) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "var(--text-inv-2)" }}>{label}</span>
        <b style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(value)}</b>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--k-red)", margin: 0, cursor: disabled ? "default" : "pointer" }}
      />
      <span style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-inv-2)", opacity: 0.7 }}>
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </span>
    </label>
  );
}

/**
 * Campo de texto (fundo escuro). `rows` vira textarea; `icon` põe o ícone dentro do campo.
 * `onEnter` dispara no Enter (fora de um form). `style` só para margens/ajustes do chamador.
 */
export function TextField({
  value,
  onChange,
  label,
  placeholder,
  rows,
  icon: I,
  onEnter,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  /** aria-label */
  label?: string;
  placeholder?: string;
  rows?: number;
  icon?: Icon;
  onEnter?: () => void;
  style?: CSSProperties;
}) {
  const common = {
    value,
    placeholder,
    "aria-label": label,
    onChange: (e: { target: { value: string } }) => onChange(e.target.value),
    onKeyDown: onEnter ? (e: { key: string }) => e.key === "Enter" && onEnter() : undefined,
  };
  if (rows) return <textarea {...common} rows={rows} className={`${d.field} ${d.fieldArea}`} style={style} />;
  if (I)
    return (
      <div className={`${d.field} ${d.fieldBox}`} style={style}>
        <I size={16} color="var(--text-inv-2)" />
        <input {...common} className={d.fieldBare} />
      </div>
    );
  return <input {...common} className={`${d.field} ${d.fieldInput}`} style={style} />;
}

/**
 * Sugestões clicáveis abaixo de um campo (fundo escuro).
 * `list`: uma por linha, alinhadas à esquerda; `pills`: em linha, com a escolhida marcada.
 */
export function Suggestions({
  items,
  value,
  onPick,
  variant = "list",
  icon,
  style,
}: {
  items: readonly string[];
  onPick: (s: string) => void;
  /** valor atual do campo: marca a sugestão escolhida (pills) */
  value?: string;
  variant?: "list" | "pills";
  /** ícone por sugestão (list) */
  icon?: (s: string) => Icon | undefined;
  style?: CSSProperties;
}) {
  return (
    <div className={variant === "pills" ? d.pills : d.list} style={style}>
      {items.map((s) => {
        const I = icon?.(s);
        return (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className={variant === "pills" ? `${d.pill} ${s === value ? d.pillActive : ""}` : d.listItem}
          >
            {I && <I size={13} style={{ flex: "none", marginTop: 2 }} />}
            {s}
          </button>
        );
      })}
    </div>
  );
}

/** Barras do nível do microfone enquanto grava (0…1). */
export function MicLevel({ level }: { level: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 28 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} style={{ width: 3, borderRadius: 3, background: "var(--k-red)", height: 4 + level * 24 * (0.4 + ((i * 7) % 10) / 10), transition: "height .08s" }} />
      ))}
    </div>
  );
}
