"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { IconCheck, IconCopy, IconFileText, IconFileTypePdf } from "@tabler/icons-react";
import { AppWindow, Button } from "@/kit";
import Stack from "@/kit/rb/Stack/Stack";
import StatusMark from "@/kit/rb/StatusMark/StatusMark";
import { PrintSheet } from "./Folha";
import css from "./atendimento.module.css";

export type CardState = "static" | "pending" | "running" | "done";

/** Um modelo na galeria: aba na lista + folha na pilha. */
export type GalCard = {
  id: string;
  nome: string;
  sub: string;
  /** "hoje" = o modelo atual dela (imagem); os outros são da Donna */
  grupo: "hoje" | "donna";
  state: CardState;
  /** o que o botão de saída faz: PDF (imprime a folha), copiar o texto, ou nada */
  saida: "pdf" | "texto" | "nenhuma";
  texto?: string;
  folha: ReactNode;
};

/** Fluxo de status pedido pela Dra. */
export type Status = "andamento" | "conferencia" | "aprovado";

const STEPS: { id: Status; label: string; detail: string }[] = [
  { id: "andamento", label: "Em andamento", detail: "A Donna monta o relatório" },
  { id: "conferencia", label: "Em conferência", detail: "No seu WhatsApp" },
  { id: "aprovado", label: "Aprovado", detail: "Enviado ao cliente" },
];

const MARK_TEXT: Record<CardState, string> = { static: "", pending: "na fila", running: "montando", done: "pronto" };

/**
 * Galeria de modelos: abas à esquerda, pilha plana (React Bits Stack) no centro.
 * `cards` só cresce (novos vão para o fim da pilha). `focus` traz um card para a frente quando muda.
 */
export function Galeria({ cards, status, focus }: { cards: GalCard[]; status: Status | null; focus?: string }) {
  const box = useRef<HTMLDivElement>(null);
  // espelho da ordem da pilha: o Stack só gira a pilha (manda o da frente para o fim)
  const order = useRef<number[]>([]);
  const [top, setTop] = useState(0);
  const [copied, setCopied] = useState(false);

  if (order.current.length !== cards.length) {
    const next = order.current.filter((i) => i < cards.length);
    for (let i = 0; i < cards.length; i++) if (!next.includes(i)) next.push(i);
    order.current = next;
  }

  const onChange = useCallback((t: number) => {
    const o = order.current;
    let guard = o.length;
    while (o[0] !== t && guard-- > 0) o.push(o.shift()!);
    setTop(t);
  }, []);

  /** traz o card `index` para a frente folheando a pilha (Enter no Stack = mandar o de cima para trás) */
  const bring = useCallback((index: number) => {
    const root = box.current?.querySelector<HTMLElement>(".stack");
    const steps = order.current.indexOf(index);
    if (!root || steps <= 0) return;
    for (let k = 0; k < steps; k++) {
      setTimeout(() => root.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })), k * 120);
    }
  }, []);

  useEffect(() => {
    if (!focus) return;
    const i = cards.findIndex((c) => c.id === focus);
    if (i < 0) return;
    // espera o card novo montar na pilha
    const t = setTimeout(() => bring(i), 250);
    return () => clearTimeout(t);
    // só quando o foco pedido muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  const current = cards[top] ?? cards[0];
  const list = [...cards.map((c, i) => ({ c, i }))].sort((a, b) => Number(a.c.grupo !== "hoje") - Number(b.c.grupo !== "hoje"));
  const busy = current && (current.state === "running" || current.state === "pending");

  const exportar = () => {
    if (!current) return;
    if (current.saida === "texto" && current.texto) {
      navigator.clipboard?.writeText(current.texto).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } else if (current.saida === "pdf") window.print();
  };

  return (
    <AppWindow nav={[]} showSidebar={false}>
      <div className={css.gallery}>
        <div className={css.panel}>
          <div className={css.panelTitle}>Relatórios do Trovão</div>
          <div className={css.panelSub}>Atendimento de 09/11 · Haras Santa Fé</div>
          <div role="tablist" aria-label="Modelos de relatório" aria-orientation="vertical">
            {list.map(({ c, i }, k) => (
              <div key={c.id}>
                {(k === 0 || list[k - 1].c.grupo !== c.grupo) && <div className={css.group}>{c.grupo === "hoje" ? "Hoje" : "Feitos pela Donna"}</div>}
                <motion.button
                  type="button"
                  role="tab"
                  aria-selected={i === top}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35 }}
                  className={`${css.tab} ${i === top ? css.tabOn : ""}`}
                  onClick={() => bring(i)}
                >
                  <span className={css.tabIcon}>
                    {c.state === "static" ? (
                      <IconFileText size={16} stroke={1.7} />
                    ) : (
                      <span aria-hidden>
                        <StatusMark status={c.state} size={16} color="var(--amber)" doneColor="var(--green)" />
                      </span>
                    )}
                  </span>
                  <span>
                    <span className={css.tabName}>{c.nome}</span>
                    <span className={css.tabSub}>
                      {c.sub}
                      {c.state !== "static" && c.state !== "done" ? ` · ${MARK_TEXT[c.state]}` : ""}
                    </span>
                  </span>
                </motion.button>
              </div>
            ))}
          </div>

          <div className={css.status} aria-label="Status do relatório">
            {STEPS.map((s, i) => {
              const idx = status ? STEPS.findIndex((x) => x.id === status) : -1;
              const on = i <= idx;
              return (
                <div key={s.id} className={css.step}>
                  <motion.span
                    className={css.dot}
                    animate={{ background: on ? (i === 2 ? "#1f8a4c" : "#7b2a2e") : "#e2e3e4", scale: i === idx ? [1, 1.3, 1] : 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className={`${css.stepLabel} ${on ? "" : css.stepOff}`}>
                    {s.label}
                    <span className={css.stepDetail}>{s.detail}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <Button
            icon={current?.saida === "texto" ? (copied ? IconCheck : IconCopy) : IconFileTypePdf}
            onClick={exportar}
            disabled={!current || current.saida === "nenhuma" || busy}
            style={{ width: "100%" }}
          >
            {current?.saida === "texto" ? (copied ? "Copiado" : "Copiar mensagem") : current?.saida === "nenhuma" ? "Modelo atual" : "Exportar PDF"}
          </Button>
        </div>

        <div className={css.desk}>
          <div ref={box} className={css.stackBox}>
            <Stack
              cards={cards.map((c) => (
                <div key={c.id} style={{ width: 460, height: 650 }}>
                  {c.folha}
                </div>
              ))}
              layout="deck"
              visible={3}
              spread={0.8}
              depth={0.3}
              radius={3}
              tilt={0}
              onChange={onChange}
              style={{ width: 460, height: 650 }}
            />
          </div>
        </div>
      </div>
      {current?.saida === "pdf" && !busy && <PrintSheet>{current.folha}</PrintSheet>}
    </AppWindow>
  );
}
