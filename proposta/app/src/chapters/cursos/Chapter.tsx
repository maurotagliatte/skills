"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { IconMinus, IconPlus, IconArrowRight } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption } from "@/engine/ChapterFrame";
import type { ChapterProps } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard, LiveCard, Slider } from "@/kit";
import { Sales } from "./Sales";
import { Simulator } from "./Simulator";
import { Members } from "./Members";
import { CENARIO_PADRAO, calcular, brl, milhar, type Cenario } from "./calc";

const W = 5800;
const H = 1400;

const BOX = {
  abertura: { x: 140, y: 200, w: 1700, h: 900 },
  vendas: { x: 740, y: 330, w: 1100, h: 640 },
  simCena: { x: 2000, y: 200, w: 1760, h: 900 },
  sim: { x: 2580, y: 200, w: 1180, h: 900 },
  membros: { x: 4300, y: 200, w: 1180, h: 900 },
};

const SHOTS: Shot[] = [
  frame(BOX.abertura, { hold: 3.4, cue: "painel" }),
  frame(BOX.vendas, { dur: 1.5, hold: 3.4, cue: "taxa" }),
  frame(BOX.simCena, { dur: 1.9, hold: 2.6, cue: "sim" }),
];
const left = (b: (typeof BOX)[keyof typeof BOX]) => frame(b, { region: "left", pad: 40, dur: 1.3 });

// "indo": câmera a caminho da área de membros, entre o simulador e o card seguinte
type Fase = "scene" | "sim" | "indo" | "membros" | "scope";

// "Pular e ver um exemplo": os controles se movem sozinhos, inclusive um cenário em que não compensa
const DEMO_SIM: Partial<Cenario>[] = [
  { faturamento: 900_000 },
  { faturamento: 1_200_000 },
  { ticket: 1497 },
  { parcelado: 80 },
  { faturamento: 150_000, ticket: 497 },
  { faturamento: 150_000, ticket: 497 },
  { faturamento: 600_000, ticket: 997, parcelado: 60 },
];

