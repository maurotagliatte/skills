"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Icon } from "@tabler/icons-react";
import { IconSearch, IconFileText, IconSchool, IconFileDescription, IconCheck, IconQuote, IconListSearch } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption } from "@/engine/ChapterFrame";
import type { ChapterProps, Phase } from "@/engine/types";
import { AdvanceCard, AgentRow, AppWindow, Backdrop, Button, Chip, LiveCard, ScopeCard, useReveal } from "@/kit";
import ThoughtLine from "@/kit/rb/ThoughtLine/ThoughtLine";
import { useAgent } from "@/agent/useAgent";
import { PERGUNTA, type Frase, type Resultado } from "./agent";
import { CORPUS, CLUSTERS, byId, type Tipo } from "./corpus";
import { Mapa, MAP_W, TIPO_LABEL } from "./Mapa";

const W = 4200;
const H = 1500;

// Mundo: [a Donna lendo os relatórios] → [mapa dos casos + casos achados] → [resposta com os casos citados]
const WIN = { x: 1500, y: 260, w: 1240, h: 980 };
const RESP = { x: 2900, y: 330, w: 1100, h: 840 };
// posição do mapa dentro da janela (inset 5%/4% + barra 44 + cabeçalho 104)
const MAP_ORIGIN = { x: WIN.x + WIN.w * 0.04 + 22, y: WIN.y + WIN.h * 0.05 + 44 + 104 };
const BOX = {
  leitura: { x: 140, y: 170, w: 1180, h: 1190 },
  mapa: WIN,
  zoom: { x: MAP_ORIGIN.x, y: MAP_ORIGIN.y + 60, w: MAP_W * 0.62, h: 380 },
};
const SHOTS: Shot[] = [
  frame(BOX.leitura, { hold: 4.4, cue: "leitura" }),
  frame(BOX.mapa, { dur: 1.8, hold: 3.2, cue: "mapa" }),
  frame(BOX.zoom, { dur: 1.6, hold: 1.8, cue: "zoom" }),
];
const LIVE_SHOT: Shot = frame(WIN, { region: "left", pad: 40, dur: 1.6 });
const RESP_SHOT: Shot = frame(RESP, { region: "left", pad: 40, dur: 1.8 });

const ICON: Record<Tipo, Icon> = { relatorio: IconFileText, aula: IconSchool, documento: IconFileDescription };

const LEITURA = ["p-trovao", "a-flexao", "p-pampa", "p-rubi", "d-laudo", "p-tufao", "a-salto", "p-zorro", "p-ventania", "d-ferrador", "p-estrela", "p-ouro", "a-bloq", "p-duque"].map(
  (id) => byId[id],
);

/**
 * scene → pause ("Achar os casos parecidos") → live (os casos aparecem no mapa e na lista)
 * → ida (câmera até a resposta) → resposta (frases com os casos citados) → scope.
 * Nenhum card aparece com a câmera andando.
 */
