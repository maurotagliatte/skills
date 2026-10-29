"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconSparkles, IconArrowRight } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard } from "@/kit";
import { useAgent } from "@/agent/useAgent";
import { Board } from "./Board";
import { Panel, type PanelState } from "./Panel";
import { useSteps } from "./anim";
import { LEADS, ORIGENS, TOTAL_LEADS } from "./data";
import type { Analise } from "./agent";

const W = 3500;
const H = 1400;
const BOX = {
  abertura: { x: 140, y: 200, w: 1700, h: 900 },
  quadro: { x: 740, y: 200, w: 1100, h: 900 },
  painel: { x: 2080, y: 200, w: 1180, h: 900 },
};
const SHOTS: Shot[] = [frame(BOX.abertura, { hold: 5.4, cue: "quadro" }), frame(BOX.painel, { dur: 1.9, hold: 3.4, cue: "painel" })];
const LIVE_SHOT = frame(BOX.painel, { region: "left", pad: 40, dur: 1.3 });

const nomeDe = (id?: string) => ORIGENS.find((o) => o.id === id)?.nome;

export default function LeadsChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [phase, setPhase] = useState<Phase>("scene");
  const [cue, setCue] = useState("quadro");
  const agent = useAgent();
  const chegaram = useSteps(true, LEADS.length, 420);
  const call = agent.tool("analisar_leads");
  const a = (call?.args ?? {}) as Partial<Analise>;
  const insights = (a.insights ?? []).filter((i) => i && i.titulo);
  const ultimo = insights[insights.length - 1];

  useEffect(() => {
    if (phase === "live" && agent.run.status === "done") {
      const t = setTimeout(() => setPhase("scope"), 3600);
      return () => clearTimeout(t);
    }
  }, [phase, agent.run.status]);

  const toPause = async () => {
    setPhase("pause");
    await stage.current?.goTo(LIVE_SHOT);
  };
  const pedir = (demo: boolean) => {
    setPhase("live");
    agent.start({ chapter: "leads", text: "Analise as origens de lead dos últimos 30 dias.", demo });
  };

  const running = agent.run.status === "running";
  const status: PanelState["status"] =
    phase !== "live" && phase !== "scope" ? "idle" : agent.run.status === "done" ? "pronto" : call ? "escrevendo" : running ? "lendo" : "idle";
  const destaque = a.origem_destaque ?? (status === "escrevendo" ? ultimo?.origem : undefined);

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        <Caption
          x={140}
          y={330}
          w={520}
          eyebrow="05 · Leads"
          title={"Lead chega de\ntodo lado."}
          sub="WhatsApp, indicação, dois anúncios. Todos parecem iguais na hora em que chegam — a diferença aparece semanas depois, na venda."
          show={cue === "quadro"}
        />
        <Backdrop photo="icm-noite" x={BOX.quadro.x} y={BOX.quadro.y} w={BOX.quadro.w} h={BOX.quadro.h} inset="5% 4% -2% 4%">
          <Board chegaram={chegaram} />
        </Backdrop>
        <Backdrop photo="icm-oliva" x={BOX.painel.x} y={BOX.painel.y} w={BOX.painel.w} h={BOX.painel.h} inset="5% 4% -2% 4%">
          <Panel show={cue === "painel" || phase !== "scene"} status={status} destaque={destaque} apontando={status === "escrevendo" ? ultimo?.origem : undefined} />
        </Backdrop>
      </Stage>

      <Overlay show={phase === "pause"}>
        <PauseCard step="peça uma análise" title="Qual origem traz o aluno bom — e qual só parece barata?" onSkip={() => pedir(true)}>
          <p style={{ margin: "0 0 16px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            A Donna lê os {TOTAL_LEADS} leads dos últimos 30 dias, com origem, perfil e resultado, e diz onde está o dinheiro bem gasto.
          </p>
          <div>
            <Button icon={IconSparkles} onClick={() => pedir(false)}>
              Pedir análise para a Donna
            </Button>
          </div>
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <div
          style={{
            width: 400,
            maxHeight: "calc(100vh - 200px)",
            overflow: "hidden",
            padding: 20,
            borderRadius: 16,
            background: "rgba(17,18,18,.88)",
            backdropFilter: "blur(24px)",
            border: "1px solid var(--border-dark)",
            color: "var(--text-inv)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="eyebrow">Análise da Donna</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          {a.resumo ? (
            <p className="display" style={{ margin: "0 0 14px", fontSize: 17, lineHeight: 1.35 }}>
              {a.resumo}
            </p>
          ) : (
            <p style={{ margin: "0 0 4px", color: "var(--text-inv-2)" }}>Lendo os leads por origem…</p>
          )}
          <div style={{ display: "grid", gap: 10 }}>
            {insights.map((i, k) => (
              <motion.div
                key={k}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ paddingTop: 10, borderTop: "1px solid var(--border-dark)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                  <b style={{ fontWeight: 600 }}>{i.titulo}</b>
                  {i.origem && (
                    <span className="mono" style={{ fontSize: 10, color: i.origem === a.origem_destaque ? "var(--k-red)" : "var(--text-inv-2)", whiteSpace: "nowrap", paddingTop: 2 }}>
                      {nomeDe(i.origem)}
                    </span>
                  )}
                </div>
                {i.evidencia && <div style={{ color: "var(--text-inv-2)", lineHeight: 1.45, fontSize: 12.5 }}>{i.evidencia}</div>}
                {i.acao && (
                  <div style={{ display: "flex", gap: 6, marginTop: 5, lineHeight: 1.45, fontSize: 12.5 }}>
                    <IconArrowRight size={13} color="var(--k-red)" style={{ flex: "none", marginTop: 3 }} />
                    <span>{i.acao}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          {agent.run.text && (
            <p style={{ margin: "12px 0 0", paddingTop: 10, borderTop: "1px solid var(--border-dark)", lineHeight: 1.45, fontSize: 12.5 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
        </div>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="05"
          title="CRM de leads por origem"
          items={[
            "Todo lead entra com a origem rastreada: WhatsApp, indicação, anúncio e campanha",
            "Qualificação registrada no primeiro contato, até a venda",
            "Painel por origem: volume, qualificação, conversão e custo",
            "Análises da Donna com recomendação de verba",
          ]}
          phase="Fase 2"
          metric="Custo por lead qualificado"
          onNext={onNext}
        />
      </Overlay>
    </>
  );
}
