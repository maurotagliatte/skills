"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconMinus, IconPlus, IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard } from "@/kit";
import { useAgent } from "@/agent/useAgent";
import { Sales } from "./Sales";
import { Simulator } from "./Simulator";
import { Editor, EDIT_STEPS } from "./Editor";
import { Members } from "./Members";
import { useSteps } from "./anim";
import { CENARIO_PADRAO, calcular, brl, milhar, type Cenario } from "./calc";
import { SUGESTOES_TEMA, TEMA_EXEMPLO, type Aula } from "./agent";

const W = 7600;
const H = 1400;

const BOX = {
  abertura: { x: 140, y: 200, w: 1700, h: 900 },
  vendas: { x: 740, y: 330, w: 1100, h: 640 },
  simCena: { x: 2000, y: 200, w: 1760, h: 900 },
  sim: { x: 2580, y: 200, w: 1180, h: 900 },
  editor: { x: 4430, y: 200, w: 1180, h: 900 },
  membros: { x: 6280, y: 200, w: 1180, h: 900 },
};

const SHOTS: Shot[] = [
  frame(BOX.abertura, { hold: 3.2, cue: "painel" }),
  frame(BOX.vendas, { dur: 1.5, hold: 3.2, cue: "taxa" }),
  frame(BOX.simCena, { dur: 1.9, hold: 2.4, cue: "sim" }),
];
const left = (b: (typeof BOX)[keyof typeof BOX]) => frame(b, { region: "left", pad: 40, dur: 1.3 });

type Fase = "scene" | "sim" | "tema" | "live" | "pub" | "scope";

// "Pular e ver um exemplo" no simulador: os controles se movem sozinhos
const DEMO_SIM: Partial<Cenario>[] = [{ faturamento: 900_000 }, { faturamento: 1_200_000 }, { ticket: 1497 }, { parcelado: 80 }, { faturamento: 400_000 }, { faturamento: 600_000, ticket: 997, parcelado: 60 }];

