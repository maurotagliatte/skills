import type { Chapter } from "@/engine/types";
import Abertura from "./abertura/Chapter";
import Atendimento from "./atendimento/Chapter";
import Busca from "./busca/Chapter";
import Agenda from "./agenda/Chapter";
import Contas from "./contas/Chapter";
import Conversas from "./conversas/Chapter";
import Numeros from "./numeros/Chapter";
import Cursos from "./cursos/Chapter";
import Conteudo from "./conteudo/Chapter";
import Fechamento from "./fechamento/Chapter";

/** Ordem da proposta: cada capítulo mostra a Donna resolvendo uma parte do dia dela (ver proposta/COPY.md). */
export const chapters: Chapter[] = [
  { id: "abertura", number: "00", title: "Abertura", summary: "Um caso seu, do haras até a aula", Component: Abertura },
  { id: "atendimento", number: "01", title: "Atendimento", summary: "Grave na tela bloqueada, receba o relatório", Component: Atendimento },
  { id: "busca", number: "02", title: "Seus casos", summary: "Pergunte, e os casos parecidos aparecem", Component: Busca },
  { id: "agenda", number: "03", title: "Agenda", summary: "Um áudio e a semana se organiza", Component: Agenda },
  { id: "contas", number: "04", title: "Contas", summary: "Boleto pago, cobrança enviada", Component: Contas },
  { id: "conversas", number: "05", title: "Conversas", summary: "Cada cliente respondido no tempo certo", Component: Conversas },
  { id: "numeros", number: "06", title: "Números", summary: "De onde vêm os bons clientes", Component: Numeros },
  { id: "cursos", number: "07", title: "Cursos", summary: "Sua plataforma, mais para você", Component: Cursos },
  { id: "conteudo", number: "08", title: "Conteúdo", summary: "O caso vira aula, post e arte", Component: Conteudo },
  { id: "fechamento", number: "09", title: "Proposta", summary: "Escopo, fases e investimento", Component: Fechamento },
];
