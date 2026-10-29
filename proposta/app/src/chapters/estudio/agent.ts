import type { AgentRequest, ChapterAgent, DemoStep } from "@/agent/protocol";

/**
 * Estúdio: a Donna orquestra três especialistas (Designer, Redatora, Diagramadora) e
 * devolve uma peça com a marca da Dra. Gabriela — documento, arte para Instagram ou slide deck.
 * As tools são de render: o Claude chama, o frontend monta a peça.
 */

export type Aba = "documento" | "arte" | "slides";

export const FOTOS = ["oliva", "dourado", "areia", "noite", "musgo", "pessego"] as const;
export type Foto = (typeof FOTOS)[number];

export type Documento = {
  titulo: string;
  tipo: string;
  secoes: { titulo: string; texto: string }[];
  rodape: string;
};
export type Arte = {
  foto: Foto;
  layout: "topo" | "base" | "centro";
  headline: string;
  subtitulo: string;
  cta: string;
};
export type Slide = { titulo: string; bullets: string[]; tipo: "capa" | "conteudo" | "fechamento" };
export type Deck = { slides: Slide[] };

export const TOOL_POR_ABA: Record<Aba, string> = { documento: "gerar_documento", arte: "gerar_arte", slides: "gerar_slides" };

export const PEDIDOS: Record<Aba, string> = {
  documento: "Termo de consentimento para infiltração articular",
  arte: "Post anunciando a nova turma do curso de biomecânica",
  slides: "Aula 1: introdução à biomecânica do posterior",
};

/** O frontend manda "[aba] pedido" em req.text. */
export function lerPedido(text?: string): { aba: Aba; pedido: string } {
  const m = (text ?? "").match(/^\[(documento|arte|slides)\]\s*([\s\S]*)$/);
  const aba = (m?.[1] as Aba) ?? "documento";
  return { aba, pedido: (m?.[2] ?? "").trim() || PEDIDOS[aba] };
}

const str = { type: "string" };

export const agent: ChapterAgent = {
  system: [
    "Você é a Donna, assistente da Dra. Gabriela Guenka, médica veterinária de equinos especialista em biomecânica, que também vende cursos.",
    "No Estúdio você coordena três especialistas — Designer, Redatora e Diagramadora — e entrega uma peça pronta com a marca dela (vinho #7b2a2e e tinta #2b2b2b).",
    "Chame exatamente a ferramenta da aba pedida: gerar_documento, gerar_arte ou gerar_slides.",
    "Documento: linguagem técnica e clara, 4 a 6 seções curtas (2 a 3 frases cada), pronto para impressão; termos de consentimento terminam com uma seção de declaração do tutor.",
    "Arte para Instagram: headline curta (até 7 palavras), subtítulo de uma frase, CTA de 2 a 4 palavras; escolha a foto e o layout que deixam o texto legível.",
    "Slides: 5 a 7 slides, o primeiro do tipo capa e o último fechamento; bullets curtos (até 10 palavras), no máximo 4 por slide.",
    "Nada de slogans ou exageros: fale como ela fala com tutores e alunos. Português do Brasil.",
  ].join(" "),
  tools: [
    {
      name: "gerar_documento",
      description: "Monta um documento A4 com o cabeçalho e a marca d'água da clínica.",
      parameters: {
        type: "object",
        properties: {
          titulo: str,
          tipo: { type: "string", description: "Ex.: Termo de consentimento, Laudo, Orientação pós-procedimento" },
          secoes: { type: "array", items: { type: "object", properties: { titulo: str, texto: str }, required: ["titulo", "texto"] } },
          rodape: { type: "string", description: "Linha de rodapé (local, data, campos de assinatura)" },
        },
        required: ["titulo", "tipo", "secoes", "rodape"],
      },
    },
    {
      name: "gerar_arte",
      description: "Monta uma arte 1080×1350 para o Instagram no editor, camada por camada.",
      parameters: {
        type: "object",
        properties: {
          foto: { type: "string", enum: [...FOTOS], description: "Foto de fundo do banco da marca" },
          layout: { type: "string", enum: ["topo", "base", "centro"], description: "Onde fica o bloco de texto" },
          headline: str,
          subtitulo: str,
          cta: str,
        },
        required: ["foto", "layout", "headline", "subtitulo", "cta"],
      },
    },
    {
      name: "gerar_slides",
      description: "Monta um slide deck com o manual da marca aplicado.",
      parameters: {
        type: "object",
        properties: {
          slides: {
            type: "array",
            items: {
              type: "object",
              properties: { titulo: str, bullets: { type: "array", items: str }, tipo: { type: "string", enum: ["capa", "conteudo", "fechamento"] } },
              required: ["titulo", "bullets", "tipo"],
            },
          },
        },
        required: ["slides"],
      },
    },
  ],
  prompt: (req) => {
    const { aba, pedido } = lerPedido(req.text);
    const nome = { documento: "Documento", arte: "Arte para Instagram", slides: "Slide deck" }[aba];
    return `Aba: ${nome}. Use a ferramenta ${TOOL_POR_ABA[aba]}.\n\nPedido da Dra. Gabriela:\n"""${pedido}"""`;
  },
  demo: (req) => demoPara(req),
};

