"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Icon } from "@tabler/icons-react";
import {
  IconMovie,
  IconArticle,
  IconBrandInstagram,
  IconPresentation,
  IconSparkles,
  IconRefresh,
  IconArrowRight,
  IconLayoutDashboard,
  IconSchool,
  IconUsers,
  IconCalendarEvent,
} from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps } from "@/engine/types";
import { AppWindow, Avatar, Backdrop, Button, PauseCard, ScopeCard, LiveCard, SpecRow, TextField, useReveal, type NavEntry } from "@/kit";
import ThoughtLine from "@/kit/rb/ThoughtLine/ThoughtLine";
import { useAgent } from "@/agent/useAgent";
import { EXEMPLO_ARTE, EXEMPLO_AULA, EXEMPLO_POST, PEDIDOS, TOOL_POR_ABA, type Aba, type Arte, type Aula, type Deck, type Post } from "./agent";
import { AulaView, EDIT_STEPS } from "./Aula";
import { PostView } from "./Post";
import { Publicado } from "./Publicado";
import { ArteEditor, arteAvailable, arteStatus } from "./Arte";
import { SlidesView, slidesAvailable, slidesStatus } from "./Slides";
import { EQUIPE, type Membro, type Status } from "./equipe";
import css from "./conteudo.module.css";

const W = 6400;
const H = 1500;

// Mundo: [legenda + aula sendo cortada] → [post no ar] → [arte da turma] → [o pedido da semana]
const BOX = {
  abertura: { x: 140, y: 300, w: 1740, h: 900 },
  aula: { x: 700, y: 300, w: 1180, h: 900 },
  post: { x: 2040, y: 300, w: 1180, h: 900 },
  arte: { x: 3380, y: 280, w: 1240, h: 940 },
  pedido: { x: 4880, y: 260, w: 1240, h: 980 },
};
const SHOTS: Shot[] = [
  frame(BOX.abertura, { hold: 4.6, cue: "aula" }),
  frame(BOX.post, { dur: 1.7, hold: 2.8, cue: "post" }),
  frame(BOX.arte, { dur: 1.7, hold: 3, cue: "arte" }),
];
const LIVE_SHOT: Shot = frame(BOX.pedido, { region: "left", pad: 40, dur: 1.4 });
const CUES = ["aula", "post", "arte"];

const ABAS: { id: Aba; label: string; icon: Icon; nota: string }[] = [
  { id: "aula", label: "Aula", icon: IconMovie, nota: "Sai legendada e com capítulos, pronta para a área de membros." },
  { id: "post", label: "Post", icon: IconArticle, nota: "Sai escrito para aparecer no Google, com a sua revisão antes de ir ao ar." },
  { id: "arte", label: "Arte", icon: IconBrandInstagram, nota: "Sai no tamanho do feed, com camadas editáveis." },
  { id: "slides", label: "Slides", icon: IconPresentation, nota: "Sai com as cores e o logo da sua identidade visual." },
];

const PASSOS: Record<Aba, string[]> = {
  aula: ["Cortando pausas e repetições", "Gerando as legendas", "Escrevendo título, descrição e capítulos"],
  post: ["Lendo os posts que já trazem visita", "Escrevendo o rascunho", "Conferindo antes de publicar"],
  arte: ["Dividindo o pedido", "Chamando a equipe", "Montando as camadas"],
  slides: ["Dividindo o pedido", "Chamando a equipe", "Montando os slides"],
};
const RITMO: Record<Aba, number> = { aula: 950, post: 900, arte: 1000, slides: 800 };
const AVISO_DEMO = "Agente ao vivo desligado nesta sessão. Esta é a resposta de exemplo.";

const NAV_AULA: NavEntry[] = [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda" },
  { section: "Cursos" },
  { icon: IconSchool, label: "Cursos" },
  { icon: IconMovie, label: "Aulas", active: true },
  { icon: IconUsers, label: "Alunos" },
];

type Fase = "scene" | "pause" | "live" | "scope";

