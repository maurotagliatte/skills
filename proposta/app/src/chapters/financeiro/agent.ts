import type { ChapterAgent } from "@/agent/protocol";

/** Lançamento extraído de um comprovante, boleto ou recibo. */
export type Comprovante = {
  fornecedor: string;
  documento: string;
  valor: string;
  vencimento: string;
  categoria: string;
  forma_pagamento: string;
  descricao: string;
};

/** Alerta (push no app) agendado pela Donna. */
export type Alerta = { titulo: string; mensagem: string; quando: string };

/** Contas já lançadas na tela "Contas a pagar" (a mesma lista vai no prompt ao vivo). */
export const CONTAS_EXISTENTES = [
  { fornecedor: "Energia elétrica", descricao: "Baias e galpão · out/2026", categoria: "Utilidades", vencimento: "13/11/2026", forma: "Boleto", valor: "R$ 1.118,40", status: "aberto" },
  { fornecedor: "Aluguel do consultório", descricao: "Novembro/2026", categoria: "Estrutura", vencimento: "20/11/2026", forma: "Boleto", valor: "R$ 3.200,00", status: "aberto" },
  { fornecedor: "Contabilidade Prado & Lima", descricao: "Honorários · out/2026", categoria: "Serviços", vencimento: "25/11/2026", forma: "PIX", valor: "R$ 890,00", status: "aberto" },
  { fornecedor: "VetPharma Distribuidora", descricao: "Anti-inflamatórios e seringas", categoria: "Medicamentos", vencimento: "05/11/2026", forma: "Boleto", valor: "R$ 1.642,30", status: "pago" },
] as const;

/** "Hoje" dentro da cena (véspera do vencimento dos exemplos). */
export const HOJE_CENA = "12/11/2026";

/** Os 3 comprovantes fictícios de public/comprovantes/ (gerados por gerar-comprovantes.cjs). */
export const EXEMPLOS: { id: string; arquivo: string; rotulo: string; comprovante: Comprovante; alerta: Alerta; resposta: string }[] = [
  {
    id: "casa-do-cavalo",
    arquivo: "/comprovantes/casa-do-cavalo.png",
    rotulo: "Ração · boleto",
    comprovante: {
      fornecedor: "Casa do Cavalo Agropecuária",
      documento: "Boleto nº 004812",
      valor: "R$ 2.340,00",
      vencimento: "13/11/2026",
      categoria: "Nutrição e insumos",
      forma_pagamento: "Boleto",
      descricao: "Ração extrusada 40 kg × 18 sc · suplemento mineral × 2",
    },
    alerta: {
      titulo: "2 boletos vencem amanhã",
      mensagem: "Casa do Cavalo e Energia elétrica. Total de R$ 3.458,40.",
      quando: "12/11/2026 08:00",
    },
    resposta: "Lancei o boleto da Casa do Cavalo em contas a pagar. Ele vence amanhã junto com a energia — te aviso às 8h.",
  },
  {
    id: "ferrador-silva",
    arquivo: "/comprovantes/ferrador-silva.png",
    rotulo: "Ferrador · PIX",
    comprovante: {
      fornecedor: "Ferrador Silva",
      documento: "Cobrança nº 0217",
      valor: "R$ 680,00",
      vencimento: "13/11/2026",
      categoria: "Ferrageamento",
      forma_pagamento: "PIX",
      descricao: "Ferrageamento completo · Trovão, Estrela Dalva, Zarco e Pérola",
    },
    alerta: {
      titulo: "2 contas vencem amanhã",
      mensagem: "Ferrador Silva (PIX) e Energia elétrica. Total de R$ 1.798,40.",
      quando: "12/11/2026 08:00",
    },
    resposta: "Lancei a cobrança do Ferrador Silva (4 animais, PIX). Vence amanhã junto com a energia — te aviso às 8h.",
  },
  {
    id: "vetlab",
    arquivo: "/comprovantes/vetlab.png",
    rotulo: "Exames · boleto",
    comprovante: {
      fornecedor: "VetLab Análises",
      documento: "Fatura nº 2026-1187",
      valor: "R$ 418,50",
      vencimento: "13/11/2026",
      categoria: "Exames laboratoriais",
      forma_pagamento: "Boleto",
      descricao: "Hemograma, bioquímico e fibrinogênio · Trovão",
    },
    alerta: {
      titulo: "2 boletos vencem amanhã",
      mensagem: "VetLab Análises e Energia elétrica. Total de R$ 1.536,90.",
      quando: "12/11/2026 08:00",
    },
    resposta: "Lancei a fatura da VetLab e vinculei aos exames do Trovão. Vence amanhã junto com a energia — te aviso às 8h.",
  },
];

