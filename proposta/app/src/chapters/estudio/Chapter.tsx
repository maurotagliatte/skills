"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Icon } from "@tabler/icons-react";
import { IconFileText, IconBrandInstagram, IconPresentation, IconSparkles, IconRefresh, IconArrowRight } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard, AppWindow, AgentRow, Avatar, Chip, Cursor } from "@/kit";
import { useAgent } from "@/agent/useAgent";
import { EXEMPLO_ARTE, PEDIDOS, TOOL_POR_ABA, type Aba, type Arte, type Deck, type Documento } from "./agent";
import { EQUIPE, SpecRow, useReveal, type Membro, type Status } from "./equipe";
import { DocumentoView, docAvailable, docStatus } from "./Documento";
import { ArteEditor, arteAvailable, arteStatus } from "./Arte";
import { SlidesView, slidesAvailable, slidesStatus } from "./Slides";
import css from "./estudio.module.css";

const W = 4900;
const H = 1500;

// Mundo: [legenda + pedido para a Donna] → [editor com os especialistas] → [estúdio onde ela pede]
const BOX = {
  pedido: { x: 140, y: 380, w: 1800, h: 700 },
  equipe: { x: 2100, y: 280, w: 1240, h: 940 },
  estudio: { x: 3500, y: 260, w: 1240, h: 980 },
};
const SHOTS: Shot[] = [
  frame(BOX.pedido, { hold: 4.2, cue: "pedido" }),
  frame(BOX.equipe, { dur: 1.8, hold: 4.6, cue: "equipe" }),
  frame(BOX.estudio, { dur: 1.8, hold: 0.5, cue: "estudio" }),
];
const LIVE_SHOT: Shot = frame(BOX.estudio, { region: "left", pad: 40, dur: 1.2 });
const CUES = ["pedido", "equipe", "estudio"];

const ABAS: { id: Aba; label: string; short: string; icon: Icon }[] = [
  { id: "documento", label: "Documento", short: "Documento", icon: IconFileText },
  { id: "arte", label: "Arte para Instagram", short: "Arte", icon: IconBrandInstagram },
  { id: "slides", label: "Slide deck", short: "Slides", icon: IconPresentation },
];
const RITMO: Record<Aba, number> = { documento: 650, arte: 1000, slides: 800 };

const CHAMADOS: { who: Exclude<Membro, "Donna">; task: string }[] = [
  { who: "Redatora", task: "Texto do termo e legenda do post" },
  { who: "Designer", task: "Foto, logo e cores da marca" },
  { who: "Diagramadora", task: "Página A4, grid do post e slides" },
];

