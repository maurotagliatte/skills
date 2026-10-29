"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Icon } from "@tabler/icons-react";
import { IconSearch, IconStethoscope, IconSchool, IconFileText, IconCash, IconCheck, IconRefresh, IconArrowRight } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard, AppWindow, Chip } from "@/kit";
import { useAgent } from "@/agent/useAgent";
import { EXEMPLOS, type Resultado } from "./agent";
import { CORPUS, CLUSTERS, byId, type Tipo } from "./corpus";
import { Mapa, MAP_W, TIPO_LABEL } from "./Mapa";

const W = 3600;
const H = 1500;

// Mundo: [legenda + acervo sendo indexado] → [mapa de assuntos] → (zoom num assunto) → busca
const WIN = { x: 2100, y: 260, w: 1240, h: 980 };
// posição do mapa dentro da janela (inset 5%/4% + barra 44 + cabeçalho 104 + margem 22)
const MAP_ORIGIN = { x: WIN.x + WIN.w * 0.04 + 22, y: WIN.y + WIN.h * 0.05 + 44 + 104 };
const BOX = {
  indexa: { x: 140, y: 330, w: 1800, h: 820 },
  busca: WIN,
  zoom: { x: MAP_ORIGIN.x, y: MAP_ORIGIN.y + 60, w: MAP_W * 0.62, h: 380 },
};
const SHOTS: Shot[] = [
  frame(BOX.indexa, { hold: 4, cue: "indexa" }),
  frame(BOX.busca, { dur: 1.8, hold: 3.4, cue: "mapa" }),
  frame(BOX.zoom, { dur: 1.6, hold: 1.8, cue: "zoom" }),
];
const LIVE_SHOT: Shot = frame(BOX.busca, { region: "left", pad: 40, dur: 1.6 });
const CUES = ["indexa", "mapa", "zoom"];

const ICON: Record<Tipo, Icon> = { prontuario: IconStethoscope, aula: IconSchool, documento: IconFileText, financeiro: IconCash };

/** vetor ilustrativo (determinístico) para a cena de indexação */
function vec(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Array.from({ length: 4 }, (_, i) => {
    const v = (Math.sin(h + i * 7.3) * 0.9).toFixed(2);
    return v.startsWith("-") ? `−${v.slice(1)}` : ` ${v}`;
  }).join(" ");
}

function useStep(total: number, ms: number, active: boolean, key: string | number) {
  const [st, setSt] = useState({ key, n: 0 });
  const n = st.key === key ? st.n : 0;
  useEffect(() => {
    if (!active || n >= total) return;
    const t = setTimeout(() => setSt({ key, n: n + 1 }), ms);
    return () => clearTimeout(t);
  }, [n, total, ms, active, key]);
  return active ? Math.min(n, total) : 0;
}

