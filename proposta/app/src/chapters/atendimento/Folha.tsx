"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { IconAlertTriangle, IconChecks, IconFileTypePdf, IconPaperclip } from "@tabler/icons-react";
import { BrandLogo } from "@/kit";
import type { Relatorio, Secao } from "./agent";
import { serif } from "./fonts";
import hoje from "./relatorio-atual-p1.png";
import css from "./folha.module.css";

/** args parciais: chegam aos poucos do agente */
export type R = Partial<Relatorio>;

export const MODELO_LABEL: Record<string, string> = {
  atendimento: "Relatório de atendimento",
  alta: "Orientações de alta",
  laudo: "Laudo de imagem",
  internacao: "Atualização da internação",
  final: "Relatório final do caso",
  livre: "Do meu jeito",
};

const secoesDe = (r: R) => (r.secoes ?? []).filter((s): s is Secao => !!s?.titulo);
const itensDe = (s: Partial<Secao>, en?: boolean) => ((en ? s.itens_en : s.itens) ?? []).filter(Boolean);

function Bar({ w, h = 8 }: { w: number | string; h?: number }) {
  return <span className={css.bar} style={{ width: w, height: h }} />;
}

/** Linha em branco para preencher à mão (sai em branco no PDF também). */
const Blank = () => <span className={css.blank} aria-label="em branco" />;