export default function EstudioChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [phase, setPhase] = useState<Phase>("scene");
  const [cue, setCue] = useState("pedido");
  const [aba, setAba] = useState<Aba>("arte");
  const [pedidos, setPedidos] = useState<Record<Aba, string>>(PEDIDOS);
  const [run, setRun] = useState<{ aba: Aba; text: string; key: number } | null>(null);
  const agent = useAgent();
  const runSeq = useRef(0);
  const cueIdx = CUES.indexOf(cue);

  // cena: conversa com a Donna e editor com os especialistas
  const chat = useReveal(4, 700, true, "chat");
  const sceneArte = useReveal(5, 760, cueIdx >= 1, "cena");

  // ao vivo
  const shownAba = run?.aba ?? aba;
  const call = run ? agent.tool(TOOL_POR_ABA[run.aba]) : undefined;
  const args = (call?.args ?? {}) as Record<string, unknown>;
  const toolDone = !!call?.done && agent.run.status !== "running";
  const available =
    shownAba === "documento" ? docAvailable(args as Partial<Documento>) : shownAba === "arte" ? arteAvailable(args as Partial<Arte>) : slidesAvailable(args as Partial<Deck>);
  const n = useReveal(available, RITMO[shownAba], !!run, run?.key ?? 0);
  const complete = toolDone && n >= available && available > 0;
  const statuses: Status[] = !run
    ? []
    : shownAba === "documento"
      ? docStatus(args as Partial<Documento>, n, toolDone)
      : shownAba === "arte"
        ? arteStatus(args as Partial<Arte>, n, toolDone)
        : slidesStatus(args as Partial<Deck>, n, toolDone);

  const toPause = async () => {
    setPhase("pause");
    await stage.current?.goTo(LIVE_SHOT);
  };

  const submit = (demo: boolean) => {
    const text = pedidos[aba].trim() || PEDIDOS[aba];
    setRun({ aba, text, key: ++runSeq.current });
    setPhase("live");
    agent.start({ chapter: "estudio", text: `[${aba}] ${text}`, demo });
  };

  const outraPeca = () => {
    const i = ABAS.findIndex((a) => a.id === run?.aba);
    setAba(ABAS[(i + 1) % ABAS.length].id);
    setRun(null);
    agent.reset();
    setPhase("pause");
  };

  useEffect(() => {
    if (agent.run.status === "error") setPhase("pause");
  }, [agent.run.status]);

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        {/* 1 · O pedido */}
        <Caption
          x={140}
          y={480}
          w={640}
          eyebrow="07 · Estúdio"
          title={"Um pedido seu,\ntrês especialistas."}
          sub="A Donna entende o que você precisa e chama, na hora certa, quem escreve, quem desenha e quem diagrama — sempre com a sua marca."
        />
        <Backdrop photo="icm-pessego" x={840} y={380} w={1100} h={700}>
          <AppWindow nav={[]} showSidebar={false}>
            <PedidoThread step={chat} />
          </AppWindow>
        </Backdrop>

        {/* 2 · Os especialistas trabalhando na arte */}
        <Backdrop photo="icm-musgo" x={2100} y={280} w={1240} h={940} inset="5% 4% -2% 4%">
          <AppWindow nav={[]} showSidebar={false} workspace="Estúdio · Post da nova turma">
            <ArteEditor a={EXEMPLO_ARTE} n={sceneArte} done />
          </AppWindow>
        </Backdrop>

        {/* 3 · O estúdio, onde ela pede */}
        <Backdrop photo="icm-oliva" x={3500} y={260} w={1240} h={980} inset="5% 4% -2% 4%">
          <AppWindow nav={[]} showSidebar={false} workspace="Estúdio">
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div className={css.tabs}>
                {ABAS.map((t) => (
                  <span key={t.id} className={`${css.tab} ${t.id === shownAba ? css.tabActive : ""}`}>
                    <t.icon size={15} stroke={1.7} />
                    {t.label}
                  </span>
                ))}
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                  {(Object.keys(EQUIPE) as Membro[]).map((m) => (
                    <Avatar key={m} name={m} color={EQUIPE[m].color} size={20} />
                  ))}
                </span>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                {shownAba === "documento" && <DocumentoView d={args as Partial<Documento>} n={n} statuses={statuses} done={toolDone} />}
                {shownAba === "arte" && <ArteEditor a={args as Partial<Arte>} n={n} done={toolDone} />}
                {shownAba === "slides" && <SlidesView d={args as Partial<Deck>} n={n} done={toolDone} />}
              </div>
            </div>
          </AppWindow>
        </Backdrop>
      </Stage>

      <Overlay show={phase === "pause"}>
        <PauseCard step="faça um pedido" title="Peça uma peça com a sua marca, do jeito que pediria a alguém da equipe." onSkip={() => submit(true)}>
          <div className={css.darkTabs}>
            {ABAS.map((t) => (
              <button key={t.id} className={`${css.darkTab} ${t.id === aba ? css.darkTabActive : ""}`} onClick={() => setAba(t.id)}>
                <t.icon size={14} stroke={1.7} />
                {t.short}
              </button>
            ))}
          </div>
          <textarea
            className={css.textarea}
            rows={3}
            value={pedidos[aba]}
            onChange={(e) => setPedidos((p) => ({ ...p, [aba]: e.target.value }))}
            aria-label="Pedido para a Donna"
          />
          <p style={{ margin: "10px 0 16px", color: "var(--text-inv-2)", lineHeight: 1.5 }}>
            {aba === "documento" && "Sai em A4, com o cabeçalho e a marca d'água da clínica, pronto para imprimir."}
            {aba === "arte" && "Sai no tamanho do feed (1080 × 1350), com camadas editáveis."}
            {aba === "slides" && "Sai um deck de aula com as cores e o logo do manual da marca."}
          </p>
          <div>
            <Button icon={IconSparkles} onClick={() => submit(false)}>
              Pedir à Donna
            </Button>
          </div>
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <div style={{ width: 380, padding: 20, borderRadius: 16, background: "rgba(17,18,18,.86)", backdropFilter: "blur(24px)", border: "1px solid var(--border-dark)", color: "var(--text-inv)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">Pedido · {ABAS.find((t) => t.id === run?.aba)?.short}</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          <p style={{ margin: "0 0 12px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>“{run?.text}”</p>
          <div style={{ borderTop: "1px solid var(--border-dark)", paddingTop: 6 }}>
            <DonnaDark done={complete} />
            {statuses.map((s) => (
              <SpecRow key={s.who} s={s} dark />
            ))}
          </div>
          {complete && agent.run.text && (
            <p style={{ margin: "10px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.5 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
          {complete && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Button variant="ghost" icon={IconRefresh} onClick={outraPeca}>
                Pedir outra peça
              </Button>
              <Button icon={IconArrowRight} onClick={() => setPhase("scope")} style={{ flex: 1 }}>
                Continuar
              </Button>
            </motion.div>
          )}
        </div>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="07"
          title="Estúdio de conteúdo"
          items={[
            "Documentos com a sua marca: termos, laudos e orientações, prontos para imprimir ou salvar em PDF",
            "Artes para o Instagram no tamanho certo, com camadas editáveis",
            "Apresentações de aula e palestra com o manual da marca aplicado",
            "Manual de marca da clínica (logo, cores, fotos) como base de tudo",
          ]}
          phase="Fase 3"
          metric="Peças produzidas por semana"
          onNext={onNext}
        />
      </Overlay>
    </>
  );
}

function DonnaDark({ done }: { done: boolean }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "8px 0" }}>
      <Avatar name="Donna" color="var(--k-red)" size={22} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <b style={{ fontWeight: 600 }}>Donna</b>
          <span className="mono" style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "var(--dark-3)", color: "var(--text-inv-2)", border: "1px solid var(--border-dark)" }}>
            AGENTE
          </span>
          <span style={{ marginLeft: "auto", fontWeight: 500, color: done ? "#7ee2a8" : "var(--amber)" }}>{done ? "entregue" : "orquestrando…"}</span>
        </div>
        <div style={{ marginTop: 2, color: "var(--text-inv-2)" }}>Dividiu o pedido e chamou a equipe</div>
      </div>
    </div>
  );
}

