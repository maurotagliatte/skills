"use client";

import { useRef, useState } from "react";
import { IconArrowRight } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption } from "@/engine/ChapterFrame";
import type { ChapterProps } from "@/engine/types";
import { AdvanceCard, Backdrop, Button, ScopeCard, LiveCard } from "@/kit";
import { Sales } from "./Sales";
import { Simulator } from "./Simulator";
import { Members } from "./Members";
import { CENARIO_PADRAO, calcular, brl, milhar } from "./calc";

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

// cenário fixo: os valores padrão do simulador
const C = CENARIO_PADRAO;
const RESULTADO = calcular(C);

export default function CursosChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [fase, setFase] = useState<Fase>("scene");
  const [cue, setCue] = useState("painel");
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
          <Simulator c={C} r={RESULTADO} />
        </Backdrop>

        <Backdrop photo="icm-areia" x={BOX.membros.x} y={BOX.membros.y} w={BOX.membros.w} h={BOX.membros.h} inset="5% 4% -2% 4%">
          <Members show={fase === "membros" || fase === "scope"} />
        </Backdrop>
      </Stage>

      <Overlay show={fase === "sim"}>
        <AdvanceCard title="Um ano de turmas, nas duas plataformas." label="Ver a área de membros" onAdvance={toMembros}>
          <p style={{ margin: "0 0 14px" }}>Os valores são exemplo. Com os seus números, a conta fica exata.</p>
          <div style={{ display: "grid", gap: 8, paddingTop: 12, borderTop: "1px solid var(--border-dark)" }}>
            <Row label="Faturamento anual com cursos" value={milhar(C.faturamento)} />
            <Row label="Ticket médio" value={brl(C.ticket)} />
          </div>
        </AdvanceCard>
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
          <Button icon={IconArrowRight} onClick={() => setFase("scope")} advance>
            Ver o que entra no projeto
          </Button>
        </LiveCard>
      </Overlay>

      <Overlay show={fase === "scope"}>
        <ScopeCard
          number="05"
          title="Seus cursos na sua plataforma"
          items={[
            "Área de membros e página de venda no seu endereço",
            "Pagamento por cartão, parcelado e Pix, a ≈ 6,5% por venda e sem taxa fixa",
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span>{label}</span>
      <span style={{ color: "var(--text-inv)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
