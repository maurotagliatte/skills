"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconCalendarEvent, IconClockShare, IconCircleCheckFilled, IconSend } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { AdvanceCard, Backdrop, Button, ScopeCard, LiveCard, useReveal } from "@/kit";
import ThoughtLine from "@/kit/rb/ThoughtLine/ThoughtLine";
import { useAgent } from "@/agent/useAgent";
import { Week } from "./Week";
import { Scattered } from "./Scattered";
import { VoiceNote } from "./VoiceNote";
import { EXEMPLO_TRANSCRICAO, CONFIRMACOES, RESPOSTAS, type Evento, type Conflito, type Confirmacao } from "./agent";
import { horaCurta } from "./datas";

const W = 4100;
const H = 1500;

// Mundo: [o áudio no carro] → [os pedidos que ele resume] → [a semana na agenda]
const BOX = {
  audio: { x: 140, y: 170, w: 1180, h: 1190 },
  pedidos: { x: 1440, y: 170, w: 1180, h: 1190 },
  sistema: { x: 2760, y: 300, w: 1180, h: 900 },
};
const SHOTS: Shot[] = [
  frame(BOX.audio, { hold: 4.8, cue: "audio" }),
  frame(BOX.pedidos, { dur: 1.8, hold: 3.0, cue: "pedidos" }),
  frame(BOX.sistema, { dur: 1.9, hold: 0.8, cue: "sistema" }),
];
const LIVE_SHOT: Shot = frame(BOX.sistema, { region: "left", pad: 40, dur: 1.2 });
const FULL_SHOT: Shot = frame(BOX.sistema, { pad: 60, dur: 1.4 });

const lista = (n: number) => ["", "Um", "Dois", "Três", "Quatro", "Cinco"][n] ?? String(n);

/**
 * scene → pause ("Organizar a semana") → live (a Donna marca os compromissos do áudio e acha o que encavala)
 * → conflito ("Mover para as 16h") → confirmando (a Donna confirma com os clientes; as respostas chegam;
 * "Ver a semana pronta") → pronta (a semana inteira, com lembretes) → scope.
 * "ida" é qualquer viagem de câmera: nenhum card aparece com a câmera andando.
 */
type Step = Phase | "conflito" | "confirmando" | "ida" | "pronta";

