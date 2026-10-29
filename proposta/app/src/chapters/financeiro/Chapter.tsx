"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload, IconDownload } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard, Cursor } from "@/kit";
import { useAgent } from "@/agent/useAgent";
import { Sheet } from "./Sheet";
import { Payables, type Activity } from "./Payables";
import { LockScreen } from "./LockScreen";
import { EXEMPLOS, type Alerta, type Comprovante } from "./agent";

const W = 4700;
const H = 1500;

// Mundo: [planilha digitada à mão] → [virada: o comprovante] → [contas a pagar] → [celular]
const BOX = {
  antes: { x: 140, y: 170, w: 1180, h: 1190 },
  virada: { x: 1430, y: 250, w: 1250, h: 1020 },
  sistema: { x: 2760, y: 300, w: 1180, h: 900 },
  alerta: { x: 3330, y: 300, w: 1250, h: 900 },
};
const SHOTS: Shot[] = [
  frame(BOX.antes, { hold: 4.6, cue: "antes" }),
  frame(BOX.virada, { dur: 1.8, hold: 3.2, cue: "virada" }),
  frame(BOX.sistema, { dur: 1.9, hold: 0.5, cue: "sistema" }),
];
const LIVE_SHOT: Shot = frame(BOX.sistema, { region: "left", pad: 40, dur: 1.2 });
const ALERT_SHOT: Shot = frame(BOX.alerta, { dur: 1.6 });

type Step = Phase | "alerta";
type Envio = { src: string; own: boolean };

/** Reduz a imagem no navegador (≤ 1600 px) e devolve um data URL JPEG. */
async function toDataUrl(blob: Blob): Promise<string> {
  const bmp = await createImageBitmap(blob);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return c.toDataURL("image/jpeg", 0.85);
}

