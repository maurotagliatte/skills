"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { IconPrinter, IconFileText, IconDroplet, IconRuler2, IconCheck } from "@tabler/icons-react";
import { BrandLogo, Button, Prop, Chip, SpecRow } from "@/kit";
import type { Documento } from "./agent";
import { EQUIPE, type Status } from "./equipe";
import css from "./estudio.module.css";

type D = Partial<Documento>;

/** Quantos blocos do documento já existem nos args (cabeçalho, seções, rodapé). */
export function docAvailable(d: D) {
  const secs = (d.secoes ?? []).filter((s) => s?.titulo).length;
  return (d.titulo ? 1 : 0) + secs + (d.rodape ? 1 : 0);
}

export function docStatus(d: D, n: number, done: boolean): Status[] {
  const secs = (d.secoes ?? []).filter((s) => s?.titulo);
  const total = 1 + secs.length + (d.rodape ? 1 : 0);
  const finished = done && n >= total;
  const writing = secs[Math.max(0, Math.min(n - 2, secs.length - 1))]?.titulo;
  return [
    { who: "Designer", text: "Cabeçalho, logo e marca d'água da clínica", state: n >= 1 ? "pronto" : "trabalhando" },
    {
      who: "Redatora",
      text: finished || n > secs.length ? `${secs.length} seções escritas` : writing ? `Escrevendo “${writing}”` : "Lendo o pedido",
      state: finished || (d.rodape && n > secs.length) ? "pronto" : n >= 1 ? "trabalhando" : "aguardando",
    },
    { who: "Diagramadora", text: "Página A4, margens e campos de assinatura", state: finished ? "pronto" : n >= 2 ? "trabalhando" : "aguardando" },
  ];
}

function Bar({ w, h = 10 }: { w: number | string; h?: number }) {
  return <span style={{ display: "block", width: w, height: h, borderRadius: 4, background: "#eef0f0", marginBottom: 8 }} />;
}

/** A folha A4 com a marca da Dra. Gabriela. `n` = blocos revelados. */
export function Sheet({ d, n }: { d: D; n: number }) {
  const secs = (d.secoes ?? []).filter((s) => s?.titulo);
  const showTitle = n >= 1 && d.titulo;
  const shownSecs = secs.slice(0, Math.max(0, n - 1));
  const showFooter = !!d.rodape && n >= 2 + secs.length;
  return (
    <div className={css.sheet}>
      <div className={css.watermark}>
        <BrandLogo brand="guenka" height={360} />
      </div>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, paddingBottom: 16, borderBottom: "2px solid var(--gg-wine)" }}>
        <BrandLogo brand="guenka" height={62} />
        <div style={{ textAlign: "right", fontSize: 11, lineHeight: 1.5, color: "#6b6b6b" }}>
          <div style={{ color: "var(--gg-ink)", fontWeight: 600, fontSize: 12 }}>Dra. Gabriela Guenka</div>
          Medicina veterinária de equinos · Biomecânica
        </div>
      </header>

      <div style={{ marginTop: 26, minHeight: 64 }}>
        {showTitle ? (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gg-wine)", marginBottom: 6 }}>
              {d.tipo || "Documento"}
            </div>
            <div className="display" style={{ fontSize: 26, color: "var(--gg-ink)" }}>
              {d.titulo}
            </div>
          </motion.div>
        ) : (
          <>
            <Bar w={110} h={8} />
            <Bar w={380} h={18} />
          </>
        )}
      </div>

      <div style={{ marginTop: 18, display: "grid", gap: 16 }}>
        {shownSecs.map((s, i) => (
          <motion.section
            key={i}
            data-sec={i}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: 10, color: "var(--gg-wine)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{s.titulo}</span>
            </div>
            <p style={{ margin: "0 0 0 26px", fontSize: 13, lineHeight: 1.6, color: "#3d3d3d" }}>{s.texto}</p>
          </motion.section>
        ))}
        {shownSecs.length < Math.max(secs.length, 3) &&
          Array.from({ length: Math.max(1, (secs.length || 3) - shownSecs.length) }).map((_, i) => (
            <div key={`sk${i}`} style={{ paddingLeft: 26, opacity: 0.9 }}>
              <Bar w={160} />
              <Bar w="100%" h={8} />
              <Bar w="82%" h={8} />
            </div>
          ))}
      </div>

      <div style={{ flex: 1 }} />
      <footer style={{ marginTop: 28, paddingTop: 14, borderTop: "1px solid #e3dcdc" }} data-sec="footer">
        {showFooter ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: "flex", flexWrap: "wrap", gap: "10px 28px", fontSize: 11, color: "#555" }}
          >
            {d.rodape!.split(/\s{3,}/).map((f, i) => (
              <span key={i}>{f}</span>
            ))}
          </motion.div>
        ) : (
          <Bar w="70%" h={8} />
        )}
        <div className="mono" style={{ marginTop: 12, fontSize: 9, color: "#9a9a9a", display: "flex", justifyContent: "space-between" }}>
          <span>Clínica Gabriela Guenka</span>
          <span>Página 1 de 1</span>
        </div>
      </footer>
    </div>
  );
}

/** Folha só para impressão (portal no body; o CSS @media print esconde o resto). */
function PrintSheet({ d }: { d: D }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div className={css.printRoot}>
      <Sheet d={d} n={99} />
    </div>,
    document.body,
  );
}

export function DocumentoView({ d, n, statuses, done }: { d: D; n: number; statuses: Status[]; done: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const secs = (d.secoes ?? []).filter((s) => s?.titulo).length;
  const complete = done && n >= docAvailable(d);

  // acompanha a seção que está sendo escrita; no fim volta para o topo da folha
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (complete) {
      const t = setTimeout(() => el.scrollTo({ top: 0, behavior: "smooth" }), 1600);
      return () => clearTimeout(t);
    }
    const target = el.querySelector<HTMLElement>(n > secs ? '[data-sec="footer"]' : `[data-sec="${n - 2}"]`);
    if (target) {
      const top = target.getBoundingClientRect().top - el.getBoundingClientRect().top;
      const scale = el.getBoundingClientRect().height / el.clientHeight || 1;
      el.scrollTo({ top: el.scrollTop + top / scale - el.clientHeight * 0.45, behavior: "smooth" });
    }
  }, [n, secs, complete]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 290px", height: "100%", minHeight: 0 }}>
      <div ref={scroller} className={css.sheetScroll}>
        <Sheet d={d} n={n} />
      </div>
      <aside style={{ borderLeft: "1px solid var(--border)", padding: "16px 16px 40px", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Documento</div>
        <Prop icon={IconFileText} label="Tipo">
          {d.tipo || <span style={{ color: "var(--text-3)" }}>—</span>}
        </Prop>
        <Prop icon={IconRuler2} label="Formato">
          A4 · 1 página
        </Prop>
        <Prop icon={IconDroplet} label="Marca d'água">
          Logo · 7%
        </Prop>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>Equipe</div>
          {statuses.map((s) => (
            <SpecRow key={s.who} name={s.who} color={EQUIPE[s.who].color} state={s.state}>
              {s.text}
            </SpecRow>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        {complete && (
          <div style={{ marginBottom: 10 }}>
            <Chip tone="green" icon={IconCheck}>
              Pronto para imprimir
            </Chip>
          </div>
        )}
        <Button icon={IconPrinter} onClick={() => window.print()} disabled={!complete} style={{ width: "100%" }}>
          Imprimir / PDF
        </Button>
      </aside>
      {complete && <PrintSheet d={d} />}
    </div>
  );
}
