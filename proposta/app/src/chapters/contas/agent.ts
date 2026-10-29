import type { ChapterAgent } from "@/agent/protocol";

/* Cap. 02 · Contas — os dois lados do dinheiro da semana:
   a conta que ela paga (foto do boleto → contas a pagar → aviso na véspera)
   e a cobrança que ela manda ao cliente (preparada pela Donna, enviada com um toque). */

/** Conta a pagar lida de uma foto de boleto, recibo ou cobrança por PIX. */
export type Comprovante = {
  fornecedor: string;
  documento: string;
  valor: string;
  vencimento: string;
  categoria: string;
  forma_pagamento: string;
  descricao: string;
};

/** Aviso no celular agendado pela Donna. */
export type Alerta = { titulo: string; mensagem: string; quando: string };

/** Cobrança que a Donna prepara para ela enviar ao cliente. */
export type Cobranca = { cliente: string; referente: string; valor: string; vencimento: string; mensagem: string };

/** A semana da cena: o atendimento do Trovão foi na segunda; as contas são lançadas na mesma noite. */
export const HOJE_CENA = "09/11/2026";
export const VESPERA = "12/11/2026";
export const VENCE = "13/11/2026";

/** Contas já lançadas (a mesma lista vai no prompt ao vivo). */
export const CONTAS_EXISTENTES = [
  { fornecedor: "Energia elétrica", descricao: "Baias e galpão · outubro", categoria: "Utilidades", vencimento: VENCE, forma: "Boleto", valor: "R$ 1.118,40" },
  { fornecedor: "Aluguel do consultório", descricao: "Novembro", categoria: "Estrutura", vencimento: "20/11/2026", forma: "Boleto", valor: "R$ 3.200,00" },
  { fornecedor: "Contabilidade Prado & Lima", descricao: "Honorários · outubro", categoria: "Serviços", vencimento: "25/11/2026", forma: "PIX", valor: "R$ 890,00" },
] as const;

/** Cobranças a enviar aos clientes que já estão na fila. */
export const COBRANCAS_EXISTENTES = [
  { cliente: "Haras Boa Vista", referente: "Rotina do plantel · outubro", valor: "R$ 4.600,00", status: "paga" as const, quando: "paga em 05/11" },
  { cliente: "Grupo da internação · Zarco", referente: "Internação · semana 2", valor: "R$ 2.380,00", status: "agendada" as const, quando: "sai na sexta, 13/11" },
];

/** Orçamentos, de leve: o aprovado vira conta a receber. */
export const ORCAMENTOS = [
  { cliente: "Haras Boa Vista", referente: "Exames de compra · 2 potros", valor: "R$ 1.900,00", status: "aprovado" as const },
  { cliente: "Marina Couto", referente: "Ultrassom de tendão · Pérola", valor: "R$ 650,00", status: "aguardando" as const },
];

/** O exemplo do outro lado: a conta do atendimento de segunda, para o Ricardo. */
export const COBRANCA_EXEMPLO: Cobranca = {
  cliente: "Ricardo Alves · Haras Santa Fé",
  referente: "Atendimento do Trovão · 09/11 · exame, raio-x e infiltração",
  valor: "R$ 1.850,00",
  vencimento: "16/11/2026",
  mensagem:
    "Oi, Ricardo! Segue a conta do atendimento do Trovão de segunda: R$ 1.850,00, com vencimento dia 16. Pelo link você paga no Pix ou no cartão. Qualquer dúvida, me chama.",
};

/** Os 3 comprovantes fictícios de public/comprovantes/. O primeiro é o padrão do "pular": fala do Trovão. */
export const EXEMPLOS: { id: string; arquivo: string; rotulo: string; comprovante: Comprovante; alerta: Alerta; resposta: string }[] = [
  {
    id: "ferrador-silva",
    arquivo: "/comprovantes/ferrador-silva.png",
    rotulo: "Ferrador · PIX",
    comprovante: {
      fornecedor: "Ferrador Silva",
      documento: "Cobrança nº 0217",
      valor: "R$ 680,00",
      vencimento: VENCE,
      categoria: "Ferrageamento",
      forma_pagamento: "PIX",
      descricao: "Ferrageamento · Trovão, Estrela Dalva, Zarco e Pérola",
    },
    alerta: { titulo: "2 contas vencem amanhã", mensagem: "Ferrador Silva (PIX) e Energia elétrica. Total de R$ 1.798,40.", quando: `${VESPERA} 08:00` },
    resposta: "Lancei a cobrança do Ferrador Silva: R$ 680,00 por PIX, Trovão e mais três. Vence dia 13. Te aviso na véspera, às 8h.",
  },
  {
    id: "casa-do-cavalo",
    arquivo: "/comprovantes/casa-do-cavalo.png",
    rotulo: "Ração · boleto",
    comprovante: {
      fornecedor: "Casa do Cavalo Agropecuária",
      documento: "Boleto nº 004812",
      valor: "R$ 2.340,00",
      vencimento: VENCE,
      categoria: "Nutrição e insumos",
      forma_pagamento: "Boleto",
      descricao: "Ração extrusada 40 kg × 18 sc · suplemento mineral × 2",
    },
    alerta: { titulo: "2 boletos vencem amanhã", mensagem: "Casa do Cavalo e Energia elétrica. Total de R$ 3.458,40.", quando: `${VESPERA} 08:00` },
    resposta: "Lancei o boleto da Casa do Cavalo, R$ 2.340,00. Vence dia 13, junto com a energia. Te aviso na véspera, às 8h.",
  },
  {
    id: "vetlab",
    arquivo: "/comprovantes/vetlab.png",
    rotulo: "Exames · boleto",
    comprovante: {
      fornecedor: "VetLab Análises",
      documento: "Fatura nº 2026-1187",
      valor: "R$ 418,50",
      vencimento: VENCE,
      categoria: "Exames laboratoriais",
      forma_pagamento: "Boleto",
      descricao: "Hemograma, bioquímico e fibrinogênio · Trovão",
    },
    alerta: { titulo: "2 boletos vencem amanhã", mensagem: "VetLab Análises e Energia elétrica. Total de R$ 1.536,90.", quando: `${VESPERA} 08:00` },
    resposta: "Lancei a fatura da VetLab e liguei aos exames do Trovão. Vence dia 13. Te aviso na véspera, às 8h.",
  },
];