export default function BuscaChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [phase, setPhase] = useState<Phase>("scene");
  const [cue, setCue] = useState("indexa");
  const [input, setInput] = useState(EXEMPLOS[0]);
  const [query, setQuery] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const runSeq = useRef(0);
  const [runKey, setRunKey] = useState(0);
  const agent = useAgent();
  const cueIdx = CUES.indexOf(cue);

  const indexados = useStep(INDEX_ROWS.length, 330, true, "idx");

  const call = agent.tool("resultados");
  const raw = ((call?.args as { itens?: Partial<Resultado>[] } | undefined)?.itens ?? []) as Partial<Resultado>[];
  const itens = raw.filter((r): r is Resultado => !!r?.id && !!byId[r.id]).map((r) => ({ ...r, score: typeof r.score === "number" ? r.score : 0 }));
  const shown = useStep(itens.length, 480, !!query, runKey);
  const finished = agent.run.status === "done" && shown >= itens.length;

  const toPause = async () => {
    setPhase("pause");
    await stage.current?.goTo(LIVE_SHOT);
  };

  const buscar = (text: string, demo: boolean) => {
    const t = text.trim() || EXEMPLOS[0];
    setInput(t);
    setQuery(t);
    setRunKey(++runSeq.current);
    setPhase("live");
    agent.start({ chapter: "busca", text: t, demo });
  };

  const outra = () => {
    agent.reset();
    setQuery(null);
    const i = EXEMPLOS.indexOf(input);
    setInput(EXEMPLOS[(i + 1) % EXEMPLOS.length]);
    setPhase("pause");
  };

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        {/* 1 · Indexação */}
        <Caption
          x={140}
          y={450}
          w={640}
          eyebrow="08 · Busca semântica"
          title={"Ache pelo sentido,\nnão pela palavra."}
          sub="Cada prontuário, aula e documento vira um ponto num mapa. O que fala do mesmo assunto fica perto — mesmo escrito com outras palavras."
        />
        <Backdrop photo="icm-areia" x={840} y={330} w={1100} h={820}>
          <AppWindow nav={[]} showSidebar={false}>
            <div style={{ padding: "18px 24px" }}>
              <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 6 }}>Busca › Índice do acervo</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <span className="display" style={{ fontSize: 22 }}>
                  Indexando o acervo
                </span>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {Math.round((indexados / INDEX_ROWS.length) * CORPUS.length)} de {CORPUS.length} itens
                </span>
                <span style={{ marginLeft: "auto", width: 180, height: 4, borderRadius: 4, background: "#eef0f0", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${(indexados / INDEX_ROWS.length) * 100}%`, background: "var(--k-red)", transition: "width .3s" }} />
                </span>
              </div>
              {INDEX_ROWS.map((it, i) => {
                const I = ICON[it.tipo];
                const done = i < indexados;
                return (
                  <div key={it.id} style={{ display: "grid", gridTemplateColumns: "22px 1fr 96px 250px 92px", alignItems: "center", height: 40, borderTop: "1px solid var(--border)" }}>
                    <I size={16} color="var(--text-3)" />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 12 }}>{it.titulo}</span>
                    <span style={{ color: "var(--text-3)", fontSize: 12 }}>{TIPO_LABEL[it.tipo]}</span>
                    <span className="mono" style={{ fontSize: 11, color: done ? "var(--text-2)" : "transparent", transition: "color .4s", whiteSpace: "pre" }}>
                      [{vec(it.id)} …]
                    </span>
                    <span style={{ justifySelf: "end", opacity: done ? 1 : 0, transition: "opacity .4s" }}>
                      <Chip tone="green" icon={IconCheck}>
                        indexado
                      </Chip>
                    </span>
                  </div>
                );
              })}
            </div>
          </AppWindow>
        </Backdrop>

        {/* 2 · Mapa e busca */}
        <Backdrop photo="icm-noite" x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} inset="5% 4% -2% 4%">
          <AppWindow nav={[]} showSidebar={false}>
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 104, padding: "14px 22px 0" }}>
                <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 8 }}>Busca › Acervo da clínica</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, height: 46, padding: "0 14px", border: "1px solid var(--border-strong)", borderRadius: 10, boxShadow: "var(--shadow-card)" }}>
                  <IconSearch size={18} color={query ? "var(--k-red)" : "var(--text-3)"} />
                  <span style={{ fontSize: 15, color: query ? "var(--text-1)" : "var(--text-3)" }}>{query ?? "Busque como você falaria…"}</span>
                  <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)" }}>
                    {CORPUS.length} itens · {Object.keys(CLUSTERS).length} assuntos
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: `${MAP_W + 22}px 1fr`, paddingTop: 0 }}>
                <div style={{ paddingLeft: 22 }}>
                  <Mapa formed={cueIdx >= 1} itens={itens} shown={shown} query={query ?? undefined} hover={hover} />
                </div>
                <Resultados itens={itens} shown={shown} query={query} hover={hover} setHover={setHover} />
              </div>
            </div>
          </AppWindow>
        </Backdrop>
      </Stage>

      <Overlay show={phase === "pause"}>
        <PauseCard step="busque" title="Busque como você falaria." onSkip={() => buscar(EXEMPLOS[0], true)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              buscar(input, false);
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, height: 42, padding: "0 12px", borderRadius: 10, border: "1px solid var(--border-dark)", background: "rgba(255,255,255,.04)" }}>
              <IconSearch size={16} color="var(--text-inv-2)" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Busca"
                style={{ flex: 1, minWidth: 0, background: "none", border: 0, outline: "none", color: "var(--text-inv)" }}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "12px 0 14px" }}>
              {EXEMPLOS.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setInput(ex)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 99,
                    border: "1px solid var(--border-dark)",
                    background: ex === input ? "var(--dark-3)" : "transparent",
                    color: ex === input ? "var(--text-inv)" : "var(--text-inv-2)",
                    fontSize: 12,
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
            <p style={{ margin: "0 0 16px", color: "var(--text-inv-2)", lineHeight: 1.5 }}>
              Escreva do seu jeito: “aquele potro que mancava”, “aula do jarrete”. A busca entende o assunto.
            </p>
            <Button icon={IconSearch}>Buscar</Button>
          </form>
        </PauseCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <div style={{ width: 380, padding: 20, borderRadius: 16, background: "rgba(17,18,18,.86)", backdropFilter: "blur(24px)", border: "1px solid var(--border-dark)", color: "var(--text-inv)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">Busca</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>“{query}”</p>
          {finished && agent.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.5 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
          <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", color: "var(--text-inv-2)", fontSize: 12, lineHeight: 1.55 }}>
            Prévia: aqui a Donna ordena um acervo de exemplo com {CORPUS.length} itens. No projeto, cada registro vira um vetor (embedding) guardado num banco vetorial, e a
            busca acha os vizinhos mais próximos em todo o histórico da clínica.
          </p>
          {finished && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Button variant="ghost" icon={IconRefresh} onClick={outra}>
                Buscar outra coisa
              </Button>
              <Button icon={IconArrowRight} onClick={() => setPhase("scope")} style={{ flex: 1 }}>
                Continuar
              </Button>
            </motion.div>
          )}
        </div>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="08"
          title="Busca semântica"
          items={[
            "Indexação de prontuários, aulas e documentos com embeddings",
            "Busca em linguagem natural, do jeito que você falaria",
            "Casos parecidos com o porquê de cada resultado",
            "Índice atualizado a cada prontuário novo, num banco vetorial",
          ]}
          phase="Fase 3"
          metric="Tempo para achar um caso"
          onNext={onNext}
        />
      </Overlay>
    </>
  );
}

const INDEX_ROWS = ["p-trovao", "a-flexao", "d-termo", "p-faisca", "p-rubi", "a-nutri", "p-tufao", "f-recibo", "d-laudo", "p-duque", "a-salto", "p-ventania", "f-boleto", "a-bloq", "p-atlas"].map((id) => byId[id]);

function Resultados({
  itens,
  shown,
  query,
  hover,
  setHover,
}: {
  itens: Resultado[];
  shown: number;
  query: string | null;
  hover: string | null;
  setHover: (id: string | null) => void;
}) {
  const vis = itens.slice(0, shown);
  return (
    <div style={{ padding: "0 22px 30px 16px", minWidth: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>Mais parecidos</span>
        <span style={{ color: "var(--text-3)", fontSize: 12 }}>{query ? (vis.length ? `${vis.length} resultados` : "buscando…") : "—"}</span>
      </div>
      {!query &&
        [0, 1, 2, 3].map((i) => (
          <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <span style={{ display: "block", width: 160, height: 10, borderRadius: 4, background: "#eef0f0", marginBottom: 8 }} />
            <span style={{ display: "block", width: "90%", height: 8, borderRadius: 4, background: "#f3f4f4" }} />
          </div>
        ))}
      <AnimatePresence initial={false}>
        {vis.map((r, i) => {
          const it = byId[r.id];
          const I = ICON[it.tipo];
          const [nome, ...resto] = it.titulo.split(" · ");
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.45 }}
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              style={{
                border: `1px solid ${hover === r.id ? "var(--k-red)" : "var(--border)"}`,
                borderRadius: 10,
                padding: "10px 12px",
                marginBottom: 8,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 10, color: "#fff", background: "var(--k-red)", borderRadius: 4, padding: "1px 5px" }}>
                  {i + 1}
                </span>
                <I size={14} color="var(--text-3)" />
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>{TIPO_LABEL[it.tipo]}</span>
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 46, height: 4, borderRadius: 4, background: "#eef0f0", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${Math.round(r.score * 100)}%`, background: "var(--k-red)" }} />
                  </span>
                  <span className="mono" style={{ fontSize: 11 }}>
                    {r.score.toFixed(2).replace(".", ",")}
                  </span>
                </span>
              </div>
              <div style={{ marginTop: 6, lineHeight: 1.35 }}>
                <b style={{ fontWeight: 600 }}>{nome}</b>
                {resto.length > 0 && <span style={{ color: "var(--text-2)" }}> · {resto.join(" · ")}</span>}
              </div>
              {r.porque && (
                <div style={{ marginTop: 5, color: "var(--text-2)", fontSize: 12, lineHeight: 1.45 }}>
                  <span style={{ color: "var(--text-3)" }}>Por que é parecido: </span>
                  {r.porque}
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
