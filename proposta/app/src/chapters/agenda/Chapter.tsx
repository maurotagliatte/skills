"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconMicrophone, IconPlayerStopFilled } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard } from "@/kit";
import { useAgent } from "@/agent/useAgent";
import { useRecorder } from "@/agent/useRecorder";
import { Week, type Activity } from "./Week";
import { Scattered } from "./Scattered";
import { EXEMPLO_TRANSCRICAO, type Evento } from "./agent";
import { proximaQuinta, segundaDa, parseData } from "./datas";

const W = 3900;
const H = 1500;

// Mundo: [horários espalhados] → [virada] → [semana no sistema]
const BOX = {
  antes: { x: 140, y: 170, w: 1180, h: 1190 },
  virada: { x: 1440, y: 490, w: 980, h: 300 },
  sistema: { x: 2560, y: 300, w: 1180, h: 900 },
};
const SHOTS: Shot[] = [
  frame(BOX.antes, { hold: 3.6, cue: "antes" }),
  frame(BOX.virada, { dur: 1.7, hold: 2.0, cue: "virada" }),
  frame(BOX.sistema, { dur: 1.9, hold: 1.0, cue: "sistema" }),
];
const LIVE_SHOT: Shot = frame(BOX.sistema, { region: "left", pad: 40, dur: 1.2 });

export default function AgendaChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [phase, setPhase] = useState<Phase>("scene");
  const [cue, setCue] = useState("antes");
  const [transcript, setTranscript] = useState<{ text: string; example: boolean } | null>(null);
  const agent = useAgent();
  const mic = useRecorder();
  const hoje = useMemo(() => new Date(), []);

  const call = agent.tool("criar_evento");
  const live = phase === "live" || phase === "scope";
  const ev = (live ? call?.args ?? {} : {}) as Partial<Evento>;
  // a grade mostra a semana do evento (ou a da próxima quinta, antes do pedido)
  const segunda = segundaDa(parseData(ev.data) ?? proximaQuinta(hoje));

  const activity: Activity = [];
  if (transcript && live) activity.push({ label: transcript.example ? "Usando o áudio de exemplo" : "Áudio transcrito", done: true });
  if (call && live) activity.push({ label: call.done ? "Compromisso criado e sincronizado" : "Marcando na agenda…", done: call.done });

  useEffect(() => {
    if (phase === "live" && agent.run.status === "done") {
      const t = setTimeout(() => setPhase("scope"), 3200);
      return () => clearTimeout(t);
    }
  }, [phase, agent.run.status]);

  const toPause = async () => {
    setPhase("pause");
    await stage.current?.goTo(LIVE_SHOT);
  };

  const submit = (text: string | undefined) => {
    const t = text ?? EXEMPLO_TRANSCRICAO;
    setTranscript({ text: t, example: !text });
    setPhase("live");
    agent.start({ chapter: "agenda", text: t, demo: !text });
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
          eyebrow="03 · Agenda"
          title={"Hoje, a agenda mora\nem cinco lugares."}
          sub="Mensagens, ligações perdidas, post-it e memória. Marcar um retorno é abrir três aplicativos e torcer para não encavalar."
        />
        <Backdrop photo="icm-musgo" x={140} y={640} w={1180} h={720}>
          <Scattered />
        </Backdrop>

        {/* 2 · Virada */}
        <Caption
          x={1460}
          y={520}
          w={940}
          title={"E se bastasse pedir?"}
          sub="Um áudio no carro, entre um haras e outro. A Donna entende o dia, o horário e o paciente — e o compromisso entra na agenda, com lembrete."
          show={cue !== "antes"}
        />

        {/* 3 · Semana no sistema */}
        <Backdrop photo="icm-pessego" x={2560} y={300} w={1180} h={900} inset="5% 4% -2% 4%">
          <Week segunda={segunda} hoje={hoje} ev={ev} done={!!call?.done && live} activity={activity} />
        </Backdrop>
      </Stage>

      <Overlay show={phase === "pause"}>
        <PauseCard step="peça por áudio" title="Peça para a Donna marcar um compromisso." onSkip={() => submit(undefined)}>
          <p style={{ margin: "0 0 12px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            Fale como falaria com uma secretária: quem, onde, que dia e a que horas. O áudio é processado e descartado.
          </p>
          <p style={{ margin: "0 0 16px", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.05)", border: "1px solid var(--border-dark)", color: "var(--text-inv)", lineHeight: 1.5 }}>
            “{EXEMPLO_TRANSCRICAO}.”
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button icon={mic.state === "recording" ? IconPlayerStopFilled : IconMicrophone} onClick={onRecord}>
              {mic.state === "recording" ? `Parar · ${mic.seconds}s` : mic.state === "asking" ? "Liberando microfone…" : mic.state === "transcribing" ? "Transcrevendo…" : "Gravar pedido"}
            </Button>
            {mic.state === "recording" && <Wave level={mic.level} />}
          </div>
          {mic.state === "denied" && <p style={{ color: "#f3a38c", marginTop: 12 }}>Sem microfone — seguimos com o pedido de exemplo.</p>}
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <div style={{ width: 380, padding: 20, borderRadius: 16, background: "rgba(17,18,18,.86)", backdropFilter: "blur(24px)", border: "1px solid var(--border-dark)", color: "var(--text-inv)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="eyebrow">{transcript?.example ? "Pedido de exemplo" : "Seu pedido"}</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          <p style={{ margin: 0, color: "var(--text-inv-2)", lineHeight: 1.6, maxHeight: 200, overflow: "hidden" }}>“{transcript?.text}”</p>
          {agent.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.55 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
        </div>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="03"
          title="Agenda"
          items={[
            "Agenda integrada ao Google Agenda, nos dois sentidos",
            "Marcação por áudio no app e por mensagem no WhatsApp",
            "Lembretes para você e confirmação para o tutor",
            "Retornos do prontuário entram sozinhos na semana",
          ]}
          phase="Fase 1"
          metric="Compromissos marcados sem abrir o calendário"
          onNext={onNext}
        />
      </Overlay>
    </>
  );
}

function Wave({ level }: { level: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 28 }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <span key={i} style={{ width: 3, borderRadius: 3, background: "var(--k-red)", height: 4 + level * 24 * (0.4 + ((i * 7) % 10) / 10), transition: "height .08s" }} />
      ))}
    </div>
  );
}
