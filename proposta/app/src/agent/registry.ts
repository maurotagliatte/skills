import type { ChapterAgent } from "./protocol";
import { agent as atendimento } from "@/chapters/atendimento/agent";
import { agent as contas } from "@/chapters/contas/agent";
import { agent as conversas } from "@/chapters/conversas/agent";
import { agent as numeros } from "@/chapters/numeros/agent";
import { agent as cursos } from "@/chapters/cursos/agent";
import { agent as conteudo } from "@/chapters/conteudo/agent";
import { agent as fechamento } from "@/chapters/fechamento/agent";

/** Agentes por capítulo (lado do servidor). Cada capítulo exporta `agent` em src/chapters/<id>/agent.ts. */
const all: Record<string, ChapterAgent | null> = { atendimento, contas, conversas, numeros, cursos, conteudo, fechamento };

export const agents = Object.fromEntries(Object.entries(all).filter(([, a]) => a)) as Record<string, ChapterAgent>;
