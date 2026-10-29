"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconSparkles, IconArrowRight, IconRefresh } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard, LiveCard, TextField, Suggestions, useReveal } from "@/kit";
import ThoughtLine from "@/kit/rb/ThoughtLine/ThoughtLine";
import RubberSegment from "@/kit/rb/RubberSegment/RubberSegment";
import { useAgent } from "@/agent/useAgent";
import { Board } from "./Board";
import { Painel, type PainelStatus } from "./Painel";
import { Simulacao } from "./Simulacao";
import { PESSOAS, TOTAL, type Modo, type Periodo } from "./data";
import { PERGUNTAS, perguntaDe, type Resposta } from "./agent";
import css from "./numeros.module.css";

const W = 5900;
const H = 1400;
const BOX = {
  abertura: { x: 140, y: 200, w: 1700, h: 900 },
  painel: { x: 2080, y: 200, w: 1180, h: 900 },
  sim: { x: 3760, y: 200, w: 1180, h: 900 },
};
const SHOTS: Shot[] = [frame(BOX.abertura, { hold: 5.2, cue: "quadro" }), frame(BOX.painel, { dur: 1.9, hold: 2.6, cue: "painel" })];
const left = (b: (typeof BOX)[keyof typeof BOX]) => frame(b, { region: "left", pad: 40, dur: 1.3 });

const PASSOS = [`Separando as ${TOTAL} pessoas por origem`, "Cruzando com quem comprou", "Montando o gráfico"];
const AVISO_DEMO = "Agente ao vivo desligado nesta sessão. Esta é a resposta de exemplo.";

// "indo": câmera a caminho da simulação, entre um card e outro
type Fase = "scene" | "pergunta" | "live" | "indo" | "ensinar" | "scope";