/** `text` do pedido carrega "exemplo:<id>" quando ela escolhe um dos comprovantes fictícios. */
export const exemploDoPedido = (text?: string) => EXEMPLOS.find((e) => text === `exemplo:${e.id}`) ?? EXEMPLOS[0];

/** `options.acao`: "comprovante" (padrão) ou "cobranca". */
const acao = (o?: Record<string, string>) => (o?.acao === "cobranca" ? "cobranca" : "comprovante");

const str = (description?: string) => (description ? { type: "string", description } : { type: "string" });

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, médica veterinária de equinos que atende em haras e tem um consultório.",
    "Você cuida das contas dela nos dois sentidos.",
    "(1) Quando ela envia a foto de um boleto, recibo ou cobrança por PIX: leia a imagem e chame extrair_comprovante para lançar a conta a pagar.",
    "Depois chame agendar_alerta para a véspera do vencimento, às 08:00. Se outras contas já lançadas vencem no mesmo dia, junte tudo num aviso só e diga quantas são e o total.",
    "(2) Quando ela pedir a cobrança de um cliente: chame preparar_cobranca com o cliente, o que está sendo cobrado, o valor, o vencimento e a mensagem de WhatsApp no tom dela (próximo, direto, sem formalidade, até 220 caracteres). Ela confere e envia; você não envia sozinha.",
    "Formatos: valor como \"R$ 1.234,56\"; datas como dd/mm/aaaa; quando como \"dd/mm/aaaa HH:MM\".",
    "Categoria curta, uma de: Nutrição e insumos, Ferrageamento, Exames laboratoriais, Medicamentos, Utilidades, Estrutura, Serviços, Equipamentos, Deslocamento, Outros.",
    "Descrição em até 70 caracteres. Título do aviso em até 32 caracteres, mensagem em até 110 (é uma notificação de celular).",
    "Se algum campo não estiver legível, deixe string vazia. Nunca invente. Português do Brasil.",
    "Ao final, uma frase curta para ela dizendo o que fez.",
  ].join(" "),
  tools: [
    {
      name: "extrair_comprovante",
      description: "Lança a conta lida da foto em contas a pagar.",
      parameters: {
        type: "object",
        properties: {
          fornecedor: str("nome de quem recebe"),
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
      description: "Agenda um aviso no celular da Dra. Gabriela (aparece na tela de bloqueio).",
      parameters: {
        type: "object",
        properties: { titulo: str(), mensagem: str(), quando: str("dd/mm/aaaa HH:MM") },
        required: ["titulo", "mensagem", "quando"],
      },
    },
    {
      name: "preparar_cobranca",
      description: "Prepara a cobrança de um cliente (valor, vencimento, link de pagamento por Pix ou cartão e a mensagem de WhatsApp) para a Dra. Gabriela conferir e enviar com um toque.",
      parameters: {
        type: "object",
        properties: {
          cliente: str("nome do cliente e, se houver, do haras"),
          referente: str("o que está sendo cobrado, até 70 caracteres"),
          valor: str(),
          vencimento: str("dd/mm/aaaa"),
          mensagem: str("mensagem de WhatsApp no tom dela"),
        },
        required: ["cliente", "referente", "valor", "vencimento", "mensagem"],
      },
    },
  ],
  prompt: (req) => {
    if (acao(req.options) === "cobranca") {
      return [
        `Hoje é segunda-feira, ${HOJE_CENA}.`,
        "Atendimento de hoje no Haras Santa Fé, cliente Ricardo Alves: Trovão, Quarto de Milha, 8 anos, claudicação no posterior esquerdo.",
        "Feito: exame locomotor, raio-x do tarso esquerdo (4 projeções) e infiltração. Total do orçamento aprovado: R$ 1.850,00. Prazo combinado: 7 dias.",
        "Prepare a cobrança para o Ricardo.",
      ].join("\n");
    }
    const abertas = CONTAS_EXISTENTES.map((c) => `- ${c.fornecedor} · ${c.valor} · vence ${c.vencimento} · ${c.forma}`).join("\n");
    return `Hoje é segunda-feira, ${HOJE_CENA}. Contas a pagar já lançadas e em aberto:\n${abertas}\n\nLeia a foto, lance a conta e agende o aviso.`;
  },
  demo: (req) => {
    if (acao(req.options) === "cobranca") {
      return [
        { kind: "wait", ms: 700 },
        { kind: "tool", name: "preparar_cobranca", args: COBRANCA_EXEMPLO },
        { kind: "text", text: "Preparei a cobrança do atendimento do Trovão para o Ricardo, com o link de pagamento. Confere e envio?" },
      ];
    }
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
