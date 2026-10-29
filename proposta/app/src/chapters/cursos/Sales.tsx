"use client";

import { motion } from "motion/react";
import { IconReceipt, IconArrowDownRight } from "@tabler/icons-react";
import { Chip, CountUp } from "@/kit";
import { TAXAS, brl, brlCents, num } from "./calc";

const VENDAS = [
  { quando: "hoje, 14:02", aluno: "Dra. Marina Lopes", produto: "Curso online", forma: "12x cartão", valor: 997 },
  { quando: "hoje, 11:47", aluno: "Rafael Antunes", produto: "Workshop presencial", forma: "Pix", valor: 497 },
  { quando: "ontem, 21:15", aluno: "Dr. Paulo Henrique", produto: "Curso online", forma: "6x cartão", valor: 997 },
  { quando: "ontem, 18:30", aluno: "Camila Rezende", produto: "Mentoria", forma: "12x cartão", valor: 2997 },
  { quando: "ontem, 09:12", aluno: "Dra. Júlia Prado", produto: "Curso online", forma: "à vista", valor: 997 },
  { quando: "27/10, 16:40", aluno: "Thiago Moraes", produto: "Workshop presencial", forma: "3x cartão", valor: 497 },
];

const taxa = (v: number) => v * TAXAS.hotmart.pct + TAXAS.hotmart.fixo;

// acumulado do ano (jan–out), ticket médio ≈ R$ 997
const ANO = { vendas: 514, faturamento: 512_458 };
const ANO_TAXA = ANO.faturamento * TAXAS.hotmart.pct + ANO.vendas * TAXAS.hotmart.fixo;

export function Sales({ show, focus }: { show: boolean; focus: boolean }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--surface)",
        borderRadius: "var(--r-xl)",
        border: "1px solid rgba(0,0,0,.12)",
        boxShadow: "var(--shadow-window)",
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: "44px 1fr",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 16px", borderBottom: "1px solid var(--border)", background: "#fcfcfc" }}>
        <IconReceipt size={16} color="var(--text-2)" />
        <b style={{ fontWeight: 500 }}>Painel de vendas</b>
        <span style={{ color: "var(--text-3)" }}>· plataforma atual (Hotmart)</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10, color: "var(--text-3)", fontSize: 12 }}>
          jan – out 2026 <Chip tone="amber">Dados de exemplo</Chip>
        </span>
      </div>
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 22 }}>
          <Kpi label="Faturamento" value={<CountUp v={show ? ANO.faturamento : 0} fmt={brl} ms={1400} />} />
          <Kpi label="Vendas" value={<CountUp v={show ? ANO.vendas : 0} fmt={(n) => num(n)} ms={1400} />} />
          <Kpi
            label="Taxas da plataforma"
            hot={focus}
            value={<CountUp v={show ? ANO_TAXA : 0} fmt={brl} ms={1400} />}
            note={`${num((ANO_TAXA / ANO.faturamento) * 100, 1)}% do que entrou`}
          />
          <Kpi label="Você recebeu" value={<CountUp v={show ? ANO.faturamento - ANO_TAXA : 0} fmt={brl} ms={1400} />} />
        </div>

        <div style={{ fontWeight: 500, marginBottom: 8 }}>Últimas vendas</div>
        <div style={{ position: "relative" }}>
          <Row head cells={["Quando", "Aluno", "Produto", "Pagamento", "Valor", "Taxa", "Líquido"]} />
          {VENDAS.map((v, i) => (
            <motion.div key={v.aluno} initial={{ opacity: 0, y: 8 }} animate={show ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.3 + i * 0.14 }}>
              <Row
                cells={[
                  v.quando,
                  v.aluno,
                  v.produto,
                  v.forma,
                  brlCents(v.valor),
                  <span key="t" style={{ color: "#a32202", fontWeight: 500 }}>
                    − {brlCents(taxa(v.valor))}
                  </span>,
                  brlCents(v.valor - taxa(v.valor)),
                ]}
              />
            </motion.div>
          ))}
          {/* destaque da coluna de taxa */}
          <motion.div
            animate={{ opacity: focus ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "absolute",
              top: -4,
              bottom: -4,
              left: `calc(${COLS_LEFT_TAXA})`,
              width: 104,
              border: "1.5px solid var(--k-red)",
              borderRadius: 8,
              background: "rgba(235,49,2,.04)",
              pointerEvents: "none",
            }}
          />
        </div>
        <motion.div
          animate={{ opacity: focus ? 1 : 0, y: focus ? 0 : 6 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, color: "var(--text-2)" }}
        >
          <Chip tone="red" icon={IconArrowDownRight}>
            9,9% + R$ 2,49 por venda
          </Chip>
          numa venda de R$ 997, ficam {brlCents(taxa(997))} com a plataforma.
        </motion.div>
      </div>
    </div>
  );
}

const COLS = "92px 1.1fr 1.5fr 86px 90px 104px 90px";
// posição da coluna "Taxa": soma das colunas anteriores (frações aproximadas em px dentro do grid)
const COLS_LEFT_TAXA = "100% - 104px - 90px";

function Row({ cells, head }: { cells: React.ReactNode[]; head?: boolean }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: COLS,
        alignItems: "center",
        height: head ? 30 : 40,
        borderTop: head ? undefined : "1px solid var(--border)",
        color: head ? "var(--text-3)" : "var(--text-1)",
        fontSize: head ? 12 : 13,
      }}
    >
      {cells.map((c, i) => (
        <span key={i} style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 8, paddingLeft: i === 5 ? 8 : 0 }}>
          {c}
        </span>
      ))}
    </div>
  );
}

function Kpi({ label, value, note, hot }: { label: string; value: React.ReactNode; note?: string; hot?: boolean }) {
  return (
    <div
      style={{
        border: `1px solid ${hot ? "var(--k-red)" : "var(--border)"}`,
        background: hot ? "rgba(235,49,2,.04)" : "transparent",
        borderRadius: 10,
        padding: "12px 14px",
        transition: "border-color .5s, background .5s",
      }}
    >
      <div style={{ color: "var(--text-3)", fontSize: 12 }}>{label}</div>
      <div className="display" style={{ fontSize: 24, marginTop: 4, color: hot ? "#a32202" : "var(--text-1)" }}>
        {value}
      </div>
      {note && <div style={{ color: "var(--text-3)", fontSize: 12, marginTop: 2 }}>{note}</div>}
    </div>
  );
}