/** `text` do pedido carrega "exemplo:<id>" quando ela escolhe um dos comprovantes fictícios. */
export const exemploDoPedido = (text?: string) => EXEMPLOS.find((e) => text === `exemplo:${e.id}`) ?? EXEMPLOS[0];

const str = (description?: string) => (description ? { type: "string", description } : { type: "string" });

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, médica veterinária de equinos que atende em haras e tem um consultório.",
    "Ela envia a foto de um comprovante, boleto, recibo ou nota. Leia a imagem e chame extrair_comprovante com os dados do lançamento em contas a pagar.",
    "Depois chame agendar_alerta para o dia anterior ao vencimento, às 08:00. Se outras contas já lançadas vencem no mesmo dia, junte tudo num alerta só e diga quantas são e o total.",
    "Formatos: valor como \"R$ 1.234,56\"; datas como dd/mm/aaaa; quando como \"dd/mm/aaaa HH:MM\".",
    "Categoria curta, uma de: Nutrição e insumos, Ferrageamento, Exames laboratoriais, Medicamentos, Utilidades, Estrutura, Serviços, Equipamentos, Deslocamento, Outros.",
    "Descrição em até 70 caracteres. Título do alerta em até 32 caracteres, mensagem em até 110 (é uma notificação de celular).",
    "Se algum campo não estiver legível, deixe string vazia — nunca invente. Português do Brasil.",
    "Ao final, uma frase curta para ela confirmando o que fez.",
  ].join(" "),
  tools: [
    {
      name: "extrair_comprovante",
      description: "Lança o comprovante lido como uma conta a pagar no módulo financeiro.",
      parameters: {
        type: "object",
        properties: {
          fornecedor: str("nome do beneficiário/fornecedor"),
          documento: str("tipo e número do documento, ex.: Boleto nº 004812"),
          valor: str(),
          vencimento: str("dd/mm/aaaa"),
          categoria: str(),
          forma_pagamento: str("Boleto, PIX, Cartão, Transferência ou Dinheiro"),
          descricao: str(),
        },
        required: ["fornecedor", "documento", "valor", "vencimento", "categoria", "forma_pagamento", "descricao"],
      },
    },
    {
      name: "agendar_alerta",
      description: "Agenda uma notificação push no celular da Dra. Gabriela.",
      parameters: {
        type: "object",
        properties: { titulo: str(), mensagem: str(), quando: str("dd/mm/aaaa HH:MM") },
        required: ["titulo", "mensagem", "quando"],
      },
    },
  ],
  prompt: () => {
    const hoje = new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const abertas = CONTAS_EXISTENTES.filter((c) => c.status === "aberto")
      .map((c) => `- ${c.fornecedor} · ${c.valor} · vence ${c.vencimento} · ${c.forma}`)
      .join("\n");
    return `Hoje é ${hoje}. Contas a pagar já lançadas e em aberto:\n${abertas}\n\nLeia o comprovante da imagem, lance a conta e agende o alerta.`;
  },
  demo: (req) => {
    const ex = exemploDoPedido(req.text);
    return [
      { kind: "wait", ms: 900 },
      { kind: "tool", name: "extrair_comprovante", args: ex.comprovante },
      { kind: "wait", ms: 500 },
      { kind: "tool", name: "agendar_alerta", args: ex.alerta },
      { kind: "text", text: ex.resposta },
    ];
  },
};
