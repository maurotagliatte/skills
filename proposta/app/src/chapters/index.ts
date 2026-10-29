import type { Chapter } from "@/engine/types";
import Abertura from "./abertura/Chapter";
import Atendimento from "./atendimento/Chapter";
import Contas from "./contas/Chapter";
import Conversas from "./conversas/Chapter";
import Numeros from "./numeros/Chapter";
import Cursos from "./cursos/Chapter";
import Conteudo from "./conteudo/Chapter";
import Fechamento from "./fechamento/Chapter";

/**
 * Ordem da proposta — um problema do dia a dia por capítulo (ver proposta/COPY.md).
 * As pastas antigas (prontuario, financeiro, agenda, leads, atribuicao, cms, estudio, busca) são
 * material de origem para os capítulos novos e saem quando a migração terminar.
 */
export const chapters: Chapter[] = [
  { id: "abertura", number: "00", title: "Abertura", summary: "Um caso seu, do haras até a aula", Component: Abertura },
  { id: "atendimento", number: "01", title: "Atendimento", summary: "Grave na tela bloqueada, receba o relatório", Component: Atendimento },
  { id: "contas", number: "02", title: "Contas", summary: "Boleto pago, cobrança enviada", Component: Contas },
  { id: "conversas", number: "03", title: "Conversas", summary: "Cada cliente respondido no tempo certo", Component: Conversas },
  { id: "numeros", number: "04", title: "Números", summary: "De onde vêm os bons clientes", Component: Numeros },
  { id: "cursos", number: "05", title: "Cursos", summary: "Sua plataforma, sem a taxa", Component: Cursos },
  { id: "conteudo", number: "06", title: "Conteúdo", summary: "O caso vira aula, post e arte", Component: Conteudo },
  { id: "fechamento", number: "07", title: "Proposta", summary: "Escopo, fases e investimento", Component: Fechamento },
];
