/** O que o frontend manda em RunAgentInput.forwardedProps para cada capítulo. */
export type AgentRequest = {
  chapter: string;
  /** texto (transcrição, pedido, URL…) */
  text?: string;
  /** imagem em data URL (comprovante) */
  image?: string;
  /** força o roteiro de exemplo mesmo com chave configurada */
  demo?: boolean;
};

/** Ferramenta de "render": o agente chama, o frontend desenha. Não há execução no servidor. */
export type RenderTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

/** Um passo do roteiro de exemplo — vira os mesmos eventos AG-UI que o modelo real geraria. */
export type DemoStep =
  | { kind: "text"; text: string }
  | { kind: "tool"; name: string; args: unknown }
  | { kind: "state"; state: Record<string, unknown> }
  | { kind: "wait"; ms: number };

export type ChapterAgent = {
  system: string;
  tools: RenderTool[];
  /** monta a mensagem do usuário a partir do pedido */
  prompt: (req: AgentRequest) => string;
  demo: (req: AgentRequest) => DemoStep[];
};
