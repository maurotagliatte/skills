"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { IconArrowRight, IconCircleCheckFilled, IconClockHour4 } from "@tabler/icons-react";
import { BrandLogo, Button, Chip } from "@/kit";
import { MODULOS, FASES, INVESTIMENTO, A_DEFINIR, type Fase } from "./escopo";

const TABS = ["Escopo", "Fases", "Investimento", "Aceite"] as const;
type Tab = (typeof TABS)[number];

/** Valor de proposta; "a definir" aparece marcado, para ninguém confundir com número fechado. */
function Valor({ v, big }: { v: string; big?: boolean }) {
  if (v.trim().toLowerCase() !== A_DEFINIR)
    return (
      <span className={big ? "display" : undefined} style={big ? { fontSize: 22 } : { fontWeight: 500 }}>
        {v}
      </span>
    );
  return (
    <span
      className="mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: big ? 28 : 22,
        padding: "0 9px",
        borderRadius: 6,
        border: "1px dashed #d9a441",
        background: "var(--amber-soft)",
        color: "#8a5300",
        fontSize: big ? 12 : 11,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <IconClockHour4 size={12} /> a definir
    </span>
  );
}

const faseTone = (f: Fase) => (f === 1 ? "red" : f === 2 ? "dark" : "neutral") as "red" | "dark" | "neutral";