export default function ConteudoChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [fase, setFase] = useState<Fase>("scene");
  const [cue, setCue] = useState("aula");
  const [aba, setAba] = useState<Aba>("aula");
  const [pedidos, setPedidos] = useState<Record<Aba, string>>(PEDIDOS);
  const [run, setRun] = useState<{ aba: Aba; text: string; key: number; exemplo: boolean; proprio: boolean } | null>(null);
  const agent = useAgent();
  const seq = useRef(0);
  const cueIdx = CUES.indexOf(cue);

  // cena: a aula sendo cortada e a arte montada, com os exemplos
  const cenaAula = useReveal(EDIT_STEPS, 520, { key: "cena-aula", lead: 0.6 });
  const cenaArte = useReveal(5, 520, { active: cueIdx >= 2, key: "cena-arte", lead: 0.3 });

  // ao vivo
  const shown = run?.aba ?? aba;
  const call = run ? agent.tool(TOOL_POR_ABA[run.aba]) : undefined;
  const args = (call?.args ?? {}) as Record<string, unknown>;
  const toolDone = !!call?.done && agent.run.status !== "running";
  const available =
    shown === "aula" ? (args.titulo ? EDIT_STEPS : 0) : shown === "post" ? (args.corpo ? 1 : 0) : shown === "arte" ? arteAvailable(args as Partial<Arte>) : slidesAvailable(args as Partial<Deck>);
  // a aula corta antes de os textos chegarem: a edição anda sozinha
  const n = useReveal(shown === "aula" ? EDIT_STEPS : available, RITMO[shown], { active: !!run, key: run?.key ?? 0, lead: 0.4 });
  const complete = !!run && toolDone && (shown === "post" ? true : n >= (shown === "aula" ? EDIT_STEPS : available)) && available > 0;
  const passo = useReveal(3, 1100, { active: !!run, key: run?.key ?? 0, lead: 0.2 });
  const statuses: Status[] =
    !run || (shown !== "arte" && shown !== "slides")
      ? []
      : shown === "arte"
        ? arteStatus(args as Partial<Arte>, n, toolDone)
        : slidesStatus(args as Partial<Deck>, n, toolDone);

  // pedido de exemplo: depois da entrega, segue sozinho para o cartão
  useEffect(() => {
    if (fase !== "live" || !complete || !run?.exemplo) return;
    const t = setTimeout(() => setFase("scope"), 4600);
    return () => clearTimeout(t);
  }, [fase, complete, run]);

  useEffect(() => {
    if (agent.run.status === "error") setFase("pause");
  }, [agent.run.status]);

  const toPause = async () => {
    await stage.current?.goTo(LIVE_SHOT);
    setFase("pause");
  };
  const submit = (exemplo: boolean) => {
    const text = pedidos[aba].trim() || PEDIDOS[aba];
    setRun({ aba, text, key: ++seq.current, exemplo, proprio: text !== PEDIDOS[aba] });
    setFase("live");
    agent.start({ chapter: "conteudo", text, options: { aba }, demo: exemplo });
  };
  const outraPeca = () => {
    const i = ABAS.findIndex((a) => a.id === run?.aba);
    setAba(ABAS[(i + 1) % ABAS.length].id);
    setRun(null);
    agent.reset();
    setFase("pause");
  };

  const passos = PASSOS[shown];

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        <Caption
          x={140}
          y={420}
          w={500}
          eyebrow="06 · Conteúdo"
          title={"Uma gravação,\ntrês peças prontas."}
          sub="O caso do Trovão vira aula, post e arte da turma. Você grava uma vez e revisa o resto."
          show={cue === "aula"}
        />
        {/* 1 · a aula bruta sendo cortada */}
        <Backdrop photo="icm-musgo" x={BOX.aula.x} y={BOX.aula.y} w={BOX.aula.w} h={BOX.aula.h} inset="5% 4% -2% 4%">
          <AppWindow nav={NAV_AULA}>
            <AulaView aula={EXEMPLO_AULA} step={cenaAula} agentDone published={false} />
          </AppWindow>
        </Backdrop>

        {/* 2 · o post no ar */}
        <Backdrop photo="icm-dourado" x={BOX.post.x} y={BOX.post.y} w={BOX.post.w} h={BOX.post.h} inset="5% 6% -2% 4%">
          <Publicado p={EXEMPLO_POST} show={cueIdx >= 1} />
        </Backdrop>

        {/* 3 · a arte da nova turma */}
        <Backdrop photo="icm-pessego" x={BOX.arte.x} y={BOX.arte.y} w={BOX.arte.w} h={BOX.arte.h} inset="5% 4% -2% 4%">
          <AppWindow nav={[]} showSidebar={false} workspace="Conteúdo · arte da nova turma">
            <ArteEditor a={EXEMPLO_ARTE} n={cenaArte} done />
          </AppWindow>
        </Backdrop>

        {/* 4 · o pedido da semana */}
        <Backdrop photo="icm-oliva" x={BOX.pedido.x} y={BOX.pedido.y} w={BOX.pedido.w} h={BOX.pedido.h} inset="5% 4% -2% 4%">
          <AppWindow nav={[]} showSidebar={false} workspace="Conteúdo · pedidos da semana">
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div className={css.tabs}>
                {ABAS.map((t) => (
                  <span key={t.id} className={`${css.tab} ${t.id === shown ? css.tabActive : ""}`}>
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
                {shown === "aula" && <AulaView aula={args as Partial<Aula>} step={run ? n : 0} agentDone={toolDone} published={complete} tw={720} />}
                {shown === "post" && <PostView p={args as Partial<Post>} working={!!run && !toolDone} done={!!run && toolDone} published={false} />}
                {shown === "arte" && <ArteEditor a={args as Partial<Arte>} n={run ? n : 0} done={toolDone} />}
                {shown === "slides" && <SlidesView d={args as Partial<Deck>} n={run ? n : 0} done={toolDone} />}
              </div>
            </div>
          </AppWindow>
        </Backdrop>
      </Stage>

      <Overlay show={fase === "pause"}>
        <PauseCard step="peça à Donna" title="O que você quer pronto esta semana?" onSkip={() => submit(true)}>
          <div className={css.darkTabs} role="tablist" aria-label="Tipo de peça">
            {ABAS.map((t) => (
              <button key={t.id} role="tab" aria-selected={t.id === aba} className={`${css.darkTab} ${t.id === aba ? css.darkTabActive : ""}`} onClick={() => setAba(t.id)}>
                <t.icon size={14} stroke={1.7} />
                {t.label}
              </button>
            ))}
          </div>
          <TextField rows={3} value={pedidos[aba]} onChange={(v) => setPedidos((p) => ({ ...p, [aba]: v }))} label="Pedido para a Donna" style={{ borderRadius: 10 }} />
          <p style={{ margin: "10px 0 16px", color: "var(--text-inv-2)", lineHeight: 1.5 }}>{ABAS.find((t) => t.id === aba)?.nota}</p>
          <div>
            <Button icon={IconSparkles} onClick={() => submit(false)}>
              Pedir à Donna
            </Button>
          </div>
        </PauseCard>
      </Overlay>

      <Overlay show={fase === "live"}>
        <LiveCard style={{ width: 400 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">Pedido · {ABAS.find((t) => t.id === run?.aba)?.label}</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          <p style={{ margin: "0 0 12px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>“{run?.text}”</p>
          {run?.proprio && agent.run.mode === "demo" && <p style={{ margin: "0 0 12px", color: "#f0c36b", fontSize: 12, lineHeight: 1.5 }}>{AVISO_DEMO}</p>}
          <div style={{ borderTop: "1px solid var(--border-dark)", paddingTop: 12 }}>
            <ThoughtLine
              label={passos[Math.max(0, passo - 1)]}
              doneLabel="Entregue para a sua revisão"
              working={!complete}
              steps={passos.slice(0, Math.max(1, passo))}
              color="var(--text-inv)"
              glyphColor="var(--k-red)"
              fontSize={13}
              collapsible={false}
              collapseOnSettle={false}
              showTimer={false}
            />
          </div>
          {statuses.length > 0 && (
            <div style={{ marginTop: 10, paddingTop: 6, borderTop: "1px solid var(--border-dark)" }}>
              {statuses.map((s) => (
                <SpecRow key={s.who} name={s.who} color={EQUIPE[s.who].color} state={s.state} dark>
                  {s.text}
                </SpecRow>
              ))}
            </div>
          )}
          {complete && agent.run.text && (
            <p style={{ margin: "12px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.5 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
          {complete && !run?.exemplo && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Button variant="ghost" icon={IconRefresh} onClick={outraPeca}>
                Pedir outra peça
              </Button>
              <Button icon={IconArrowRight} onClick={() => setFase("scope")} style={{ flex: 1 }}>
                Continuar
              </Button>
            </motion.div>
          )}
        </LiveCard>
      </Overlay>

      <Overlay show={fase === "scope"}>
        <ScopeCard
          number="06"
          title="Conteúdo sem parar a clínica"
          items={[
            "Aula: cortes, legendas, capítulos e descrição, publicada na sua plataforma",
            "Post para o site, escrito para aparecer no Google",
            "Artes e apresentações com a sua identidade visual (arquivos oficiais da marca)",
            "Painel simples de visitas por post",
            "Nada vai ao ar sem a sua aprovação",
          ]}
          phase="Fase 3"
          metric="Peças publicadas por mês e visitas vindas do Google [confirmar se há site e blog]"
          onNext={onNext}
          nextLabel="Ver a proposta"
        />
      </Overlay>
    </>
  );
}
