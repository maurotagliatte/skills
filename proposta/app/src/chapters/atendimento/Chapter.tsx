"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import gsap from "gsap";
import {
  IconBrandGoogleDrive,
  IconBrandWhatsapp,
  IconCalendarWeek,
  IconCalendarEvent,
  IconDeviceMobile,
  IconFileTypeDoc,
  IconFileTypePdf,
  IconFolder,
  IconMicrophone,
  IconPencil,
  IconPhoto,
  IconPill,
  IconPlayerStopFilled,
  IconScan,
  IconSparkles,
  IconTimeline,
} from "@tabler/icons-react";
import type { Icon } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import { usePlayback } from "@/engine/playback";
import type { ChapterProps } from "@/engine/types";
import { AppWindow, Backdrop, Button, LiveCard, MicLevel, PauseCard, ScopeCard, TextField } from "@/kit";
import VoicePill from "@/kit/rb/VoicePill/VoicePill";
import LatticeLoader from "@/kit/rb/LatticeLoader/LatticeLoader";
import ThoughtLine from "@/kit/rb/ThoughtLine/ThoughtLine";
import StatusMark from "@/kit/rb/StatusMark/StatusMark";
import { useAgent } from "@/agent/useAgent";
import { useRecorder } from "@/agent/useRecorder";
import { LockScreen, type LockNotification } from "./LockScreen";
import { Galeria, type GalCard, type Status } from "./Galeria";
import { FolhaBilingue, FolhaClinica, FolhaEditorial, FolhaHoje, FolhaWhatsApp, type R } from "./Folha";
import { EXEMPLO_TRANSCRICAO, nomeDoModelo, type Pedido } from "./agent";
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

const OPCOES: { id: Pedido; icon: Icon; label: string; sub: string }[] = [
  { id: "alta", icon: IconPill, label: "Orientações de alta", sub: "Com as prescrições para você conferir" },
  { id: "laudo", icon: IconScan, label: "Laudo de imagem", sub: "Raio-x ou ultrassom" },
  { id: "internacao", icon: IconCalendarWeek, label: "Atualização da internação", sub: "A semana, para o grupo" },
  { id: "final", icon: IconTimeline, label: "Relatório final do caso", sub: "A partir do histórico" },
  { id: "livre", icon: IconPencil, label: "Do meu jeito", sub: "Descreva o que precisa" },
];
const SUB_PEDIDO: Record<Pedido, string> = {
  alta: "Com prescrições para conferir",
  laudo: "Raio-x e ultrassom",
  internacao: "Modelo da semana",
  final: "A partir do histórico",
  livre: "Seu modelo, guardado",
};