export function Proposta() {
  const [tab, setTab] = useState<Tab>("Escopo");
  const next = TABS[TABS.indexOf(tab) + 1];

  return (
    <div
      style={{
        width: "min(1160px, calc(100vw - 80px))",
        height: "min(700px, calc(100vh - 160px))",
        background: "#fff",
        color: "var(--text-1)",
        borderRadius: 20,
        boxShadow: "0 40px 120px -30px rgba(0,0,0,.8)",
        display: "grid",
        gridTemplateRows: "auto auto 1fr auto",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, padding: "26px 32px 16px" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Proposta · Plataforma Gabriela Guenka
          </div>
          <div className="display" style={{ fontSize: 32 }}>
            Nove módulos, um sistema, em três fases.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-3)" }}>
          <BrandLogo brand="khard" height={22} />
          <span>para</span>
          <BrandLogo brand="guenka" height={44} />
        </div>
      </div>

      {/* abas com sublinhado (gramática das LPs da Plane) */}
      <div role="tablist" style={{ display: "flex", gap: 26, padding: "0 32px", borderBottom: "1px solid var(--border)" }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            role="tab"
            aria-selected={t === tab}
            onClick={() => setTab(t)}
            style={{ position: "relative", background: "none", border: 0, padding: "10px 0 12px", fontSize: 14, fontWeight: 500, color: t === tab ? "var(--text-1)" : "var(--text-3)" }}
          >
            <span className="mono" style={{ fontSize: 11, marginRight: 6, color: t === tab ? "var(--k-red)" : "var(--text-3)" }}>
              0{i + 1}
            </span>
            {t}
            {t === tab && <motion.span layoutId="tabline" style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2, background: "var(--text-1)" }} />}
          </button>
        ))}
      </div>

      <div style={{ position: "relative", overflow: "auto", padding: "22px 32px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }}>
            {tab === "Escopo" && <Escopo />}
            {tab === "Fases" && <Fases />}
            {tab === "Investimento" && <Investimento />}
            {tab === "Aceite" && <Aceite />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 32px", borderTop: "1px solid var(--border)", background: "#fcfcfc" }}>
        <span style={{ color: "var(--text-3)" }}>Proposta preparada pela Khard para a Dra. Gabriela Guenka.</span>
        {next ? (
          <Button variant="outline" icon={IconArrowRight} onClick={() => setTab(next)}>
            {next}
          </Button>
        ) : (
          <span className="display" style={{ fontSize: 16 }}>
            Nós fabricamos emoções.
          </span>
        )}
      </div>
    </div>
  );
}

function Escopo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {MODULOS.map((m) => (
        <div key={m.id} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--k-red)" }}>
              {m.capitulo}
            </span>
            <b style={{ fontWeight: 600, fontSize: 14 }}>{m.titulo}</b>
            <span style={{ marginLeft: "auto" }}>
              <Chip tone={faseTone(m.fase)}>Fase {m.fase}</Chip>
            </span>
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 16px", color: "var(--text-2)", display: "grid", gap: 3 }}>
            {m.itens.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Fases() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      {FASES.map((f) => (
        <div key={f.fase}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ width: 12, height: 12, borderRadius: 99, background: f.fase === 1 ? "var(--k-red)" : "var(--text-1)", flex: "none" }} />
            <span style={{ flex: 1, height: 1, background: "var(--border-strong)" }} />
          </div>
          <div className="eyebrow" style={{ marginBottom: 6, color: f.fase === 1 ? "var(--k-red)" : "var(--text-2)" }}>
            Fase {f.fase}
          </div>
          <div className="display" style={{ fontSize: 24, marginBottom: 8 }}>
            {f.nome}
          </div>
          <p style={{ margin: "0 0 14px", color: "var(--text-2)", lineHeight: 1.55, minHeight: 60 }}>{f.foco}</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {MODULOS.filter((m) => m.fase === f.fase).map((m) => (
              <Chip key={m.id}>{m.titulo}</Chip>
            ))}
          </div>
          <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", background: "#fcfcfc" }}>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Ao fim da fase</div>
            <div style={{ lineHeight: 1.5 }}>{f.entrega}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-3)" }}>Prazo</span>
              <Valor v={INVESTIMENTO.fases[f.fase].prazo} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Investimento() {
  const cell: React.CSSProperties = { padding: "13px 12px", borderBottom: "1px solid var(--border)", verticalAlign: "middle" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 28 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ color: "var(--text-3)", fontSize: 12, textAlign: "left" }}>
            <th style={{ ...cell, fontWeight: 500 }}>Fase</th>
            <th style={{ ...cell, fontWeight: 500 }}>Módulos</th>
            <th style={{ ...cell, fontWeight: 500 }}>Prazo</th>
            <th style={{ ...cell, fontWeight: 500, textAlign: "right" }}>Investimento</th>
          </tr>
        </thead>
        <tbody>
          {FASES.map((f) => (
            <tr key={f.fase}>
              <td style={cell}>
                <b style={{ fontWeight: 600 }}>Fase {f.fase}</b>
                <div style={{ color: "var(--text-3)", fontSize: 12 }}>{f.nome}</div>
              </td>
              <td style={{ ...cell, color: "var(--text-2)" }}>
                {MODULOS.filter((m) => m.fase === f.fase)
                  .map((m) => m.titulo)
                  .join(" · ")}
              </td>
              <td style={cell}>
                <Valor v={INVESTIMENTO.fases[f.fase].prazo} />
              </td>
              <td style={{ ...cell, textAlign: "right" }}>
                <Valor v={INVESTIMENTO.fases[f.fase].valor} />
              </td>
            </tr>
          ))}
          <tr>
            <td style={cell} colSpan={3}>
              <b style={{ fontWeight: 600 }}>Mensal</b>
              <div style={{ color: "var(--text-3)", fontSize: 12 }}>{INVESTIMENTO.mensal.rotulo}</div>
            </td>
            <td style={{ ...cell, textAlign: "right" }}>
              <Valor v={INVESTIMENTO.mensal.valor} />
            </td>
          </tr>
          <tr>
            <td style={{ ...cell, borderBottom: 0 }} colSpan={3}>
              <span className="display" style={{ fontSize: 20 }}>
                Total do projeto
              </span>
            </td>
            <td style={{ ...cell, borderBottom: 0, textAlign: "right" }}>
              <Valor v={INVESTIMENTO.total} big />
            </td>
          </tr>
        </tbody>
      </table>
      <div style={{ display: "grid", alignContent: "start", gap: 10 }}>
        {(
          [
            ["Início", INVESTIMENTO.inicio],
            ["Forma de pagamento", INVESTIMENTO.pagamento],
            ["Validade da proposta", INVESTIMENTO.validade],
          ] as const
        ).map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", border: "1px solid var(--border)", borderRadius: 10 }}>
            <span style={{ color: "var(--text-2)" }}>{k}</span>
            <Valor v={v} />
          </div>
        ))}
        <p style={{ margin: "6px 2px 0", color: "var(--text-3)", lineHeight: 1.55 }}>
          Cada fase é contratada e entregue em sequência: você usa o que ficou pronto enquanto a próxima é construída.
        </p>
      </div>
    </div>
  );
}

