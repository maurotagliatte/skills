import type { AgentRequest, ChapterAgent, DemoStep } from "@/agent/protocol";

/* ——— O documento que a Donna monta ——— */

/** Tipo de relatório pedido. O visual (editorial, clínico, bilíngue, WhatsApp) é escolha da tela. */
export type Modelo = "atendimento" | "alta" | "laudo" | "internacao" | "final" | "livre";
export type Idioma = "pt" | "en" | "pt-en";

export type Secao = {
  titulo: string;
  titulo_en?: string;
  /** parágrafo curto */
  texto?: string;
  texto_en?: string;
  /** tópicos (use itens OU texto) */
  itens?: string[];
  itens_en?: string[];
  /** marca os itens para a Dra. conferir antes de enviar (dose, tempo, conclusão) */
  conferir?: boolean;
  /** seção que só se completa depois (ex.: notas da semana na internação): diz com o quê */
  pendente?: string;
};

export type Paciente = {
  nome: string;
  raca: string;
  sexo: string;
  idade: string;
  pelagem: string;
  esporte: string;
  cliente: string;
  propriedade: string;
  /** "09/11/2026" */
  data: string;
  /** CPF do cliente; vazio se não foi dito */
  documento: string;
  endereco: string;
};

export type Relatorio = {
  modelo: Modelo;
  /** nome do modelo quando ela inventa um ("Para o treinador") */
  nome_modelo?: string;
  idioma: Idioma;
  titulo: string;
  titulo_en?: string;
  paciente: Paciente;
  /** resumo em linguagem de cliente, 1 a 2 frases */
  resumo?: string;
  resumo_en?: string;
  secoes: Secao[];
  /** dados técnicos do exame, numa faixa discreta (flexões, projeções, casco) */
  dados_exame?: string[];
  /** campos deixados em branco porque não apareceram no áudio */
  pendencias?: string[];
  /** versão curta para mandar no corpo da mensagem do WhatsApp */
  mensagem_whatsapp?: string;
  assinatura: { nome: string; registro: string };
};

/** Opções da pausa "Precisa de outro relatório?" — vão em AgentRequest.options.pedido */
export const PEDIDOS = ["alta", "laudo", "internacao", "final", "livre"] as const;
export type Pedido = (typeof PEDIDOS)[number];

/* ——— Exemplo: o Trovão (paciente fictício) ——— */

export const EXEMPLO_TRANSCRICAO =
  "Atendimento do Trovão, Quarto de Milha, macho castrado, oito anos, alazão, cavalo de tambor do Ricardo Alves, no Haras Santa Fé. " +
  "Está mancando do posterior esquerdo há três semanas, pior depois do treino. " +
  "Casco com aprumo correto, sem dor na pinça, ferrado há trinta dias. " +
  "Na guia, claudicação três de cinco no posterior esquerdo, pior no círculo para a esquerda no piso duro. " +
  "Flexão do jarrete esquerdo positiva, mais dois; soldra esquerda, jarrete direito e carpos negativos. " +
  "Raio-x do tarso esquerdo, quatro projeções: proliferação óssea nas articulações intertársica distal e tarsometatarsiana. Ultrassom do suspensório normal. " +
  "Bloqueei a tarsometatarsiana, melhorou oitenta por cento, e infiltrei com triancinolona. " +
  "Orientei dois dias de baia, depois caminhada à mão, e volta ao treino aos poucos. Reavalio nos próximos dias.";

const PACIENTE: Paciente = {
  nome: "Trovão",
  raca: "Quarto de Milha",
  sexo: "Macho castrado",
  idade: "8 anos",
  pelagem: "Alazão",
  esporte: "Tambor",
  cliente: "Ricardo Alves",
  propriedade: "Haras Santa Fé",
  data: "09/11/2026",
  documento: "",
  endereco: "",
};

const ASSINATURA = { nome: "Dra. Gabriela S. M. Guenka", registro: "CRMV-DF 0886 · CRMV-GO 05033" };

