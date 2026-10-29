"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  IconMicrophone,
  IconPlayerStopFilled,
  IconFileTypePdf,
  IconPhoto,
  IconFolder,
  IconBrandGoogleDrive,
  IconPlayerPlay,
  IconFileTypeDoc,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard, AppWindow, Chip } from "@/kit";
import { useAgent } from "@/agent/useAgent";
import { useRecorder } from "@/agent/useRecorder";
import { Record, type Activity, type Status } from "./Record";
import { EXEMPLO_TRANSCRICAO, type Prontuario } from "./agent";

const W = 4200;
const H = 1500;

// Mundo: [legenda + Drive bagunçado] → [celular gravando no exame] → [prontuário no sistema]
const BOX = {
  antes: { x: 140, y: 170, w: 1180, h: 1190 },
  celular: { x: 1430, y: 250, w: 1250, h: 1020 },
  sistema: { x: 2760, y: 300, w: 1180, h: 900 },
};
const SHOTS: Shot[] = [
  frame(BOX.antes, { hold: 3.4, cue: "antes" }),
  frame(BOX.celular, { dur: 1.8, hold: 3.6, cue: "gravando" }),
  frame(BOX.sistema, { dur: 1.9, hold: 0.6, cue: "sistema" }),
];
// durante a interação, a janela fica à esquerda e o card à direita
const LIVE_SHOT: Shot = frame(BOX.sistema, { region: "left", pad: 40, dur: 1.2 });

const DRIVE_FILES = [
  { icon: IconFileTypeDoc, name: "Copy of Copy of Copy of Exame Locomotor.docx", note: "modelo de 7 páginas" },
  { icon: IconPhoto, name: "IMG_2041.HEIC", note: "foto do iPad · sem paciente" },
  { icon: IconFileTypePdf, name: "Prontuario_Trovao_final_v3.pdf", note: "editado há 2 meses" },
  { icon: IconFileTypePdf, name: "exame tarso (1).pdf", note: "duplicado" },
  { icon: IconFolder, name: "Pacientes 2024 - NÃO MEXER", note: "312 itens" },
  { icon: IconFileTypePdf, name: "Prontuário Estrela Dalva.pdf", note: "manuscrito" },
];

