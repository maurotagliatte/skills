"use client";

import { motion } from "motion/react";
import type { Icon } from "@tabler/icons-react";
import {
  IconBrandWhatsapp,
  IconBrandGoogleDrive,
  IconBrandInstagram,
  IconBrandGmail,
  IconCalendar,
  IconBrandYoutube,
  IconBrandMeta,
  IconFileSpreadsheet,
} from "@tabler/icons-react";
import { BrandLogo } from "@/kit";
import s from "./fechamento.module.css";

/**
 * Abertura do fechamento: os apps que ela usa hoje, espalhados, se juntam num único app com a marca
 * da clínica. Ícones de marca do Tabler (nunca desenhados), cada um no tile da cor característica do app.
 * Coordenadas do mundo do Stage.
 */
export const APP = { x: 1340, y: 640 };
const TILE = 186;
const APP_TILE = 280;

type App = { nome: string; icon: Icon; cor: string; x: number; y: number; r: number };
const APPS: App[] = [
  { nome: "WhatsApp", icon: IconBrandWhatsapp, cor: "#25d366", x: 400, y: 400, r: -8 },
  { nome: "Drive", icon: IconBrandGoogleDrive, cor: "#1fa463", x: 820, y: 300, r: 6 },
  { nome: "Instagram", icon: IconBrandInstagram, cor: "#d62976", x: 1260, y: 280, r: -5 },
  { nome: "Gmail", icon: IconBrandGmail, cor: "#ea4335", x: 1720, y: 340, r: 7 },
  { nome: "Agenda", icon: IconCalendar, cor: "#4285f4", x: 1900, y: 760, r: -6 },
  { nome: "YouTube", icon: IconBrandYoutube, cor: "#ff0000", x: 1560, y: 1040, r: 5 },
  { nome: "Meta Ads", icon: IconBrandMeta, cor: "#0866ff", x: 1000, y: 1060, r: -7 },
  { nome: "Planilhas", icon: IconFileSpreadsheet, cor: "#107c41", x: 470, y: 860, r: 8 },
];

/** in = espalhados flutuando · merge = convergem e fundem · app = câmera chega no app · titulo = entra a legenda */
export type FusaoStep = "" | "in" | "merge" | "app" | "titulo";

export function Fusao({ step, reduce }: { step: FusaoStep; reduce: boolean }) {
  const merging = step === "merge" || step === "app" || step === "titulo";
  const appOn = reduce || merging;
  return (
    <>
      {!reduce &&
        APPS.map((a, i) => {
          const I = a.icon;
          const dx = APP.x - a.x;
          const dy = APP.y - a.y;
          return (
            <motion.div
              key={a.nome}
              initial={{ opacity: 0, scale: 0.6, x: 0, y: 0, rotate: a.r }}
              animate={
                merging
                  ? { opacity: 0, scale: 0.42, x: dx, y: dy, rotate: 0 }
                  : step === "in"
                    ? { opacity: 1, scale: 1, x: 0, y: 0, rotate: a.r }
                    : { opacity: 0, scale: 0.6, x: 0, y: 0, rotate: a.r }
              }
              transition={
                merging
                  ? {
                      x: { type: "spring", stiffness: 70, damping: 14, delay: i * 0.035 },
                      y: { type: "spring", stiffness: 70, damping: 14, delay: i * 0.035 },
                      scale: { duration: 0.9, ease: [0.5, 0, 0.75, 0], delay: i * 0.035 },
                      rotate: { duration: 0.8, delay: i * 0.035 },
                      opacity: { duration: 0.28, delay: 0.62 + i * 0.035 },
                    }
                  : { type: "spring", stiffness: 160, damping: 15, delay: 0.25 + i * 0.07 }
              }
              style={{ position: "absolute", left: a.x - TILE / 2, top: a.y - TILE / 2, width: TILE, zIndex: 2 }}
            >
              {/* flutuação lenta enquanto estão espalhados */}
              <motion.div
                animate={merging ? { y: 0 } : { y: [0, -12, 0, 8, 0] }}
                transition={merging ? { duration: 0.3 } : { duration: 4.2 + (i % 3) * 0.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              >
                <div className={s.tile} style={{ width: TILE, height: TILE, borderRadius: TILE * 0.235, background: a.cor }}>
                  <I size={TILE * 0.52} stroke={1.6} color="#fff" />
                </div>
                <motion.div
                  animate={{ opacity: merging ? 0 : 1 }}
                  transition={{ duration: 0.25 }}
                  style={{ marginTop: 14, textAlign: "center", fontSize: 20, color: "var(--text-inv-2)" }}
                >
                  {a.nome}
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}

      {/* clarão quente no ponto de fusão */}
      {!reduce && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={merging ? { opacity: [0, 0.9, 0], scale: [0.3, 1.25, 1.8] } : { opacity: 0, scale: 0.3 }}
          transition={merging ? { duration: 1.1, delay: 0.55, times: [0, 0.4, 1], ease: "easeOut" } : { duration: 0.2 }}
          className={s.flash}
          style={{ left: APP.x - 260, top: APP.y - 260, width: 520, height: 520 }}
        />
      )}

      {/* o app único */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.4 }}
        animate={appOn ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 13, delay: 0.82 }}
        style={{ position: "absolute", left: APP.x - APP_TILE / 2, top: APP.y - APP_TILE / 2, width: APP_TILE, zIndex: 3 }}
      >
        <div className={s.appTile} style={{ width: APP_TILE, height: APP_TILE, borderRadius: APP_TILE * 0.235 }}>
          <BrandLogo brand="guenka" plate height={150} />
        </div>
        <div style={{ marginTop: 18, textAlign: "center", fontSize: 22, color: "var(--text-inv)" }}>Clínica Gabriela Guenka</div>
      </motion.div>
    </>
  );
}
