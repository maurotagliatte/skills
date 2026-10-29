"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import gsap from "gsap";
import {
  IconArrowRight,
  IconBrandGoogleDrive,
  IconBrandWhatsapp,
  IconCalendarEvent,
  IconDeviceMobile,
  IconFileTypeDoc,
  IconFileTypePdf,
  IconFolder,
  IconMicrophone,
  IconPhoto,
  IconSparkles,
} from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption } from "@/engine/ChapterFrame";
import { usePlayback } from "@/engine/playback";
import type { ChapterProps } from "@/engine/types";
import { AdvanceCard, AppWindow, Backdrop, Button, LiveCard, ScopeCard } from "@/kit";
import VoicePill from "@/kit/rb/VoicePill/VoicePill";
import LatticeLoader from "@/kit/rb/LatticeLoader/LatticeLoader";
import ThoughtLine from "@/kit/rb/ThoughtLine/ThoughtLine";
import StatusMark from "@/kit/rb/StatusMark/StatusMark";
import { useAgent } from "@/agent/useAgent";
import { LockScreen, type LockNotification } from "./LockScreen";
import { Galeria, type GalCard, type Status } from "./Galeria";
import { FolhaBilingue, FolhaClinica, FolhaEditorial, FolhaHoje, FolhaWhatsApp, type R } from "./Folha";
import { EXEMPLO_TRANSCRICAO, type Pedido } from "./agent";
import css from "./atendimento.module.css";

const W = 4700;
const H = 1500;

// Mundo: [antes: Drive bagunçado] → [celular bloqueado gravando] → [galeria de modelos no sistema]
const BOX = {
  antes: { x: 140, y: 170, w: 1180, h: 1190 },
  celular: { x: 1480, y: 220, w: 1330, h: 1060 },
  sistema: { x: 2960, y: 280, w: 1680, h: 900 },
  janela: { x: 3690, y: 331, w: 900, h: 797 },
};
const SHOTS: Shot[] = [
  frame(BOX.antes, { hold: 3.4, cue: "antes" }),
  frame(BOX.celular, { dur: 1.8, hold: 8.6, cue: "bloqueado" }),
  frame(BOX.sistema, { dur: 1.9, hold: 1.4, cue: "sistema" }),
];
// durante a interação, a galeria fica à esquerda e o card à direita
const LIVE_SHOT: Shot = frame(BOX.janela, { region: "left", pad: 40, dur: 1.2 });

const DRIVE_FILES = [
  { icon: IconFileTypeDoc, name: "Copy of Copy of Copy of Exame Locomotor.docx", note: "editado no iPad" },
  { icon: IconPhoto, name: "IMG_2041.HEIC", note: "foto sem paciente" },
  { icon: IconFileTypePdf, name: "Prontuario_Trovao_final_v3.pdf", note: "editado há 2 meses" },
  { icon: IconFileTypePdf, name: "exame tarso (1).pdf", note: "duplicado" },
  { icon: IconFolder, name: "Pacientes 2024 - NÃO MEXER", note: "312 itens" },
  { icon: IconFileTypePdf, name: "Relatório Estrela Dalva.pdf", note: "sem data" },
];

type Fase = "scene" | "pause" | "live" | "conferir" | "aprovado" | "pedido" | "live2" | "feito" | "scope";
type Rec = "idle" | "gravando" | "donna" | "pronto";

// "Precisa de outro relatório?": dois pedidos em sequência, como slides
const PEDIDOS_VER: { id: Pedido; nome: string; sub: string; botao: string }[] = [
  { id: "alta", nome: "Orientações de alta", sub: "Com prescrições para conferir", botao: "Ver as orientações de alta" },
  { id: "laudo", nome: "Laudo de imagem", sub: "Raio-x e ultrassom", botao: "Ver o laudo" },
];
// na conferência, a galeria folheia duas das versões novas antes do ok
const MODELOS_VER = ["clinico", "whatsapp"];

type PedidoCard = { id: string; pedido: Pedido; nome: string; sub: string; rel?: R };

