import type { Chapter } from "@/engine/types";
import Abertura from "./abertura/Chapter";
import Prontuario from "./prontuario/Chapter";
import Financeiro from "./financeiro/Chapter";
import Agenda from "./agenda/Chapter";
import Cursos from "./cursos/Chapter";
import Leads from "./leads/Chapter";
import Cms from "./cms/Chapter";
import Estudio from "./estudio/Chapter";
import Busca from "./busca/Chapter";
import Atribuicao from "./atribuicao/Chapter";
import Fechamento from "./fechamento/Chapter";

/** Ordem da proposta. Cada capítulo vive em src/chapters/<id>/Chapter.tsx. */
export const chapters: Chapter[] = [
  { id: "abertura", number: "00", title: "Abertura", summary: "O projeto em um olhar", Component: Abertura },
  { id: "prontuario", number: "01", title: "Prontuário", summary: "Grave o exame, a Donna estrutura", Component: Prontuario },
  { id: "financeiro", number: "02", title: "Financeiro", summary: "Comprovante vira lançamento", Component: Financeiro },
  { id: "agenda", number: "03", title: "Agenda", summary: "Compromisso por áudio", Component: Agenda },
  { id: "cursos", number: "04", title: "Cursos", summary: "Sua plataforma, sem a taxa", Component: Cursos },
  { id: "leads", number: "05", title: "Leads", summary: "De onde vem o aluno bom", Component: Leads },
  { id: "cms", number: "06", title: "Conteúdo e SEO", summary: "Do assunto ao post publicado", Component: Cms },
  { id: "estudio", number: "07", title: "Estúdio", summary: "Documento, arte e slides com a sua marca", Component: Estudio },
  { id: "busca", number: "08", title: "Busca", summary: "Ache casos parecidos", Component: Busca },
  { id: "atribuicao", number: "09", title: "Venda real", summary: "O anúncio aprende com quem compra", Component: Atribuicao },
  { id: "fechamento", number: "10", title: "Proposta", summary: "Escopo, fases e investimento", Component: Fechamento },
];