export default function ProntuarioChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  // "aprovar": segunda pausa, a conferência pelo WhatsApp (status pedido pela Dra.)
  const [phase, setPhase] = useState<Phase | "aprovar">("scene");
  const [status, setStatus] = useState<Status>("rascunho");
  const conferido = useRef(false);
  const [cue, setCue] = useState("antes");
  const [transcript, setTranscript] = useState<{ text: string; example: boolean } | null>(null);
  const agent = useAgent();
  const mic = useRecorder();

  const call = agent.tool("registrar_prontuario");
  const p = (call?.args ?? {}) as Partial<Prontuario>;

  const activity: Activity = [];
  if (transcript) activity.push({ label: transcript.example ? "Usando o áudio de exemplo" : "Áudio transcrito", done: true });
  if (call) activity.push({ label: call.done ? "Modelo Exame Locomotor preenchido" : "Preenchendo o seu modelo…", done: call.done });
  if (status !== "rascunho") activity.push({ label: "Relatório enviado para sua conferência", done: true });
  if (status === "aprovado") activity.push({ label: "Relatório enviado ao tutor", done: true });

  useEffect(() => {
    // só na primeira conclusão: depois de aprovar, o fluxo não volta para a conferência
    if (phase === "live" && agent.run.status === "done" && !conferido.current) {
      conferido.current = true;
      // sem cleanup: a troca de status re-renderiza e não pode cancelar a próxima etapa
      setTimeout(() => setStatus("conferencia"), 1400);
      setTimeout(() => setPhase("aprovar"), 2600);
    }
  }, [phase, agent.run.status]);

  const aprovar = () => {
    setStatus("aprovado");
    setPhase("live");
    setTimeout(() => setPhase("scope"), 2400);
  };

  const toPause = async () => {
    setPhase("pause");
    await stage.current?.goTo(LIVE_SHOT);
  };

  const submit = (text: string | undefined) => {
    const t = text ?? EXEMPLO_TRANSCRICAO;
    setTranscript({ text: t, example: !text });
    setPhase("live");
    agent.start({ chapter: "prontuario", text: t, demo: !text });
  };

  const onRecord = async () => {
    if (mic.state === "recording") submit(await mic.stop());
    else if (!(await mic.start())) submit(undefined);
  };

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        {/* 1 · Antes */}
        <Caption
          x={140}
          y={170}
          eyebrow="01 · Prontuário"
          title={"Hoje, o exame vive num\nWord de 7 páginas."}
          sub="O modelo é preenchido à mão no iPad, salvo no Drive, e o SimplesVet fica ao lado. Quando precisa achar um caso, começa a busca."
        />
        <Backdrop photo="icm-areia" x={140} y={640} w={1180} h={720}>
          <AppWindow nav={[]} showSidebar={false} workspace="Meu Drive">
            <div style={{ padding: "16px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: "var(--text-2)" }}>
                <IconBrandGoogleDrive size={16} /> Meu Drive › Clínica › Prontuários ›{" "}
                <b style={{ color: "var(--text-1)", fontWeight: 500 }}>2026 (novo)</b>
              </div>
              {DRIVE_FILES.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.12 }}
                  style={{ display: "grid", gridTemplateColumns: "22px 1fr 190px", alignItems: "center", height: 40, borderTop: "1px solid var(--border)" }}
                >
                  <f.icon size={16} color="var(--text-3)" />
                  <span>{f.name}</span>
                  <span style={{ color: "var(--text-3)", fontSize: 12 }}>{f.note}</span>
                </motion.div>
              ))}
            </div>
          </AppWindow>
        </Backdrop>

        {/* 2 · Gravando no exame */}
        <Backdrop photo="icm-dourado" x={1430} y={250} w={660} h={1020} inset="7% 15% 7% 15%">
          <Phone recording={cue !== "antes"} />
        </Backdrop>
        <Caption
          x={2140}
          y={300}
          w={520}
          title={"Grava enquanto\nexamina."}
          sub="No app, um toque. A Donna escuta e preenche o seu modelo de exame locomotor — sem tirar a mão do cavalo."
          show={cue !== "antes"}
        />

        {/* 3 · No sistema */}
        <Backdrop photo="icm-oliva" x={2760} y={300} w={1180} h={900} inset="5% 4% -2% 4%">
          <Record
            p={phase === "scene" || phase === "pause" ? {} : p}
            activity={activity}
            status={status}
            recording={mic.state === "recording" ? `Gravando · ${mic.seconds}s` : undefined}
          />
        </Backdrop>
      </Stage>

      <Overlay show={phase === "pause"}>
        <PauseCard step="grave um exame" title="Descreva um exame em voz alta, como faria no haras." onSkip={() => submit(undefined)}>
          <p style={{ margin: "0 0 16px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            Fale como no seu modelo: animal, histórico, casco, inspeção dinâmica, flexões, imagem e procedimentos. Uns 30 segundos bastam. O áudio é processado e descartado.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button icon={mic.state === "recording" ? IconPlayerStopFilled : IconMicrophone} onClick={onRecord}>
              {mic.state === "recording" ? `Parar · ${mic.seconds}s` : mic.state === "asking" ? "Liberando microfone…" : "Gravar áudio"}
            </Button>
            {mic.state === "recording" && <Wave level={mic.level} />}
          </div>
          {mic.state === "denied" && <p style={{ color: "#f3a38c", marginTop: 12 }}>Sem microfone — seguimos com um áudio de exemplo.</p>}
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <div style={{ width: 380, padding: 20, borderRadius: 16, background: "rgba(17,18,18,.86)", backdropFilter: "blur(24px)", border: "1px solid var(--border-dark)", color: "var(--text-inv)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="eyebrow">Transcrição</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          <p style={{ margin: 0, color: "var(--text-inv-2)", lineHeight: 1.6, maxHeight: 260, overflow: "hidden" }}>“{transcript?.text}”</p>
          {agent.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)" }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
        </div>
      </Overlay>

      <Overlay show={phase === "aprovar"}>
        <PauseCard step="confira o relatório" title="O relatório chegou no seu WhatsApp para conferência." onSkip={aprovar} skipLabel="Pular e aprovar o exemplo">
          <p style={{ margin: "0 0 16px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            Status “Em conferência”: nada vai ao cliente antes do seu ok. Ao aprovar, o relatório segue direto para o WhatsApp do tutor.
          </p>
          <Button icon={IconBrandWhatsapp} onClick={aprovar}>
            Aprovar e enviar ao tutor
          </Button>
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="01"
          title="Prontuário e relatórios"
          items={[
            "App mobile para gravar durante o exame",
            "Seu modelo Exame Locomotor preenchido pela Donna",
            "Modelos de atendimento, internação, laudo de imagem (RX/US) e alta",
            "Status: em conferência no seu WhatsApp → aprovado → cliente",
            "Migração dos dados do SimplesVet e do Drive",
          ]}
          phase="Fase 1"
          metric="Tempo de registro por exame"
          onNext={onNext}
        />
      </Overlay>
    </>
  );
}

function Phone({ recording }: { recording: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 46,
        background: "#0b0b0b",
        padding: 12,
        boxShadow: "var(--shadow-window)",
      }}
    >
      <div style={{ height: "100%", borderRadius: 36, background: "#fff", padding: "54px 22px 24px", display: "flex", flexDirection: "column" }}>
        <div style={{ color: "var(--text-3)", fontSize: 12 }}>Exame em andamento</div>
        <div className="display" style={{ fontSize: 26, margin: "4px 0 6px" }}>
          Trovão
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Chip>Quarto de Milha</Chip>
          <Chip tone="red">Posterior esquerdo</Chip>
        </div>
        <div style={{ flex: 1, display: "grid", placeItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, height: 80 }}>
            {Array.from({ length: 28 }).map((_, i) => (
              <motion.span
                key={i}
                animate={recording ? { height: [8, 18 + ((i * 37) % 54), 10] } : { height: 6 }}
                transition={{ duration: 0.9 + (i % 5) * 0.12, repeat: Infinity, repeatType: "mirror", delay: i * 0.03 }}
                style={{ width: 4, borderRadius: 4, background: recording ? "var(--k-red)" : "var(--border-strong)" }}
              />
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center", color: "var(--text-2)", marginBottom: 14 }} className="mono">
          {recording ? "● gravando  01:12" : "pronto para gravar"}
        </div>
        <div style={{ display: "grid", placeItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 99, background: "var(--k-red)", display: "grid", placeItems: "center", color: "#fff" }}>
            {recording ? <IconPlayerStopFilled size={24} /> : <IconPlayerPlay size={24} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Wave({ level }: { level: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 28 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          style={{ width: 3, borderRadius: 3, background: "var(--k-red)", height: 4 + level * 24 * (0.4 + ((i * 7) % 10) / 10), transition: "height .08s" }}
        />
      ))}
    </div>
  );
}