export default function AgendaChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [phase, setPhase] = useState<Step>("scene");
  const [cue, setCue] = useState("audio");
  const [movido, setMovido] = useState(false);
  const semana = useAgent();
  const confirma = useAgent();
  const startConfirma = confirma.start;

  const comecou = phase !== "scene" && phase !== "pause";
  const novos = comecou ? semana.run.tools.filter((t) => t.name === "criar_evento").map((t) => (t.args ?? {}) as Partial<Evento>) : [];
  const confl = semana.tool("apontar_conflito");
  const conflito = confl?.done ? ((confl.args ?? {}) as Partial<Conflito>) : undefined;
  const envios = confirma.run.tools.filter((t) => t.name === "enviar_confirmacao");
  const enviadas = envios.filter((t) => t.done).length;
  const respostas = useReveal(confirma.run.status === "done" ? CONFIRMACOES.length : 0, 1100, { active: movido });
  const todasConfirmadas = respostas >= CONFIRMACOES.length;

  // passos da Donna (ThoughtLine) enquanto marca
  const passos: string[] = [];
  if (comecou) passos.push("Ouvindo o áudio de segunda");
  for (const e of novos) if (e.lembrete) passos.push(`${e.dia_semana?.split("-")[0] ?? ""}, ${horaCurta(e.inicio)} · ${e.titulo}`);
  if (conflito) passos.push(`Quinta às ${horaCurta(novos.find((e) => e.titulo === conflito.compromisso)?.inicio)} bate com a aula ao vivo`);
  const marcando = semana.run.status !== "done";

  const atividade =
    phase === "live" || phase === "conflito"
      ? { label: marcando ? "Marcando a semana…" : `${lista(novos.length)} compromissos marcados, um encavala`, done: !marcando }
      : phase === "confirmando" || phase === "pronta" || phase === "scope" || phase === "ida"
        ? { label: todasConfirmadas ? "Todos confirmaram" : enviadas ? "Confirmações enviadas pelo WhatsApp" : "Enviando as confirmações…", done: todasConfirmadas }
        : undefined;

  // terminou de marcar: o card do horário que encavala aparece com a câmera parada
  useEffect(() => {
    if (phase === "live" && semana.run.status === "done") {
      const t = setTimeout(() => setPhase("conflito"), 1800);
      return () => clearTimeout(t);
    }
  }, [phase, semana.run.status]);

  // o ultrassom anda para as 16h; depois, a Donna confirma com os clientes
  useEffect(() => {
    if (phase === "confirmando" && confirma.run.status === "idle") {
      const t = setTimeout(() => startConfirma({ chapter: "agenda", options: { acao: "confirmacoes" }, demo: true }), 1100);
      return () => clearTimeout(t);
    }
  }, [phase, confirma.run.status, startConfirma]);

  // a semana inteira, com os lembretes; depois o cartão de escopo
  useEffect(() => {
    if (phase !== "pronta") return;
    let vivo = true;
    (async () => {
      await stage.current?.goTo(FULL_SHOT);
      await new Promise((r) => setTimeout(r, 3400));
      if (!vivo) return;
      await stage.current?.goTo(LIVE_SHOT);
      if (vivo) setPhase("scope");
    })();
    return () => {
      vivo = false;
    };
  }, [phase]);

  // o primeiro card só aparece quando a câmera para
  const toPause = async () => {
    await stage.current?.goTo(LIVE_SHOT);
    setPhase("pause");
  };

  const organizar = () => {
    setPhase("live");
    semana.start({ chapter: "agenda", text: EXEMPLO_TRANSCRICAO, options: { acao: "semana" }, demo: true });
  };

  const mover = () => {
    setMovido(true);
    setPhase("confirmando");
  };

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        {/* 1 · O áudio no carro */}
        <Caption
          x={140}
          y={170}
          eyebrow="03 · Agenda"
          title={"Um áudio e\na semana se organiza."}
          sub="Entre um haras e outro, você fala o que tem para marcar. A Donna põe cada compromisso no lugar, avisa o que encavala e confirma com os clientes."
        />
        <Backdrop photo="icm-musgo" x={140} y={640} w={1180} h={720}>
          <div style={{ position: "absolute", left: 30, top: 60, width: 768, transform: "scale(1.25)", transformOrigin: "0 0" }}>
            <VoiceNote playing={cue === "audio" || cue === "pedidos" || cue === "sistema"} seconds={4.4} />
          </div>
        </Backdrop>

        {/* 2 · Os pedidos que o áudio resume */}
        <Caption
          x={1440}
          y={170}
          w={1000}
          title={"O que chegou na semana\ncabe num áudio."}
          sub="Mensagem, ligação ou bilhete: você resume falando, a Donna marca."
          show={cue !== "audio"}
        />
        <Backdrop photo="icm-areia" x={1440} y={640} w={1180} h={720}>
          {cue !== "audio" && <Scattered />}
        </Backdrop>

        {/* 3 · A semana na agenda */}
        <Backdrop photo="icm-pessego" x={2760} y={300} w={1180} h={900} inset="5% 4% -2% 4%">
          <Week
            novos={novos}
            conflito={conflito}
            movido={movido}
            enviadas={enviadas}
            respostas={respostas}
            atividade={atividade}
            pronta={phase === "pronta" || phase === "scope"}
          />
        </Backdrop>
      </Stage>

      <Overlay show={phase === "pause"}>
        <AdvanceCard title="O áudio de segunda, no carro." label="Organizar a semana" icon={IconCalendarEvent} onAdvance={organizar}>
          <VoiceNote playing dark compact seconds={0.01} />
        </AdvanceCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <LiveCard>
          <div style={{ marginBottom: 12 }}>
            <span className="eyebrow">O áudio de exemplo</span>
          </div>
          <VoiceNote playing dark compact seconds={0.01} />
          <div style={{ marginTop: 14 }}>
            <ThoughtLine
              label="A Donna está marcando…"
              doneLabel="Semana marcada"
              steps={passos}
              working={marcando}
              showTimer={false}
              collapsible={false}
              collapseOnSettle={false}
              fontSize={14}
              color="var(--text-inv)"
              glyphColor="var(--k-red)"
            />
          </div>
          {semana.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.55 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {semana.run.text}
            </p>
          )}
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "conflito"}>
        <AdvanceCard title="Quinta às 14h já tem a aula ao vivo." label="Mover para as 16h" icon={IconClockShare} onAdvance={mover}>
          A Donna sugere o ultrassom da Pérola às 16h, no mesmo dia. A tarde está livre depois da aula.
        </AdvanceCard>
      </Overlay>

      <Overlay show={phase === "confirmando"}>
        <LiveCard>
          <div style={{ marginBottom: 10 }}>
            <span className="eyebrow">Confirmações</span>
          </div>
          <div className="display" style={{ fontSize: 22, marginBottom: 14 }}>
            {todasConfirmadas ? "Os três confirmaram." : "A Donna confirma com cada cliente."}
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {envios.map((t, i) => {
              const c = (t.args ?? {}) as Partial<Confirmacao>;
              const respondeu = i < respostas;
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.05)", border: "1px solid var(--border-dark)" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <b style={{ fontWeight: 600 }}>{c.para}</b>
                    <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: respondeu ? "#5fd28f" : "var(--text-inv-2)" }}>
                      {respondeu ? <IconCircleCheckFilled size={13} /> : <IconSend size={13} />}
                      {respondeu ? "confirmou" : t.done ? "enviada" : "escrevendo…"}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-inv-2)" }}>{c.compromisso}</div>
                  {respondeu && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 6, fontSize: 13, color: "var(--text-inv)", lineHeight: 1.45 }}>
                      “{RESPOSTAS[i]}”
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
          {confirma.run.text && !todasConfirmadas && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.55 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {confirma.run.text}
            </p>
          )}
          <div style={{ marginTop: 16, minHeight: 38, display: "flex", alignItems: "center" }}>
            {todasConfirmadas && (
              <Button icon={IconCalendarEvent} onClick={() => setPhase("pronta")} advance>
                Ver a semana pronta
              </Button>
            )}
          </div>
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="03"
          title="Agenda"
          items={[
            "Um áudio vira os compromissos da semana, com dia, horário e local",
            "A Donna avisa quando algo encavala e sugere outro horário",
            "Acha um horário livre quando você pede (gravar aula, por exemplo)",
            "Confirmação para o cliente pelo WhatsApp; a resposta volta para a agenda",
            "Lembrete para você na véspera",
            "Ligada ao Google Agenda, nos dois sentidos",
          ]}
          phase="Fase 1"
          metric="Compromissos marcados sem abrir o calendário"
          onNext={onNext}
          nextLabel="Próximo: as contas da semana"
        />
      </Overlay>
    </>
  );
}
