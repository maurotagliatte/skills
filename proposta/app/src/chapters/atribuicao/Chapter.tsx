"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import type { Icon } from "@tabler/icons-react";
import {
  IconBrandWhatsapp,
  IconBrandMeta,
  IconBrandGoogle,
  IconUsers,
  IconArrowRight,
  IconClick,
  IconShoppingCart,
  IconLock,
  IconChartLine,
} from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard, AppWindow, Chip, useReveal } from "@/kit";
import { CPA, SEMANAS_DOR, VERBA_SEMANA, brl, EMAIL, FONE_EXIBIDO, FONE_NORM, EM_HASH, PH_HASH, type Modo } from "./dados";

const W = 5300;
const H = 1500;

// Mundo: [legenda + clique × venda] → [WhatsApp → CRM → Meta/Google] → [simulador de CPA]
const BOX = {
  dor: { x: 140, y: 300, w: 1800, h: 860 },
  fluxo: { x: 2100, y: 340, w: 1500, h: 800 },
  sim: { x: 3800, y: 300, w: 1240, h: 900 },
};
const SHOTS: Shot[] = [
  frame(BOX.dor, { hold: 4.6, cue: "dor" }),
  frame(BOX.fluxo, { dur: 1.8, hold: 5.6, cue: "fluxo" }),
  frame(BOX.sim, { dur: 1.8, hold: 0.4, cue: "sim" }),
];
const LIVE_SHOT: Shot = frame(BOX.sim, { region: "left", pad: 40, dur: 1.2 });
const CUES = ["dor", "fluxo", "sim"];