export default function FinanceiroChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const file = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Step>("scene");
  const [cue, setCue] = useState("antes");
  const [envio, setEnvio] = useState<Envio | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [noCelular, setNoCelular] = useState(false);
  const agent = useAgent();

  const extr = agent.tool("extrair_comprovante");
  const alerta = agent.tool("agendar_alerta");
  const novo = (extr?.args ?? {}) as Partial<Comprovante>;
  const push = alerta?.done ? ((alerta.args ?? {}) as Partial<Alerta>) : undefined;
  const live = phase !== "scene" && phase !== "pause";

  const activity: Activity = [];
  if (envio && live) activity.push({ label: extr?.done ? "Comprovante lido e lançado" : "Lendo o comprovante…", done: !!extr?.done });
  if (alerta && live) activity.push({ label: alerta.done ? `Alerta agendado · ${alerta.args?.quando ?? ""}` : "Agendando alerta…", done: alerta.done });

  // terminou: mostra o celular recebendo o push, depois o cartão de escopo
  useEffect(() => {
    if (phase === "live" && agent.run.status === "done") {
      const t = setTimeout(async () => {
        setPhase("alerta");
        await stage.current?.goTo(ALERT_SHOT);
        setNoCelular(true);
      }, 1600);
      return () => clearTimeout(t);
    }
    if (phase === "alerta") {
      const t = setTimeout(async () => {
        setPhase("scope");
        await stage.current?.goTo(LIVE_SHOT);
      }, 5200);
      return () => clearTimeout(t);
    }
  }, [phase, agent.run.status]);

  const toPause = async () => {
    setPhase("pause");
    await stage.current?.goTo(LIVE_SHOT);
  };

  const send = (src: string, own: boolean, text?: string, image?: string) => {
    setEnvio({ src, own });
    setPhase("live");
    // com imagem própria e chave da API, o Claude lê a foto; sem chave, cai no roteiro do primeiro exemplo
    agent.start({ chapter: "financeiro", text, image, demo: !image });
  };

  const pickExample = async (i: number) => {
    const ex = EXEMPLOS[i];
    let image: string | undefined;
    try {
      image = await toDataUrl(await (await fetch(ex.arquivo)).blob());
    } catch {
      image = undefined;
    }
    send(ex.arquivo, false, `exemplo:${ex.id}`, image);
  };

  const onFile = async (f?: File) => {
    if (!f) return;
    try {
      const data = await toDataUrl(f);
      send(data, true, undefined, data);
    } catch {
      setErro("Não consegui abrir essa imagem (HEIC?). Tente JPG ou PNG — ou escolha um exemplo.");
    }
  };

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        {/* 1 · Antes: planilha digitada à mão */}
        <Caption
          x={140}
          y={170}
          eyebrow="02 · Financeiro"
          title={"Hoje, cada boleto\nvira digitação."}
          sub="Fornecedor, vencimento, valor — uma célula de cada vez, à noite, depois do último atendimento. E um erro de digitação passa fácil."
        />
        <Backdrop photo="icm-areia" x={140} y={640} w={1180} h={720}>
          <Sheet playing={cue === "antes"} />
        </Backdrop>

        {/* 2 · Virada */}
        <Caption
          x={1460}
          y={330}
          w={560}
          title={"E se o comprovante\nvirasse lançamento?"}
          sub="Uma foto do boleto ou do recibo. A Donna lê, lança em contas a pagar e avisa antes de vencer."
          show={cue !== "antes"}
        />
        <Backdrop photo="icm-dourado" x={2060} y={250} w={620} h={1020}>
          <motion.div
            animate={{ rotate: cue === "antes" ? -2 : -5, y: cue === "antes" ? 30 : 0 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: "absolute", left: "2%", right: "2%", top: "22%", boxShadow: "var(--shadow-window)", borderRadius: 6, overflow: "hidden", background: "#fff" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/comprovantes/casa-do-cavalo.png" alt="Boleto fictício da Casa do Cavalo Agropecuária" style={{ display: "block", width: "100%" }} />
            {cue !== "antes" && (
              <motion.div
                initial={{ top: "0%" }}
                animate={{ top: ["0%", "96%", "0%"] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", left: 0, right: 0, height: 3, background: "var(--k-red)", boxShadow: "0 0 18px 4px rgba(235,49,2,.45)" }}
              />
            )}
          </motion.div>
          {cue !== "antes" && <Cursor x={300} y={560} label="Donna" />}
        </Backdrop>

        {/* 3 · Contas a pagar no sistema */}
        <Backdrop photo="icm-oliva" x={2760} y={300} w={1180} h={900} inset="5% 4% -2% 4%">
          <Payables novo={live ? novo : {}} showNew={live && !!extr} activity={activity} />
        </Backdrop>

        {/* 4 · Celular: o push da Donna */}
        <motion.div animate={{ opacity: phase === "alerta" ? 1 : 0 }} transition={{ duration: 0.8 }}>
          <Backdrop photo="icm-noite" x={4020} y={300} w={560} h={900} inset="6% 9% 6% 9%">
            <LockScreen alerta={phase === "alerta" && noCelular ? push : undefined} />
          </Backdrop>
        </motion.div>
      </Stage>

      <Overlay show={phase === "pause"}>
        <PauseCard step="envie um comprovante" title="Envie a foto de um comprovante, boleto ou recibo." onSkip={() => pickExample(0)}>
          <p style={{ margin: "0 0 14px", color: "var(--text-inv-2)", lineHeight: 1.55 }}>
            Pode ser uma conta real do consultório. A imagem é processada e descartada — nada fica salvo.
          </p>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          <Button icon={IconUpload} onClick={() => file.current?.click()}>
            Enviar foto
          </Button>
          {erro && <p style={{ color: "#f3a38c", margin: "10px 0 0" }}>{erro}</p>}
          <div className="mono" style={{ margin: "18px 0 8px", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-inv-2)" }}>
            ou use um dos nossos exemplos
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {EXEMPLOS.map((ex, i) => (
              <div key={ex.id} style={{ display: "grid", gap: 6 }}>
                <button
                  onClick={() => pickExample(i)}
                  title={`Usar o exemplo: ${ex.comprovante.fornecedor}`}
                  style={{ padding: 0, border: "1px solid var(--border-dark)", borderRadius: 8, overflow: "hidden", background: "#fff", height: 78 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ex.arquivo} alt={ex.comprovante.fornecedor} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top left", display: "block" }} />
                </button>
                <span style={{ fontSize: 12, color: "var(--text-inv)", lineHeight: 1.25 }}>{ex.rotulo}</span>
                <a href={ex.arquivo} download style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-inv-2)" }}>
                  <IconDownload size={12} /> baixar
                </a>
              </div>
            ))}
          </div>
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <div style={{ width: 380, padding: 20, borderRadius: 16, background: "rgba(17,18,18,.86)", backdropFilter: "blur(24px)", border: "1px solid var(--border-dark)", color: "var(--text-inv)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="eyebrow">Comprovante enviado</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          <div style={{ position: "relative", height: 200, borderRadius: 10, overflow: "hidden", background: "#fff" }}>
            {envio && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={envio.src} alt="Comprovante enviado" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
            )}
            {!extr?.done && (
              <motion.div
                animate={{ top: ["2%", "96%", "2%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ position: "absolute", left: 0, right: 0, height: 2, background: "var(--k-red)", boxShadow: "0 0 14px 3px rgba(235,49,2,.45)" }}
              />
            )}
          </div>
          {envio?.own && agent.run.mode === "demo" && (
            <p style={{ margin: "12px 0 0", fontSize: 12, color: "var(--text-inv-2)" }}>Sem o agente ao vivo nesta sessão: mostramos a leitura de um comprovante de exemplo.</p>
          )}
          {agent.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.55 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
        </div>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="02"
          title="Financeiro"
          items={[
            "Contas a pagar e a receber da clínica e dos cursos",
            "Leitura de comprovantes, boletos e recibos por foto",
            "Alertas no app antes de cada vencimento",
            "Conciliação com o extrato e relatórios mensais",
          ]}
          phase="Fase 1"
          metric="Lançamentos digitados à mão por mês"
          onNext={onNext}
        />
      </Overlay>
    </>
  );
}