export default function NumerosChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [fase, setFase] = useState<Fase>("scene");
  const [cue, setCue] = useState("quadro");
  const [texto, setTexto] = useState("");
  const [enviado, setEnviado] = useState<{ text: string; exemplo: boolean; proprio: boolean } | null>(null);
  const [modo, setModo] = useState<Modo>("conversa");
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const [tocou, setTocou] = useState(false);
  const agent = useAgent();
  const chegaram = useReveal(PESSOAS.length, 430);
  const call = agent.tool("responder_pergunta");
  const r = (call?.args ?? {}) as Partial<Resposta>;
  const running = agent.run.status === "running";
  const done = agent.run.status === "done" || agent.run.status === "error";
  const passos = useReveal(PASSOS.length, 800, { active: fase === "live", key: enviado?.text ?? "", lead: 0.3 });

  const status: PainelStatus = fase === "scene" || fase === "pergunta" ? (r.resposta ? "pronto" : "idle") : r.resposta ? "pronto" : "lendo";

  // exemplo pulado: depois da resposta, segue sozinho para o interruptor
  useEffect(() => {
    if (fase !== "live" || !done || !enviado?.exemplo) return;
    const t = setTimeout(() => toEnsinar(), 5200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, done, enviado]);

  const toPergunta = async () => {
    await stage.current?.goTo(left(BOX.painel));
    setFase("pergunta");
  };
  const perguntar = (t: string, exemplo: boolean) => {
    const text = t.trim() || PERGUNTAS[0].texto;
    const preset = PERGUNTAS.find((p) => p.texto === text);
    setEnviado({ text, exemplo, proprio: !preset });
    setFase("live");
    agent.start({ chapter: "numeros", text, options: { pergunta: perguntaDe({ text }) }, demo: exemplo });
  };
  const outraPergunta = () => {
    setTexto("");
    setFase("pergunta");
  };
  const toEnsinar = async () => {
    setFase("indo");
    await stage.current?.goTo(left(BOX.sim));
    setFase("ensinar");
  };
  const escolher = (m: Modo) => {
    setModo(m);
    setTocou(true);
  };
  const exemploEnsinar = () => {
    escolher("venda");
    setTimeout(() => setPeriodo("mes"), 2200);
    setTimeout(() => setFase("scope"), 5200);
  };

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPergunta}>
        {/* campo claro: este capítulo respira entre os escuros */}
        <div style={{ position: "absolute", left: 40, top: 178, width: W - 80, height: 944, borderRadius: 44, background: "#eff0f0" }} />

        <Caption
          x={140}
          y={330}
          w={540}
          light
          eyebrow="04 · Números"
          title={"Gente chega de todo\nlado. Quem compra?"}
          sub="O Ricardo chegou por indicação, como muitos clientes. Com aluno é parecido, mas hoje só dá para saber semanas depois, olhando venda por venda."
          show={cue === "quadro"}
        />
        <Backdrop photo="icm-oliva" x={740} y={200} w={1100} h={900} inset="5% 4% -2% 4%">
          <Board chegaram={chegaram} />
        </Backdrop>
        <Backdrop photo="icm-dourado" x={BOX.painel.x} y={BOX.painel.y} w={BOX.painel.w} h={BOX.painel.h} inset="5% 4% -2% 4%">
          <Painel show={cue === "painel" || fase !== "scene"} r={r} status={status} passos={PASSOS.slice(0, Math.max(1, passos))} />
        </Backdrop>
        <Backdrop photo="icm-musgo" x={BOX.sim.x} y={BOX.sim.y} w={BOX.sim.w} h={BOX.sim.h} inset="5% 4% -2% 4%">
          <Simulacao modo={modo} periodo={periodo} tocou={tocou} />
        </Backdrop>
      </Stage>

      <Overlay show={fase === "pergunta"}>
        <PauseCard step="pergunte" title="O que você quer saber dos seus números?" onSkip={() => perguntar(PERGUNTAS[0].texto, true)}>
          <p style={{ margin: "0 0 12px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            A Donna lê as {TOTAL} pessoas que chegaram nos últimos 30 dias (dados de exemplo) e responde em português.
          </p>
          <TextField value={texto} onChange={setTexto} onEnter={() => texto.trim() && perguntar(texto, false)} label="Sua pergunta" placeholder="Escreva ou escolha uma pergunta" />
          <Suggestions items={PERGUNTAS.map((p) => p.texto)} onPick={setTexto} style={{ margin: "10px 0 16px" }} />
          <div>
            <Button icon={IconSparkles} onClick={() => perguntar(texto, false)} disabled={!texto.trim()}>
              Perguntar à Donna
            </Button>
          </div>
        </PauseCard>
      </Overlay>

      <Overlay show={fase === "live"}>
        <LiveCard style={{ width: 400 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">Sua pergunta</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          <p style={{ margin: "0 0 14px", lineHeight: 1.5, fontSize: 15 }}>“{enviado?.text}”</p>
          {enviado?.proprio && agent.run.mode === "demo" && <p style={{ margin: "0 0 12px", color: "#f0c36b", fontSize: 12, lineHeight: 1.5 }}>{AVISO_DEMO}</p>}
          <div style={{ paddingTop: 12, borderTop: "1px solid var(--border-dark)" }}>
            <ThoughtLine
              label={PASSOS[Math.max(0, passos - 1)]}
              doneLabel="Resposta no painel"
              working={running || !r.resposta}
              steps={PASSOS.slice(0, Math.max(1, passos))}
              color="var(--text-inv)"
              glyphColor="var(--k-red)"
              fontSize={13}
              collapsible={false}
              collapseOnSettle={false}
              showTimer={false}
            />
          </div>
          {done && r.sugestao && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border-dark)" }}>
              <p style={{ margin: 0, lineHeight: 1.5 }}>
                <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text} A sugestão ficou embaixo do gráfico, para você aprovar.
              </p>
              {!enviado?.exemplo && (
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <Button variant="ghost" icon={IconRefresh} onClick={outraPergunta}>
                    Outra pergunta
                  </Button>
                  <Button icon={IconArrowRight} onClick={toEnsinar} style={{ flex: 1 }}>
                    Ensinar o anúncio
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </LiveCard>
      </Overlay>

      <Overlay show={fase === "ensinar"}>
        <PauseCard step="ligue" title="Ensinar o anúncio com quem comprou" onSkip={tocou ? undefined : exemploEnsinar}>
          <p style={{ margin: "0 0 16px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            Hoje o anúncio aprende com quem abre conversa. Ligado, ele recebe de volta quem fechou a matrícula e passa a procurar gente parecida.
          </p>
          <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
            <span style={{ color: "var(--text-inv-2)" }}>O anúncio aprende</span>
            <RubberSegment
              aria-label="Com o que o anúncio aprende"
              items={[
                { value: "conversa", label: "Com quem chama" },
                { value: "venda", label: "Com quem compra" },
              ]}
              value={modo}
              onChange={(v) => escolher(v as Modo)}
              trackColor="var(--dark-2)"
              thumbColor={modo === "venda" ? "var(--k-red)" : "#f6f6f6"}
              textColor="var(--text-inv-2)"
              activeTextColor={modo === "venda" ? "#fff" : "var(--text-1)"}
              size="lg"
              className={css.segFull}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span style={{ color: "var(--text-inv-2)" }}>Ver por</span>
              <RubberSegment
                aria-label="Período do gráfico"
                items={[
                  { value: "semana", label: "Semana" },
                  { value: "mes", label: "Mês" },
                ]}
                value={periodo}
                onChange={(v) => setPeriodo(v as Periodo)}
                trackColor="var(--dark-2)"
                thumbColor="#f6f6f6"
                textColor="var(--text-inv-2)"
                activeTextColor="var(--text-1)"
                size="sm"
              />
            </div>
          </div>
          <div>
            <Button icon={IconArrowRight} onClick={() => setFase("scope")} disabled={!tocou}>
              Ver o que entra no projeto
            </Button>
          </div>
        </PauseCard>
      </Overlay>

      <Overlay show={fase === "scope"}>
        <ScopeCard
          number="04"
          title="O que os números dizem"
          items={[
            "Toda conversa e toda venda guardam de onde a pessoa veio",
            "Um painel com quem chegou, quem comprou e quanto custou, por origem",
            "A Donna explica o que mudou na semana e sugere onde pôr a verba",
            "As vendas voltam para o Meta e o Google, e o anúncio passa a procurar quem compra",
            "Dados pessoais protegidos: saem criptografados, nunca abertos",
          ]}
          phase="Fase 2"
          metric="Quanto custa cada aluno que comprou, por anúncio [confirmar verba e vendas reais]"
          onNext={onNext}
          nextLabel="Próximo: vender o curso sem a taxa"
        />
      </Overlay>
    </>
  );
}