export default function CursosChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [fase, setFase] = useState<Fase>("scene");
  const [cue, setCue] = useState("painel");
  const [c, setC] = useState<Cenario>(CENARIO_PADRAO);
  const [demoSim, setDemoSim] = useState(false);
  const [tema, setTema] = useState("");
  const [enviado, setEnviado] = useState<{ text: string; example: boolean } | null>(null);
  const r = useMemo(() => calcular(c), [c]);
  const agent = useAgent();
  const call = agent.tool("gerar_aula");
  const aula = (call?.args ?? {}) as Partial<Aula>;
  const step = useSteps(fase === "live" || fase === "pub", EDIT_STEPS, 950);
  const agentDone = agent.run.status === "done" || agent.run.status === "error";

  // simulador automático
  useEffect(() => {
    if (!demoSim) return;
    let i = 0;
    const id = setInterval(() => {
      if (i < DEMO_SIM.length) setC((p) => ({ ...p, ...DEMO_SIM[i++] }));
      else {
        clearInterval(id);
        setDemoSim(false);
        toTema();
      }
    }, 900);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoSim]);

  // edição pronta + agente pronto → publica
  useEffect(() => {
    if (fase !== "live" || step < EDIT_STEPS || !agentDone) return;
    const t = setTimeout(async () => {
      setFase("pub");
      await stage.current?.goTo(left(BOX.membros));
    }, 900);
    return () => clearTimeout(t);
  }, [fase, step, agentDone]);

  useEffect(() => {
    if (fase !== "pub") return;
    const t = setTimeout(() => setFase("scope"), 4200);
    return () => clearTimeout(t);
  }, [fase]);

  const toSim = async () => {
    setFase("sim");
    await stage.current?.goTo(left(BOX.sim));
  };
  const toTema = async () => {
    setFase("tema");
    await stage.current?.goTo(left(BOX.editor));
  };
  const submit = (text?: string) => {
    const t = text?.trim();
    setEnviado({ text: t || TEMA_EXEMPLO, example: !t });
    setFase("live");
    agent.start({ chapter: "cursos", text: t || TEMA_EXEMPLO, demo: !t });
  };

  const set = (k: keyof Cenario) => (v: number) => setC((p) => ({ ...p, [k]: v }));

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toSim}>
        <Caption
          x={140}
          y={330}
          w={540}
          eyebrow="04 · Cursos"
          title={"Cada venda de curso\ndeixa uma parte\nno caminho."}
          sub="Na plataforma atual, 9,9% + R$ 2,49 de cada venda ficam com ela. Em um ano de turmas, isso vira um valor que dá para medir."
          show={cue === "painel"}
        />
        <Backdrop photo="icm-pessego" x={BOX.vendas.x} y={BOX.vendas.y} w={BOX.vendas.w} h={BOX.vendas.h} inset="5% 4% -2% 4%">
          <Sales show focus={cue !== "painel"} />
        </Backdrop>

        <Caption
          x={2000}
          y={330}
          w={520}
          title={"Com a plataforma\nsendo sua."}
          sub="Mesmo checkout, mesma área de membros — com um gateway de pagamento direto e o custo da plataforma já na conta."
          show={cue === "sim" || fase !== "scene"}
        />
        <Backdrop photo="icm-dourado" x={BOX.sim.x} y={BOX.sim.y} w={BOX.sim.w} h={BOX.sim.h} inset="5% 4% -2% 4%">
          <Simulator c={c} r={r} />
        </Backdrop>

        <Backdrop photo="icm-musgo" x={BOX.editor.x} y={BOX.editor.y} w={BOX.editor.w} h={BOX.editor.h} inset="5% 4% -2% 4%">
          <Editor aula={fase === "live" || fase === "pub" || fase === "scope" ? aula : {}} step={step} agentDone={agentDone} published={fase === "pub" || fase === "scope"} />
        </Backdrop>

        <Backdrop photo="icm-areia" x={BOX.membros.x} y={BOX.membros.y} w={BOX.membros.w} h={BOX.membros.h} inset="5% 4% -2% 4%">
          <Members aula={aula} show={fase === "pub" || fase === "scope"} />
        </Backdrop>
      </Stage>

      <Overlay show={fase === "sim"}>
        <PauseCard step="simule" title="Ajuste ao tamanho dos seus cursos." onSkip={() => setDemoSim(true)}>
          <Slider label="Faturamento anual com cursos" min={100_000} max={3_000_000} step={50_000} value={c.faturamento} onChange={set("faturamento")} fmt={milhar} disabled={demoSim} />
          <Slider label="Ticket médio" min={197} max={2997} step={50} value={c.ticket} onChange={set("ticket")} fmt={brl} disabled={demoSim} />
          <Slider label="Vendas parceladas (2–6x)" min={0} max={100} step={5} value={c.parcelado} onChange={set("parcelado")} fmt={(v) => `${v}%`} disabled={demoSim} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 18px" }}>
            <span style={{ color: "var(--text-inv-2)" }}>
              Plataforma própria <span style={{ color: "#f0c36b" }}>· estimativa</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Step onClick={() => set("plataformaMensal")(Math.max(500, c.plataformaMensal - 250))} disabled={demoSim}>
                <IconMinus size={12} />
              </Step>
              <span style={{ minWidth: 92, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{brl(c.plataformaMensal)}/mês</span>
              <Step onClick={() => set("plataformaMensal")(Math.min(5000, c.plataformaMensal + 250))} disabled={demoSim}>
                <IconPlus size={12} />
              </Step>
            </span>
          </div>
          <Button icon={IconArrowRight} onClick={toTema} disabled={demoSim}>
            Ver a produção das aulas
          </Button>
        </PauseCard>
      </Overlay>

      <Overlay show={fase === "tema"}>
        <PauseCard step="nova aula" title="Sobre o que é a próxima aula que você vai gravar?" onSkip={() => submit(undefined)}>
          <p style={{ margin: "0 0 12px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            A gravação bruta já está no sistema. A Donna corta pausas e repetições, legenda e escreve título, descrição e capítulos a partir do tema.
          </p>
          <input
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tema.trim() && submit(tema)}
            placeholder="Ex.: exame do cavalo de salto no piso duro"
            style={inputStyle}
          />
          <div style={{ display: "grid", gap: 6, margin: "10px 0 16px" }}>
            {SUGESTOES_TEMA.map((s) => (
              <button key={s} onClick={() => setTema(s)} style={chipBtn}>
                {s}
              </button>
            ))}
          </div>
          <Button icon={IconSparkles} onClick={() => submit(tema)} disabled={!tema.trim()}>
            Produzir a aula
          </Button>
        </PauseCard>
      </Overlay>

      <Overlay show={fase === "live" || fase === "pub"}>
        <div style={darkCard}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">Tema da aula</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          <p style={{ margin: 0, color: "var(--text-inv)", lineHeight: 1.5, fontSize: 15 }}>“{enviado?.text}”</p>
          {enviado?.example === false && agent.run.mode === "demo" && (
            <p style={{ margin: "10px 0 0", color: "var(--text-inv-2)", fontSize: 12 }}>Sem agente conectado agora: mostramos a aula de exemplo.</p>
          )}
          {agent.run.text && step >= EDIT_STEPS && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.5 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
          {fase === "pub" && (
            <p style={{ margin: "12px 0 0", color: "#7ee2a8" }}>Publicada na área de membros, no seu domínio. Os alunos do módulo recebem o aviso.</p>
          )}
        </div>
      </Overlay>

      <Overlay show={fase === "scope"}>
        <ScopeCard
          number="04"
          title="Plataforma de cursos própria"
          items={[
            "Área de membros com a sua marca, no seu domínio",
            "Checkout e gateway próprios: cartão, parcelado e Pix",
            "Agente de produção: cortes, legendas, capítulos e descrição",
            "Migração dos alunos e cursos atuais, sem perder acesso",
          ]}
          phase="Fase 2"
          metric="Taxa média por venda"
          onNext={onNext}
        />
      </Overlay>
    </>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  fmt,
  disabled,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  fmt: (v: number) => string;
  disabled?: boolean;
}) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "var(--text-inv-2)" }}>{label}</span>
        <b style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(value)}</b>
      </span>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--k-red)", margin: 0, cursor: disabled ? "default" : "pointer" }}
      />
      <span style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-inv-2)", opacity: 0.7 }}>
        <span>{fmt(min)}</span>
        <span>{fmt(max)}</span>
      </span>
    </label>
  );
}

function Step({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ width: 24, height: 24, display: "grid", placeItems: "center", borderRadius: 6, border: "1px solid var(--border-dark)", background: "transparent", color: "var(--text-inv)" }}
    >
      {children}
    </button>
  );
}

const darkCard: React.CSSProperties = {
  width: 380,
  padding: 20,
  borderRadius: 16,
  background: "rgba(17,18,18,.86)",
  backdropFilter: "blur(24px)",
  border: "1px solid var(--border-dark)",
  color: "var(--text-inv)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid var(--border-dark)",
  background: "rgba(255,255,255,.04)",
  color: "var(--text-inv)",
  outline: "none",
};

const chipBtn: React.CSSProperties = {
  textAlign: "left",
  padding: "7px 10px",
  borderRadius: 8,
  border: "1px solid var(--border-dark)",
  background: "transparent",
  color: "var(--text-inv-2)",
  lineHeight: 1.35,
};
