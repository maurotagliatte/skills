"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { IconArrowRight } from "@tabler/icons-react";
import { Stage, frame, type Shot } from "@/engine/Stage";
import { Overlay, Caption } from "@/engine/ChapterFrame";
import { Button } from "@/kit";
import type { ChapterProps } from "@/engine/types";
import { Fusao, type FusaoStep } from "./Fusao";
import { Proposta } from "./Proposta";

const W = 2200;
const H = 1400;

// Os apps espalhados (plano aberto) → a câmera aproxima enquanto se fundem → app único e o título.
const WIDE = { x: 140, y: 160, w: 1920, h: 1060 };
const MID = { x: 440, y: 240, w: 1640, h: 820 };
const FINAL = { x: 270, y: 380, w: 1260, h: 600 };
const SHOTS: Shot[] = [
  frame(WIDE, { hold: 2.0, cue: "in" }),
  frame(MID, { dur: 1.1, ease: "power2.inOut", cue: "merge" }),
  frame(FINAL, { dur: 1.4, cue: "app" }),
  // a legenda entra quando a câmera assenta
  frame(FINAL, { dur: 0.05, hold: 1.6, cue: "titulo" }),
];
// movimento reduzido: o estado final, parado
const SHOTS_REDUCED: Shot[] = [frame(FINAL, { hold: 0.8, cue: "titulo" })];

export default function FechamentoChapter({ onNext: _onNext }: ChapterProps) {
  const reduce = !!useReducedMotion();
  const [step, setStep] = useState<FusaoStep>("");
  const [ready, setReady] = useState(false);
  const [proposta, setProposta] = useState(false);

  return (
    <>
      <motion.div animate={{ opacity: proposta ? 0.14 : 1 }} transition={{ duration: 0.8 }} style={{ position: "absolute", inset: 0 }}>
        <Stage
          width={W}
          height={H}
          shots={reduce ? SHOTS_REDUCED : SHOTS}
          running
          onCue={(c) => setStep(c as FusaoStep)}
          onEnd={() => setReady(true)}
        >
          <Caption x={300} y={440} w={820} size={64} eyebrow="09 · Proposta" title={"Do haras à venda,\nnum sistema só."} show={step === "titulo"} />
          <Fusao step={step} reduce={reduce} />
          <div style={{ position: "absolute", left: 300, top: 700, transform: "scale(1.25)", transformOrigin: "0 0" }}>
            <AnimatePresence>
              {ready && !proposta && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                  <Button icon={IconArrowRight} onClick={() => setProposta(true)} advance>
                    Ver a proposta
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Stage>
      </motion.div>

      <Overlay show={proposta} side="center">
        <Proposta />
      </Overlay>
    </>
  );
}