export default function CursosChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [fase, setFase] = useState<Fase>("scene");
  const [cue, setCue] = useState("painel");
  const [c, setC] = useState<Cenario>(CENARIO_PADRAO);
  const [demoSim, setDemoSim] = useState(false);
  const [exemplo, setExemplo] = useState(false);
  const r = useMemo(() => calcular(c), [c]);

  // simulador automático
  useEffect(() => {
    if (!demoSim) return;
    let i = 0;
    const id = setInterval(() => {
      if (i < DEMO_SIM.length) setC((p) => ({ ...p, ...DEMO_SIM[i++] }));
      else {
        clearInterval(id);
        setDemoSim(false);
        toMembros();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoSim]);

  // no exemplo, a área de membros segue sozinha para o cartão
  useEffect(() => {
    if (fase !== "membros" || !exemplo) return;
    const t = setTimeout(() => setFase("scope"), 4800);
    return () => clearTimeout(t);
  }, [fase, exemplo]);

  // cada card só aparece quando a câmera para; o anterior sai já na partida
  const toSim = async () => {
    await stage.current?.goTo(left(BOX.sim));
    setFase("sim");
  };
  const toMembros = async () => {
    setFase("indo");
    await stage.current?.goTo(left(BOX.membros));
    setFase("membros");
  };

  const set = (k: keyof Cenario) => (v: number) => setC((p) => ({ ...p, [k]: v }));

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toSim}>
        <Caption
          x={140}
          y={360}
          w={540}
          eyebrow="05 · Cursos"
          title={"Cada venda paga\n9,9% + R$ 2,49."}
          sub="É a taxa da Hotmart por venda [confirmar o plano dela]. Somada num ano de turmas, vira um valor que o simulador mostra."
          show={cue === "painel"}
        />
        <Backdrop photo="icm-pessego" x={BOX.vendas.x} y={BOX.vendas.y} w={BOX.vendas.w} h={BOX.vendas.h} inset="5% 4% -2% 4%">
          <Sales show focus={cue !== "painel"} />
        </Backdrop>

        <Caption
          x={2000}
          y={360}
          w={520}
          title={"A mesma venda,\nna sua plataforma."}
          sub="Página de venda, área de membros e alunos no seu endereço. O custo de manter a plataforma já entra na conta."
          show={cue === "sim" || fase !== "scene"}
        />
        <Backdrop photo="icm-dourado" x={BOX.sim.x} y={BOX.sim.y} w={BOX.sim.w} h={BOX.sim.h} inset="5% 4% -2% 4%">
          <Simulator c={c} r={r} />
        </Backdrop>

        <Backdrop photo="icm-areia" x={BOX.membros.x} y={BOX.membros.y} w={BOX.membros.w} h={BOX.membros.h} inset="5% 4% -2% 4%">
          <Members show={fase === "membros" || fase === "scope"} />
        </Backdrop>
      </Stage>

      <Overlay show={fase === "sim"}>
        <PauseCard
          step="simule"
          title="Ajuste ao tamanho dos seus cursos."
          onSkip={
            demoSim
              ? undefined
              : () => {
                  setExemplo(true);
                  setDemoSim(true);
                }
          }
        >
          <p style={{ margin: "0 0 16px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>Os valores iniciais são exemplo. Com os seus números, a conta fica exata.</p>
          <Slider label="Faturamento anual com cursos" min={100_000} max={3_000_000} step={50_000} value={c.faturamento} onChange={set("faturamento")} fmt={milhar} disabled={demoSim} />
          <Slider label="Ticket médio" min={197} max={2997} step={50} value={c.ticket} onChange={set("ticket")} fmt={brl} disabled={demoSim} />
          <Slider label="Vendas parceladas (2–6x)" min={0} max={100} step={5} value={c.parcelado} onChange={set("parcelado")} fmt={(v) => `${v}%`} disabled={demoSim} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "4px 0 18px" }}>
            <span style={{ color: "var(--text-inv-2)" }}>
              Custo da sua plataforma <span style={{ color: "#f0c36b" }}>· estimativa</span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Step label="Diminuir o custo da plataforma" onClick={() => set("plataformaMensal")(Math.max(500, c.plataformaMensal - 250))} disabled={demoSim}>
                <IconMinus size={12} />
              </Step>
              <span style={{ minWidth: 92, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{brl(c.plataformaMensal)}/mês</span>
              <Step label="Aumentar o custo da plataforma" onClick={() => set("plataformaMensal")(Math.min(5000, c.plataformaMensal + 250))} disabled={demoSim}>
                <IconPlus size={12} />
              </Step>
            </span>
          </div>
          <div>
            <Button icon={IconArrowRight} onClick={toMembros} disabled={demoSim}>
              Ver a área de membros
            </Button>
          </div>
        </PauseCard>
      </Overlay>

      <Overlay show={fase === "membros"}>
        <LiveCard style={{ width: 360 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Área de membros
          </div>
          <p className="display" style={{ margin: "0 0 10px", fontSize: 20, lineHeight: 1.3 }}>
            A aula do Trovão, no seu endereço e com o seu logo.
          </p>
          <p style={{ margin: "0 0 16px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>Os alunos atuais mudam junto, sem perder acesso.</p>
          {!exemplo && (
            <Button icon={IconArrowRight} onClick={() => setFase("scope")}>
              Ver o que entra no projeto
            </Button>
          )}
        </LiveCard>
      </Overlay>

      <Overlay show={fase === "scope"}>
        <ScopeCard
          number="05"
          title="Seus cursos na sua plataforma"
          items={[
            "Área de membros e página de venda no seu endereço",
            "Pagamento por cartão, parcelado e Pix, com taxa de gateway",
            "Alunos e cursos atuais trazidos da Hotmart, sem perder acesso",
            "Certificado e comunidade da turma",
          ]}
          phase="Fase 2"
          metric="Quanto fica com você de cada venda (hoje ≈ 90,1% − R$ 2,49)"
          onNext={onNext}
          nextLabel="Próximo: a aula, o post e a arte"
        />
      </Overlay>
    </>
  );
}

function Step({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{ width: 24, height: 24, display: "grid", placeItems: "center", borderRadius: 6, border: "1px solid var(--border-dark)", background: "transparent", color: "var(--text-inv)" }}
    >
      {children}
    </button>
  );
}
