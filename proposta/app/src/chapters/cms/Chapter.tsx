"use client";

import { useEffect, useRef, useState } from "react";
import { IconSparkles, IconLink } from "@tabler/icons-react";
import { Stage, frame, type Shot, type StageHandle } from "@/engine/Stage";
import { Overlay, Caption, ModeTag } from "@/engine/ChapterFrame";
import type { ChapterProps } from "@/engine/types";
import { Backdrop, Button, PauseCard, ScopeCard, LiveCard, TextField, Suggestions } from "@/kit";
import { useAgent } from "@/agent/useAgent";
import { Posts, Organic } from "./Posts";
import { Editor } from "./Editor";
import { Published } from "./Published";
import { PEDIDO_EXEMPLO, SUGESTOES, URL_RE, type PostGerado } from "./agent";

const W = 7600;
const H = 1400;
const BOX = {
  abertura: { x: 140, y: 200, w: 1700, h: 900 },
  posts: { x: 740, y: 200, w: 1100, h: 900 },
  organico: { x: 2080, y: 200, w: 1180, h: 900 },
  editor: { x: 4000, y: 200, w: 1180, h: 900 },
  publicado: { x: 5920, y: 200, w: 1180, h: 900 },
};
const SHOTS: Shot[] = [
  frame(BOX.abertura, { hold: 3.4, cue: "posts" }),
  frame(BOX.organico, { dur: 1.9, hold: 4, cue: "organico" }),
  frame(BOX.editor, { dur: 2, hold: 0.5, cue: "editor" }),
];
const left = (b: (typeof BOX)[keyof typeof BOX]) => frame(b, { region: "left", pad: 40, dur: 1.3 });

type Fase = "scene" | "pause" | "live" | "pub" | "scope";

