"use client";

import { motion } from "motion/react";
import { AppWindow, Chip } from "@/kit";
import Counter from "@/kit/rb/Counter/Counter";
import { SIM, VERBA_MES, brl, serieSim, type Modo, type Periodo } from "./data";

const CW = 960;
const CH = 450;
const Y_MIN = 300;
const Y_MAX = 700;
const L = 56;
const R = 150;

/** O anúncio aprendendo com quem comprou: custo por aluno na mesma verba. Simulação ilustrativa. */
export function Simulacao({ modo, periodo, tocou }: { modo: Modo; periodo: Periodo; tocou: boolean }) {
  const atual = serieSim(modo, periodo);
  const outro = serieSim(modo === "venda" ? "conversa" : "venda", periodo);
  const n = atual.length;
  const x = (i: number) => L + (n === 1 ? 0 : (i / (n - 1)) * (CW - L - R));
  const y = (v: number) => 20 + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * (CH - 60);
  const path = (s: { valor: number }[]) => s.map((p, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(p.valor).toFixed(1)}`).join(" ");
  const fim = atual[n - 1].valor;
  const inicio = SIM.conversa[0];
  const cor = modo === "venda" ? "var(--k-red)" : "var(--text-1)";
  const aprendizado = periodo === "semana" ? x(3) - x(0) : (x(1) - x(0)) * 0.75;

  return (
    <AppWindow nav={[]} showSidebar={false} workspace="Números · anúncios">
      <div style={{ padding: "20px 28px", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span className="display" style={{ fontSize: 24 }}>
            O anúncio aprendendo com quem comprou
          </span>
          <span style={{ marginLeft: "auto" }}>
            <Chip tone="amber">Simulação</Chip>
          </span>
        </div>
        <div style={{ color: "var(--text-2)", marginBottom: 18, maxWidth: 720 }}>
          Mesma verba nos dois cenários: {brl(VERBA_MES)} por mês nos anúncios A e B. Os números reais vêm do seu painel depois da integração.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
          <div style={{ border: `1px solid ${modo === "venda" ? "rgba(235,49,2,.35)" : "var(--border)"}`, borderRadius: 12, padding: "12px 16px", transition: "border-color .4s" }}>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>Custo por aluno que comprou · {periodo === "semana" ? "semana 12" : "mês 3"}</div>
            <div className="display" style={{ marginTop: 4, color: cor, transition: "color .4s" }}>
              <Counter value={Math.round(fim)} prefix="R$ " fontSize={34} fontWeight={430} locale="pt-BR" textColor="currentColor" duration={0.9} />
            </div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>No começo</div>
            <div className="display" style={{ fontSize: 34, marginTop: 4 }}>
              {brl(inicio)}
            </div>
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px" }}>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>O anúncio aprende com</div>
            <div className="display" style={{ fontSize: 24, marginTop: 10 }}>
              {modo === "venda" ? "quem comprou" : "quem abriu conversa"}
            </div>
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <svg width={CW} height={CH} style={{ display: "block", overflow: "visible" }} role="img" aria-label={`Custo por aluno em ${n} ${periodo === "semana" ? "semanas" : "meses"}: de ${brl(atual[0].valor)} para ${brl(fim)}`}>
            {[300, 400, 500, 600, 700].map((v) => (
              <g key={v}>
                <line x1={L} x2={CW - R} y1={y(v)} y2={y(v)} stroke="#eceeef" />
                <text x={L - 8} y={y(v) + 4} textAnchor="end" fontSize={11} fill="#8a8d90" fontFamily="var(--font-ui)">
                  {v}
                </text>
              </g>
            ))}
            {modo === "venda" && (
              <g>
                <rect x={x(0)} y={14} width={aprendizado} height={CH - 54} fill="rgba(199,124,2,.08)" />
                <text x={x(0) + 8} y={32} fontSize={12} fill="#8a5300" fontFamily="var(--font-ui)">
                  aprendendo
                </text>
              </g>
            )}
            {atual.map((p, i) => (
              <text key={p.rotulo} x={x(i)} y={CH - 16} textAnchor="middle" fontSize={11} fill="#8a8d90" fontFamily="var(--font-ui)">
                {p.rotulo}
              </text>
            ))}
            <path d={path(outro)} fill="none" stroke="#c4c7c9" strokeWidth={2} strokeDasharray="4 5" />
            <text x={x(n - 1) + 10} y={y(outro[n - 1].valor) + 4} fontSize={12} fill="#8a8d90" fontFamily="var(--font-ui)">
              {modo === "venda" ? "aprende com quem chama" : "aprende com quem compra"}
            </text>
            <motion.path
              key={modo + periodo}
              d={path(atual)}
              fill="none"
              stroke={cor}
              strokeWidth={2.5}
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
            <circle cx={x(n - 1)} cy={y(fim)} r={5} fill={cor} stroke="#fff" strokeWidth={2} />
            <text x={x(n - 1) + 10} y={y(fim) + 4} fontSize={12} fontWeight={600} fill="var(--text-1)" fontFamily="var(--font-ui)">
              {modo === "venda" ? "aprende com quem compra" : "aprende com quem chama"}
            </text>
          </svg>
        </div>

        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid var(--border)", color: "var(--text-2)", minHeight: 40 }}>
          {!tocou
            ? "Custo por aluno que comprou (R$). A linha tracejada é o outro cenário."
            : modo === "venda"
              ? "Na simulação, com a mesma verba, o custo por aluno cai depois de umas três semanas de aprendizado."
              : "Aprendendo só com quem abre conversa, o custo por aluno fica parado, com a mesma verba."}
        </div>
      </div>
    </AppWindow>
  );
}
