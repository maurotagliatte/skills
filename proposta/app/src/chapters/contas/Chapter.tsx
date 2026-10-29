"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconSend, IconCash, IconFileText } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { AdvanceCard, Backdrop, Button, ScopeCard, Cursor, LiveCard } from "@/kit";
import ThoughtLine from "@/kit/rb/ThoughtLine/ThoughtLine";
import StatusMark from "@/kit/rb/StatusMark/StatusMark";
import { useAgent } from "@/agent/useAgent";
import { LockScreen, type LockNotification } from "@/chapters/atendimento/LockScreen";
import { Sheet } from "./Sheet";
import { Contas, type EnvioCobranca } from "./Contas";
import { EXEMPLOS, type Alerta, type Cobranca, type Comprovante } from "./agent";

// a cobrança do Ferrador Silva, a mesma da cena
const EXEMPLO = EXEMPLOS[0];

const W = 4700;
const H = 1500;

// Mundo: [planilha digitada à mão] → [virada: a foto da cobrança] → [contas] → [celular bloqueado]
const BOX = {
  antes: { x: 140, y: 170, w: 1180, h: 1190 },
  virada: { x: 1430, y: 250, w: 1250, h: 1020 },
  sistema: { x: 2760, y: 320, w: 1180, h: 820 },
  alerta: { x: 3330, y: 300, w: 1250, h: 900 },
  // coluna "A enviar ao cliente" da janela de contas
  cobranca: { x: 3280, y: 330, w: 680, h: 840 },
};
const SHOTS: Shot[] = [
  frame(BOX.antes, { hold: 4.4, cue: "antes" }),
  frame(BOX.virada, { dur: 1.8, hold: 3.0, cue: "virada" }),
  frame(BOX.sistema, { dur: 1.9, hold: 0.6, cue: "sistema" }),
];
const LIVE_SHOT: Shot = frame(BOX.sistema, { region: "left", pad: 40, dur: 1.2 });
const ALERT_SHOT: Shot = frame(BOX.alerta, { dur: 1.6 });
const COBRANCA_SHOT: Shot = frame(BOX.cobranca, { region: "left", pad: 40, dur: 1.6 });

/**
 * scene → pause ("Lançar o boleto") → live (lendo e lançando) → alerta (tela de bloqueio na véspera)
 * → cobranca (a Donna prepara a cobrança do Ricardo; "Enviar ao Ricardo") → scope.
 * "volta" e "ida" são as viagens de câmera entre um passo e outro: nenhum card aparece com a câmera andando.
 */
