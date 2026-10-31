import Anthropic from "@anthropic-ai/sdk";
import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";
import { EventEncoder } from "@ag-ui/encoder";
import type { AgentRequest, DemoStep } from "@/agent/protocol";
import { agents } from "@/agent/registry";

export const runtime = "nodejs";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
const MAX_RUNS_PER_IP = 60;
const runsByIp = new Map<string, number>();

/**
 * Endpoint AG-UI. Com ANTHROPIC_API_KEY, o Claude responde de verdade e as tool calls
 * chegam em streaming (TOOL_CALL_ARGS). Sem chave — ou com demo: true — o roteiro do
 * capítulo emite exatamente os mesmos eventos, então a UI é idêntica nos dois modos.
 */
export async function POST(req: Request) {
  const input = (await req.json()) as RunAgentInput;
  const ask = (input.forwardedProps ?? {}) as AgentRequest;
  const agent = agents[ask.chapter];
  if (!agent) return new Response("capítulo desconhecido", { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  const runs = (runsByIp.get(ip) ?? 0) + 1;
  runsByIp.set(ip, runs);
  const live = !!process.env.ANTHROPIC_API_KEY && !ask.demo && runs <= MAX_RUNS_PER_IP;

  const encoder = new EventEncoder({ accept: req.headers.get("accept") ?? undefined });
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: BaseEvent) => controller.enqueue(new TextEncoder().encode(encoder.encode(e)));
      const base = { threadId: input.threadId, runId: input.runId };
      emit({ type: EventType.RUN_STARTED, ...base } as BaseEvent);
      emit({ type: EventType.CUSTOM, name: "mode", value: live ? "live" : "demo" } as BaseEvent);
      try {
        if (live) await runClaude(agent, ask, emit);
        else await runDemo(agent.demo(ask), emit);
        emit({ type: EventType.RUN_FINISHED, ...base } as BaseEvent);
      } catch (err) {
        // falhou ao vivo: cai para o roteiro, a experiência não quebra
        if (live) {
          emit({ type: EventType.CUSTOM, name: "mode", value: "demo" } as BaseEvent);
          await runDemo(agent.demo(ask), emit);
          emit({ type: EventType.RUN_FINISHED, ...base } as BaseEvent);
        } else {
          emit({ type: EventType.RUN_ERROR, message: String(err) } as BaseEvent);
        }
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { "Content-Type": encoder.getContentType(), "Cache-Control": "no-store" } });
}

type Emit = (e: BaseEvent) => void;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let seq = 0;
const id = (p: string) => `${p}_${Date.now().toString(36)}_${(seq++).toString(36)}`;

async function runDemo(steps: DemoStep[], emit: Emit) {
  for (const step of steps) {
    if (step.kind === "wait") await sleep(step.ms);
    else if (step.kind === "state") emit({ type: EventType.STATE_SNAPSHOT, snapshot: step.state } as BaseEvent);
    else if (step.kind === "text") {
      const messageId = id("msg");
      emit({ type: EventType.TEXT_MESSAGE_START, messageId, role: "assistant" } as BaseEvent);
      for (const chunk of step.text.match(/.{1,6}/gs) ?? []) {
        emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: chunk } as BaseEvent);
        await sleep(18);
      }
      emit({ type: EventType.TEXT_MESSAGE_END, messageId } as BaseEvent);
    } else {
      const toolCallId = id("tool");
      emit({ type: EventType.TOOL_CALL_START, toolCallId, toolCallName: step.name } as BaseEvent);
      const json = JSON.stringify(step.args);
      for (const chunk of json.match(/.{1,10}/gs) ?? []) {
        emit({ type: EventType.TOOL_CALL_ARGS, toolCallId, delta: chunk } as BaseEvent);
        await sleep(22);
      }
      emit({ type: EventType.TOOL_CALL_END, toolCallId } as BaseEvent);
    }
  }
}

async function runClaude(agent: (typeof agents)[string], ask: AgentRequest, emit: Emit) {
  const client = new Anthropic();
  const content: Anthropic.ContentBlockParam[] = [];
  if (ask.image) {
    const m = ask.image.match(/^data:(image\/\w+);base64,(.+)$/);
    if (m) content.push({ type: "image", source: { type: "base64", media_type: m[1] as "image/png", data: m[2] } });
  }
  content.push({ type: "text", text: agent.prompt(ask) });

  const stream = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: agent.system,
    tools: agent.tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters as Anthropic.Tool.InputSchema })),
    tool_choice: { type: "any" },
    messages: [{ role: "user", content }],
    stream: true,
  });

  const open = new Map<number, { kind: "text" | "tool"; id: string }>();
  for await (const ev of stream) {
    if (ev.type === "content_block_start") {
      if (ev.content_block.type === "tool_use") {
        const toolCallId = ev.content_block.id;
        open.set(ev.index, { kind: "tool", id: toolCallId });
        emit({ type: EventType.TOOL_CALL_START, toolCallId, toolCallName: ev.content_block.name } as BaseEvent);
      } else if (ev.content_block.type === "text") {
        const messageId = id("msg");
        open.set(ev.index, { kind: "text", id: messageId });
        emit({ type: EventType.TEXT_MESSAGE_START, messageId, role: "assistant" } as BaseEvent);
      }
    } else if (ev.type === "content_block_delta") {
      const b = open.get(ev.index);
      if (!b) continue;
      if (ev.delta.type === "input_json_delta") emit({ type: EventType.TOOL_CALL_ARGS, toolCallId: b.id, delta: ev.delta.partial_json } as BaseEvent);
      else if (ev.delta.type === "text_delta") emit({ type: EventType.TEXT_MESSAGE_CONTENT, messageId: b.id, delta: ev.delta.text } as BaseEvent);
    } else if (ev.type === "content_block_stop") {
      const b = open.get(ev.index);
      if (!b) continue;
      emit(
        (b.kind === "tool"
          ? { type: EventType.TOOL_CALL_END, toolCallId: b.id }
          : { type: EventType.TEXT_MESSAGE_END, messageId: b.id }) as BaseEvent,
      );
      open.delete(ev.index);
    }
  }
}
