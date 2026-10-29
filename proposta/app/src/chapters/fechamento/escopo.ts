/**
 * Fonte única do escopo consolidado (capítulo 10 · Proposta).
 * Edite aqui: módulos, fases e — quando os números chegarem — o investimento.
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
    id: "prontuario",
    titulo: "Prontuário e relatórios",
    itens: [
      "Exame Locomotor por voz, no seu modelo",
      "Relatórios de atendimento, internação, imagem e alta",
      "Status de conferência e envio pelo WhatsApp",
      "Clientes e pacientes migrados do SimplesVet",
    ],
    fase: 1,
  },
  {
    capitulo: "02",
    id: "financeiro",
    titulo: "Financeiro",
    itens: ["Orçamentos aprovados e não aprovados", "Contas a pagar, a receber e a enviar", "Leitura de comprovantes e boletos", "Alertas, conciliação e relatórios"],
    fase: 1,
  },
  {
    capitulo: "03",
    id: "agenda",
    titulo: "Agenda",
    itens: ["Integrada ao Google Agenda", "Marcação por áudio e WhatsApp", "Lembretes para você e o tutor"],
    fase: 1,
  },
  {
    capitulo: "04",
    id: "cursos",
    titulo: "Plataforma de cursos",
    itens: ["Área de membros e checkout próprios", "Migração dos alunos da Hotmart", "Agente que edita e publica aulas"],
    fase: 2,
  },
  {
    capitulo: "05",
    id: "leads",
    titulo: "Leads e CRM",
    itens: ["Funil de leads por origem", "Painel de qualidade por anúncio", "Insights semanais da Donna"],
    fase: 2,
  },
  {
    capitulo: "06",
    id: "cms",
    titulo: "Conteúdo e SEO",
    itens: ["CMS do site e do blog", "Agente que pesquisa e escreve posts", "Métricas de tráfego orgânico"],
    fase: 3,
  },
  {
    capitulo: "07",
    id: "estudio",
    titulo: "Estúdio",
    itens: ["Documentos com timbre e marca d'água", "Artes para Instagram", "Slides com o manual da marca"],
    fase: 3,
  },
  {
    capitulo: "08",
    id: "busca",
    titulo: "Busca semântica",
    itens: ["Indexação de prontuários, aulas e docs", "Busca em linguagem natural", "Casos parecidos com o porquê"],
    fase: 3,
  },
  {
    capitulo: "09",
    id: "atribuicao",
    titulo: "Venda real",
    itens: ["WhatsApp integrado ao CRM", "Conversões offline para Meta e Google", "Relatório de custo por venda"],
    fase: 2,
  },
];

export const FASES: { fase: Fase; nome: string; foco: string; entrega: string }[] = [
  {
    fase: 1,
    nome: "Rotina da clínica",
    foco: "Tirar a digitação do seu dia: prontuário, contas e agenda num só app, com a Donna.",
    entrega: "Você grava exames, lança contas por foto e marca compromissos por áudio.",
  },
  {
    fase: 2,
    nome: "Cursos e vendas",
    foco: "Trazer os cursos para casa e ligar cada venda à origem do aluno.",
    entrega: "Cursos na plataforma própria, leads no CRM e anúncios otimizados por venda.",
  },
  {
    fase: 3,
    nome: "Conteúdo e conhecimento",
    foco: "Transformar o que você já sabe em conteúdo, material e busca.",
    entrega: "Blog publicado com SEO, estúdio com a sua marca e busca em todo o acervo.",
  },
];

/**
 * Investimento e prazos — A DEFINIR. Troque os textos quando os números chegarem
 * (ex.: valor: "R$ 00.000", prazo: "8 semanas"). Tudo o que estiver "a definir" aparece marcado na tela.
 */
export const INVESTIMENTO = {
  fases: {
    1: { valor: "a definir", prazo: "a definir" },
    2: { valor: "a definir", prazo: "a definir" },
    3: { valor: "a definir", prazo: "a definir" },
  } as Record<Fase, { valor: string; prazo: string }>,
  total: "a definir",
  mensal: { rotulo: "Infraestrutura, IA e suporte", valor: "a definir" },
  pagamento: "a definir",
  validade: "a definir",
  inicio: "a definir",
};

export const A_DEFINIR = "a definir";