export default function CmsChapter({ onNext }: ChapterProps) {
  const stage = useRef<StageHandle>(null);
  const [fase, setFase] = useState<Fase>("scene");
  const [cue, setCue] = useState("posts");
  const [pedido, setPedido] = useState("");
  const [enviado, setEnviado] = useState<{ text: string; example: boolean; link: boolean } | null>(null);
  const agent = useAgent();
  const call = agent.tool("gerar_post");
  const p = (call?.args ?? {}) as Partial<PostGerado>;
  const done = agent.run.status === "done";
  const temLink = URL_RE.test(pedido);

  useEffect(() => {
    if (fase !== "live" || !done) return;
    const t = setTimeout(async () => {
      setFase("pub");
      await stage.current?.goTo(left(BOX.publicado));
    }, 2600);
    return () => clearTimeout(t);
  }, [fase, done]);

  useEffect(() => {
    if (fase !== "pub") return;
    const t = setTimeout(() => setFase("scope"), 4600);
    return () => clearTimeout(t);
  }, [fase]);

  // o card "Sua vez" só aparece quando a câmera para
  const toPause = async () => {
    await stage.current?.goTo(left(BOX.editor));
    setFase("pause");
  };
  const submit = (text?: string) => {
    const t = text?.trim();
    setEnviado({ text: t || PEDIDO_EXEMPLO, example: !t, link: !!t && URL_RE.test(t) });
    setFase("live");
    agent.start({ chapter: "cms", text: t || PEDIDO_EXEMPLO, demo: !t });
  };

  const live = fase !== "scene" && fase !== "pause";

  return (
    <>
      <Stage ref={stage} width={W} height={H} shots={SHOTS} running onCue={setCue} onEnd={toPause}>
        <Caption
          x={140}
          y={330}
          w={540}
          eyebrow="06 · Conteúdo e SEO"
          title={"O blog que você\nnão tem tempo\nde escrever."}
          sub="Sete posts publicados, o último em junho. Os que existem já trazem visita — falta constância, não assunto."
          show={cue === "posts"}
        />
        <Backdrop photo="icm-areia" x={BOX.posts.x} y={BOX.posts.y} w={BOX.posts.w} h={BOX.posts.h} inset="5% 4% -2% 4%">
          <Posts show />
        </Backdrop>
        <Backdrop photo="icm-musgo" x={BOX.organico.x} y={BOX.organico.y} w={BOX.organico.w} h={BOX.organico.h} inset="5% 4% -2% 4%">
          <Organic show={cue !== "posts"} />
        </Backdrop>
        <Caption
          x={3420}
          y={330}
          w={500}
          title={"A pauta sai\ndo que já\nfunciona."}
          show={cue === "editor"}
        />
        <Backdrop photo="icm-pessego" x={BOX.editor.x} y={BOX.editor.y} w={BOX.editor.w} h={BOX.editor.h} inset="5% 4% -2% 4%">
          <Editor p={live ? p : {}} working={live && !done} done={live && done} published={fase === "pub" || fase === "scope"} />
        </Backdrop>
        <Backdrop photo="icm-dourado" x={BOX.publicado.x} y={BOX.publicado.y} w={BOX.publicado.w} h={BOX.publicado.h} inset="5% 6% -2% 4%">
          <Published p={p} show={fase === "pub" || fase === "scope"} />
        </Backdrop>
      </Stage>

      <Overlay show={fase === "pause"}>
        <PauseCard step="peça um post" title="Descreva um post que você gostaria de publicar — ou cole o link de uma página do seu site." onSkip={() => submit(undefined)}>
          <TextField rows={3} value={pedido} onChange={setPedido} placeholder="Ex.: quando fazer raio-x no exame de compra" />
          <Suggestions items={SUGESTOES} onPick={setPedido} icon={(s) => (URL_RE.test(s) ? IconLink : undefined)} style={{ margin: "10px 0 12px" }} />
          <p style={{ margin: "0 0 14px", fontSize: 12, lineHeight: 1.5, color: temLink ? "#f0c36b" : "var(--text-inv-2)" }}>
            {temLink
              ? "Link detectado. Nesta demonstração a Donna não abre a página: usa o endereço como pista de tema. Ler o site inteiro entra no projeto."
              : "Se colar um link, a Donna usa o endereço como pista de tema — nesta demonstração ela não abre a página."}
          </p>
          <div>
            <Button icon={IconSparkles} onClick={() => submit(pedido)} disabled={!pedido.trim()}>
              Escrever o post
            </Button>
          </div>
        </PauseCard>
      </Overlay>

      <Overlay show={fase === "live" || fase === "pub"}>
        <LiveCard>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow">Pedido</span>
            <ModeTag mode={agent.run.mode} />
          </div>
          <p style={{ margin: 0, lineHeight: 1.5, fontSize: 15 }}>“{enviado?.text}”</p>
          {enviado?.link && (
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "#f0c36b", lineHeight: 1.5 }}>A página não foi aberta: o endereço serviu de pista de tema.</p>
          )}
          {enviado?.example === false && agent.run.mode === "demo" && (
            <p style={{ margin: "10px 0 0", color: "var(--text-inv-2)", fontSize: 12 }}>Sem agente conectado agora: mostramos o post de exemplo.</p>
          )}
          {agent.run.text && (
            <p style={{ margin: "14px 0 0", paddingTop: 12, borderTop: "1px solid var(--border-dark)", lineHeight: 1.5 }}>
              <b style={{ color: "var(--k-red)" }}>Donna:</b> {agent.run.text}
            </p>
          )}
          {fase === "pub" && <p style={{ margin: "12px 0 0", color: "#7ee2a8" }}>Depois da sua revisão, vai ao ar assim — com a sua marca. O painel orgânico passa a acompanhar o post.</p>}
        </LiveCard>
      </Overlay>

      <Overlay show={fase === "scope"}>
        <ScopeCard
          number="06"
          title="Conteúdo e SEO"
          items={[
            "CMS do site e do blog, com a sua marca",
            "Agente de pauta e SEO: rascunho, meta, estrutura e links internos",
            "Você revisa e publica — nada vai ao ar sem a sua aprovação",
            "Acompanhamento de métricas orgânicas por post",
          ]}
          phase="Fase 3"
          metric="Tráfego orgânico e posts publicados por mês"
          onNext={onNext}
        />
      </Overlay>
    </>
  );
}