type Step = Phase | "alerta" | "ida" | "cobranca";
export default function ContasChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [phase, setPhase] = useState<Step>("scene");
  const [cue, setCue] = useState("antes");
  const [noCelular, setNoCelular] = useState(false);
  const [cobrancaEnvio, setCobrancaEnvio] = useState<"pronta" | "enviando" | "enviada">("pronta");
  const conta = useAgent();
  const cobrar = useAgent();
  const startCobrar = cobrar.start;

  const extr = conta.tool("extrair_comprovante");
  const alerta = conta.tool("agendar_alerta");
  const prep = cobrar.tool("preparar_cobranca");
  const novo = (extr?.args ?? {}) as Partial<Comprovante>;
  const push = alerta?.done ? ((alerta.args ?? {}) as Partial<Alerta>) : undefined;
  const cob = (prep?.args ?? {}) as Partial<Cobranca>;
  const lancou = phase !== "scene" && phase !== "pause";
  const estadoCobranca: EnvioCobranca | undefined = !prep ? undefined : cobrancaEnvio === "enviada" ? "enviada" : prep.done ? "pronta" : "preparando";

  // passos da Donna (ThoughtLine)
  const passos: string[] = [];
  if (lancou) passos.push("Lendo a foto de exemplo");
  if (extr) passos.push(extr.done ? `Lançado em contas a pagar · ${novo.valor ?? ""}` : "Lançando em contas a pagar");
  if (alerta) passos.push(alerta.done ? "Aviso marcado para a véspera, às 8h" : "Marcando o aviso");
  const lendo = conta.run.status !== "done";

  // tela de bloqueio do cap. 01: o mesmo celular que grava é o que avisa
  const avisos: LockNotification[] = [
    ...(noCelular && push?.titulo ? [{ id: "aviso", app: "Contas", icon: IconCash, quando: "agora", titulo: push.titulo, texto: push.mensagem, nova: true }] : []),
    { id: "relatorio", app: "Atendimento", icon: IconFileText, quando: "segunda", titulo: "Relatório do Trovão enviado ao Ricardo", cor: "#3a3d40" },
  ];

  // terminou de lançar: o celular recebe o aviso na véspera; depois, a outra ponta (cobrar o cliente)
  useEffect(() => {
    if (phase === "live" && conta.run.status === "done") {
      const t = setTimeout(async () => {
        setPhase("alerta");
        await stage.current?.goTo(ALERT_SHOT);
        setNoCelular(true);
      }, 1800);
      return () => clearTimeout(t);
    }
    if (phase === "alerta" && noCelular) {
      const t = setTimeout(async () => {
        setPhase("ida");
        startCobrar({ chapter: "contas", options: { acao: "cobranca" } });
        await stage.current?.goTo(COBRANCA_SHOT);
        setPhase("cobranca");
      }, 4600);
      return () => clearTimeout(t);
    }
  }, [phase, conta.run.status, noCelular, startCobrar]);

  // enviada: o cartão de escopo vem depois de um respiro
  useEffect(() => {
    if (cobrancaEnvio === "enviando") {
      const t = setTimeout(() => setCobrancaEnvio("enviada"), 1100);
      return () => clearTimeout(t);
    }
    if (cobrancaEnvio === "enviada" && phase === "cobranca") {
      const t = setTimeout(async () => {
        setPhase("ida");
        await stage.current?.goTo(LIVE_SHOT);
        setPhase("scope");
      }, 2400);
      return () => clearTimeout(t);
    }
  }, [cobrancaEnvio, phase]);

  // o primeiro card só aparece quando a câmera para
  const toPause = async () => {
    await stage.current?.goTo(LIVE_SHOT);
    setPhase("pause");
  };

  const lancar = () => {
    setPhase("live");
    conta.start({ chapter: "contas", text: `exemplo:${EXEMPLO.id}`, options: { acao: "comprovante" }, demo: true });
  };

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        {/* 1 · Antes: planilha digitada à mão */}
        <Caption
          x={140}
          y={170}
          eyebrow="02 · Contas"
          title={"Cada boleto\nvira digitação."}
          sub="Na mesma noite do atendimento: fornecedor, vencimento e valor, uma célula por vez. E um boleto que chegou no WhatsApp fica para trás."
        />
        <Backdrop photo="icm-areia" x={140} y={640} w={1180} h={720}>
          <Sheet playing={cue === "antes"} />
        </Backdrop>

        {/* 2 · Virada: a foto da cobrança do ferrador */}
        <Caption
          x={1460}
          y={330}
          w={560}
          title={"Uma foto e\na conta está lançada."}
          sub="Boleto, recibo ou cobrança por PIX. A Donna lê, lança e avisa você na véspera."
          show={cue !== "antes"}
        />
        <Backdrop photo="icm-dourado" x={2060} y={250} w={620} h={1020}>
          <motion.div
            animate={{ rotate: cue === "antes" ? -2 : -4, y: cue === "antes" ? 30 : 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", left: "3%", right: "3%", top: "16%", boxShadow: "var(--shadow-window)", borderRadius: 6, overflow: "hidden", background: "#fff" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/comprovantes/ferrador-silva.png" alt="Cobrança fictícia do Ferrador Silva" style={{ display: "block", width: "100%" }} />
            {cue === "virada" && (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "96%", "0%"] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", left: 0, right: 0, height: 3, background: "var(--k-red)", boxShadow: "0 0 18px 4px rgba(235,49,2,.45)" }}
              />
            )}
          </motion.div>
          {cue !== "antes" && <Cursor x={330} y={620} label="Donna" />}
        </Backdrop>

        {/* 3 · Contas: a pagar e a enviar ao cliente */}
        <Backdrop photo="icm-oliva" x={2760} y={320} w={1180} h={820} inset="5% 4% -2% 4%">
          <Contas novo={lancou ? novo : {}} showNew={lancou && !!extr} cobranca={cob} envio={estadoCobranca} />
        </Backdrop>

        {/* 4 · Celular bloqueado: o aviso na véspera */}
        <motion.div animate={{ opacity: phase === "alerta" ? 1 : 0 }} transition={{ duration: 0.6 }}>
          <Backdrop photo="icm-noite" x={4020} y={300} w={560} h={900} inset="6% 9% 6% 9%">
            <LockScreen hora="08:00" data="quinta-feira, 12 de novembro" notificacoes={avisos} />
          </Backdrop>
        </motion.div>
      </Stage>

      <Overlay show={phase === "pause"}>
        <AdvanceCard title="A cobrança do ferrador chegou no WhatsApp." label="Lançar a conta" onAdvance={lancar}>
          Boleto, recibo ou PIX: basta a foto.
        </AdvanceCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="eyebrow">A foto</span>
          </div>
          <div style={{ position: "relative", height: 190, borderRadius: 10, overflow: "hidden", background: "#fff" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={EXEMPLO.arquivo} alt={EXEMPLO.rotulo} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            {!extr?.done && (
              <motion.div
                animate={{ top: ["2%", "96%", "2%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", left: 0, right: 0, height: 2, background: "var(--k-red)", boxShadow: "0 0 14px 3px rgba(235,49,2,.45)" }}
              />
            )}
          </div>
          <div style={{ marginTop: 14 }}>
            <ThoughtLine
              label="A Donna está lendo…"
              doneLabel="Conta lançada"
              steps={passos}
              working={lendo}
              showTimer={false}
              collapsible={false}
              collapseOnSettle={false}
              fontSize={14}
              color="var(--text-inv)"
              glyphColor="var(--k-red)"
            />
          </div>
          {conta.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.55 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {conta.run.text}
            </p>
          )}
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "cobranca"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">A outra ponta</span>
          </div>
          <div className="display" style={{ fontSize: 22, marginBottom: 12 }}>
            {cobrancaEnvio === "enviada" ? "Cobrança enviada ao Ricardo." : "A cobrança do Ricardo, pronta para enviar."}
          </div>
          <ThoughtLine
            label="Montando a cobrança do atendimento…"
            doneLabel="Valor, vencimento e link de pagamento prontos"
            working={!prep?.done}
            showTimer={false}
            collapsible={false}
            fontSize={14}
            color="var(--text-inv)"
            glyphColor="var(--k-red)"
          />
          {cobrar.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.55 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {cobrar.run.text}
            </p>
          )}
          <div style={{ marginTop: 16, minHeight: 38, display: "flex", alignItems: "center" }}>
            {cobrancaEnvio === "pronta" ? (
              <Button icon={IconSend} disabled={!prep?.done} onClick={() => setCobrancaEnvio("enviando")} advance>
                Enviar ao Ricardo
              </Button>
            ) : (
              <StatusMark
                status={cobrancaEnvio === "enviada" ? "done" : "running"}
                label={cobrancaEnvio === "enviada" ? "Enviada ao Ricardo, com o link de pagamento" : "Enviando pelo WhatsApp…"}
                color="var(--text-inv)"
                doneColor="#2fd27a"
                strike={false}
                fontSize={14}
              />
            )}
          </div>
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="02"
          title="Contas"
          items={[
            "Foto do boleto, recibo ou PIX vira conta lançada",
            "Aviso no celular na véspera de cada vencimento",
            "Cobranças a enviar ao cliente: a Donna prepara com o link de pagamento, você envia com um toque",
            "Orçamentos aprovados e não aprovados; o aprovado vira conta a receber",
            "Contas a receber: quanto cada cliente deve e desde quando",
            "Conferência com o extrato do banco e resumo do mês",
            "Histórico trazido do sistema atual",
          ]}
          phase="Fase 1"
          metric="Contas lançadas sem digitar, por mês"
          onNext={onNext}
          nextLabel="Próximo: o Ricardo mandou mensagem"
        />
      </Overlay>
    </>
  );
}
