"use client";

import { useCallback, useRef, useState } from "react";
import { HttpAgent } from "@ag-ui/client";
import { EventType, type BaseEvent } from "@ag-ui/core";
import { parsePartialJson } from "./partialJson";
import type { AgentRequest } from "./protocol";

export type ToolCall = { id: string; name: string; argsText: string; args: Record<string, unknown> | undefined; done: boolean };

export type AgentRun = {
  status: "idle" | "running" | "done" | "error";
  mode: "live" | "demo" | undefined;
  text: string;
  tools: ToolCall[];
  state: Record<string, unknown>;
};

const initial: AgentRun = { status: "idle", mode: undefined, text: "", tools: [], state: {} };

/** Roda o agente de um capítulo via AG-UI e acumula texto, tool calls (args parciais) e estado. */
export function useAgent() {
  const [run, setRun] = useState<AgentRun>(initial);
  const sub = useRef<{ unsubscribe: () => void } | null>(null);

  const start = useCallback((req: AgentRequest) => {
    sub.current?.unsubscribe();
    setRun({ ...initial, status: "running" });
    const agent = new HttpAgent({ url: "/api/agent" });
    const tools = new Map<string, ToolCall>();
    const order: string[] = [];
    const snapshot = () => order.map((k) => ({ ...tools.get(k)! }));

    const obs = agent.run({
      threadId: `thread_${req.chapter}`,
      runId: `run_${Date.now()}`,
      state: {},
      messages: [],
      tools: [],
      context: [],
      forwardedProps: req,
    });

    sub.current = obs.subscribe({
      next: (e: BaseEvent) => {
        const ev = e as BaseEvent & Record<string, unknown>;
        switch (e.type) {
          case EventType.CUSTOM:
            if (ev.name === "mode") setRun((r) => ({ ...r, mode: ev.value as AgentRun["mode"] }));
            break;
          case EventType.TEXT_MESSAGE_CONTENT:
            setRun((r) => ({ ...r, text: r.text + (ev.delta as string) }));
            break;
          case EventType.TOOL_CALL_START: {
            const id = ev.toolCallId as string;
            tools.set(id, { id, name: ev.toolCallName as string, argsText: "", args: undefined, done: false });
            order.push(id);
            setRun((r) => ({ ...r, tools: snapshot() }));
            break;
          }
          case EventType.TOOL_CALL_ARGS: {
            const t = tools.get(ev.toolCallId as string);
            if (!t) break;
            t.argsText += ev.delta as string;
            t.args = (parsePartialJson(t.argsText) as Record<string, unknown>) ?? t.args;
            setRun((r) => ({ ...r, tools: snapshot() }));
            break;
          }
          case EventType.TOOL_CALL_END: {
            const t = tools.get(ev.toolCallId as string);
            if (t) t.done = true;
            setRun((r) => ({ ...r, tools: snapshot() }));
            break;
          }
          case EventType.STATE_SNAPSHOT:
            setRun((r) => ({ ...r, state: ev.snapshot as Record<string, unknown> }));
            break;
          case EventType.RUN_FINISHED:
            setRun((r) => ({ ...r, status: "done" }));
            break;
          case EventType.RUN_ERROR:
            setRun((r) => ({ ...r, status: "error" }));
            break;
        }
      },
      error: () => setRun((r) => ({ ...r, status: "error" })),
    });
  }, []);

  const reset = useCallback(() => {
    sub.current?.unsubscribe();
    setRun(initial);
  }, []);

  /** última tool call com esse nome (args parciais enquanto chega) */
  const tool = useCallback((name: string) => [...run.tools].reverse().find((t) => t.name === name), [run.tools]);

  return { run, start, reset, tool };
}