function Fade({ children }: { children: ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Conferir() {
  return (
    <span className={`${css.check} ${css.screenOnly}`}>
      <IconAlertTriangle size={9} stroke={2.4} />
      conferir
    </span>
  );
}

function Body({ s, en }: { s: Partial<Secao>; en?: boolean }) {
  if (s.pendente) return <div className={css.pending}>Preenche depois: {s.pendente.charAt(0).toLowerCase() + s.pendente.slice(1)}.</div>;
  const itens = itensDe(s, en);
  const texto = en ? s.texto_en : s.texto;
  if (itens.length)
    return (
      <ul className={css.list}>
        {itens.map((i, k) => (
          <li key={k}>{i}</li>
        ))}
      </ul>
    );
  if (texto) return <p className={css.para}>{texto}</p>;
  return (
    <>
      <Bar w="100%" h={7} />
      <Bar w="70%" h={7} />
    </>
  );
}

function Head({ r, right }: { r: R; right?: ReactNode }) {
  return (
    <header className={css.head}>
      <BrandLogo brand="guenka" height={46} />
      <div className={css.headRight}>
        {right ?? (
          <>
            <b>Dra. Gabriela Guenka</b>
            Medicina veterinária equina · Biomecânica
            <br />
            {r.paciente?.data || " "}
          </>
        )}
      </div>
    </header>
  );
}

function Foot({ r }: { r: R }) {
  return (
    <footer className={css.foot}>
      <div className={css.sign}>
        {r.assinatura?.nome ? (
          <Fade>
            <b>{r.assinatura.nome}</b>
            <span>{r.assinatura.registro}</span>
          </Fade>
        ) : (
          <>
            <Bar w={140} h={9} />
            <Bar w={110} h={7} />
          </>
        )}
      </div>
      <span className={css.pageNo}>Clínica Gabriela Guenka · página 1 de 1</span>
    </footer>
  );
}

function PatientLines({ r }: { r: R }) {
  const p = r.paciente;
  const linha = p ? [p.raca, p.sexo?.toLowerCase(), p.idade, p.pelagem?.toLowerCase(), p.esporte?.toLowerCase()].filter(Boolean).join(" · ") : "";
  return (
    <>
      <div className={css.meta}>{linha || <Bar w={240} h={8} />}</div>
      <div className={css.meta}>
        {p?.nome && !p.cliente && p.raca ? null : p?.cliente ? (
          <>
            Cliente {p.cliente}
            {p.propriedade ? ` · ${p.propriedade}` : ""} · CPF {p.documento || <Blank />}
          </>
        ) : (
          <Bar w={200} h={8} />
        )}
      </div>
    </>
  );
}

/* ——— Editorial: para o cliente (também é a base dos modelos pedidos na pausa 2) ——— */

export function FolhaEditorial({ r }: { r: R }) {
  const secs = secoesDe(r);
  const kicker = r.modelo === "livre" ? r.nome_modelo || r.titulo : r.titulo || (r.modelo ? MODELO_LABEL[r.modelo] : "");
  return (
    <div className={css.sheet}>
      <div className={css.watermark}>
        <BrandLogo brand="guenka" height={210} />
      </div>
      <Head r={r} />
      <div className={css.kicker}>{kicker || <Bar w={130} h={9} />}</div>
      <div className={`${css.name} ${serif.className}`}>{r.paciente?.nome || <Bar w={150} h={28} />}</div>
      <PatientLines r={r} />

      {r.resumo ? (
        <Fade>
          <div className={`${css.summary} ${serif.className}`}>{r.resumo}</div>
        </Fade>
      ) : (
        !secs.length && (
          <div style={{ marginTop: 14 }}>
            <Bar w="100%" h={46} />
          </div>
        )
      )}

      <div className={css.cols}>
        {secs.map((s, i) => (
          <section key={i} className={css.sec}>
            <Fade>
              <div className={css.secTitle}>
                {s.titulo}
                {s.conferir && <Conferir />}
              </div>
              <Body s={s} />
            </Fade>
          </section>
        ))}
        {!secs.length &&
          [0, 1, 2, 3].map((i) => (
            <section key={i} className={css.sec}>
              <Bar w={90} h={9} />
              <Bar w="100%" h={7} />
              <Bar w="85%" h={7} />
              <Bar w="60%" h={7} />
            </section>
          ))}
      </div>

      {r.dados_exame?.length ? (
        <Fade>
          <div className={css.tech}>
            <b>Dados do exame</b>
            {r.dados_exame.filter(Boolean).join(" · ")}
          </div>
        </Fade>
      ) : (
        <div style={{ marginTop: "auto" }} />
      )}
      <Foot r={r} />
    </div>
  );
}

/* ——— Clínico enxuto: uma página, direto ao ponto ——— */

export function FolhaClinica({ r }: { r: R }) {
  const p = r.paciente;
  const secs = secoesDe(r).filter((s) => !s.pendente);
  const cell = (label: string, v?: string, blank?: boolean) => (
    <div className={css.metaCell}>
      <span>{label}</span>
      <span>{v || (blank ? <Blank /> : "—")}</span>
    </div>
  );
  return (
    <div className={css.sheet}>
      <div className={css.clinHead}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BrandLogo brand="guenka" height={36} />
          <div>
            <div className={css.clinTitle}>Relatório clínico</div>
            <div className={css.meta}>Exame locomotor · {p?.data}</div>
          </div>
        </div>
        <div className={css.headRight}>
          <b>{r.assinatura?.nome}</b>
          {r.assinatura?.registro}
        </div>
      </div>
      <div className={css.metaGrid}>
        {cell("Paciente", p?.nome)}
        {cell("Cliente", p?.cliente)}
        {cell("Raça", p?.raca)}
        {cell("Propriedade", p?.propriedade)}
        {cell("Sexo e idade", [p?.sexo, p?.idade].filter(Boolean).join(", "))}
        {cell("CPF", p?.documento, true)}
        {cell("Pelagem", [p?.pelagem, p?.esporte?.toLowerCase()].filter(Boolean).join(" · "))}
        {cell("Endereço", p?.endereco, true)}
      </div>
      <div style={{ marginTop: 6 }}>
        {secs.map((s, i) => (
          <div key={i} className={css.row}>
            <div className={css.rowLabel}>{s.titulo}</div>
            <Body s={s} />
          </div>
        ))}
        {r.dados_exame?.length ? (
          <div className={css.row}>
            <div className={css.rowLabel}>Exame</div>
            <ul className={css.list}>
              {r.dados_exame.map((d, k) => (
                <li key={k}>{d}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <div style={{ marginTop: "auto" }} />
      <Foot r={r} />
    </div>
  );
}

/* ——— Bilíngue PT/EN: para clientes de fora ——— */

export function FolhaBilingue({ r }: { r: R }) {
  const secs = secoesDe(r).filter((s) => !s.pendente);
  const temEn = !!r.resumo_en || secs.some((s) => s.titulo_en);
  return (
    <div className={`${css.sheet} ${css.bi}`} style={{ fontSize: 9.5 }}>
      <Head
        r={r}
        right={
          <>
            <b>Relatório de atendimento</b>
            <span className={css.en}>Visit report · {r.paciente?.data}</span>
          </>
        }
      />
      <div className={css.biTitle}>
        <span className={`${css.biName} ${serif.className}`}>{r.paciente?.nome}</span>
        <span className={css.meta}>
          {r.paciente?.raca} · {r.paciente?.idade} · Cliente <span className={css.en}>/ Client</span> {r.paciente?.cliente}
        </span>
      </div>
      {r.resumo && (
        <div className={`${css.biSummary} ${css.biPair}`}>
          <span>{r.resumo}</span>
          <span className={css.en}>{r.resumo_en || "Tradução pendente."}</span>
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        {secs.map((s, i) => (
          <div key={i} className={`${css.biSec} ${css.biPair}`}>
            <div>
              <div className={css.biSecTitle}>{s.titulo}</div>
              <Body s={s} />
            </div>
            <div className={css.en}>
              <div className={css.biSecTitle}>{s.titulo_en || s.titulo}</div>
              {temEn ? <Body s={s} en /> : <p className={css.para}>Tradução pendente.</p>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "auto" }} />
      <Foot r={r} />
    </div>
  );
}

/* ——— Versão curta para o WhatsApp ——— */

export function FolhaWhatsApp({ r }: { r: R }) {
  const p = r.paciente;
  return (
    <div className={css.chat}>
      <div className={css.chatBar}>
        <span className={css.avatar}>RA</span>
        <div>
          <div style={{ fontWeight: 600 }}>{p?.cliente || "Cliente"}</div>
          <div style={{ fontSize: 11.5, color: "#6a6a6a" }}>{p?.propriedade}</div>
        </div>
      </div>
      <div className={css.chatBody}>
        <span className={css.day}>Hoje</span>
        <div className={css.bubble}>
          <div className={css.attach}>
            <IconFileTypePdf size={28} stroke={1.5} color="var(--gg-wine)" />
            <span>
              <b>Relatório · {p?.nome || "Trovão"}.pdf</b>
              <span>1 página · PDF</span>
            </span>
            <IconPaperclip size={14} style={{ marginLeft: "auto", color: "#6a6a6a" }} />
          </div>
          {r.mensagem_whatsapp || r.resumo}
          <div className={css.time}>
            18:42 <IconChecks size={14} color="#3b8fd6" />
          </div>
        </div>
      </div>
      <div className={css.chatInput}>Mensagem</div>
    </div>
  );
}

/* ——— O relatório que ela usa hoje (imagem da página 1) ——— */

export function FolhaHoje() {
  return (
    <div className={css.today}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={hoje.src} alt="Página 1 do relatório que a Dra. usa hoje: faixas vinho, caixas e tudo em caixa-alta, em inglês" draggable={false} />
      <div className={css.todayTag}>
        Seu modelo de hoje
        <span>Relatório da Shanah, 2025 · página 1 de 2</span>
      </div>
    </div>
  );
}

/** Folha só para impressão (portal no body; o CSS @media print esconde o resto da página). */
export function PrintSheet({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(<div className={css.printRoot}>{children}</div>, document.body);
}
