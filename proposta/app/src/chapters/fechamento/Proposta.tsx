"use client";

import { motion, useReducedMotion } from "motion/react";
import { IconClockHour4 } from "@tabler/icons-react";
import { BrandLogo } from "@/kit";
import { MODULOS, FASES, INVESTIMENTO, A_COMBINAR, TAMBEM_ENTRA } from "./escopo";
import s from "./fechamento.module.css";

const GUENKA_H = 44;
// o logo da cliente vai em placa (padding 0,18 × altura de cada lado): a Khard acompanha a altura total
const KHARD_H = Math.round(GUENKA_H * 1.36);

const PASSOS = [
  ["Primeira conversa", "Para fechar detalhes, prazos e ver os relatórios que você mais envia."],
  ["Ajuste da Fase 1", "Atendimento, contas e conversas no jeito da sua rotina."],
  ["Cronograma e início", "Datas de entrega por módulo e acesso ao ambiente de testes."],
] as const;

/** Marca o que ainda não tem número, para ninguém confundir com valor fechado. */
function Combinar() {
  return (
    <span className={s.combinar}>
      <IconClockHour4 size={12} /> {A_COMBINAR}
    </span>
  );
}

/** Tela final do fechamento: o preço já à vista, sem abas nem gesto para revelar. */
export function Proposta() {
  const reduce = useReducedMotion();
  const enter = (i: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.1 + i * 0.09, ease: [0.16, 1, 0.3, 1] as const } };

  return (
    <div className={s.panel} data-proposta-final="">
      <div className={s.head}>
        <div>
          <div style={{ marginBottom: 6, color: "var(--text-inv-2)", fontSize: 14 }}>Proposta para a Dra. Gabriela Guenka</div>
          <div className="display" style={{ fontSize: 32 }}>
            Oito soluções, em três fases.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-inv-2)" }}>
          <BrandLogo brand="khard" height={KHARD_H} />
          <span>para</span>
          <BrandLogo brand="guenka" height={GUENKA_H} plate />
        </div>
      </div>

      <div className={s.grid}>
        {/* carta em vidro: preço por fase, total e o escopo resumido */}
        <motion.div className={s.glass} {...enter(0)}>
          <div className={s.glassInner}>
            <div className={s.halo} />
            <div className={s.haze} />
            <span className={`${s.index} ${s.indexTop}`}>K♠ 09</span>
            <span className={`${s.index} ${s.indexBottom}`}>K♠ 09</span>
            <div className={s.lensArea}>
              <div className={s.lens} />
            </div>
            <div className={s.glassBody}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Investimento
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span className="display" style={{ fontSize: 50, lineHeight: 1 }}>
                  {INVESTIMENTO.porFase}
                </span>
                <span style={{ fontSize: 17, color: "var(--text-inv-2)" }}>por fase</span>
              </div>
              <div style={{ margin: "8px 0 16px", color: "var(--text-inv-2)", fontSize: 14 }}>
                {FASES.length} fases · <span style={{ color: "var(--text-inv)" }}>{INVESTIMENTO.total}</span> no total
              </div>
              {FASES.map((f) => (
                <div key={f.fase} className={s.row}>
                  <span>
                    <b style={{ fontWeight: 600 }}>Fase {f.fase}</b> <span style={{ color: "var(--text-inv-2)" }}>· {f.nome}</span>
                    <span style={{ display: "block", marginTop: 2, color: "var(--text-inv-2)", fontSize: 12, lineHeight: 1.45 }}>
                      {MODULOS.filter((m) => m.fase === f.fase)
                        .map((m) => m.titulo)
                        .join(" · ")}
                    </span>
                  </span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{INVESTIMENTO.fases[f.fase].valor}</span>
                </div>
              ))}
              <div className={s.row} style={{ alignItems: "center" }}>
                <span className="display" style={{ fontSize: 18 }}>
                  Total do projeto
                </span>
                <span className="display" style={{ fontSize: 24, fontVariantNumeric: "tabular-nums" }}>
                  {INVESTIMENTO.total}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, minWidth: 0 }}>
          <motion.div {...enter(1)}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              Próximos passos
            </div>
            {PASSOS.map(([t, d], i) => (
              <div key={t} className={s.step}>
                <span className="mono" style={{ color: "var(--k-red)", fontSize: 12, paddingTop: 2 }}>
                  0{i + 1}
                </span>
                <span>
                  <b style={{ fontWeight: 600, fontSize: 14 }}>{t}</b>
                  <span style={{ display: "block", color: "var(--text-inv-2)", marginTop: 2, lineHeight: 1.5 }}>{d}</span>
                </span>
              </div>
            ))}
            <div className={s.step} style={{ gridTemplateColumns: "1fr auto", alignItems: "center" }}>
              <span style={{ color: "var(--text-inv-2)", lineHeight: 1.5 }}>
                Prazo de cada fase, mensal (infraestrutura, IA e suporte), forma de pagamento e validade
              </span>
              <Combinar />
            </div>
            <div className="eyebrow" style={{ margin: "16px 0 8px" }}>
              Também entra
            </div>
            <div style={{ color: "var(--text-inv-2)", lineHeight: 1.55, paddingTop: 8, borderTop: "1px solid var(--border-dark)" }}>
              {TAMBEM_ENTRA.map((t, i) => (
                <span key={t.titulo}>
                  {i > 0 && " · "}
                  <span style={{ color: "var(--text-inv)" }}>{t.titulo}</span> <span style={{ color: "var(--text-3)" }}>(Fase {t.fase})</span>
                </span>
              ))}
            </div>
          </motion.div>

          {/* assinatura do responsável */}
          <motion.div className={s.sign} style={{ marginTop: "auto" }} {...enter(2)}>
            {/* foto oficial, já redonda e com moldura própria */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mauro-avatar.jpg" alt="Mauro Souza Tagliatte" width={84} height={84} style={{ display: "block", width: 84, height: 84, borderRadius: "50%" }} />
            <div>
              <div className="display" style={{ fontSize: 21, lineHeight: 1.3, maxWidth: 520 }}>
                Obrigado pelo interesse, Dra. Gabriela. Vai ser uma honra conduzir este projeto com você.
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/mauro-assinatura.png" alt="Assinatura de Mauro Souza Tagliatte" className={s.signature} />
              <div style={{ fontSize: 14 }}>Mauro Souza Tagliatte · Khard</div>
              <p style={{ margin: "6px 0 0", color: "var(--text-inv-2)", lineHeight: 1.55, maxWidth: 540 }}>
                Para seguir, responda a mensagem em que recebeu este link: marcamos a primeira conversa e começamos pela Fase 1.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className={s.foot}>
        <span className="display" style={{ fontSize: 17 }}>
          Nós fabricamos emoções.
        </span>
        <span style={{ color: "var(--text-3)", fontSize: 12 }}>Nada é enviado por esta tela.</span>
      </div>
    </div>
  );
}
