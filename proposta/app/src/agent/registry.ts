import type { ChapterAgent } from "./protocol";
import { prontuarioAgent } from "@/chapters/prontuario/agent";
import { agent as financeiro } from "@/chapters/financeiro/agent";
import { agent as agenda } from "@/chapters/agenda/agent";
import { agent as cursos } from "@/chapters/cursos/agent";
import { agent as leads } from "@/chapters/leads/agent";
import { agent as cms } from "@/chapters/cms/agent";
import { agent as estudio } from "@/chapters/estudio/agent";
import { agent as busca } from "@/chapters/busca/agent";
import { agent as atribuicao } from "@/chapters/atribuicao/agent";
import { agent as fechamento } from "@/chapters/fechamento/agent";

/** Agentes por capítulo (lado do servidor). Cada capítulo exporta `agent` em src/chapters/<id>/agent.ts. */
const all: Record<string, ChapterAgent | null> = { prontuario: prontuarioAgent, financeiro, agenda, cursos, leads, cms, estudio, busca, atribuicao, fechamento };

export const agents = Object.fromEntries(Object.entries(all).filter(([, a]) => a)) as Record<string, ChapterAgent>;
