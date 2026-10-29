"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconMicrophone, IconPlayerStopFilled, IconSend, IconUsersGroup } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard, LiveCard, MicLevel } from "@/kit";
import ThoughtLine from "@/kit/rb/ThoughtLine/ThoughtLine";
import StatusMark from "@/kit/rb/StatusMark/StatusMark";
import { useAgent } from "@/agent/useAgent";
import { useRecorder } from "@/agent/useRecorder";
import { Scattered } from "./Scattered";
import { Inbox, type EstadoResposta } from "./Inbox";
import { Week, paraGrade, type Activity } from "./Week";
import { Internacao } from "./Internacao";
import { EXEMPLO_TRANSCRICAO, HOJE_CENA, type Resposta } from "./agent";
import { proximaQuinta, segundaDa, parseData } from "./datas";

const W = 5200;
const H = 1500;

// Mundo: [WhatsApp lotado] → [conversas separadas] → [semana na agenda] → [internação: a semana do Zarco]
const BOX = {
  antes: { x: 140, y: 170, w: 1180, h: 1190 },
  virada: { x: 1500, y: 170, w: 1260, h: 1190 },
  inbox: { x: 1500, y: 560, w: 1260, h: 800 },
  semana: { x: 2900, y: 560, w: 1180, h: 800 },
  internacao: { x: 4220, y: 170, w: 800, h: 880 },
};
const SHOTS: Shot[] = [
  frame(BOX.antes, { hold: 4.0, cue: "antes" }),
  frame(BOX.virada, { dur: 1.7, hold: 2.4, cue: "virada" }),
  frame(BOX.inbox, { dur: 1.3, hold: 1.4, cue: "inbox" }),
];
const LIVE_SHOT: Shot = frame(BOX.inbox, { region: "left", pad: 40, dur: 1.2 });
const WEEK_SHOT: Shot = frame(BOX.semana, { region: "left", pad: 40, dur: 1.5 });
const GRUPO_SHOT: Shot = frame(BOX.internacao, { region: "left", pad: 40, dur: 1.8 });

/**
 * scene → pause (áudio) → live (rascunho + compromisso; câmera vai à semana e volta) → aprovar (um toque)
 * → grupo (quinta: a atualização da internação; um toque abre no grupo, ela confirma lá) → scope.
 * "ida" é qualquer viagem de câmera: nenhum card aparece com a câmera andando.
 */
type Step = Phase | "ida" | "aprovar" | "grupo";