function demoPara(req: AgentRequest): DemoStep[] {
  const { aba } = lerPedido(req.text);
  const fala: Record<Aba, string> = {
    documento: "Termo pronto, com o cabeçalho e a marca d'água da clínica. Dá para imprimir ou salvar em PDF.",
    arte: "Arte pronta no tamanho do feed (1080×1350). As camadas ficam editáveis se quiser trocar a foto.",
    slides: "Deck com seis slides, nas cores do seu manual. Deixei espaço para os vídeos de marcha no slide 4.",
  };
  const args = { documento: EXEMPLO_DOCUMENTO, arte: EXEMPLO_ARTE, slides: EXEMPLO_DECK }[aba];
  return [
    { kind: "wait", ms: 400 },
    { kind: "tool", name: TOOL_POR_ABA[aba], args },
    { kind: "text", text: fala[aba] },
  ];
}

export const EXEMPLO_DOCUMENTO: Documento = {
  titulo: "Termo de consentimento para infiltração articular",
  tipo: "Termo de consentimento",
  secoes: [
    {
      titulo: "Identificação",
      texto: "Paciente: Trovão, Quarto de Milha, macho castrado, 8 anos. Tutor: Ricardo Alves. Articulação: tarsometatarsiana, membro posterior esquerdo.",
    },
    {
      titulo: "Procedimento",
      texto:
        "Aplicação intra-articular de corticoide (triancinolona), com tricotomia e antissepsia do local, sob contenção e sedação leve quando necessário. O objetivo é reduzir a inflamação e a dor associadas à osteoartrite distal do tarso.",
    },
    {
      titulo: "Riscos e possíveis complicações",
      texto:
        "Mesmo com técnica asséptica, podem ocorrer aumento de volume transitório, dor local por 24 a 48 horas e, raramente, artrite séptica, que exige tratamento imediato. Fui informado de que o resultado varia entre pacientes.",
    },
    {
      titulo: "Cuidados após a infiltração",
      texto:
        "Repouso em baia por 48 horas, seguido de caminhada controlada de 15 minutos por dia durante duas semanas. Manter o local limpo e seco. Avisar a clínica em caso de calor, inchaço ou piora da claudicação.",
    },
    {
      titulo: "Declaração do tutor",
      texto:
        "Declaro que recebi as informações acima de forma clara, tive a oportunidade de esclarecer dúvidas e autorizo a realização do procedimento no animal sob minha responsabilidade.",
    },
  ],
  rodape: "Local e data ____________________     Assinatura do tutor ____________________     Dra. Gabriela Guenka · CRMV",
};

export const EXEMPLO_ARTE: Arte = {
  foto: "dourado",
  layout: "base",
  headline: "Nova turma de Biomecânica Equina",
  subtitulo: "Do exame de marcha ao plano de treino: 8 semanas, com casos reais da clínica.",
  cta: "Inscrições abertas",
};

export const EXEMPLO_DECK: Deck = {
  slides: [
    { tipo: "capa", titulo: "Introdução à biomecânica do posterior", bullets: ["Aula 1 · Curso de Biomecânica Equina", "Dra. Gabriela Guenka"] },
    { tipo: "conteudo", titulo: "Por que começar pelo posterior", bullets: ["É o motor da locomoção", "Concentra boa parte das claudicações em atletas", "Compensações aparecem no anterior e no dorso"] },
    { tipo: "conteudo", titulo: "Anatomia funcional", bullets: ["Quadril, joelho e jarrete trabalham em conjunto", "Aparelho recíproco: joelho e jarrete fletem juntos", "Tarso distal: pouca mobilidade, muita carga"] },
    { tipo: "conteudo", titulo: "Como avaliar a marcha", bullets: ["Passo e trote em linha reta e em círculo", "Assimetria de pelve na subida e na descida", "Filmagem lenta para comparar os lados"] },
    { tipo: "conteudo", titulo: "Flexão de jarrete na prática", bullets: ["60 segundos de flexão, depois trote imediato", "Compare sempre com o membro contralateral", "Resultado positivo orienta, não fecha diagnóstico"] },
    { tipo: "fechamento", titulo: "Na próxima aula", bullets: ["Bloqueios anestésicos do posterior", "Traga um vídeo de marcha de um paciente"] },
  ],
};
