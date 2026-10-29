"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { IconArrowRight, IconMicrophone, IconReceipt, IconCalendarEvent, IconChartBar, IconSearch, IconPalette } from "@tabler/icons-react";
import { Stage, frame, type Shot } from "@/engine/Stage";
import { Overlay } from "@/engine/ChapterFrame";
import type { ChapterProps } from "@/engine/types";
import { Backdrop, Button, BrandLogo, Chip, AgentRow } from "@/kit";

const W = 2600;
const H = 1600;

// Abertura no estilo do vídeo de referência: componentes soltos no canvas, câmera passeia e recua.
const ALL = { x: 380, y: 340, w: 2020, h: 820 };
const SHOTS: Shot[] = [
  frame(ALL, { hold: 1.2 }),
  frame({ x: 560, y: 360, w: 760, h: 560 }, { dur: 1.6, hold: 1.6 }),
  frame({ x: 1440, y: 420, w: 640, h: 500 }, { dur: 1.5, hold: 1.6 }),
  frame(ALL, { dur: 1.7, hold: 0.2 }),
];

const Card = ({ x, y, w, children, delay = 0 }: { x: number; y: number; w: number; children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    style={{ position: "absolute", left: x, top: y, width: w, background: "#fff", borderRadius: 14, boxShadow: "var(--shadow-window)", padding: 18 }}
  >
    {children}
  </motion.div>
);

export default function AberturaChapter({ onNext }: ChapterProps) {
  const [ready, setReady] = useState(false);

  return (
    <>
      <motion.div animate={{ opacity: ready ? 0.35 : 1 }} transition={{ duration: 0.8 }} style={{ position: "absolute", inset: 0 }}>
      <Stage width={W} height={H} shots={SHOTS} running onEnd={() => setReady(true)}>
        <Backdrop photo="icm-dourado" x={560} y={360} w={760} h={560} />
        <Card x={640} y={430} w={600} delay={0.1}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Prontuário · Trovão
          </div>
          <div className="display" style={{ fontSize: 24, marginBottom: 10 }}>
            Claudicação posterior esquerdo
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <Chip>Quarto de Milha</Chip>
            <Chip tone="red">AAEP 3/5</Chip>
            <Chip tone="violet">tarso</Chip>
          </div>
          <AgentRow status="concluído" done>
            Estruturado a partir de um áudio de 1min12s
          </AgentRow>
        </Card>

        <Card x={1460} y={420} w={380} delay={0.25}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <IconReceipt size={16} /> <b style={{ fontWeight: 600 }}>Contas a pagar</b>
          </div>
          {[
            ["Ração Premium Equi", "R$ 2.340,00", "amanhã"],
            ["Energia — haras", "R$ 1.118,40", "amanhã"],
          ].map(([a, b, c]) => (
            <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: "1px solid var(--border)" }}>
              <span>{a}</span>
              <span>
                {b} <Chip tone="amber">{c}</Chip>
              </span>
            </div>
          ))}
        </Card>

        <Card x={1440} y={760} w={640} delay={0.4}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <IconChartBar size={16} /> <b style={{ fontWeight: 600 }}>Custo por venda real</b>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
            {[92, 84, 77, 66, 58, 51, 44, 40].map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: h }}
                transition={{ delay: 0.8 + i * 0.08, duration: 0.6 }}
                style={{ flex: 1, borderRadius: 4, background: i === 7 ? "var(--k-red)" : "#e7e8e9" }}
              />
            ))}
          </div>
        </Card>

        <Card x={560} y={1000} w={380} delay={0.55}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconSearch size={16} color="var(--text-3)" />
            <span style={{ color: "var(--text-2)" }}>casos parecidos com o do Trovão</span>
          </div>
        </Card>

        <Card x={1000} y={1000} w={300} delay={0.7}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconCalendarEvent size={16} />
            <span>Retorno · Trovão</span>
            <Chip tone="sky">12 nov</Chip>
          </div>
        </Card>

        <Card x={2140} y={480} w={240} delay={0.85}>
          <div style={{ display: "grid", gap: 10, justifyItems: "start" }}>
            <IconPalette size={18} />
            <span style={{ color: "var(--text-2)" }}>Arte para o Instagram, com a sua marca</span>
          </div>
        </Card>

        <Card x={400} y={720} w={110} delay={1}>
          <div style={{ display: "grid", placeItems: "center", height: 70, color: "var(--k-red)" }}>
            <IconMicrophone size={34} />
          </div>
        </Card>
      </Stage>
      </motion.div>

      {/* chamada sobre o canvas, como o "Showcase" do vídeo */}
      <Overlay show={ready} side="center">
        <div style={{ textAlign: "center", color: "var(--text-inv)", width: 760, padding: "36px 40px", borderRadius: 24, background: "rgba(5,5,5,.9)", backdropFilter: "blur(20px)", border: "1px solid var(--border-dark)" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginBottom: 22 }}>
            <BrandLogo brand="khard" height={40} />
            <span style={{ color: "var(--text-inv-2)" }}>para</span>
            <BrandLogo brand="guenka" height={52} />
          </div>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Proposta · Plataforma Gabriela Guenka
          </div>
          <div className="display" style={{ fontSize: 46, marginBottom: 14 }}>
            Uma proposta para você ver
            <br />o projeto funcionando.
          </div>
          <p style={{ color: "var(--text-inv-2)", fontSize: 16, margin: "0 auto 26px", maxWidth: 520, lineHeight: 1.55 }}>
            São 9 capítulos, cada um com uma parte da sua rotina. Em alguns, você grava um áudio ou envia um arquivo, e o agente responde na hora.
          </p>
          <Button icon={IconArrowRight} onClick={onNext}>
            Começar
          </Button>
          <div className="mono" style={{ marginTop: 18, fontSize: 11, color: "var(--text-inv-2)" }}>
            espaço pausa · ← → capítulos · leva uns 12 minutos
          </div>
        </div>
      </Overlay>
    </>
  );
}