type PedidoCard = { id: string; pedido: Pedido; nome: string; rel?: R };

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
  const [transcript, setTranscript] = useState<{ text: string; example: boolean } | null>(null);
  const [rel1, setRel1] = useState<R | null>(null);
  // 0 = só o editorial; 1..6 = as três versões novas entrando (montando/pronta)
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status | null>(null);
  const [escolha, setEscolha] = useState<Pedido>("alta");
  const [livre, setLivre] = useState("");
  const [pedidos, setPedidos] = useState<PedidoCard[]>([]);
  const handled = useRef<string | null>(null);
  const interagiu = useRef(false);
  const agent = useAgent();
  const mic = useRecorder();
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
      if (phase === "live") agent.start({ chapter: "atendimento", text: transcript?.text, demo: true });
      if (phase === "live2") {
        const last = pedidos[pedidos.length - 1];
        agent.start({ chapter: "atendimento", options: { pedido: last.pedido, atendimento: transcript?.text ?? "" }, text: livre, demo: true });
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
      setPedidos((ps) => ps.map((p, i) => (i === ps.length - 1 ? { ...p, rel: done, nome: p.pedido === "livre" ? done.nome_modelo || p.nome : p.nome } : p)));
      interagiu.current = false;
      later(900, () => setPhase("feito"));
      // sem nenhum toque dela, segue sozinho para o escopo
      later(10500, () => {
        if (!interagiu.current) setPhase((f) => (f === "feito" ? "scope" : f));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.run.status, phase]);

  useEffect(() => {
    if (phase !== "feito") return;
    const mark = () => (interagiu.current = true);
    window.addEventListener("pointerdown", mark);
    window.addEventListener("keydown", mark);
    return () => {
      window.removeEventListener("pointerdown", mark);
      window.removeEventListener("keydown", mark);
    };
  }, [phase]);

  // o card "Sua vez" só aparece quando a câmera para
  const toPause = async () => {
    await stage.current?.goTo(LIVE_SHOT);
    setPhase("pause");
  };

  const submit = (text: string | undefined) => {
    const t = text ?? EXEMPLO_TRANSCRICAO;
    setTranscript({ text: t, example: !text });
    setStatus("andamento");
    setPhase("live");
    agent.start({ chapter: "atendimento", text: t, demo: !text });
  };

  const onRecord = async () => {
    if (mic.state === "recording") submit(await mic.stop());
    else if (!(await mic.start())) later(1600, () => submit(undefined));
  };

  const aprovar = () => {
    setStatus("aprovado");
    setPhase("aprovado");
    later(2600, () => setPhase("pedido"));
  };

  const pedir = (p: Pedido) => {
    const texto = p === "livre" ? livre.trim() || "relatório para o treinador, sem termos técnicos" : undefined;
    const nome = p === "livre" ? nomeDoModelo(texto ?? "") : OPCOES.find((o) => o.id === p)!.label;
    setPedidos((ps) => [...ps, { id: `pedido-${ps.length}`, pedido: p, nome }]);
    setPhase("live2");
    agent.start({
      chapter: "atendimento",
      options: { pedido: p, atendimento: transcript?.text ?? EXEMPLO_TRANSCRICAO },
      text: texto,
      demo: (transcript?.example ?? true) && p !== "livre",
    });
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
      sub: SUB_PEDIDO[p.pedido],
      grupo: "donna",
      state: running ? "running" : "done",
      saida: "pdf",
      folha: <FolhaEditorial r={running ? args : (p.rel ?? {})} />,
    });
  });
  const focus = pedidos.length ? pedidos[pedidos.length - 1].id : undefined;

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
        <PauseCard step="grave um atendimento" title="Fale como falaria no haras." onSkip={() => submit(undefined)}>
          <p style={{ margin: "0 0 16px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            Diga qual é o animal, o que você viu e o que fez. Uns 30 segundos bastam. O áudio é usado só nesta demonstração e apagado.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Button icon={mic.state === "recording" ? IconPlayerStopFilled : IconMicrophone} onClick={onRecord} disabled={mic.state === "asking" || mic.state === "transcribing"}>
              {mic.state === "recording" ? `Parar · ${mic.seconds}s` : mic.state === "asking" ? "Liberando o microfone…" : mic.state === "transcribing" ? "Ouvindo…" : "Gravar"}
            </Button>
            {mic.state === "recording" && <MicLevel level={mic.level} />}
          </div>
          {mic.state === "denied" && <p style={{ color: "#f3a38c", margin: "12px 0 0" }}>Sem microfone. Seguimos com o áudio de exemplo do Trovão.</p>}
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">{transcript?.example ? "Áudio de exemplo" : "O que você falou"}</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          <p className={css.transcript}>“{transcript?.text}”</p>
          {!transcript?.example && agent.run.mode === "demo" && <p className={css.note}>Agente ao vivo desligado nesta sessão. Esta é a resposta de exemplo.</p>}
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
            <ModeTag mode={agent.run.mode} />
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
              <Button icon={IconBrandWhatsapp} onClick={aprovar}>
                Aprovar e enviar ao Ricardo
              </Button>
              <button className={css.linkBtn} onClick={aprovar}>
                Pular e aprovar o exemplo
              </button>
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
        <PauseCard step="peça outro modelo" title="Precisa de outro relatório?" onSkip={() => pedir("alta")}>
          <p style={{ margin: "0 0 14px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>Peça o modelo que quiser. A Donna monta e preenche com este atendimento.</p>
          <div className={css.options} role="radiogroup" aria-label="Modelo">
            {OPCOES.map((o) => (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={escolha === o.id}
                className={`${css.option} ${escolha === o.id ? css.optionOn : ""}`}
                onClick={() => setEscolha(o.id)}
              >
                <o.icon size={16} style={{ marginTop: 2 }} />
                <span>
                  {o.label}
                  <span className={css.optionSub}>{o.sub}</span>
                </span>
              </button>
            ))}
          </div>
          {escolha === "livre" && (
            <TextField
              value={livre}
              onChange={setLivre}
              label="Como você quer o relatório"
              placeholder="Ex.: relatório para o treinador, sem termos técnicos"
              onEnter={() => pedir("livre")}
              style={{ marginBottom: 12 }}
            />
          )}
          <Button icon={IconSparkles} onClick={() => pedir(escolha)}>
            Montar o modelo
          </Button>
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "live2" || phase === "feito"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="eyebrow">Pedido</span>
            <ModeTag mode={agent.run.mode} />
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
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Button onClick={() => setPhase("scope")}>Seguir</Button>
              <Button variant="ghost" onClick={() => setPhase("pedido")}>
                Pedir outro modelo
              </Button>
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