function Aceite() {
  const [ok, setOk] = useState(false);
  // TODO(aceite): integração pendente — hoje o aceite é só um estado local, nada é enviado.
  // Quando houver backend, registrar aqui (data, IP, versão da proposta) e notificar a Khard.
  return (
    <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 40, alignItems: "center" }}>
      <div style={{ position: "relative", padding: "38px 36px 34px", borderRadius: 18, background: "#fff", boxShadow: "0 24px 60px -24px rgba(0,0,0,.35)", border: "1px solid var(--border)" }}>
        <div style={{ position: "absolute", inset: 14, border: "1px solid var(--k-red)", borderRadius: 10, pointerEvents: "none" }} />
        <span className="mono" style={{ position: "absolute", top: 8, left: 22, fontSize: 12, color: "var(--k-red)", background: "#fff", padding: "0 6px", lineHeight: 1 }}>
          K♠ 10
        </span>
        <span className="mono" style={{ position: "absolute", bottom: 8, right: 22, fontSize: 12, color: "var(--k-red)", background: "#fff", padding: "0 6px", lineHeight: 1, transform: "rotate(180deg)" }}>
          K♠ 10
        </span>
        <AnimatePresence mode="wait">
          {!ok ? (
            <motion.div key="ask" exit={{ opacity: 0, y: -8 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                Proposta
              </div>
              <div className="display" style={{ fontSize: 26, marginBottom: 14 }}>
                Plataforma Gabriela Guenka
              </div>
              <div style={{ display: "grid", gap: 8, marginBottom: 22, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <Linha k="Escopo" v={`${MODULOS.length} módulos`} />
                <Linha k="Fases" v={`${FASES.length}, em sequência`} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--text-3)" }}>Investimento</span>
                  <Valor v={INVESTIMENTO.total} />
                </div>
              </div>
              <Button onClick={() => setOk(true)} style={{ width: "100%" }}>
                Quero seguir com o projeto
              </Button>
            </motion.div>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", padding: "18px 0" }}>
              <IconCircleCheckFilled size={44} color="var(--green)" />
              <div className="display" style={{ fontSize: 26, margin: "10px 0 8px" }}>
                Combinado.
              </div>
              <p style={{ margin: 0, color: "var(--text-2)", lineHeight: 1.55 }}>
                O próximo passo é a reunião de kickoff. Responda a mensagem em que recebeu este link para marcarmos o dia e começarmos pela Fase 1.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div>
        {/* mockup oficial das cartas da Khard (public/brand), só recortado */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/khard-cartas.jpg" alt="Cartas da Khard" style={{ display: "block", width: "100%", height: 150, objectFit: "cover", objectPosition: "center 55%", borderRadius: 12, marginBottom: 18 }} />
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Próximos passos
        </div>
        {[
          ["Kickoff", "Uma conversa para fechar detalhes e receber os seus modelos de prontuário."],
          ["Ajuste do escopo da Fase 1", "Prontuário, financeiro e agenda no formato exato da sua rotina."],
          ["Cronograma e início", "Datas de entrega por módulo e acesso ao ambiente de testes."],
        ].map(([t, d], i) => (
          <div key={t} style={{ display: "grid", gridTemplateColumns: "34px 1fr", gap: 10, padding: "14px 0", borderTop: "1px solid var(--border)" }}>
            <span className="mono" style={{ color: "var(--k-red)", fontSize: 12, paddingTop: 2 }}>
              0{i + 1}
            </span>
            <span>
              <b style={{ fontWeight: 600, fontSize: 14 }}>{t}</b>
              <span style={{ display: "block", color: "var(--text-2)", marginTop: 2, lineHeight: 1.5 }}>{d}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Linha({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-3)" }}>{k}</span>
      <span>{v}</span>
    </div>
  );
}
