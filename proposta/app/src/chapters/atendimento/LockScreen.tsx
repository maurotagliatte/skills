"use client";

import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Icon } from "@tabler/icons-react";
import { IconAntennaBars5, IconBattery3, IconBulb, IconCamera, IconLock, IconWifi } from "@tabler/icons-react";
import SwipeToast from "@/kit/rb/SwipeToast/SwipeToast";
import Noise from "@/kit/rb/Noise/Noise";
import css from "./lock.module.css";

/** Uma notificação na tela de bloqueio. A primeira da lista aparece no topo (a mais nova). */
export type LockNotification = {
  /** chave estável: trocar a lista com ids novos faz a notificação nova deslizar para dentro */
  id: string;
  /** nome do app ou da área ("Donna", "Contas", "Agenda") — aparece como "Clínica · {app}" */
  app: string;
  titulo: ReactNode;
  texto?: ReactNode;
  /** "agora", "7:10", "ontem" */
  quando: string;
  /** ícone Tabler do app (padrão: IconBulb) */
  icon?: Icon;
  /** cor do quadradinho do ícone (padrão: vermelho Khard) */
  cor?: string;
  /** destaque de notificação recém-chegada (mais opaca, com sombra) */
  nova?: boolean;
};

/** Botão redondo de atalho da tela de bloqueio (no iPhone, os dois cantos de baixo). */
export type LockShortcut = {
  icon: Icon;
  /** nome do atalho; vira o aria-label e, com `destaque`, uma etiqueta acima do botão */
  label: string;
  /** mostra a etiqueta com o nome (para o espectador saber o que é) */
  destaque?: boolean;
  /** aceso (fundo branco), como quando o atalho está em uso */
  ativo?: boolean;
  onPress?: () => void;
};

export type LockScreenProps = {
  /** relógio grande, ex.: "07:42" */
  hora: string;
  /** linha acima do relógio, ex.: "segunda-feira, 9 de novembro" */
  data: string;
  /** foto ICM de public/bg/ (sem extensão). Padrão: "icm-noite" */
  wallpaper?: string;
  /** grão de filme sobre a foto (padrão: true) */
  grao?: boolean;
  notificacoes?: LockNotification[];
  /**
   * Atalhos dos cantos. Padrão: lanterna à esquerda e câmera à direita, como no iPhone.
   * Passe `null` para esconder um lado.
   */
  atalhos?: { esquerda?: LockShortcut | null; direita?: LockShortcut | null };
  /** anima um toque no atalho (cena sem interação) */
  toque?: "esquerda" | "direita" | null;
  /**
   * Conteúdo vivo acima dos atalhos (ex.: a gravação em andamento, um status da Donna).
   * Fica sobre a foto: use fundo escuro translúcido e texto claro.
   */
  children?: ReactNode;
  style?: CSSProperties;
};

const DEFAULT_LEFT: LockShortcut = { icon: IconBulb, label: "Lanterna" };
const DEFAULT_RIGHT: LockShortcut = { icon: IconCamera, label: "Câmera" };

/**
 * Celular na tela de bloqueio — reutilizável entre capítulos (01 grava daqui; 02 recebe o aviso do boleto).
 * Preenche o elemento pai (pense num pai de ~430×880 px). Representa um app nativo: gravar ou abrir algo
 * sem desbloquear depende de um controle de tela de bloqueio (iPhone, iOS 18+) ou de um atalho (Android).
 */
export function LockScreen({
  hora,
  data,
  wallpaper = "icm-noite",
  grao = true,
  notificacoes = [],
  atalhos,
  toque,
  children,
  style,
}: LockScreenProps) {
  const left = atalhos?.esquerda === undefined ? DEFAULT_LEFT : atalhos.esquerda;
  const right = atalhos?.direita === undefined ? DEFAULT_RIGHT : atalhos.direita;
  return (
    <div className={css.device} style={style}>
      <div className={css.screen} style={{ backgroundImage: `url(/bg/${wallpaper}.webp)` }}>
        <div className={css.scrim} />
        {grao && <Noise opacity={0.14} fps={0} blendMode="overlay" contrast={0.7} />}
        <div className={css.layer}>
          <div className={css.statusBar} aria-hidden>
            <span style={{ paddingLeft: 18 }}>{hora.replace(/^0/, "")}</span>
            <span className={css.island} />
            <span className={css.statusIcons}>
              <IconAntennaBars5 size={17} stroke={2} />
              <IconWifi size={17} stroke={2} />
              <IconBattery3 size={19} stroke={1.8} />
            </span>
          </div>
          <div className={css.lock} aria-hidden>
            <IconLock size={20} stroke={2} />
          </div>
          <div className={css.date}>{data}</div>
          <div className={css.time}>{hora}</div>

          <div className={css.notifs} aria-label="Notificações">
            {notificacoes.map((n) => (
              <Notification key={n.id} n={n} />
            ))}
          </div>

          <div className={css.slot}>{children}</div>

          <div className={css.shortcuts}>
            {left ? <Shortcut s={left} side="esquerda" tapping={toque === "esquerda"} /> : <span />}
            {right ? <Shortcut s={right} side="direita" tapping={toque === "direita"} /> : <span />}
          </div>
          <div className={css.home} aria-hidden />
        </div>
      </div>
    </div>
  );
}

function Notification({ n }: { n: LockNotification }) {
  const I = n.icon ?? IconBulb;
  return (
    <SwipeToast
      inline
      className={`${css.notif} ${n.nova ? css.notifNew : ""}`}
      duration={0}
      dismissible={false}
      width={600}
      radius={22}
      background={n.nova ? "rgba(246, 246, 246, 0.9)" : "rgba(246, 246, 246, 0.62)"}
      color="#141515"
      icon={
        <span className={css.appIcon} style={n.cor ? { background: n.cor } : undefined}>
          <I size={20} stroke={1.9} />
        </span>
      }
      title={
        <>
          <span className={css.notifHead}>
            <span>Clínica · {n.app}</span>
            <span>{n.quando}</span>
          </span>
          <span className={css.notifTitle}>{n.titulo}</span>
        </>
      }
      description={n.texto ? <span className={css.notifText}>{n.texto}</span> : undefined}
    />
  );
}

function Shortcut({ s, side, tapping }: { s: LockShortcut; side: "esquerda" | "direita"; tapping: boolean }) {
  const I = s.icon;
  return (
    <button
      type="button"
      aria-label={s.label}
      onClick={s.onPress}
      className={`${css.shortcut} ${s.ativo ? css.shortcutOn : ""} ${tapping ? css.pressed : ""}`}
    >
      <I size={24} stroke={1.9} />
      {s.destaque && <span className={`${css.tag} ${side === "direita" ? css.tagRight : ""}`}>{s.label}</span>}
      <AnimatePresence>
        {tapping && (
          <motion.span
            key="ripple"
            className={css.ripple}
            initial={{ opacity: 0.9, scale: 1 }}
            animate={{ opacity: 0, scale: 1.9 }}
            transition={{ duration: 0.7, ease: "easeOut", repeat: 1 }}
          />
        )}
      </AnimatePresence>
    </button>
  );
}
