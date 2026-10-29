"use client";

import { IconCheck, IconAlertTriangle } from "@tabler/icons-react";
import { AppWindow, Chip, CountUp } from "@/kit";
import { META_PP, TAXAS, brl, brlCents, milhar, num, pct, type Cenario, type Resultado } from "./calc";

const ESCALA = 12; // % máximo nas barras

export function Simulator({ c, r }: { c: Cenario; r: Resultado }) {
  const ok = r.ppLiquida >= META_PP;
  return (
    <AppWindow nav={[]} showSidebar={false} workspace="Simulação · taxas de venda dos cursos">
      <div style={{ padding: "18px 26px", height: "100%", display: "flex", flexDirection: "column" }}>
        <div className="eyebrow" style={{ color: "var(--text-3)" }}>
          Cenário
        </div>
        <div className="display" style={{ fontSize: 22, margin: "4px 0 16px" }}>
          {milhar(c.faturamento)}/ano · <CountUp v={r.vendas} fmt={(n) => num(n)} /> vendas · ticket {brl(c.ticket)} · {c.parcelado}% parcelado
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Col title="Hoje · Hotmart" total={r.hotmart} ef={r.efHotmart}>
            <Line label={`9,9% sobre ${brl(c.faturamento)}`} v={r.hotPct} />
            <Line label={`R$ 2,49 × ${num(r.vendas)} vendas`} v={r.hotFixo} />
          </Col>
          <Col title="Sua plataforma · pagamento pelo Asaas" total={r.propria} ef={r.efPropria} accent>
            <Line label={`À vista · 2,99% × ${brl(r.baseVista)}`} v={r.vista} />
            <Line label={`Parcelado 2–6x · 3,49% × ${brl(r.baseParc)}`} v={r.parc} />
            <Line label={`R$ 0,49 × ${num(r.vendas)} vendas`} v={r.fixo} />
            <Line label={`Plataforma ${brl(c.plataformaMensal)} × 12`} v={r.plataforma} tag="estimativa" />
          </Col>
        </div>

        {/* taxa efetiva lado a lado */}
        <div style={{ marginTop: 18, padding: "14px 16px", border: "1px solid var(--border)", borderRadius: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontWeight: 500 }}>Taxa efetiva sobre o faturamento</span>
            <span style={{ color: "var(--text-3)", fontSize: 12 }}>só recomendamos com {num(META_PP, 1)} p.p. ou mais de diferença</span>
          </div>
          <Bar label="Hotmart" v={r.efHotmart} color="#5c5f62" />
          <Bar label="Sua (só pagamento)" v={r.efGateway} color="#c9cbcd" />
          <Bar label="Sua (com a plataforma)" v={r.efPropria} color="var(--k-red)" marker={r.efHotmart - META_PP} />
        </div>

        {/* resultado */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.15fr", gap: 10, marginTop: 14 }}>
          <Big label="Economia bruta (só taxas)" v={r.bruta} sub={`${num(r.ppBruta, 1)} p.p. abaixo`} />
          <Big label="Economia líquida (com plataforma)" v={r.liquida} sub={r.ppLiquida >= 0 ? `${num(r.ppLiquida, 1)} p.p. abaixo` : `${num(-r.ppLiquida, 1)} p.p. acima: custa mais`} />
          <div
            style={{
              borderRadius: 10,
              padding: "12px 14px",
              background: ok ? "var(--green-soft)" : "var(--amber-soft)",
              color: ok ? "#146136" : "#8a5300",
            }}
          >
            <div style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              {ok ? <IconCheck size={14} /> : <IconAlertTriangle size={14} />} Cenário conservador
            </div>
            <div className="display" style={{ fontSize: 28, marginTop: 2 }}>
              <CountUp v={r.ppLiquida} fmt={(n) => `${n >= 0 ? "−" : "+"}${num(Math.abs(n), 1)} p.p.`} />
            </div>
            <div style={{ fontSize: 12 }}>
              {ok
                ? `já descontando a plataforma: compensa mudar`
                : r.liquida < 0
                  ? "neste volume, a plataforma própria ainda não se paga: não recomendamos mudar"
                  : `diferença pequena: neste volume, mudar pode não compensar`}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px", marginTop: 14, padding: "10px 14px", background: "#f7f7f7", borderRadius: 10, color: "var(--text-2)" }}>
          <b style={{ color: "var(--text-1)", fontWeight: 500 }}>Numa venda de {brlCents(c.ticket)}</b>
          <span>Hotmart {brlCents(c.ticket * TAXAS.hotmart.pct + TAXAS.hotmart.fixo)}</span>
          <span>Sua, à vista {brlCents(c.ticket * TAXAS.asaasVista.pct + TAXAS.asaasVista.fixo)}</span>
          <span>Sua, parcelado {brlCents(c.ticket * TAXAS.asaasParcelado.pct + TAXAS.asaasParcelado.fixo)}</span>
          <span style={{ color: "var(--text-3)" }}>+ plataforma, rateada no ano</span>
        </div>

        <p style={{ marginTop: "auto", marginBottom: 6, fontSize: 10.5, lineHeight: 1.5, color: "var(--text-3)" }}>
          Fontes: Hotmart, central de ajuda: 9,9% + R$ 2,49 por venda (desde 21/09/2026; confirmar o plano dela). Asaas, preços e taxas: cartão à vista 2,99% + R$ 0,49;
          parcelado 2–6x 3,49% + R$ 0,49. Não inclui antecipação de recebíveis. O custo mensal da plataforma é estimativa (hospedagem, vídeo, área de
          membros e antifraude) e será fechado no escopo. Números a confirmar com o seu faturamento real.
        </p>
      </div>
    </AppWindow>
  );
}

function Col({ title, total, ef, accent, children }: { title: string; total: number; ef: number; accent?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${accent ? "rgba(235,49,2,.35)" : "var(--border)"}`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "grid", gap: 4, minHeight: 112, alignContent: "start" }}>{children}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 8 }}>
        <span style={{ color: "var(--text-2)" }}>
          Custo no ano · <CountUp v={ef} fmt={(n) => pct(n)} />
        </span>
        <b className="display" style={{ fontSize: 20, fontWeight: 500 }}>
          <CountUp v={total} fmt={brl} />
        </b>
      </div>
    </div>
  );
}

function Line({ label, v, tag }: { label: string; v: number; tag?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "var(--text-2)" }}>
      <span style={{ display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
        {label}
        {tag && <Chip tone="amber">{tag}</Chip>}
      </span>
      <span style={{ color: "var(--text-1)" }}>
        <CountUp v={v} fmt={brl} />
      </span>
    </div>
  );
}

function Bar({ label, v, color, marker }: { label: string; v: number; color: string; marker?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "170px 1fr 64px", alignItems: "center", gap: 10, height: 24 }}>
      <span style={{ color: "var(--text-2)" }}>{label}</span>
      <div style={{ position: "relative", height: 10, background: "#f1f2f2", borderRadius: 6 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: `${Math.max(0, Math.min(100, (v / ESCALA) * 100))}%`,
            background: color,
            borderRadius: 6,
            transition: "width .5s cubic-bezier(.22,1,.36,1)",
          }}
        />
        {marker !== undefined && (
          <div
            title="meta"
            style={{
              position: "absolute",
              top: -5,
              bottom: -5,
              left: `${Math.max(0, Math.min(100, (marker / ESCALA) * 100))}%`,
              width: 0,
              borderLeft: "1.5px dashed var(--text-1)",
              transition: "left .5s cubic-bezier(.22,1,.36,1)",
            }}
          />
        )}
      </div>
      <span style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
        <CountUp v={v} fmt={(n) => pct(n)} />
      </span>
    </div>
  );
}

function Big({ label, v, sub }: { label: string; v: number; sub: string }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, color: "var(--text-3)" }}>{label}</div>
      <div className="display" style={{ fontSize: 26, marginTop: 2, color: v < 0 ? "#8a5300" : "var(--text-1)" }}>
        <CountUp v={v} fmt={(n) => `${brl(n)}`} />
        <span style={{ fontSize: 13, color: "var(--text-3)", letterSpacing: 0 }}> /ano</span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-2)" }}>{sub}</div>
    </div>
  );
}