export default function ConversasChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [phase, setPhase] = useState<Step>("scene");
  const [cue, setCue] = useState("antes");
  const [transcript, setTranscript] = useState<{ text: string; example: boolean } | null>(null);
  const [envioRicardo, setEnvioRicardo] = useState<"nao" | "enviando" | "enviada">("nao");
  const [grupo, setGrupo] = useState<"pronta" | "abrindo" | "aberta">("pronta");
  const [viuSemana, setViuSemana] = useState(false);
  const [semTranscricao, setSemTranscricao] = useState(false);
  const agent = useAgent();
  const mic = useRecorder();

  const call = agent.tool("responder_conversa");
  const r = (phase !== "scene" && phase !== "pause" ? call?.args ?? {} : {}) as Partial<Resposta>;
  const ev = paraGrade(r.evento, r.lembrete);
  const segunda = segundaDa(parseData(ev.data) ?? proximaQuinta(HOJE_CENA));
  const estado: EstadoResposta | undefined =
    phase === "scene" || phase === "pause" ? undefined : envioRicardo === "enviada" ? "enviada" : call?.done ? "aprovar" : "escrevendo";

  const activity: Activity = [];
  if (call?.args && phase !== "pause") activity.push({ label: call.done ? "Reavaliação marcada, com lembrete" : "Marcando na agenda…", done: !!call.done });

  const passos: string[] = [];
  if (transcript) passos.push(transcript.example ? "Áudio de exemplo" : "Áudio transcrito");
  if (call) passos.push(r.resposta ? "Resposta escrita no seu tom" : "Escrevendo a resposta");
  if (r.evento?.hora) passos.push(`Reavaliação na quinta, às ${r.evento.hora.replace(/^0/, "").replace(":00", "h")}`);
  const pensando = agent.run.status !== "done";

  // terminou: mostra a quinta na agenda e volta para ela aprovar a resposta
  useEffect(() => {
    if (phase === "live" && agent.run.status === "done" && !viuSemana) {
      const t = setTimeout(async () => {
        setViuSemana(true);
        await stage.current?.goTo(WEEK_SHOT);
        await new Promise((res) => setTimeout(res, 2600));
        await stage.current?.goTo(LIVE_SHOT);
        setPhase("aprovar");
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [phase, agent.run.status, viuSemana]);

  useEffect(() => {
    if (envioRicardo === "enviando") {
      const t = setTimeout(() => setEnvioRicardo("enviada"), 1000);
      return () => clearTimeout(t);
    }
    if (envioRicardo === "enviada" && phase === "aprovar") {
      const t = setTimeout(() => irParaGrupo(), 2200);
      return () => clearTimeout(t);
    }
  }, [envioRicardo, phase]);

  useEffect(() => {
    if (grupo === "abrindo") {
      const t = setTimeout(() => setGrupo("aberta"), 1100);
      return () => clearTimeout(t);
    }
    if (grupo === "aberta" && phase === "grupo") {
      const t = setTimeout(() => setPhase("scope"), 2800);
      return () => clearTimeout(t);
    }
  }, [grupo, phase]);

  const irParaGrupo = async () => {
    setPhase("ida");
    await stage.current?.goTo(GRUPO_SHOT);
    setPhase("grupo");
  };

  // o card "Sua vez" só aparece quando a câmera para
  const toPause = async () => {
    await stage.current?.goTo(LIVE_SHOT);
    setPhase("pause");
  };

  const submit = (text: string | undefined) => {
    const t = text ?? EXEMPLO_TRANSCRICAO;
    setTranscript({ text: t, example: !text });
    setPhase("live");
    agent.start({ chapter: "conversas", text: t, demo: !text });
  };

  const onRecord = async () => {
    if (mic.state === "recording") {
      const t = await mic.stop();
      if (!t) setSemTranscricao(true);
      submit(t);
    }
    else if (!(await mic.start())) {
      // sem microfone: avisa e segue com o áudio de exemplo
      setTimeout(() => submit(undefined), 1400);
    }
  };

  const gravando = mic.state === "recording";
  const naInternacao = phase === "ida" ? envioRicardo === "enviada" : phase === "grupo" || phase === "scope";

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        {/* 1 · Antes: tudo no mesmo WhatsApp */}
        <Caption
          x={140}
          y={170}
          eyebrow="03 · Conversas"
          title={"Todo mundo chama\nno mesmo WhatsApp."}
          sub="Na terça, o Ricardo pergunta do retorno do Trovão, um aluno quer saber o preço e o grupo da internação espera notícia. Responder e marcar sem encavalar fica com você."
        />
        <Backdrop photo="icm-musgo" x={140} y={640} w={1180} h={720}>
          <Scattered />
        </Backdrop>

        {/* 2 · Virada: cada conversa no seu lugar */}
        <Caption
          x={1500}
          y={170}
          w={1100}
          title={"Cada conversa\nno seu lugar."}
          sub="Clientes, alunos e internação separados. A Donna responde o que você liberou e prepara o resto para você aprovar."
          show={cue !== "antes"}
        />
        <Backdrop photo="icm-pessego" x={1500} y={560} w={1260} h={800} inset="5% 4% -2% 4%">
          <Inbox resposta={r} estado={estado} audio={transcript && !transcript.example ? transcript.text : undefined} />
        </Backdrop>

        {/* 3 · A semana: a reavaliação entra na quinta */}
        <Backdrop photo="icm-areia" x={2900} y={560} w={1180} h={800} inset="5% 4% -2% 4%">
          <Week segunda={segunda} hoje={HOJE_CENA} ev={ev} done={!!call?.done} activity={activity} />
        </Backdrop>

        {/* 4 · Quinta: a atualização da internação para o grupo */}
        <Caption
          x={4220}
          y={170}
          w={800}
          title={"Na quinta, a semana\ndo Zarco vem pronta."}
          sub="Fotos e notas da internação num texto só, para você conferir e mandar ao grupo. A conta vai na sexta."
          show={naInternacao}
        />
        <motion.div animate={{ opacity: naInternacao ? 1 : 0.35 }} transition={{ duration: 0.8 }}>
          <Backdrop photo="icm-dourado" x={4220} y={470} w={800} h={580} inset="6% 6% 6% 6%">
            <Internacao estado={grupo === "aberta" ? "aberta" : "pronta"} />
          </Backdrop>
        </motion.div>
      </Stage>

      <Overlay show={phase === "pause"}>
        <PauseCard step="responda por áudio" title="Responda o Ricardo sem digitar." onSkip={() => submit(undefined)}>
          <p style={{ margin: "0 0 12px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            Fale como falaria com a sua secretária: o que responder e o que marcar. O áudio é usado só nesta demonstração e apagado.
          </p>
          <p style={{ margin: "0 0 16px", padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.05)", border: "1px solid var(--border-dark)", color: "var(--text-inv)", lineHeight: 1.5 }}>
            “{EXEMPLO_TRANSCRICAO}.”
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button icon={gravando ? IconPlayerStopFilled : IconMicrophone} onClick={onRecord} disabled={mic.state === "asking" || mic.state === "transcribing"}>
              {gravando ? `Parar · ${mic.seconds}s` : mic.state === "asking" ? "Liberando o microfone…" : mic.state === "transcribing" ? "Transcrevendo…" : "Gravar resposta"}
            </Button>
            {gravando && <MicLevel level={mic.level} />}
          </div>
          {mic.state === "denied" && (
            <p role="status" style={{ color: "#f3a38c", margin: "12px 0 0" }}>
              Sem microfone. Seguimos com o áudio de exemplo.
            </p>
          )}
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "live" || phase === "aprovar"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="eyebrow">{transcript?.example ? "Áudio de exemplo" : "Seu áudio"}</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          {semTranscricao && (
            <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--text-inv-2)" }}>Transcrição desligada nesta sessão. Seguimos com o áudio de exemplo.</p>
          )}
          <p style={{ margin: 0, color: "var(--text-inv-2)", lineHeight: 1.6, maxHeight: 130, overflow: "hidden" }}>“{transcript?.text}”</p>
          <div style={{ marginTop: 14 }}>
            <ThoughtLine
              label="A Donna está escrevendo…"
              doneLabel="Resposta pronta e quinta marcada"
              steps={passos}
              working={pensando}
              showTimer={false}
              collapsible={false}
              collapseOnSettle={false}
              fontSize={14}
              color="var(--text-inv)"
              glyphColor="var(--k-red)"
            />
          </div>
          {agent.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.55 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {envioRicardo === "enviada" ? "Enviado. Te lembro na véspera." : agent.run.text}
            </p>
          )}
          {phase === "aprovar" && (
            <div style={{ marginTop: 16 }}>
              {envioRicardo === "nao" ? (
                <>
                  <Button icon={IconSend} onClick={() => setEnvioRicardo("enviando")}>
                    Enviar ao Ricardo
                  </Button>
                  <button
                    onClick={irParaGrupo}
                    style={{ display: "block", marginTop: 14, background: "none", border: 0, padding: 0, color: "var(--text-inv-2)", textDecoration: "underline", textUnderlineOffset: 3 }}
                  >
                    Pular e seguir
                  </button>
                </>
              ) : (
                <StatusMark
                  status={envioRicardo === "enviada" ? "done" : "running"}
                  label={envioRicardo === "enviada" ? "Resposta enviada e reavaliação na agenda" : "Enviando ao Ricardo…"}
                  color="var(--text-inv)"
                  doneColor="#2fd27a"
                  strike={false}
                  fontSize={14}
                />
              )}
            </div>
          )}
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "grupo"}>
        <LiveCard>
          <div className="display" style={{ fontSize: 22, marginBottom: 10 }}>
            {grupo === "aberta" ? "Pronta no grupo, esperando o seu toque." : "A semana do Zarco, pronta para o grupo."}
          </div>
          <p style={{ margin: "0 0 14px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            A Donna juntou as fotos e as notas da equipe. No grupo, quem confirma o envio é você: ela abre a conversa já com o texto e as fotos.
          </p>
          {grupo === "pronta" ? (
            <>
              <Button icon={IconUsersGroup} onClick={() => setGrupo("abrindo")}>
                Enviar ao grupo
              </Button>
              <button
                onClick={() => setPhase("scope")}
                style={{ display: "block", marginTop: 14, background: "none", border: 0, padding: 0, color: "var(--text-inv-2)", textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                Pular e seguir
              </button>
            </>
          ) : (
            <StatusMark
              status={grupo === "aberta" ? "done" : "running"}
              label={grupo === "aberta" ? "Aberta no grupo, com texto e 6 fotos" : "Abrindo o grupo da internação…"}
              color="var(--text-inv)"
              doneColor="#2fd27a"
              strike={false}
              fontSize={14}
            />
          )}
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="03"
          title="Conversas com clientes e alunos"
          items={[
            "O WhatsApp da clínica com as conversas separadas por cliente, aluno e internação",
            "Cada conversa ligada ao animal ou ao curso",
            "A Donna sugere a resposta; o que você liberar (preço, endereço, horários) ela responde sozinha",
            "Compromisso marcado direto da conversa, com lembrete para você e confirmação para o cliente",
            "Atualização semanal da internação no grupo: conferência na quinta, conta na sexta",
            "Agenda ligada ao Google Agenda",
          ]}
          phase="Fase 1"
          metric="Mensagens sem resposta no fim do dia e tempo até a primeira resposta"
          onNext={onNext}
          nextLabel="Próximo: o que os números dizem"
        />
      </Overlay>
    </>
  );
}