const ENTREGAS: { peca: string; icon: Icon; quem: Membro[]; prazo: string; tone: "amber" | "neutral" }[] = [
  { peca: "Termo de consentimento · Trovão · A4", icon: IconFileText, quem: ["Redatora", "Diagramadora"], prazo: "amanhã, 07:00", tone: "amber" },
  { peca: "Post da nova turma · 1080 × 1350", icon: IconBrandInstagram, quem: ["Redatora", "Designer", "Diagramadora"], prazo: "sexta", tone: "neutral" },
  { peca: "Aula 1 · slides da biomecânica do posterior", icon: IconPresentation, quem: ["Redatora", "Designer", "Diagramadora"], prazo: "segunda", tone: "neutral" },
];

/** Cena 1: o pedido dela e a Donna chamando cada especialista. */
function PedidoThread({ step }: { step: number }) {
  const cardX = (i: number) => 28 + i * 312 + 200;
  const donna = step >= 2 ? { x: cardX(Math.min(step - 2, 2)), y: 300 } : { x: 640, y: 210 };
  return (
    <div style={{ position: "relative", padding: "20px 28px", height: "100%" }}>
      <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 8 }}>Estúdio › Pedidos da semana</div>
      <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 12, background: "#f6f6f5", border: "1px solid var(--border)" }}>
        <Avatar name="Gabriela Guenka" color="var(--gg-wine)" size={26} />
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <b style={{ fontWeight: 600 }}>Gabriela</b>
            <span style={{ color: "var(--text-3)", fontSize: 12 }}>hoje, 07:48</span>
          </div>
          <div style={{ marginTop: 3, fontSize: 14, lineHeight: 1.5 }}>
            Donna, preciso do termo de consentimento da infiltração do Trovão para amanhã cedo, do post da nova turma do curso e dos slides da aula 1.
          </div>
        </div>
      </div>
      <motion.div animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : 8 }} transition={{ duration: 0.5 }} style={{ marginTop: 10 }}>
        <AgentRow status={step >= 4 ? "equipe chamada" : "orquestrando…"} done={step >= 4}>
          Separei em três peças e estou chamando quem faz cada parte.
        </AgentRow>
      </motion.div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 14 }}>
        {CHAMADOS.map((c, i) => (
          <motion.div
            key={c.who}
            animate={{ opacity: step >= i + 2 ? 1 : 0.25, y: step >= i + 2 ? 0 : 6, filter: step >= i + 2 ? "blur(0px)" : "blur(2px)" }}
            transition={{ duration: 0.5 }}
            style={{ border: "1px solid var(--border)", borderTop: `3px solid ${EQUIPE[c.who].color}`, borderRadius: 10, padding: "12px 14px", background: "#fff" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Avatar name={c.who} color={EQUIPE[c.who].color} size={22} />
              <b style={{ fontWeight: 600 }}>{c.who}</b>
              <span className="mono" style={{ fontSize: 9, padding: "1px 5px", borderRadius: 4, background: "#f1f1f1", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                AGENTE
              </span>
            </div>
            <div style={{ marginTop: 8, color: "var(--text-2)" }}>{c.task}</div>
            <div style={{ marginTop: 8, fontSize: 12, fontWeight: 500, color: step >= i + 2 ? "var(--amber)" : "var(--text-3)" }}>{step >= i + 2 ? "entrou no pedido" : "—"}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: 18, opacity: step >= 4 ? 1 : 0, transition: "opacity .6s" }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 500, marginBottom: 6 }}>Entregas</div>
        {ENTREGAS.map((e) => (
          <div key={e.peca} style={{ display: "grid", gridTemplateColumns: "22px 1fr 110px 130px", alignItems: "center", height: 40, borderTop: "1px solid var(--border)" }}>
            <e.icon size={16} color="var(--text-3)" />
            <span>{e.peca}</span>
            <span style={{ display: "flex", gap: 3 }}>
              {e.quem.map((m) => (
                <Avatar key={m} name={m} color={EQUIPE[m].color} size={18} />
              ))}
            </span>
            <span style={{ justifySelf: "end" }}>
              <Chip tone={e.tone}>{e.prazo}</Chip>
            </span>
          </div>
        ))}
      </div>
      <Cursor x={donna.x} y={donna.y} label="Donna" />
    </div>
  );
}