export const EXEMPLO_RELATORIO: Relatorio = {
  modelo: "atendimento",
  idioma: "pt-en",
  titulo: "Relatório de atendimento",
  titulo_en: "Visit report",
  paciente: PACIENTE,
  resumo:
    "O Trovão manca da perna de trás esquerda por um desgaste na articulação do jarrete. Hoje infiltramos essa articulação para aliviar a dor, e ele volta ao treino aos poucos.",
  resumo_en:
    "Trovão is lame on the left hind leg because of wear in the hock joint. Today we injected the joint to relieve the pain, and he will return to training gradually.",
  secoes: [
    {
      titulo: "Por que fomos chamados",
      titulo_en: "Why we were called",
      texto: "Manca do posterior esquerdo há três semanas, pior depois do treino.",
      texto_en: "Lame on the left hind for three weeks, worse after training.",
    },
    {
      titulo: "O que encontramos",
      titulo_en: "What we found",
      itens: [
        "Claudicação 3 de 5 no posterior esquerdo, pior no círculo à esquerda em piso duro",
        "Flexão do jarrete esquerdo positiva",
        "Raio-x: proliferação óssea nas articulações de baixo do tarso",
        "Ultrassom do ligamento suspensório normal",
      ],
      itens_en: [
        "Grade 3/5 lameness, left hind, worse on the left circle on hard ground",
        "Positive left hock flexion",
        "X-ray: bone proliferation in the lower hock joints",
        "Normal suspensory ligament ultrasound",
      ],
    },
    {
      titulo: "O que fizemos",
      titulo_en: "What we did",
      itens: ["Bloqueio anestésico da articulação: 80% de melhora", "Infiltração da articulação com triancinolona"],
      itens_en: ["Joint nerve block: 80% improvement", "Joint injection with triamcinolone"],
    },
    {
      titulo: "Próximos passos",
      titulo_en: "Next steps",
      itens: ["Dois dias de baia, depois caminhada à mão", "Volta ao treino aos poucos", "Reavaliação nos próximos dias, data a combinar"],
      itens_en: ["Two days of stall rest, then hand walking", "Gradual return to training", "Re-check in the coming days, date to be set"],
    },
  ],
  dados_exame: [
    "Flexões: jarrete MPE +2/5; soldra MPE, jarrete MPD e carpos negativas",
    "Raio-x: 4 projeções do tarso esquerdo (intertársica distal e tarsometatarsiana)",
    "Casco: aprumos corretos, pinça negativa, ferrageamento há 30 dias",
  ],
  pendencias: ["CPF do Ricardo", "Endereço do Ricardo"],
  mensagem_whatsapp:
    "Oi, Ricardo! Segue o relatório do Trovão de hoje. Ele manca de trás por um desgaste no jarrete esquerdo, e infiltramos a articulação. Agora são dois dias de baia, depois caminhada à mão, e o treino volta aos poucos. Combino a reavaliação com você nos próximos dias.",
  assinatura: ASSINATURA,
};