type Step = Phase | "ida" | "resposta";
export default function BuscaChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [phase, setPhase] = useState<Step>("scene");
  const [cue, setCue] = useState("leitura");
  const busca = useAgent();
  const resp = useAgent();

  const lidos = useReveal(LEITURA.length, 260, { key: "leitura" });
  const asked = phase !== "scene";

  const call = busca.tool("casos_parecidos");
  const raw = ((call?.args as { itens?: Partial<Resultado>[] } | undefined)?.itens ?? []) as Partial<Resultado>[];
  const itens = raw
    .filter((r): r is Resultado => !!r?.id && !!byId[r.id] && r.id !== "p-trovao")
    .map((r) => ({ ...r, score: typeof r.score === "number" ? r.score : 0, porque: r.porque ?? "" }));
  const buscando = phase === "live" || phase === "ida" || phase === "resposta" || phase === "scope";
  const shown = useReveal(itens.length, 520, { active: buscando, key: "casos" });
  const achou = busca.run.status === "done" && itens.length > 0 && shown >= itens.length;

  const rcall = resp.tool("resposta");
  const frases = (((rcall?.args as { frases?: Partial<Frase>[] } | undefined)?.frases ?? []) as Partial<Frase>[]).filter((f): f is Frase => !!f?.texto);
  const ditas = useReveal(frases.length, 900, { active: phase === "resposta" || phase === "scope", key: "resposta" });
  const respondeu = resp.run.status === "done" && frases.length > 0 && ditas >= frases.length;

  const passos: string[] = [];
  if (buscando) passos.push("Li a pergunta sobre o Trovão");
  if (call) passos.push(`Comparando com ${CORPUS.length - 1} relatórios, laudos e aulas`);
  if (achou) passos.push(`Achei ${itens.length} casos parecidos`);

  const passosResp: string[] = ["Li os casos que achei"];
  if (rcall) passosResp.push("Escrevendo a resposta, com o caso de cada frase");
  if (respondeu) passosResp.push("Resposta pronta");

  // o primeiro card só aparece quando a câmera para
  const toPause = async () => {
    await stage.current?.goTo(LIVE_SHOT);
    setPhase("pause");
  };

  const buscar = () => {
    setPhase("live");
    busca.start({ chapter: "busca", text: PERGUNTA, options: { etapa: "casos" }, demo: true });
  };

  const responder = async () => {
    setPhase("ida");
    resp.start({ chapter: "busca", text: PERGUNTA, options: { etapa: "resposta", casos: itens.map((r) => r.id).join(",") }, demo: true });
    await stage.current?.goTo(RESP_SHOT);
    setPhase("resposta");
  };

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        {/* 1 · A Donna lendo os relatórios */}
        <Caption
          x={140}
          y={170}
          eyebrow="02 · Seus casos"
          title={"Pergunte, e os casos\nparecidos aparecem."}
          sub="Relatórios, laudos e aulas de todos os anos. A Donna lê tudo e acha o que fala do mesmo caso, mesmo escrito com outras palavras."
        />
        <Backdrop photo="icm-areia" x={140} y={640} w={1180} h={720}>
          <AppWindow nav={[]} showSidebar={false}>
            <div style={{ padding: "16px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <span className="display" style={{ fontSize: 22 }}>
                  Seus relatórios
                </span>
                <span className="mono" style={{ fontSize: 11, color: "var(--text-3)" }}>
                  {Math.round((lidos / LEITURA.length) * CORPUS.length)} de {CORPUS.length} lidos
                </span>
                <span style={{ marginLeft: "auto", width: 180, height: 4, borderRadius: 4, background: "#eef0f0", overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", width: `${(lidos / LEITURA.length) * 100}%`, background: "var(--k-red)", transition: "width .3s" }} />
                </span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <AgentRow status={lidos >= LEITURA.length ? "pronto" : "lendo…"} done={lidos >= LEITURA.length} list>
                  Separando cada caso pelo assunto
                </AgentRow>
              </div>
              {LEITURA.map((it, i) => {
                const I = ICON[it.tipo];
                const done = i < lidos;
                return (
                  <div key={it.id} style={{ display: "grid", gridTemplateColumns: "22px 1fr 84px 96px 70px", alignItems: "center", height: 36, borderTop: "1px solid var(--border)" }}>
                    <I size={16} color="var(--text-3)" />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 12 }}>
                      <b style={{ fontWeight: 600 }}>{it.nome}</b> <span style={{ color: "var(--text-2)" }}>· {it.titulo}</span>
                    </span>
                    <span style={{ color: "var(--text-3)", fontSize: 12 }}>{it.data}</span>
                    <span style={{ opacity: done ? 1 : 0, transition: "opacity .4s" }}>
                      <Chip>{it.assunto}</Chip>
                    </span>
                    <span style={{ justifySelf: "end", opacity: done ? 1 : 0, transition: "opacity .4s" }}>
                      <Chip tone="green" icon={IconCheck}>
                        lido
                      </Chip>
                    </span>
                  </div>
                );
              })}
            </div>
          </AppWindow>
        </Backdrop>

        {/* 2 · O mapa dos casos e os casos achados */}
        <Backdrop photo="icm-noite" x={WIN.x} y={WIN.y} w={WIN.w} h={WIN.h} inset="5% 4% -2% 4%">
          <AppWindow nav={[]} showSidebar={false}>
            <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 104, padding: "14px 22px 0" }}>
                <div style={{ color: "var(--text-3)", fontSize: 12, marginBottom: 8 }}>Seus casos · por assunto</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, height: 46, padding: "0 14px", border: "1px solid var(--border-strong)", borderRadius: 10, boxShadow: "var(--shadow-card)" }}>
                  <IconSearch size={18} color={asked ? "var(--k-red)" : "var(--text-3)"} />
                  <span style={{ fontSize: 15, color: asked ? "var(--text-1)" : "var(--text-3)" }}>{asked ? PERGUNTA : "Pergunte sobre seus casos…"}</span>
                  <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)" }}>
                    {CORPUS.length} itens · {Object.keys(CLUSTERS).length} assuntos
                  </span>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: `${MAP_W + 22}px 1fr` }}>
                <div style={{ paddingLeft: 22 }}>
                  <Mapa formed={cue !== "leitura"} asked={asked} itens={itens} shown={shown} />
                </div>
                <Resultados itens={itens} shown={shown} buscando={buscando} />
              </div>
            </div>
          </AppWindow>
        </Backdrop>

        {/* 3 · A resposta, com os casos citados */}
        <Backdrop photo="icm-oliva" x={RESP.x} y={RESP.y} w={RESP.w} h={RESP.h} inset="5% 5% -2% 5%">
          <AppWindow nav={[]} showSidebar={false}>
            <Resposta itens={itens} frases={frases} ditas={ditas} escrevendo={!!rcall && !respondeu} pronta={respondeu} />
          </AppWindow>
        </Backdrop>
      </Stage>

      <Overlay show={phase === "pause"}>
        <AdvanceCard eyebrow="A pergunta" title="Casos parecidos com o Trovão: claudicação no posterior." label="Achar os casos parecidos" icon={IconSearch} onAdvance={buscar}>
          A pergunta de exemplo já está feita. A Donna procura em todos os seus relatórios, laudos e aulas.
        </AdvanceCard>
      </Overlay>

      <Overlay show={phase === "live"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">A pergunta</span>
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>“{PERGUNTA}”</p>
          <div style={{ marginTop: 14 }}>
            <ThoughtLine
              label="A Donna está procurando…"
              doneLabel="Casos encontrados"
              steps={passos}
              working={!achou}
              showTimer={false}
              collapsible={false}
              collapseOnSettle={false}
              fontSize={14}
              color="var(--text-inv)"
              glyphColor="var(--k-red)"
            />
          </div>
          {achou && busca.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.55 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {busca.run.text}
            </p>
          )}
          <div style={{ marginTop: 16 }}>
            <Button icon={IconQuote} disabled={!achou} onClick={responder} advance>
              Ver a resposta com os casos
            </Button>
          </div>
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "resposta"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">A resposta</span>
          </div>
          <div className="display" style={{ fontSize: 22, marginBottom: 12 }}>
            {respondeu ? "Cada frase diz de qual caso veio." : "A Donna responde com os seus casos."}
          </div>
          <ThoughtLine
            label="Escrevendo…"
            doneLabel="Resposta pronta, com os casos citados"
            steps={passosResp}
            working={!respondeu}
            showTimer={false}
            collapsible={false}
            collapseOnSettle={false}
            fontSize={14}
            color="var(--text-inv)"
            glyphColor="var(--k-red)"
          />
          {respondeu && resp.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.55 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {resp.run.text}
            </p>
          )}
          <div style={{ marginTop: 16 }}>
            <Button icon={IconListSearch} disabled={!respondeu} onClick={() => setPhase("scope")} advance>
              Ver o que entra no projeto
            </Button>
          </div>
        </LiveCard>
      </Overlay>

      <Overlay show={phase === "scope"}>
        <ScopeCard
          number="02"
          title="Perguntar sobre seus casos"
          items={[
            "Pergunte em português e a Donna acha os casos parecidos nos seus relatórios",
            "Cada resposta mostra de quais casos veio",
            "Vale para prontuários, laudos, documentos antigos e as aulas do curso",
            "Cada relatório novo entra na busca assim que é salvo",
          ]}
          phase="Fase 3"
          metric="Tempo para achar um caso parecido"
          onNext={onNext}
          nextLabel="Próximo: a agenda por áudio"
        />
      </Overlay>
    </>
  );
}

