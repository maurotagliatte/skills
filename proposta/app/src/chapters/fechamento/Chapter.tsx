"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Stage, frame, type Shot } from "@/engine/Stage";
import { Overlay, Caption } from "@/engine/ChapterFrame";
import type { ChapterProps } from "@/engine/types";
import { Minis, MINI_POS, MINI_W, MINI_H } from "./Minis";
import { Proposta } from "./Proposta";

const W = 2200;
const H = 1500;

// A câmera começa perto do primeiro módulo e recua até ver os nove (eco da abertura).
const first = MINI_POS[0];
const ALL = { x: 220, y: 80, w: 1620, h: 1260 };
const SHOTS: Shot[] = [
  frame({ x: first.x - 60, y: first.y - 60, w: MINI_W + 120, h: MINI_H + 120 }, { hold: 1.0 }),
  frame({ x: 240, y: 240, w: 1020, h: 720 }, { dur: 1.8, hold: 0.6 }),
  frame(ALL, { dur: 2.2, hold: 2.2, cue: "todos" }),
];

export default function FechamentoChapter({ onNext: _onNext }: ChapterProps) {
  const [cue, setCue] = useState("");
  const [proposta, setProposta] = useState(false);

  return (
    <>
      <motion.div animate={{ opacity: proposta ? 0.22 : 1, filter: proposta ? "blur(3px)" : "blur(0px)" }} transition={{ duration: 0.9 }} style={{ position: "absolute", inset: 0 }}>
        <Stage width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={() => setProposta(true)}>
          <Caption x={260} y={80} w={1500} eyebrow="10 · Proposta" title="Tudo o que você viu, num sistema só." show={cue === "todos"} />
          <Minis show />
        </Stage>
      </motion.div>

      <Overlay show={proposta} side="center">
        <div style={{ marginTop: -18 }}>
          <Proposta />
        </div>
      </Overlay>
    </>
  );
}
