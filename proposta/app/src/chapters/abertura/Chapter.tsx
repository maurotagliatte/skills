"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconArrowRight, IconMicrophone } from "@tabler/icons-react";
import { Stage, type Shot } from "@/engine/Stage";
import { SceneTitle, titleDuration } from "@/engine/ChapterFrame";
import type { ChapterProps } from "@/engine/types";
import { Button, BrandLogo } from "@/kit";
import Cubes, { type CubesHandle } from "@/kit/rb/Cubes/Cubes";

// Mundo do tamanho da tela de referência: a abertura é uma composição 50/50 da régua Plane,
// título à esquerda e um único elemento vivo à direita (a grade de cubos).
const W = 1440;
const H = 900;
const SHOTS: Shot[] = [{ x: W / 2, y: H / 2, zoom: 1 }];

const TITLE = "Um caso seu, do haras\naté a aula.";
const SETTLE = titleDuration(TITLE);

const L = 120; // margem externa (régua: 120–160)
const CUBE = { x: 772, y: 168, s: 548 };

const fade = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function AberturaChapter({ onNext }: ChapterProps) {
  const cubes = useRef<CubesHandle>(null);
  const [leaving, setLeaving] = useState(false);

  // "Começar": uma onda vermelha sai do centro da grade; quando chega à borda, a câmera segue para o 01
  const start = () => {
    if (leaving) return;
    setLeaving(true);
    const t = cubes.current?.ripple() ?? 0;
    window.setTimeout(onNext, Math.max(0, t * 1000 * 0.8));
  };

  return (
    <Stage width={W} height={H} shots={SHOTS} running>
      <motion.div {...fade(0)} style={{ position: "absolute", left: L, top: 176, display: "flex", alignItems: "center", gap: 14, color: "var(--text-inv-2)" }}>
        <BrandLogo brand="khard" height={34} />
        <span style={{ fontSize: 14 }}>para</span>
        <BrandLogo brand="guenka" height={46} plate />
        <span style={{ fontSize: 14, marginLeft: 6 }}>Proposta para a Dra. Gabriela Guenka</span>
      </motion.div>

      <div style={{ position: "absolute", left: L, top: 290, width: 640, color: "var(--text-inv)" }}>
        <h1 style={{ margin: 0, font: "inherit" }}>
          <SceneTitle text={TITLE} size={64} delay={0.15} />
        </h1>
        <motion.p {...fade(0.15 + SETTLE * 0.6)} style={{ margin: "24px 0 0", fontSize: 18, lineHeight: 1.5, color: "var(--text-inv-2)", maxWidth: 540 }}>
          Seis problemas da sua semana, seguidos num paciente de exemplo, o Trovão. Em cada um você testa: grava, envia uma foto ou pede, e a Donna responde.
        </motion.p>
        <motion.div {...fade(0.3 + SETTLE * 0.6)} style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 18 }}>
          <Button icon={IconArrowRight} onClick={start} disabled={leaving} style={{ height: 44, padding: "0 20px", fontSize: 15, opacity: 1 }}>
            Começar
          </Button>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--text-inv-2)", fontSize: 13, maxWidth: 270, lineHeight: 1.45 }}>
            <IconMicrophone size={16} stroke={1.6} style={{ flex: "none" }} />
            No capítulo 01 o navegador pede o microfone. Dá para seguir sem ele.
          </span>
        </motion.div>
      </div>

      <div style={{ position: "absolute", left: CUBE.x, top: CUBE.y, width: CUBE.s, height: CUBE.s }}>
        <Cubes
          ref={cubes}
          gridSize={10}
          gap={0.22}
          faceColor="#050505"
          edgeColor="#424242"
          edgeWidth={1}
          shading={0.5}
          maxAngle={40}
          radius={2.6}
          perspective={0}
          autoAnimate
          rippleOnClick={false}
          rippleColor="#EB3102"
          rippleSpeed={1.1}
        />
      </div>
    </Stage>
  );
}