export default function AtribuicaoChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [phase, setPhase] = useState<Phase>("scene");
  const [cue, setCue] = useState("dor");
  const [modo, setModo] = useState<Modo>("clique");
  const [tocou, setTocou] = useState(false);
  const cueIdx = CUES.indexOf(cue);
  const fluxo = useReveal(4 + PAYLOAD.length, 170, { active: cueIdx >= 1 });

  // o card "Sua vez" só aparece quando a câmera para
  const toPause = async () => {
    await stage.current?.goTo(LIVE_SHOT);
    setPhase("pause");
  };
  const escolher = (m: Modo) => {
    setModo(m);
    setTocou(true);
  };
  const exemplo = () => {
    escolher("venda");
    setTimeout(() => setPhase("scope"), 4200);
  };

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        {/* 1 · Clique × venda */}
        <Caption
          x={140}
          y={430}
          w={660}
          eyebrow="09 · Venda real"
          title={"Chega de medir lead\npor clique no WhatsApp."}
          sub="Meça o lead que comprou. Hoje o anúncio aprende com quem abre a conversa; com o CRM ligado, ele passa a aprender com quem fechou a matrícula."
        />
        <Backdrop photo="icm-dourado" x={840} y={300} w={1100} h={860}>
          <AppWindow nav={[]} showSidebar={false} workspace="Anúncios · últimas 8 semanas">
            <Dor />
          </AppWindow>
        </Backdrop>

        {/* 2 · O caminho da venda */}
        <Backdrop photo="icm-noite" x={BOX.fluxo.x} y={BOX.fluxo.y} w={BOX.fluxo.w} h={BOX.fluxo.h} inset="5% 4% -2% 4%">
          <AppWindow nav={[]} showSidebar={false} workspace="Integrações · conversões offline">
            <Fluxo step={fluxo} />
          </AppWindow>
        </Backdrop>

        {/* 3 · Simulador */}
        <Backdrop photo="icm-oliva" x={BOX.sim.x} y={BOX.sim.y} w={BOX.sim.w} h={BOX.sim.h} inset="5% 4% -2% 4%">
          <AppWindow nav={[]} showSidebar={false} workspace="Painel · custo por aquisição">
            <Simulador modo={modo} setModo={escolher} />
          </AppWindow>
        </Backdrop>
      </Stage>

      <Overlay show={phase === "pause"}>
        <PauseCard step="escolha" title="Com o que o anúncio deve aprender?" onSkip={tocou ? undefined : exemplo}>
          <div style={{ display: "grid", gap: 8 }}>
            {(
              [
                ["clique", "Otimizar por clique", "Conversa iniciada no WhatsApp conta como lead.", IconClick],
                ["venda", "Otimizar por venda real", "Só conta quem comprou — o CRM avisa o Meta e o Google.", IconShoppingCart],
              ] as [Modo, string, string, Icon][]
            ).map(([m, t, d, I]) => (
              <button
                key={m}
                onClick={() => escolher(m)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "20px 1fr",
                  gap: 10,
                  textAlign: "left",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${modo === m ? (m === "venda" ? "var(--k-red)" : "#55595c") : "var(--border-dark)"}`,
                  background: modo === m ? "rgba(255,255,255,.06)" : "transparent",
                  color: "var(--text-inv)",
                }}
              >
                <I size={18} color={modo === m ? (m === "venda" ? "var(--k-red)" : "var(--text-inv)") : "var(--text-inv-2)"} />
                <span>
                  <b style={{ fontWeight: 600 }}>{t}</b>
                  <span style={{ display: "block", color: "var(--text-inv-2)", marginTop: 2 }}>{d}</span>
                </span>
              </button>
            ))}
          </div>
          <p style={{ margin: "14px 0 16px", color: "var(--text-inv-2)", lineHeight: 1.5 }}>
            {modo === "clique"
              ? `Mesma verba (${brl(VERBA_SEMANA)}/semana): o custo por venda fica parado em torno de ${brl(CPA.clique[11])}.`
              : `Mesma verba: depois de ~3 semanas de aprendizado, o custo por venda cai para ${brl(CPA.venda[11])} na semana 12.`}
          </p>
          <div>
            <Button icon={IconArrowRight} onClick={() => setPhase("scope")} disabled={!tocou}>
              Ver o que entra no projeto
            </Button>
          </div>
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="09"
          title="Venda real no anúncio"
          items={[
            "Atendimento do WhatsApp integrado ao CRM, com a origem de cada conversa",
            "Venda fechada no CRM enviada como conversão offline ao Meta (Conversions API) e ao Google (Data Manager API)",
            "E-mail e telefone sempre em hash SHA-256: o dado pessoal não sai aberto",
            "Painel de custo por aquisição real, por campanha e origem",
          ]}
          phase="Fase 2"
          metric="Custo por aquisição (venda real)"
          onNext={onNext}
        />
      </Overlay>
    </>
  );
}

/* ——— Cena 1: o que o anúncio conta × o que vende ——— */

function Dor() {
  const conversas = SEMANAS_DOR.reduce((s, w) => s + w.conversas, 0);
  const vendas = SEMANAS_DOR.reduce((s, w) => s + w.vendas, 0);
  const verba = VERBA_SEMANA * SEMANAS_DOR.length;
  const max = 200;
  const BAR_H = 410;
  return (
    <div style={{ padding: "18px 26px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span className="display" style={{ fontSize: 22 }}>
          Lead por clique × lead que comprou
        </span>
        <span style={{ marginLeft: "auto" }}>
          <Chip tone="amber">Simulação ilustrativa</Chip>
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        <Kpi label="Conversas no WhatsApp" value={conversas.toLocaleString("pt-BR")} note="o “lead” que o anúncio conta" />
        <Kpi label="Custo por conversa" value={brl(verba / conversas, 2)} note="parece barato" />
        <Kpi label="Compraram" value={String(vendas)} note={`${((vendas / conversas) * 100).toFixed(1).replace(".", ",")}% das conversas`} accent />
        <Kpi label="Custo por venda" value={brl(verba / vendas)} note="o número que importa" accent />
      </div>
      <div style={{ position: "relative", height: BAR_H + 30, display: "grid", gridTemplateColumns: `repeat(${SEMANAS_DOR.length}, 1fr)`, alignItems: "end", gap: 18, padding: "0 6px", borderBottom: "1px solid var(--border)" }}>
        {SEMANAS_DOR.map((w, i) => (
          <div key={w.s} style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, height: "100%" }}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: (w.conversas / max) * BAR_H }}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: 30, borderRadius: "4px 4px 0 0", background: "#d9dbdc", position: "relative" }}
            >
              <span className="mono" style={{ position: "absolute", top: -18, left: "50%", translate: "-50% 0", fontSize: 10, color: "var(--text-3)" }}>
                {w.conversas}
              </span>
            </motion.div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: (w.vendas / max) * BAR_H }}
              transition={{ duration: 0.9, delay: 0.9 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{ width: 30, borderRadius: "4px 4px 0 0", background: "var(--k-red)", position: "relative" }}
            >
              <span className="mono" style={{ position: "absolute", top: -18, left: "50%", translate: "-50% 0", fontSize: 10, color: "var(--k-red)", fontWeight: 600 }}>
                {w.vendas}
              </span>
            </motion.div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${SEMANAS_DOR.length}, 1fr)`, gap: 18, padding: "6px 6px 0" }}>
        {SEMANAS_DOR.map((w) => (
          <span key={w.s} className="mono" style={{ textAlign: "center", fontSize: 10, color: "var(--text-3)" }}>
            {w.s}
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 20, marginTop: 16, color: "var(--text-2)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "#d9dbdc" }} /> Conversa iniciada pelo anúncio — é para isso que ele otimiza hoje
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--k-red)" }} /> Venda fechada no CRM
        </span>
      </div>
    </div>
  );
}

function Kpi({ label, value, note, accent }: { label: string; value: string; note: string; accent?: boolean }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</div>
      <div className="display" style={{ fontSize: 24, margin: "4px 0 2px", color: accent ? "var(--k-red)" : "var(--text-1)" }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-3)" }}>{note}</div>
    </div>
  );
}

/* ——— Cena 2: WhatsApp → CRM → Meta / Google ——— */

const PAYLOAD = [
  "// Meta Conversions API · POST /{dataset_id}/events",
  "{",
  '  "data": [{',
  '    "event_name": "Purchase",',
  '    "event_time": 1793126520,',
  '    "action_source": "business_messaging",',
  '    "messaging_channel": "whatsapp",',
  '    "user_data": {',
  `      // e-mail normalizado: ${EMAIL} → SHA-256`,
  `      "em": ["${EM_HASH}"],`,
  `      // telefone ${FONE_EXIBIDO} → ${FONE_NORM} → SHA-256`,
  `      "ph": ["${PH_HASH}"],`,
  '      "ctwa_clid": "<id do clique, guardado no CRM>"',
  "    },",
  '    "custom_data": { "currency": "BRL", "value": 1497.00 }',
  "  }]",
  "}",
];

function Code({ line }: { line: string }) {
  if (line.trimStart().startsWith("//")) return <span style={{ color: "#7d8287" }}>{line}</span>;
  const parts = line.split(/("[^"]*")/g);
  return (
    <>
      {parts.map((p, i) => {
        if (!p.startsWith('"')) return <span key={i}>{p}</span>;
        const isKey = parts[i + 1]?.trimStart().startsWith(":");
        const hash = p.length > 60;
        return (
          <span key={i} style={{ color: isKey ? "#9ecbff" : hash ? "#f0a58f" : "#b5e3a1" }}>
            {p}
          </span>
        );
      })}
    </>
  );
}

function Node({ icon: I, title, sub, detail, on, tone }: { icon: Icon; title: string; sub: string; detail: string; on: boolean; tone?: string }) {
  return (
    <motion.div
      animate={{ opacity: on ? 1 : 0.25, y: on ? 0 : 8 }}
      transition={{ duration: 0.5 }}
      style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", background: "#fff", boxShadow: "var(--shadow-card)" }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", background: "#f3f4f4", color: tone ?? "var(--text-1)" }}>
          <I size={17} stroke={1.7} />
        </span>
        <span>
          <b style={{ fontWeight: 600 }}>{title}</b>
          <span style={{ display: "block", fontSize: 11, color: "var(--text-3)" }}>{sub}</span>
        </span>
      </div>
      <div style={{ marginTop: 8, color: "var(--text-2)", lineHeight: 1.45 }}>{detail}</div>
    </motion.div>
  );
}

function Seta({ on }: { on: boolean }) {
  return (
    <motion.span animate={{ opacity: on ? 1 : 0.2 }} style={{ display: "grid", placeItems: "center", color: "var(--k-red)" }}>
      <IconArrowRight size={20} />
    </motion.span>
  );
}

function Fluxo({ step }: { step: number }) {
  const lines = Math.max(0, step - 4);
  return (
    <div style={{ padding: "18px 26px", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
        <span className="display" style={{ fontSize: 22 }}>
          A venda volta para o anúncio
        </span>
        <span style={{ color: "var(--text-3)" }}>quando a matrícula fecha no CRM, o Meta e o Google ficam sabendo</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 32px 1fr 32px 1.1fr", alignItems: "center", gap: 6 }}>
        <Node icon={IconBrandWhatsapp} tone="#1f8a4c" title="WhatsApp" sub="anúncio de clique para conversa" detail="A aluna clica no anúncio e chama. O CRM guarda o identificador do clique (ctwa_clid)." on={step >= 1} />
        <Seta on={step >= 2} />
        <Node icon={IconUsers} title="CRM" sub="atendimento e venda" detail="Atendimento no próprio CRM. Matrícula paga: venda fechada, R$ 1.497." on={step >= 2} tone="var(--gg-wine)" />
        <Seta on={step >= 3} />
        <div style={{ display: "grid", gap: 8 }}>
          <Node icon={IconBrandMeta} tone="#0b66c3" title="Meta · Conversions API" sub="evento Purchase" detail="O algoritmo passa a buscar gente parecida com quem comprou." on={step >= 3} />
          <Node icon={IconBrandGoogle} title="Google · Data Manager API" sub="conversão offline · leads otimizados" detail="Mesma venda, com gclid quando houver e dados em hash." on={step >= 4} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginTop: 18 }}>
        <div style={{ background: "#141515", borderRadius: 12, padding: "14px 16px", minHeight: 360, overflow: "hidden" }}>
          <pre className="mono" style={{ margin: 0, fontSize: 11.5, lineHeight: 1.62, color: "#e6e6e6", whiteSpace: "pre" }}>
            {PAYLOAD.slice(0, lines).map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
                <Code line={l} />
              </motion.div>
            ))}
          </pre>
        </div>
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
              <IconLock size={16} /> Dado pessoal em hash
            </div>
            <div style={{ marginTop: 6, color: "var(--text-2)", lineHeight: 1.5 }}>
              E-mail e telefone são normalizados e transformados em SHA-256 antes de sair do CRM. O Meta e o Google só comparam hashes.
            </div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
              <IconBrandGoogle size={16} /> No Google
            </div>
            <div style={{ marginTop: 6, color: "var(--text-2)", lineHeight: 1.5 }}>
              Conversões offline e leads otimizados (Enhanced Conversions for Leads) são enviados pela Data Manager API, o caminho atual desde 15/06/2026.
            </div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600 }}>
              <IconChartLine size={16} /> O que muda
            </div>
            <div style={{ marginTop: 6, color: "var(--text-2)", lineHeight: 1.5 }}>A campanha deixa de premiar quem só clica e passa a premiar quem compra.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ——— Cena 3: simulador ——— */