function Resultados({ itens, shown, buscando }: { itens: Resultado[]; shown: number; buscando: boolean }) {
  const vis = itens.slice(0, shown);
  return (
    <div style={{ padding: "0 22px 30px 16px", minWidth: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <span style={{ fontWeight: 600 }}>Casos parecidos</span>
        <span style={{ color: "var(--text-3)", fontSize: 12 }}>{buscando ? (vis.length ? `${vis.length} encontrados` : "procurando…") : ""}</span>
      </div>
      {!vis.length &&
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
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", marginBottom: 8, background: "#fff" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ fontSize: 10, color: "#fff", background: "var(--k-red)", borderRadius: 4, padding: "1px 5px" }}>
                  {i + 1}
                </span>
                <I size={14} color="var(--text-3)" />
                <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                  {TIPO_LABEL[it.tipo]} · {it.data}
                </span>
                <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 46, height: 4, borderRadius: 4, background: "#eef0f0", overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${Math.round(r.score * 100)}%`, background: "var(--k-red)" }} />
                  </span>
                  <span className="mono" style={{ fontSize: 11 }}>
                    {Math.round(r.score * 100)}%
                  </span>
                </span>
              </div>
              <div style={{ marginTop: 6, lineHeight: 1.35 }}>
                <b style={{ fontWeight: 600 }}>{it.nome}</b>
                <span style={{ color: "var(--text-2)" }}> · {it.titulo}</span>
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

function Num({ n }: { n: number }) {
  return (
    <span
      className="mono"
      style={{ display: "inline-block", fontSize: 10, lineHeight: "14px", color: "#fff", background: "var(--k-red)", borderRadius: 4, padding: "0 5px", marginLeft: 4, verticalAlign: 2 }}
    >
      {n}
    </span>
  );
}

function Resposta({ itens, frases, ditas, escrevendo, pronta }: { itens: Resultado[]; frases: Frase[]; ditas: number; escrevendo: boolean; pronta: boolean }) {
  const vis = frases.slice(0, ditas);
  const citados = new Set(vis.flatMap((f) => f.casos));
  return (
    <div style={{ padding: "18px 24px", height: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <span className="display" style={{ fontSize: 24 }}>
          Resposta da Donna
        </span>
        <span style={{ marginLeft: "auto" }}>
          <Chip>casos de exemplo</Chip>
        </span>
      </div>

      <div style={{ alignSelf: "flex-end", maxWidth: "80%", background: "#f1f2f2", borderRadius: "12px 12px 4px 12px", padding: "10px 14px", lineHeight: 1.45 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>Você perguntou</div>
        {PERGUNTA}
      </div>

      <AgentRow status={pronta ? "pronta" : escrevendo ? "escrevendo…" : "lendo os casos…"} done={pronta}>
        <div style={{ display: "grid", gap: 8, marginTop: 4, minHeight: 150 }}>
          {!vis.length &&
            [0, 1, 2].map((i) => <span key={i} style={{ display: "block", width: `${90 - i * 14}%`, height: 9, borderRadius: 4, background: "#eef0f0" }} />)}
          <AnimatePresence initial={false}>
            {vis.map((f) => (
              <motion.div
                key={f.texto}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ color: "var(--text-1)", fontSize: 14, lineHeight: 1.55 }}
              >
                {f.texto}
                {f.casos.map((n) => (
                  <Num key={n} n={n} />
                ))}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </AgentRow>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Casos citados</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {itens.map((r, i) => {
            const it = byId[r.id];
            const I = ICON[it.tipo];
            const on = citados.has(i + 1);
            return (
              <motion.div
                key={r.id}
                initial={false}
                animate={{ opacity: on ? 1 : 0.35 }}
                transition={{ duration: 0.4 }}
                style={{ border: `1px solid ${on ? "var(--border-strong)" : "var(--border)"}`, borderRadius: 10, padding: "8px 10px", background: "#fff" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="mono" style={{ fontSize: 10, color: "#fff", background: on ? "var(--k-red)" : "var(--text-3)", borderRadius: 4, padding: "1px 5px" }}>
                    {i + 1}
                  </span>
                  <I size={14} color="var(--text-3)" />
                  <b style={{ fontWeight: 600 }}>{it.nome}</b>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)" }}>{it.data}</span>
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "var(--text-2)", lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.titulo}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
