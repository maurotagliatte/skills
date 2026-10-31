"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconStethoscope,
  IconHorse,
  IconCash,
  IconMessageCircle,
  IconSparkles,
  IconPaperclip,
  IconMessageCircleCheck,
  IconCheck,
  IconClock,
  IconSend,
} from "@tabler/icons-react";
import { AppWindow, Chip, V, type NavEntry } from "@/kit";
import AnimatedList, { type AnimatedListEntry } from "@/kit/rb/AnimatedList/AnimatedList";
import Counter from "@/kit/rb/Counter/Counter";
import { CONTAS_EXISTENTES, COBRANCAS_EXISTENTES, ORCAMENTOS, VENCE, type Cobranca, type Comprovante } from "./agent";

export const NAV: NavEntry[] = [
  { icon: IconLayoutDashboard, label: "Início" },
  { icon: IconCalendarEvent, label: "Agenda" },
  { icon: IconMessageCircle, label: "Conversas" },
  { section: "Clínica" },
  { icon: IconStethoscope, label: "Atendimentos" },
  { icon: IconHorse, label: "Clientes e animais" },
  { section: "Gestão" },
  { icon: IconCash, label: "Contas", active: true },
];

/** Estado da cobrança do Ricardo: preparando (args chegando), pronta (para ela conferir) e enviada. */
export type EnvioCobranca = "preparando" | "pronta" | "enviada";

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const num = (s?: string) => {
  const m = s?.replace(/[^\d,]/g, "").replace(",", ".");
  const n = m ? Number(m) : NaN;
  return Number.isFinite(n) ? n : 0;
};
const curta = (d?: string) => (d && /^\d{2}\/\d{2}/.test(d) ? d.slice(0, 5) : d);
const BRL: Intl.NumberFormatOptions = { style: "currency", currency: "BRL" };

const LIST_VARS = {
  "--al-tile": "#fff",
  "--al-tile-shadow": "none",
  "--al-tile-edge": "var(--border)",
  "--al-tile-highlight": "transparent",
  "--al-hover": "none",
  "--al-active": "none",
  "--al-press": "none",
} as CSSProperties;

