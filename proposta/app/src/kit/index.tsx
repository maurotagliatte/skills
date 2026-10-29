"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { Icon } from "@tabler/icons-react";
import { IconPointerFilled, IconSearch, IconSparkles } from "@tabler/icons-react";
import s from "./kit.module.css";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");

/* ——— Logo oficial (nunca recriado: ver CLAUDE.md) ——— */

const LOGOS = {
  khard: { src: "/brand/khard-mark.png", label: "Logo Khard" },
  guenka: { src: "/brand/gabriela-guenka.png", label: "Logo Gabriela Guenka" },
} as const;

/** Carrega o arquivo oficial de public/brand/. Sem o arquivo, mostra um espaço reservado explícito. */
export function BrandLogo({
  brand,
  height,
  style,
  plate,
}: {
  brand: keyof typeof LOGOS;
  height: number;
  style?: CSSProperties;
  /** sobre fundo escuro: apresenta o logo original numa placa clara, sem alterar as cores */
  plate?: boolean;
}) {
  const logo = LOGOS[brand];
  const [status, setStatus] = useState<"loading" | "ok" | "missing">("loading");
  useEffect(() => {
    const img = new Image();
    img.onload = () => setStatus("ok");
    img.onerror = () => setStatus("missing");
    img.src = logo.src;
  }, [logo.src]);
  if (status === "loading") return <span style={{ display: "inline-block", height, width: height }} />;
  if (status === "missing") {
    return (
      <span className={s.logoSlot} style={{ height, minWidth: height, ...style }} title="Arquivo oficial pendente">
        {logo.label}
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src={logo.src} alt={logo.label} style={{ height, width: "auto", display: "block", ...(plate ? {} : style) }} />;
  if (!plate) return img;
  return (
    <span style={{ display: "inline-block", padding: height * 0.18, borderRadius: 12, background: "var(--k-paper)", ...style }}>{img}</span>
  );
}

/* ——— Moldura fotográfica ICM ——— */

export function Backdrop({
  photo,
  x,
  y,
  w,
  h,
  inset,
  children,
}: {
  photo: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /** margem da foto ao redor da janela */
  inset?: string;
  children?: ReactNode;
}) {
  return (
    <div className={s.backdrop} style={{ left: x, top: y, width: w, height: h, backgroundImage: `url(/bg/${photo}.webp)` }}>
      <div className={s.backdropInner} style={inset ? { inset } : undefined}>
        {children}
      </div>
    </div>
  );
}

/* ——— Janela do app ——— */

export type NavEntry = { icon: Icon; label: string; active?: boolean } | { section: string };

export function AppWindow({
  nav,
  aside,
  children,
  workspace = "Clínica Gabriela Guenka",
  showSidebar = true,
}: {
  nav: NavEntry[];
  aside?: ReactNode;
  children: ReactNode;
  workspace?: string;
  showSidebar?: boolean;
}) {
  return (
    <div className={s.window}>
      <div className={s.topbar}>
        <div className={s.workspace}>
          <BrandLogo brand="guenka" height={20} />
          {workspace}
        </div>
        <div className={s.search}>
          <IconSearch size={13} />
          Buscar em tudo
          <span className={s.kbd}>⌘K</span>
        </div>
        <div className={s.assistantBtn}>
          <IconSparkles size={13} color="var(--k-red)" />
          Donna
        </div>
      </div>
      <div className={cx(s.body, !!aside && s.bodyWithAside)} style={showSidebar ? undefined : { gridTemplateColumns: aside ? "1fr 300px" : "1fr" }}>
        {showSidebar && (
          <nav className={s.sidebar}>
            {nav.map((n, i) =>
              "section" in n ? (
                <div key={i} className={s.navLabel}>
                  {n.section}
                </div>
              ) : (
                <div key={i} className={cx(s.navItem, n.active && s.navItemActive)}>
                  <n.icon size={15} stroke={1.6} />
                  {n.label}
                </div>
              ),
            )}
          </nav>
        )}
        <main className={s.main}>{children}</main>
        {aside && <aside className={s.aside}>{aside}</aside>}
      </div>
    </div>
  );
}

/* ——— Átomos ——— */

type Tone = "neutral" | "red" | "amber" | "green" | "violet" | "sky" | "dark";
const toneClass: Record<Tone, string> = {
  neutral: s.chipNeutral,
  red: s.chipRed,
  amber: s.chipAmber,
  green: s.chipGreen,
  violet: s.chipViolet,
  sky: s.chipSky,
  dark: s.chipDark,
};

export function Chip({ tone = "neutral", icon: I, children }: { tone?: Tone; icon?: Icon; children: ReactNode }) {
  return (
    <span className={cx(s.chip, toneClass[tone])}>
      {I && <I size={12} stroke={2} />}
      {children}
    </span>
  );
}

export function Avatar({ name, color = "#5c5f62", size = 20 }: { name: string; color?: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span className={s.avatar} style={{ width: size, height: size, background: color }}>
      {initials}
    </span>
  );
}

export function Prop({ icon: I, label, children }: { icon: Icon; label: string; children: ReactNode }) {
  return (
    <div className={s.prop}>
      <span className={s.propLabel}>
        <I size={14} stroke={1.6} />
        {label}
      </span>
      <span>{children}</span>
    </div>
  );
}

export function Button({
  variant = "primary",
  icon: I,
  children,
  onClick,
  disabled,
  style,
}: {
  variant?: "primary" | "ghost" | "light" | "outline";
  icon?: Icon;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const v = { primary: s.btnPrimary, ghost: s.btnGhost, light: s.btnLight, outline: s.btnOutline }[variant];
  return (
    <button className={cx(s.btn, v)} onClick={onClick} disabled={disabled} style={{ opacity: disabled ? 0.5 : 1, ...style }}>
      {I && <I size={15} stroke={1.8} />}
      {children}
    </button>
  );
}

/* ——— Agente ——— */

export function AgentRow({
  name = "Donna",
  status,
  done,
  children,
}: {
  name?: string;
  status: string;
  done?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={s.agentRow}>
      <Avatar name={name} color="var(--k-red)" size={22} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <b style={{ fontWeight: 600 }}>{name}</b>
          <span className={s.agentBadge}>AGENTE</span>
          <span className={done ? s.statusDone : s.statusWorking}>{status}</span>
        </div>
        {children && <div style={{ marginTop: 4, color: "var(--text-2)" }}>{children}</div>}
      </div>
    </div>
  );
}

/** Cursor com etiqueta (Plane real-time grid / pen.dev). Posição em coordenadas do pai. */
export function Cursor({ x, y, label, color = "var(--k-red)" }: { x: number; y: number; label: string; color?: string }) {
  return (
    <div className={s.cursor} style={{ left: x, top: y, transition: "left 0.9s var(--ease-cam), top 0.9s var(--ease-cam)" }}>
      <IconPointerFilled size={20} color={color} style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,.35))" }} />
      <span className={s.cursorTag} style={{ background: color }}>
        {label}
      </span>
    </div>
  );
}

/* ——— Cartão de escopo (carta de baralho Khard) ——— */

export function ScopeCard({
  number,
  title,
  items,
  phase,
  metric,
  onNext,
  nextLabel = "Próximo capítulo",
}: {
  number: string;
  title: string;
  items: string[];
  phase: string;
  metric: string;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className={s.card}>
      <div className={s.cardFrame} />
      <span className={cx(s.cardIndex, s.cardIndexTop)}>K♠ {number}</span>
      <span className={cx(s.cardIndex, s.cardIndexBottom)}>K♠ {number}</span>
      <div className="eyebrow" style={{ marginBottom: 10 }}>
        Isso entra no projeto
      </div>
      <div className="display" style={{ fontSize: 26, marginBottom: 14 }}>
        {title}
      </div>
      <ul style={{ margin: 0, padding: "0 0 0 16px", color: "var(--text-2)", display: "grid", gap: 6 }}>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      <div style={{ display: "grid", gap: 6, margin: "18px 0 20px", paddingTop: 14, borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "var(--text-3)" }}>Fase</span>
          <span>{phase}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span style={{ color: "var(--text-3)" }}>Como medimos</span>
          <span style={{ textAlign: "right" }}>{metric}</span>
        </div>
      </div>
      <Button onClick={onNext} style={{ width: "100%" }}>
        {nextLabel}
      </Button>
    </div>
  );
}

/* ——— Card de interação ("Sua vez") ——— */

export function PauseCard({
  step,
  title,
  children,
  onSkip,
  skipLabel = "Pular e ver um exemplo",
}: {
  step: string;
  title: string;
  children: ReactNode;
  onSkip?: () => void;
  skipLabel?: string;
}) {
  return (
    <div className={s.pause}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        Sua vez · {step}
      </div>
      <div className="display" style={{ fontSize: 22, marginBottom: 16, color: "var(--text-inv)" }}>
        {title}
      </div>
      {children}
      {onSkip && (
        <button
          onClick={onSkip}
          style={{ display: "block", marginTop: 14, background: "none", border: 0, padding: 0, color: "var(--text-inv-2)", textDecoration: "underline", textUnderlineOffset: 3 }}
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}

export { cx };