/** Um relatório por opção da pausa 2, com os dados deste atendimento. */
export const EXEMPLOS_PEDIDO: Record<Exclude<Pedido, "livre">, Relatorio> = {
  alta: {
    modelo: "alta",
    idioma: "pt",
    titulo: "Orientações de alta",
    paciente: PACIENTE,
    resumo: "O Trovão recebeu infiltração no jarrete esquerdo hoje. Siga estas orientações até a reavaliação.",
    secoes: [
      {
        titulo: "Repouso e exercício",
        itens: ["Dias 1 e 2: baia, sem exercício", "Dias 3 a 7: caminhada à mão, 15 minutos, duas vezes ao dia", "Treino leve só depois da reavaliação"],
        conferir: true,
      },
      {
        titulo: "Prescrição",
        itens: ["Anti-inflamatório: nome, dose e dias a definir pela Dra.", "Gelo no jarrete por 15 minutos, duas vezes ao dia, por 3 dias"],
        conferir: true,
      },
      {
        titulo: "Avise a Dra. se",
        itens: ["O jarrete ficar quente ou inchado", "Ele mancar mais do que hoje", "Parar de comer"],
      },
      { titulo: "Reavaliação", texto: "Nos próximos dias, no Haras Santa Fé. A data vai pelo WhatsApp." },
    ],
    assinatura: ASSINATURA,
  },
  laudo: {
    modelo: "laudo",
    idioma: "pt",
    titulo: "Laudo de imagem",
    paciente: PACIENTE,
    secoes: [
      { titulo: "Exame", texto: "Radiografia do tarso esquerdo, 4 projeções. Ultrassonografia do ligamento suspensório do posterior esquerdo." },
      { titulo: "Indicação", texto: "Claudicação 3/5 no posterior esquerdo há três semanas, com flexão do jarrete positiva." },
      {
        titulo: "Achados",
        itens: [
          "Proliferação óssea periarticular nas articulações intertársica distal e tarsometatarsiana",
          "Ligamento suspensório com ecogenicidade e espessura normais",
        ],
      },
      {
        titulo: "Conclusão",
        itens: ["Achados compatíveis com osteoartrite distal do tarso"],
        conferir: true,
      },
    ],
    pendencias: ["Conclusão para a sua assinatura"],
    assinatura: ASSINATURA,
  },
  internacao: {
    modelo: "internacao",
    idioma: "pt",
    titulo: "Atualização da semana",
    // a internação da semana é de outro paciente (o Zarco); o modelo fica pronto para ele
    paciente: { ...PACIENTE, nome: "Zarco", raca: "Internado na clínica", sexo: "", idade: "", pelagem: "", esporte: "", cliente: "", propriedade: "", data: "13/11/2026" },
    resumo: "Modelo da atualização semanal da internação, pronto para o Zarco. Na quinta, a Donna preenche com as notas e fotos do grupo para você conferir.",
    secoes: [
      { titulo: "Como ele passou a semana", pendente: "As notas do grupo da internação, dia a dia" },
      { titulo: "Fotos", pendente: "As três melhores fotos da semana, com data" },
      { titulo: "Medicação e curativos", pendente: "O que foi feito e o que muda" },
      { titulo: "Próxima semana", pendente: "O plano que você aprovar" },
      { titulo: "Conta da semana", texto: "Vai no grupo na sexta, depois da sua conferência." },
    ],
    assinatura: ASSINATURA,
  },
  final: {
    modelo: "final",
    idioma: "pt",
    titulo: "Relatório final do caso",
    paciente: PACIENTE,
    resumo: "Resumo do caso do Trovão a partir do histórico. A evolução depois da reavaliação entra quando você registrar.",
    secoes: [
      { titulo: "Histórico", texto: "Claudicação no posterior esquerdo há três semanas, pior depois do treino." },
      { titulo: "Diagnóstico", itens: ["Osteoartrite distal do tarso esquerdo (raio-x e bloqueio positivo)"], conferir: true },
      { titulo: "Tratamento", itens: ["09/11: bloqueio tarsometatarsiano, 80% de melhora", "09/11: infiltração com triancinolona"] },
      { titulo: "Evolução", pendente: "A reavaliação desta semana e as seguintes" },
      { titulo: "Prognóstico e recomendações", pendente: "Para você completar ao fechar o caso" },
    ],
    assinatura: ASSINATURA,
  },
};

/** Relatório "do meu jeito": o nome sai do pedido; o exemplo é para o treinador, sem termos técnicos. */
export function exemploLivre(pedido: string): Relatorio {
  const nome = nomeDoModelo(pedido);
  return {
    modelo: "livre",
    nome_modelo: nome,
    idioma: "pt",
    titulo: nome,
    paciente: PACIENTE,
    resumo: "O Trovão está com dor no jarrete esquerdo, uma junta da perna de trás. Hoje tratamos com uma injeção na junta.",
    secoes: [
      { titulo: "O que muda no treino", itens: ["Dois dias parado na baia", "Depois, só caminhada puxado à mão", "Volta ao tambor aos poucos, quando a Dra. liberar"] },
      { titulo: "Fique de olho", itens: ["Perna quente ou inchada perto do jarrete", "Se ele voltar a mancar mais"] },
      { titulo: "Quem chamar", texto: "A Dra. Gabriela, pelo WhatsApp da clínica." },
    ],
    assinatura: ASSINATURA,
  };
}