export function Contas({
  novo,
  showNew,
  cobranca,
  envio,
}: {
  novo: Partial<Comprovante>;
  showNew: boolean;
  cobranca?: Partial<Cobranca>;
  envio?: EnvioCobranca;
}) {
  const aPagar = CONTAS_EXISTENTES.reduce((s, c) => s + num(c.valor), 0) + (showNew ? num(novo.valor) : 0);
  const aReceber =
    COBRANCAS_EXISTENTES.filter((c) => c.status !== "paga").reduce((s, c) => s + num(c.valor), 0) +
    ORCAMENTOS.filter((o) => o.status === "aprovado").reduce((s, o) => s + num(o.valor), 0) +
    (envio === "enviada" && cobranca?.valor ? num(cobranca.valor) : 0);
  const sexta = CONTAS_EXISTENTES.filter((c) => c.vencimento === VENCE).length + (showNew && novo.vencimento === VENCE ? 1 : 0);

  const pagar: AnimatedListEntry[] = [
    ...(showNew ? [{ id: "novo", title: "novo" }] : []),
    ...CONTAS_EXISTENTES.map((c) => ({ id: c.fornecedor, title: c.fornecedor })),
  ];
  const enviar: AnimatedListEntry[] = [
    ...(envio ? [{ id: "ricardo", title: "ricardo" }] : []),
    ...COBRANCAS_EXISTENTES.map((c) => ({ id: c.cliente, title: c.cliente })),
  ];

  return (
    <AppWindow nav={NAV}>
      <div style={{ padding: "18px 22px", height: "100%", overflow: "hidden", display: "grid", gridTemplateRows: "auto auto 1fr", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span className="display" style={{ fontSize: 26 }}>
            Contas de novembro
          </span>
          <span style={{ color: "var(--text-3)" }}>segunda, 09/11</span>
          <span style={{ marginLeft: "auto" }}>
            <Chip>valores de exemplo</Chip>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <Stat label="A pagar no mês">
            <Counter value={aPagar} locale="pt-BR" format={BRL} fontSize={22} intro={false} motionBlur={false} />
          </Stat>
          <Stat label="A receber no mês">
            <Counter value={aReceber} locale="pt-BR" format={BRL} fontSize={22} intro={false} motionBlur={false} />
          </Stat>
          <Stat label="Vencem na sexta, 13/11" tone={sexta > 1 ? "amber" : undefined}>
            <span className="display" style={{ fontSize: 22 }}>
              {sexta} {sexta === 1 ? "conta" : "contas"}
            </span>
          </Stat>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.08fr 1fr", gap: 18, minHeight: 0 }}>
          {/* ——— o que ela paga ——— */}
          <section style={{ minWidth: 0 }}>
            <Head title="A pagar" sub="lançadas pela foto ou à mão" />
            <AnimatedList
              items={pagar}
              frame={false}
              theme="light"
              width="100%"
              maxHeight={520}
              gap={6}
              radius={10}
              animation="slide"
              showGradients={false}
              displayScrollbar={false}
              selectOnHover={false}
              enableArrowNavigation={false}
              style={{ ...LIST_VARS, margin: "0 -6px" }}
              renderItem={(it) => {
                const id = typeof it === "string" ? it : it.id;
                if (id === "novo") return <NovaConta novo={novo} />;
                const c = CONTAS_EXISTENTES.find((x) => x.fornecedor === id)!;
                return (
                  <Linha
                    titulo={c.fornecedor}
                    sub={`${c.descricao} · ${c.forma}`}
                    valor={c.valor}
                    status={c.vencimento === VENCE ? <Chip tone="amber">vence sexta</Chip> : <span style={{ color: "var(--text-3)" }}>vence {curta(c.vencimento)}</span>}
                  />
                );
              }}
            />
            <div style={{ marginTop: 14, borderRadius: 10, background: "#f5f6f6", padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 500 }}>Conferência com o extrato de outubro</span>
                <span style={{ color: "var(--text-2)" }}>14 de 18</span>
              </div>
              <div style={{ height: 6, borderRadius: 6, background: "#e3e5e5", overflow: "hidden" }}>
                <div style={{ width: "78%", height: "100%", background: "var(--green)" }} />
              </div>
              <div style={{ marginTop: 6, color: "var(--text-3)", fontSize: 12 }}>4 lançamentos esperando o banco compensar</div>
            </div>
          </section>

          {/* ——— o que ela cobra ——— */}
          <section style={{ minWidth: 0 }}>
            <Head title="A enviar ao cliente" sub="a Donna prepara, você envia" />
            <AnimatedList
              items={enviar}
              frame={false}
              theme="light"
              width="100%"
              maxHeight={420}
              gap={6}
              radius={10}
              animation="slide"
              showGradients={false}
              displayScrollbar={false}
              selectOnHover={false}
              enableArrowNavigation={false}
              style={{ ...LIST_VARS, margin: "0 -6px" }}
              renderItem={(it) => {
                const id = typeof it === "string" ? it : it.id;
                if (id === "ricardo") return <NovaCobranca c={cobranca ?? {}} envio={envio!} />;
                const c = COBRANCAS_EXISTENTES.find((x) => x.cliente === id)!;
                return (
                  <Linha
                    titulo={c.cliente}
                    sub={c.referente}
                    valor={c.valor}
                    status={
                      c.status === "paga" ? (
                        <Chip tone="green" icon={IconCheck}>
                          {c.quando}
                        </Chip>
                      ) : (
                        <Chip tone="sky" icon={IconClock}>
                          {c.quando}
                        </Chip>
                      )
                    }
                  />
                );
              }}
            />

            <div style={{ marginTop: 16 }}>
              <Head title="Orçamentos" sub="o aprovado vira conta a receber" />
              {ORCAMENTOS.map((o) => (
                <div key={o.referente} style={{ padding: "6px 2px" }}>
                  <Linha
                    titulo={o.cliente}
                    sub={o.referente}
                    valor={o.valor}
                    status={<span style={{ color: o.status === "aprovado" ? "var(--green)" : "var(--text-3)" }}>{o.status === "aprovado" ? "aprovado · a receber" : "aguardando resposta"}</span>}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppWindow>
  );
}

function Head({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
      <b style={{ fontWeight: 600, fontSize: 14 }}>{title}</b>
      <span style={{ color: "var(--text-3)" }}>{sub}</span>
    </div>
  );
}

function Stat({ label, tone, children }: { label: string; tone?: "amber"; children: ReactNode }) {
  return (
    <div style={{ borderRadius: 10, padding: "10px 12px", background: tone ? "var(--amber-soft)" : "#f5f6f6", transition: "background .4s", color: tone ? "#8a5300" : undefined }}>
      <div style={{ fontSize: 12, color: tone ? "#8a5300" : "var(--text-2)", marginBottom: 4 }}>{label}</div>
      <div className="display" style={{ lineHeight: 1.1 }}>
        {children}
      </div>
    </div>
  );
}

function Linha({ titulo, sub, valor, status }: { titulo: ReactNode; sub: ReactNode; valor: ReactNode; status: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "2px 12px", width: "100%", alignItems: "center" }}>
      <span style={{ fontWeight: 500, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{titulo}</span>
      <span style={{ fontWeight: 500, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>{valor}</span>
      <span style={{ color: "var(--text-3)", fontSize: 12, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</span>
      <span style={{ fontSize: 12, justifySelf: "end" }}>{status}</span>
    </div>
  );
}

/** A conta que a Donna acabou de ler da foto (valores chegando aos poucos). */
function NovaConta({ novo }: { novo: Partial<Comprovante> }) {
  return (
    <div style={{ width: "100%", borderLeft: "2px solid var(--k-red)", margin: "-4px 0 -4px -4px", padding: "4px 0 4px 10px" }}>
      <Linha
        titulo={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <V v={novo.fornecedor} w={130} />
            {novo.fornecedor && (
              <Chip tone="red" icon={IconSparkles}>
                Donna
              </Chip>
            )}
          </span>
        }
        sub={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, maxWidth: "100%" }}>
            <IconPaperclip size={12} style={{ flex: "none" }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
              <V v={novo.descricao ? `${novo.descricao}${novo.forma_pagamento ? ` · ${novo.forma_pagamento}` : ""}` : undefined} w={190} />
            </span>
          </span>
        }
        valor={<V v={novo.valor} w={70} />}
        status={novo.vencimento ? novo.vencimento === VENCE ? <Chip tone="amber">vence sexta</Chip> : <span style={{ color: "var(--text-3)" }}>vence {curta(novo.vencimento)}</span> : <V w={70} />}
      />
    </div>
  );
}

/** A cobrança do Ricardo, preparada pela Donna: a mensagem de WhatsApp aparece com o link de pagamento. */
function NovaCobranca({ c, envio }: { c: Partial<Cobranca>; envio: EnvioCobranca }) {
  return (
    <div style={{ width: "100%", borderLeft: "2px solid var(--k-red)", margin: "-4px 0 -4px -4px", padding: "4px 0 4px 10px" }}>
      <Linha
        titulo={<V v={c.cliente} w={150} />}
        sub={<V v={c.referente} w={190} />}
        valor={<V v={c.valor} w={70} />}
        status={
          envio === "enviada" ? (
            <Chip tone="green" icon={IconMessageCircleCheck}>
              enviada agora
            </Chip>
          ) : envio === "pronta" ? (
            <Chip tone="amber">para você conferir</Chip>
          ) : (
            <Chip tone="red" icon={IconSparkles}>
              Donna preparando
            </Chip>
          )
        }
      />
      <AnimatePresence initial={false}>
        {c.mensagem && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: "hidden" }}>
            <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: "4px 12px 12px 12px", background: envio === "enviada" ? "#e7f6ec" : "#f3f4f4", lineHeight: 1.45, transition: "background .5s" }}>
              {c.mensagem}
              <span style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                <Chip icon={IconSend}>Link de pagamento · Pix ou cartão</Chip>
                {c.vencimento && <Chip>vence {curta(c.vencimento)}</Chip>}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