/** setTimeout que só é cancelado quando o capítulo sai (trocas de estado não cancelam a etapa seguinte). */
function useLater() {
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return useCallback((ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);
}

export default function AtendimentoChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const later = useLater();
  const [phase, setPhase] = useState<Fase>("scene");
  const [cue, setCue] = useState("antes");
  const [rec, setRec] = useState<Rec>("idle");
  const [toque, setToque] = useState(false);
  const [rel1, setRel1] = useState<R | null>(null);
  // 0 = só o editorial; 1..6 = as três versões novas entrando (montando/pronta)
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status | null>(null);
  // quantas versões novas a conferência já folheou (0..MODELOS_VER.length)
  const [vistos, setVistos] = useState(0);
  const [pedidos, setPedidos] = useState<PedidoCard[]>([]);
  const handled = useRef<string | null>(null);
  const agent = useAgent();
  const { paused } = usePlayback();

  const call = agent.tool("montar_relatorio");
  const args = (call?.args ?? {}) as R;

  /* ——— cena do celular: um roteiro próprio, que pausa junto com a câmera ——— */
  const phoneTl = useRef<gsap.core.Timeline | null>(null);
  useEffect(() => {
    if (cue !== "bloqueado" || phoneTl.current) return;
    const tl = gsap.timeline();
    tl.call(() => setToque(true), [], 2.4)
      .call(() => {
        setToque(false);
        setRec("gravando");
      }, [], 3.1)
      .call(() => setRec("donna"), [], 6.6)
      .call(() => setRec("pronto"), [], 8.3);
    phoneTl.current = tl;
  }, [cue]);
  useEffect(() => () => void phoneTl.current?.kill(), []);
  useEffect(() => {
    if (paused) phoneTl.current?.pause();
    else phoneTl.current?.resume();
  }, [paused]);

  /* ——— fim de cada rodada do agente ——— */
  useEffect(() => {
    if (agent.run.status === "error" && handled.current !== `err-${phase}`) {
      // falhou: refaz com o roteiro de exemplo, a experiência não quebra
      handled.current = `err-${phase}`;
      if (phase === "live") agent.start({ chapter: "atendimento", text: EXEMPLO_TRANSCRICAO, demo: true });
      if (phase === "live2") {
        const last = pedidos[pedidos.length - 1];
        agent.start({ chapter: "atendimento", options: { pedido: last.pedido, atendimento: EXEMPLO_TRANSCRICAO }, demo: true });
      }
      return;
    }
    if (agent.run.status !== "done") return;
    if (phase === "live" && handled.current !== "live") {
      handled.current = "live";
      setRel1(args);
      // as três versões novas entram uma a uma, depois vai para a sua conferência
      for (let k = 1; k <= 6; k++) later(500 + k * 650, () => setStep(k));
      later(500 + 7 * 650, () => {
        setStatus("conferencia");
        setPhase("conferir");
      });
    }
    if (phase === "live2" && handled.current !== `live2-${pedidos.length}`) {
      handled.current = `live2-${pedidos.length}`;
      const done = args;
      setPedidos((ps) => ps.map((p, i) => (i === ps.length - 1 ? { ...p, rel: done } : p)));
      later(900, () => setPhase("feito"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.run.status, phase]);

  // o primeiro card só aparece quando a câmera para
  const toPause = async () => {
    await stage.current?.goTo(LIVE_SHOT);
    setPhase("pause");
  };

  const submit = () => {
    setStatus("andamento");
    setPhase("live");
    agent.start({ chapter: "atendimento", text: EXEMPLO_TRANSCRICAO, demo: true });
  };

  const aprovar = () => {
    setStatus("aprovado");
    setPhase("aprovado");
    later(2600, () => setPhase("pedido"));
  };

  const proximoPedido = PEDIDOS_VER[pedidos.length];
  const pedir = () => {
    const p = PEDIDOS_VER[pedidos.length];
    if (!p) return;
    setPedidos((ps) => [...ps, { id: `pedido-${ps.length}`, pedido: p.id, nome: p.nome, sub: p.sub }]);
    setPhase("live2");
    agent.start({ chapter: "atendimento", options: { pedido: p.id, atendimento: EXEMPLO_TRANSCRICAO }, demo: true });
  };

  /* ——— cards da galeria (só crescem: novos vão para o fim da pilha) ——— */
  const editorialR: R = phase === "scene" || phase === "pause" ? {} : (rel1 ?? args);
  const st = (k: number) => (step >= 2 * k ? "done" : "running") as GalCard["state"];
  const base = rel1 ?? {};
  const cards: GalCard[] = [
    {
      id: "editorial",
      nome: "Editorial",
      sub: "Para o Ricardo",
      grupo: "donna",
      state: phase === "scene" || phase === "pause" ? "pending" : rel1 ? "done" : "running",
      saida: "pdf",
      folha: <FolhaEditorial r={editorialR} />,
    },
    { id: "hoje", nome: "Seu modelo de hoje", sub: "Em inglês, tudo em caixa-alta", grupo: "hoje", state: "static", saida: "nenhuma", folha: <FolhaHoje /> },
  ];
  if (step >= 1) cards.push({ id: "clinico", nome: "Clínico enxuto", sub: "Uma página, para colegas", grupo: "donna", state: st(1), saida: "pdf", folha: <FolhaClinica r={base} /> });
  if (step >= 3) cards.push({ id: "bilingue", nome: "Bilíngue", sub: "Português e inglês", grupo: "donna", state: st(2), saida: "pdf", folha: <FolhaBilingue r={base} /> });
  if (step >= 5)
    cards.push({
      id: "whatsapp",
      nome: "Curto, para o WhatsApp",
      sub: "No corpo da mensagem",
      grupo: "donna",
      state: st(3),
      saida: "texto",
      texto: base.mensagem_whatsapp,
      folha: <FolhaWhatsApp r={base} />,
    });
  pedidos.forEach((p, i) => {
    const running = i === pedidos.length - 1 && !p.rel;
    cards.push({
      id: p.id,
      nome: p.nome,
      sub: p.sub,
      grupo: "donna",
      state: running ? "running" : "done",
      saida: "pdf",
      folha: <FolhaEditorial r={running ? args : (p.rel ?? {})} />,
    });
  });
  const focus = pedidos.length ? pedidos[pedidos.length - 1].id : vistos ? MODELOS_VER[vistos - 1] : undefined;

  /* ——— passos da Donna, em palavras dela ——— */
  const steps1 = ["Ouvi o áudio do Trovão"];
  if (args.paciente?.nome || rel1) steps1.push("Separei o que você viu e o que fez");
  if (args.secoes?.length || rel1) steps1.push("Montando no modelo Editorial");
  if (step >= 1) steps1.push("Fiz mais três versões com os mesmos dados");
  const working1 = phase === "live" && step < 6;

  const pedidoAtual = pedidos[pedidos.length - 1];
  const steps2 = ["Li o atendimento de hoje"];
  if (pedidoAtual) steps2.push(`Montando: ${pedidoAtual.nome}`);
  if (phase === "feito") steps2.push("Pronto, na galeria");

  /* ——— celular ——— */
  const notifs: LockNotification[] = [
    { id: "agenda", app: "Agenda", icon: IconCalendarEvent, quando: "7:10", titulo: "Haras Santa Fé · 7h30", texto: "Trovão, posterior esquerdo" },
  ];
  if (rec === "pronto")
    notifs.unshift({ id: "rel", app: "Donna", icon: IconSparkles, quando: "agora", titulo: "Relatório do Trovão pronto", texto: "Para você conferir antes de ir ao Ricardo.", nova: true });

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        {/* 1 · Antes */}
        <Caption
          x={140}
          y={170}
          eyebrow="01 · Atendimento"
          title={"As mãos estão\nno cavalo."}
          sub="O atendimento acontece no haras, com o cavalo na guia. O registro fica para a noite, no iPad, e o relatório para depois."
        />
        <Backdrop photo="icm-areia" x={140} y={640} w={1180} h={720}>
          <AppWindow nav={[]} showSidebar={false} workspace="Meu Drive">
            <div style={{ padding: "16px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: "var(--text-2)" }}>
                <IconBrandGoogleDrive size={16} /> Meu Drive › Clínica › Relatórios ›{" "}
                <b style={{ color: "var(--text-1)", fontWeight: 500 }}>2026 (novo)</b>
              </div>
              {DRIVE_FILES.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.12 }}
                  style={{ display: "grid", gridTemplateColumns: "22px 1fr 190px", alignItems: "center", height: 40, borderTop: "1px solid var(--border)" }}
                >
                  <f.icon size={16} color="var(--text-3)" />
                  <span>{f.name}</span>
                  <span style={{ color: "var(--text-3)", fontSize: 12 }}>{f.note}</span>
                </motion.div>
              ))}
            </div>
          </AppWindow>
        </Backdrop>

        {/* 2 · Celular bloqueado */}
        <Backdrop photo="icm-dourado" x={1480} y={220} w={700} h={1060} inset="8.5% 19.5% 8.5% 19.5%">
          <LockScreen
            hora="07:42"
            data="segunda-feira, 9 de novembro"
            notificacoes={notifs}
            atalhos={{ esquerda: { icon: IconMicrophone, label: "Gravar atendimento", destaque: rec === "idle", ativo: rec === "gravando" } }}
            toque={toque ? "esquerda" : null}
          >
            <AnimatePresence mode="wait">
              {rec === "gravando" && <Gravando key="rec" />}
              {(rec === "donna" || rec === "pronto") && <Montando key="donna" pronto={rec === "pronto"} />}
            </AnimatePresence>
          </LockScreen>
        </Backdrop>
        <Caption
          x={2250}
          y={300}
          w={560}
          title={"Um toque na\ntela de bloqueio."}
          sub="Sem desbloquear o celular. Você fala o que está vendo, e o atendimento cai no registro do Trovão."
          show={cue !== "antes"}
        />
        <motion.div
          animate={{ opacity: cue !== "antes" ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{ position: "absolute", left: 2250, top: 650, width: 520 }}
        >
          <div className={css.native}>
            <IconDeviceMobile size={20} style={{ flex: "none", marginTop: 3 }} />
            <span>No projeto, isso é um app no celular. No iPhone, um controle na tela de bloqueio (iOS 18 ou mais novo); no Android, um atalho na tela de bloqueio.</span>
          </div>
        </motion.div>

        {/* 3 · Galeria de modelos no sistema */}
        <Caption
          x={2960}
          y={330}
          w={620}
          title={"O relatório sai\npronto para o Ricardo."}
          sub="A Donna organiza o que você falou num modelo bonito, pronto para exportar. Se precisar de outro formato, é só pedir."
          show={cue === "sistema" && phase === "scene"}
        />
        <Backdrop photo="icm-oliva" x={3640} y={280} w={1000} h={900} inset="7.9% 7% 7.9% 7%">
          <Galeria cards={cards} status={status} focus={focus} />
        </Backdrop>
      </Stage>

      <Overlay show={phase === "pause"}>
        <AdvanceCard title="O áudio do Trovão, gravado no haras." label="Ver o relatório pronto" onAdvance={submit}>
          Uns 30 segundos: qual é o animal, o que você viu e o que fez.
        </AdvanceCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">Áudio de exemplo</span>
          </div>
          <p className={css.transcript}>“{EXEMPLO_TRANSCRICAO}”</p>
          <div className={css.thought}>
            <ThoughtLine
              label="A Donna está montando o relatório"
              doneLabel="Relatório pronto"
              steps={steps1}
              working={working1}
              collapseOnSettle={false}
              collapsible={false}
              showTimer={false}
              fontSize={14}
              color="#f6f6f6"
              glyphColor="var(--k-red)"
            />
          </div>
          {agent.run.text && (
            <p className={css.donna}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "conferir" || phase === "aprovado"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span className="eyebrow">{phase === "aprovado" ? "Aprovado" : "Em conferência"}</span>
          </div>
          {phase === "conferir" ? (
            <>
              <div className={css.wa}>
                <div className={css.waHead}>
                  <IconBrandWhatsapp size={15} /> Donna, para você
                </div>
                Relatório do Trovão pronto para conferir. Responda “ok” para aprovar ou edite no app.
              </div>
              <p style={{ margin: "0 0 16px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
                Nada vai ao Ricardo sem o seu ok. Na galeria, ao lado do seu modelo de hoje, ficaram três versões novas com os mesmos dados.
              </p>
              {vistos < MODELOS_VER.length ? (
                <Button icon={IconArrowRight} onClick={() => setVistos((v) => v + 1)} advance>
                  Próximo modelo
                </Button>
              ) : (
                <Button icon={IconBrandWhatsapp} onClick={aprovar} advance>
                  Aprovar e enviar ao Ricardo
                </Button>
              )}
            </>
          ) : (
            <div className={css.wa} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 0 }}>
              <span aria-hidden style={{ marginTop: 1 }}>
                <StatusMark status="done" size={18} doneColor="#2fd27a" />
              </span>
              <span>Enviado ao Ricardo pelo WhatsApp, em PDF.</span>
            </div>
          )}
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "pedido"}>
        <AdvanceCard title="Precisa de outro relatório?" label={PEDIDOS_VER[0].botao} onAdvance={pedir}>
          A Donna monta o modelo e preenche com este atendimento.
        </AdvanceCard>
      </Overlay>

      <Overlay show={phase === "live2" || phase === "feito"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="eyebrow">Pedido</span>
          </div>
          <ThoughtLine
            label="A Donna está montando o modelo"
            doneLabel="Modelo pronto"
            steps={steps2}
            working={phase === "live2"}
            collapseOnSettle={false}
            collapsible={false}
            showTimer={false}
            fontSize={14}
            color="#f6f6f6"
            glyphColor="var(--k-red)"
          />
          {agent.run.text && (
            <p className={css.donna}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
          {phase === "feito" && (
            <div style={{ marginTop: 16 }}>
              {proximoPedido ? (
                <Button icon={IconArrowRight} onClick={pedir} advance>
                  {proximoPedido.botao}
                </Button>
              ) : (
                <Button icon={IconArrowRight} onClick={() => setPhase("scope")} advance>
                  Seguir
                </Button>
              )}
            </div>
          )}
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="01"
          title="Atendimento e relatórios"
          items={[
            "App no celular, com atalho na tela de bloqueio para gravar o atendimento",
            "A Donna monta o relatório a partir do que você falou",
            "Modelos de atendimento, alta, laudo de imagem e internação, e novos modelos quando você pedir",
            "Exportar em PDF ou enviar pelo WhatsApp",
            "Nada sai sem a sua conferência: em conferência, aprovado, enviado ao cliente",
            "Cadastro de clientes e animais trazido do sistema atual",
          ]}
          phase="Fase 1"
          metric="Tempo entre o fim do atendimento e o relatório enviado"
          onNext={onNext}
          nextLabel="Próximo: as contas da semana"
        />
      </Overlay>
    </>
  );
}

/** Atividade ao vivo na tela bloqueada: gravando, sem desbloquear. */
function Gravando() {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(69);
  useEffect(() => {
    // liga a pílula de voz do React Bits (onda simulada; a gravação real fica na pausa)
    const btn = ref.current?.querySelector<HTMLButtonElement>("button.voice-pill");
    btn?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    const t = setInterval(() => setS((v) => v + 1), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4 }} className={css.activity}>
      <div className={css.activityText}>
        <b>Trovão</b>
        <span>
          <i className={css.rec} />
          gravando {Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}
        </span>
      </div>
      <VoicePill
        size={34}
        accentColor="#ffffff"
        iconColor="#ffffff"
        background="rgba(255,255,255,0.14)"
        showTime={false}
        slideToCancel={false}
        mode="toggle"
        ariaLabel="Gravando o atendimento"
      />
    </motion.div>
  );
}

/** Depois de gravar: a Donna monta o relatório (status compacto). */
function Montando({ pronto }: { pronto: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className={css.activity}>
      <span className={css.lattice} aria-hidden>
        <LatticeLoader
          label="A Donna monta o relatório"
          doneLabel="Relatório montado"
          status={pronto ? "done" : "working"}
          showTimer={false}
          fontSize={14}
          cellSize={5}
          doneColor="#2fd27a"
        />
      </span>
      <span className={css.sr}>{pronto ? "Relatório montado" : "A Donna monta o relatório"}</span>
    </motion.div>
  );
}