export function nomeDoModelo(pedido: string) {
  const p = pedido.trim();
  if (!p) return "Do meu jeito";
  if (/treinador/i.test(p)) return "Para o treinador";
  if (/seguro/i.test(p)) return "Para o seguro";
  if (/veterin|colega/i.test(p)) return "Para o colega";
  const words = p.replace(/^(um|uma|o|a)\s+/i, "").replace(/^relat[óo]rio\s+/i, "").split(/\s+/).slice(0, 4).join(" ");
  return words.charAt(0).toUpperCase() + words.slice(1).replace(/[.,;:]+$/, "");
}

const DONNA_PEDIDO: Record<Exclude<Pedido, "livre">, string> = {
  alta: "Fiz as orientações de alta do Trovão. As prescrições estão marcadas para você conferir dose e tempo antes de enviar.",
  laudo: "Montei o laudo das quatro projeções do tarso esquerdo com os achados que você falou. A conclusão fica para você assinar.",
  internacao: "Montei o modelo da atualização semanal, já com o Zarco. Na internação, ele junta as fotos e notas da semana para você conferir na quinta.",
  final: "Juntei o histórico do Trovão num relatório do caso. A evolução depois da reavaliação fica marcada para você completar.",
};

/* ——— Agente ——— */

const str = { type: "string" };
const strs = { type: "array", items: str };

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, médica veterinária de equinos especialista em biomecânica.",
    "Ela grava o atendimento no haras, pelo celular, e você monta o relatório num documento bonito, pronto para exportar em PDF ou enviar ao cliente pelo WhatsApp.",
    "Sempre chame a ferramenta montar_relatorio uma única vez e depois escreva uma frase curta para a Dra. (no máximo 30 palavras), dizendo o que fez e o que ela precisa conferir.",
    "Regras: use só o que foi dito no áudio ou é inferência clínica óbvia. Nunca invente dose, tempo de tratamento, data, CPF ou endereço: deixe vazio, liste em pendencias e marque conferir: true nas seções com prescrição ou conclusão.",
    "Resumo e seções de cliente em linguagem simples, sem jargão (diga 'jarrete', 'perna de trás'); termos técnicos ficam em dados_exame.",
    "Seções curtas: 3 a 5 seções, até 4 itens cada, itens de até 14 palavras. O documento cabe em uma página A4.",
    "Chame o dono do animal de cliente, nunca de tutor. Português do Brasil.",
    "Quando o idioma for pt-en, preencha também os campos _en (titulo_en, resumo_en, titulo_en/texto_en/itens_en de cada seção) em inglês claro, para clientes internacionais.",
  ].join(" "),
  tools: [
    {
      name: "montar_relatorio",
      description:
        "Monta e preenche um relatório da clínica (atendimento, alta, laudo de imagem, internação, relatório final do caso ou um modelo pedido por ela) para a tela desenhar no papel timbrado.",
      parameters: {
        type: "object",
        properties: {
          modelo: { type: "string", enum: ["atendimento", "alta", "laudo", "internacao", "final", "livre"] },
          nome_modelo: { type: "string", description: "Só para modelo 'livre': nome curto do modelo que ela pediu" },
          idioma: { type: "string", enum: ["pt", "en", "pt-en"] },
          titulo: str,
          titulo_en: str,
          paciente: {
            type: "object",
            properties: {
              nome: str,
              raca: str,
              sexo: str,
              idade: str,
              pelagem: str,
              esporte: str,
              cliente: str,
              propriedade: str,
              data: { type: "string", description: "dd/mm/aaaa; vazio se não foi dita" },
              documento: { type: "string", description: "CPF do cliente; vazio se não foi dito" },
              endereco: str,
            },
            required: ["nome", "raca", "sexo", "idade", "pelagem", "esporte", "cliente", "propriedade", "data", "documento", "endereco"],
          },
          resumo: { type: "string", description: "1 a 2 frases para o cliente, sem jargão" },
          resumo_en: str,
          secoes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                titulo: str,
                titulo_en: str,
                texto: str,
                texto_en: str,
                itens: strs,
                itens_en: strs,
                conferir: { type: "boolean", description: "true quando a Dra. precisa conferir (dose, tempo, conclusão)" },
                pendente: { type: "string", description: "seção que só se completa depois: diga com o quê" },
              },
              required: ["titulo"],
            },
          },
          dados_exame: { ...strs, description: "dados técnicos em linhas curtas (flexões, projeções, casco)" },
          pendencias: { ...strs, description: "campos deixados em branco porque não foram ditos" },
          mensagem_whatsapp: { type: "string", description: "só no relatório de atendimento: versão curta para o corpo da mensagem ao cliente (até 60 palavras)" },
          assinatura: { type: "object", properties: { nome: str, registro: str }, required: ["nome", "registro"] },
        },
        required: ["modelo", "idioma", "titulo", "paciente", "secoes", "assinatura"],
      },
    },
  ],
  prompt: (req) => promptFor(req),
  demo: (req) => demoFor(req),
};