const CH_W = 1010;
const CH_H = 480;
const Y_MIN = 150;
const Y_MAX = 420;
const cx = (i: number) => 56 + (i / 11) * (CH_W - 90);
const cy = (v: number) => 16 + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * (CH_H - 50);
const pathOf = (vs: number[]) => vs.map((v, i) => `${i ? "L" : "M"} ${cx(i).toFixed(1)} ${cy(v).toFixed(1)}`).join(" ");

function Simulador({ modo, setModo }: { modo: Modo; setModo: (m: Modo) => void }) {
  const serie = CPA[modo];
  const outra: Modo = modo === "clique" ? "venda" : "clique";
  const vendasSem = VERBA_SEMANA / serie[11];
  const vendasClique = VERBA_SEMANA / CPA.clique[11];
  return (
    <div style={{ padding: "18px 26px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span className="display" style={{ fontSize: 22 }}>
          Custo por aquisição · venda real
        </span>
        <span style={{ marginLeft: "auto", display: "flex", padding: 3, borderRadius: 10, background: "#f3f4f4", border: "1px solid var(--border)" }}>
          {(
            [
              ["clique", "Otimizar por clique"],
              ["venda", "Otimizar por venda real"],
            ] as [Modo, string][]
          ).map(([m, t]) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              style={{
                height: 30,
                padding: "0 12px",
                border: 0,
                borderRadius: 7,
                fontWeight: 500,
                background: modo === m ? "#fff" : "transparent",
                boxShadow: modo === m ? "var(--shadow-card)" : "none",
                color: modo === m ? (m === "venda" ? "var(--k-red)" : "var(--text-1)") : "var(--text-3)",
              }}
            >
              {t}
            </button>
          ))}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        <Kpi label="Custo por venda · semana 12" value={brl(serie[11])} note={modo === "venda" ? `${Math.round((1 - serie[11] / CPA.clique[11]) * 100)}% menor que por clique` : "estável, sem aprender"} accent={modo === "venda"} />
        <Kpi label="Vendas por semana" value={vendasSem.toFixed(1).replace(".", ",")} note={modo === "venda" ? `antes ${vendasClique.toFixed(1).replace(".", ",")}` : "com a mesma verba"} accent={modo === "venda"} />
        <Kpi label="Verba" value={`${brl(VERBA_SEMANA)}/sem.`} note="igual nos dois cenários" />
      </div>
      <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 6px 6px", position: "relative" }}>
        <svg width={CH_W} height={CH_H} style={{ display: "block" }}>
          {[150, 200, 250, 300, 350, 400].map((v) => (
            <g key={v}>
              <line x1={56} x2={CH_W - 30} y1={cy(v)} y2={cy(v)} stroke="#eceeef" />
              <text x={48} y={cy(v) + 4} textAnchor="end" fontSize={10} fill="#8a8d90" fontFamily="var(--font-mono)">
                {v}
              </text>
            </g>
          ))}
          <rect x={cx(0)} y={10} width={cx(3) - cx(0)} height={CH_H - 44} fill={modo === "venda" ? "rgba(199,124,2,.07)" : "transparent"} />
          {modo === "venda" && (
            <text x={cx(0) + 8} y={30} fontSize={10.5} fill="#8a5300" fontFamily="var(--font-ui)">
              fase de aprendizado
            </text>
          )}
          {CPA.clique.map((_, i) => (
            <text key={i} x={cx(i)} y={CH_H - 12} textAnchor="middle" fontSize={10} fill="#8a8d90" fontFamily="var(--font-mono)">
              S{i + 1}
            </text>
          ))}
          <path d={pathOf(CPA[outra])} fill="none" stroke="#c4c7c9" strokeWidth={1.5} strokeDasharray="4 4" />
          <motion.path
            key={modo}
            d={pathOf(serie)}
            fill="none"
            stroke={modo === "venda" ? "var(--k-red)" : "var(--text-1)"}
            strokeWidth={2.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.circle key={`c${modo}`} cx={cx(11)} cy={cy(serie[11])} r={4.5} fill={modo === "venda" ? "var(--k-red)" : "var(--text-1)"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} />
          <motion.text
            key={`t${modo}`}
            x={cx(11) - 10}
            y={cy(serie[11]) - 12}
            textAnchor="end"
            fontSize={12}
            fontWeight={600}
            fill={modo === "venda" ? "var(--k-red)" : "var(--text-1)"}
            fontFamily="var(--font-ui)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {brl(serie[11])}
          </motion.text>
        </svg>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color: "var(--text-3)", fontSize: 12 }}>
        <span>Custo por venda fechada (R$) em 12 semanas · linha tracejada: o outro cenário</span>
        <span>Simulação ilustrativa — os números reais vêm do seu painel</span>
      </div>
    </div>
  );
}
