/**
 * Fonte única do escopo consolidado (capítulo 07 · Proposta).
 * Edite aqui: módulos, o que também entra, fases e o investimento.
 * Texto visível em linguagem simples (ver proposta/COPY.md); os nomes técnicos ficam só em RODAPE_TECNICO.
 */

export type Fase = 1 | 2 | 3;

export type Modulo = {
  /** número do capítulo em que o módulo aparece */
  capitulo: string;
  id: string;
  titulo: string;
  itens: string[];
  fase: Fase;
};

export const MODULOS: Modulo[] = [
  {
    capitulo: "01",
    id: "atendimento",
    titulo: "Atendimento e relatórios",
    itens: [
      "Atalho na tela bloqueada do celular para gravar o atendimento",
      "A Donna monta o relatório a partir do que você falou",
      "Modelos de atendimento, alta, laudo de imagem e internação, e novos quando você pedir",
      "Exportar em PDF ou enviar pelo WhatsApp, sempre depois da sua conferência",
    ],
    fase: 1,
  },
  {
    capitulo: "02",
    id: "contas",
    titulo: "Contas",
    itens: [
      "A foto do boleto, recibo ou Pix vira conta lançada",
      "Aviso no celular na véspera de cada vencimento",
      "Orçamentos; o aprovado vira conta a receber",
      "Cobranças preparadas para enviar ao cliente com um toque",
      "Conferência com o extrato do banco e resumo do mês",
    ],
    fase: 1,
  },
  {
    capitulo: "03",
    id: "conversas",
    titulo: "Conversas com clientes e alunos",
    itens: [
      "O WhatsApp da clínica separado por cliente, aluno e internação",
      "A Donna sugere a resposta; o que você liberar, ela responde sozinha",
      "Compromisso marcado direto da conversa, com lembrete e confirmação",
      "Atualização semanal da internação: conferência na quinta, conta na sexta",
    ],
    fase: 1,
  },
  {
    capitulo: "04",
    id: "numeros",
    titulo: "O que os números dizem",
    itens: [
      "Cada conversa e cada venda guardam de onde a pessoa veio",
      "Um painel com quem chegou, quem comprou e quanto custou, por origem",
      "A Donna explica o que mudou na semana",
      "O anúncio aprende com quem comprou, com os dados protegidos",
    ],
    fase: 2,
  },
  {
    capitulo: "05",
    id: "cursos",
    titulo: "Seus cursos na sua plataforma",
    itens: [
      "Área de membros e página de venda no seu endereço",
      "Cartão, parcelado e Pix",
      "Alunos e cursos atuais trazidos da Hotmart, sem perder acesso",
      "Certificado e comunidade da turma",
    ],
    fase: 2,
  },
  {
    capitulo: "06",
    id: "conteudo",
    titulo: "Conteúdo sem parar a clínica",
    itens: [
      "Aula editada: cortes, legendas, capítulos e descrição",
      "Post para o site, escrito para aparecer no Google",
      "Artes e apresentações com a sua identidade visual",
      "Nada vai ao ar sem a sua aprovação",
    ],
    fase: 3,
  },
];

/** Entra no projeto sem capítulo próprio. */
export const TAMBEM_ENTRA: { titulo: string; texto: string; fase: Fase }[] = [
  {
    titulo: "Perguntar sobre seus casos",
    texto: "Busca nos prontuários e documentos, em português: “cavalos que infiltrei no tarso, como voltaram?”",
    fase: 3,
  },
  {
    titulo: "Seus dados de hoje",
    texto: "Migração do SimplesVet, com o cadastro de clientes e animais e o histórico de cada um.",
    fase: 1,
  },
  {
    titulo: "Relatórios em dois idiomas",
    texto: "Os modelos saem em português e em inglês, para os clientes de fora.",
    fase: 1,
  },
];

/** Nomes técnicos — só aqui, num rodapé discreto da aba Escopo. */
export const RODAPE_TECNICO =
  "Por baixo: app nativo (iOS e Android) com atalho na tela de bloqueio · CRM próprio · API oficial do WhatsApp Business · Google Agenda · leitura de imagem (OCR) e conciliação bancária · busca semântica com embeddings · site com CMS e SEO · Conversions API (Meta) e conversões offline (Google), com dados pessoais em hash SHA-256 · criptografia em trânsito e em repouso.";

export const FASES: { fase: Fase; nome: string; foco: string; entrega: string }[] = [
  {
    fase: 1,
    nome: "Rotina da clínica",
    foco: "Tirar a digitação do seu dia: atendimento, contas e conversas, com a Donna.",
    entrega: "Você grava o atendimento da tela bloqueada, lança contas por foto e responde clientes por áudio.",
  },
  {
    fase: 2,
    nome: "Números e cursos",
    foco: "Saber de onde vêm os bons clientes e alunos e vender os cursos sem a taxa.",
    entrega: "Painel de números, anúncio que aprende com quem compra e cursos na sua plataforma.",
  },
  {
    fase: 3,
    nome: "Conteúdo",
    foco: "Transformar o que você já sabe em aula, post e arte.",
    entrega: "Aulas editadas, posts no site e peças com a sua identidade.",
  },
];

/** O que ainda não tem número: aparece marcado na tela como "a combinar" (nunca inventar). */
export const A_COMBINAR = "a combinar";
/** compatibilidade com o nome antigo */
export const A_DEFINIR = A_COMBINAR;

/** Preço por fase do projeto. */
export const POR_FASE = "R$ 4.900";

/**
 * Investimento: R$ 4.900 por fase, 3 fases = R$ 14.700. Prazos, mensal, pagamento, validade e início
 * ainda sem número — ficam "a combinar" (troque o texto quando o número chegar, ex.: prazo: "8 semanas").
 */
export const INVESTIMENTO = {
  porFase: POR_FASE,
  fases: {
    1: { valor: POR_FASE, prazo: A_COMBINAR },
    2: { valor: POR_FASE, prazo: A_COMBINAR },
    3: { valor: POR_FASE, prazo: A_COMBINAR },
  } as Record<Fase, { valor: string; prazo: string }>,
  total: "R$ 14.700",
  mensal: { rotulo: "Infraestrutura, IA e suporte", valor: A_COMBINAR },
  pagamento: A_COMBINAR,
  validade: A_COMBINAR,
  inicio: A_COMBINAR,
};