const PEDIDO_TEXTO: Record<Pedido, string> = {
  alta: "Orientações de alta, com prescrições (marque as prescrições para conferir).",
  laudo: "Laudo de imagem (raio-x e ultrassom) com exame, indicação, achados e conclusão para assinar.",
  internacao: "Modelo da atualização semanal da internação, para o grupo do WhatsApp; seções da semana ficam pendentes.",
  final: "Relatório final do caso a partir do histórico; o que ainda não aconteceu fica pendente.",
  livre: "Um modelo do jeito que ela descreveu.",
};

function promptFor(req: AgentRequest) {
  const pedido = req.options?.pedido as Pedido | undefined;
  const assinatura = `Assinatura: ${ASSINATURA.nome}, ${ASSINATURA.registro}.`;
  if (!pedido) {
    return [
      "Transcrição do áudio gravado no atendimento:",
      `"""${req.text ?? EXEMPLO_TRANSCRICAO}"""`,
      "Monte o relatório de atendimento (modelo 'atendimento', idioma 'pt-en'), com resumo para o cliente, dados_exame e mensagem_whatsapp.",
      assinatura,
    ].join("\n\n");
  }
  return [
    "Transcrição do atendimento de hoje:",
    `"""${req.options?.atendimento ?? EXEMPLO_TRANSCRICAO}"""`,
    `Pedido da Dra.: ${PEDIDO_TEXTO[pedido]}${pedido === "livre" && req.text ? ` Nas palavras dela: "${req.text}". Dê um nome curto ao modelo em nome_modelo.` : ""}`,
    `Use o modelo '${pedido}', idioma 'pt'.`,
    assinatura,
  ].join("\n\n");
}

function demoFor(req: AgentRequest): DemoStep[] {
  const pedido = req.options?.pedido as Pedido | undefined;
  if (!pedido) {
    return [
      { kind: "wait", ms: 700 },
      { kind: "tool", name: "montar_relatorio", args: EXEMPLO_RELATORIO },
      { kind: "text", text: "Montei o relatório de atendimento do Trovão. Deixei em branco o CPF e o endereço do Ricardo, que não apareceram no áudio." },
    ];
  }
  if (pedido === "livre") {
    const r = exemploLivre(req.text ?? "");
    return [
      { kind: "wait", ms: 600 },
      { kind: "tool", name: "montar_relatorio", args: r },
      { kind: "text", text: `Criei o modelo “${r.nome_modelo}” e guardei. Da próxima vez é só pedir por esse nome.` },
    ];
  }
  return [
    { kind: "wait", ms: 600 },
    { kind: "tool", name: "montar_relatorio", args: EXEMPLOS_PEDIDO[pedido] },
    { kind: "text", text: DONNA_PEDIDO[pedido] },
  ];
}
