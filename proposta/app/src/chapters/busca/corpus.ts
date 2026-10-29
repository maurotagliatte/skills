/**
 * Acervo de exemplo da busca semântica: prontuários, aulas e documentos da clínica.
 * As coordenadas 2D são pré-definidas por assunto (no projeto, saem de uma projeção dos embeddings).
 */

export type Tipo = "prontuario" | "aula" | "documento" | "financeiro";

export type ClusterId = "tarso" | "aulas" | "salto" | "casco" | "odonto" | "nutricao" | "financeiro";

export const CLUSTERS: Record<ClusterId, { label: string; x: number; y: number }> = {
  tarso: { label: "Claudicação · tarso e jarrete", x: 24, y: 30 },
  aulas: { label: "Aulas do curso", x: 50, y: 50 },
  salto: { label: "Biomecânica de salto", x: 74, y: 22 },
  casco: { label: "Casco e ferrageamento", x: 84, y: 54 },
  odonto: { label: "Odontologia", x: 15, y: 76 },
  nutricao: { label: "Nutrição", x: 42, y: 82 },
  financeiro: { label: "Financeiro", x: 77, y: 83 },
};

export type Item = {
  id: string;
  tipo: Tipo;
  cluster: ClusterId;
  titulo: string;
  resumo: string;
  /** termos para o ranqueamento roteirizado do modo de exemplo */
  kw: string[];
  /** deslocamento manual dentro do grupo (puxa itens para perto de outro assunto) */
  dx?: number;
  dy?: number;
};

const RAW: Item[] = [
  // claudicação · tarso e jarrete
  { id: "p-trovao", tipo: "prontuario", cluster: "tarso", titulo: "Trovão · claudicação no posterior esquerdo", resumo: "Quarto de Milha, 8 anos, atleta de tambor. Grau 3/5, flexão de jarrete positiva, bloqueio tarsometatarsiano com 80% de melhora. Suspeita de osteoartrite distal do tarso; infiltração com triancinolona.", kw: ["claudicacao", "posterior", "tarso", "jarrete", "flexao", "osteoartrite", "esparavao", "infiltracao", "quarto de milha", "tambor", "trovao", "adulto"] },
  { id: "p-faisca", tipo: "prontuario", cluster: "tarso", titulo: "Faísca · potra de 14 meses, claudicação no posterior direito", resumo: "Efusão na articulação tarsocrural, claudicação 2/5 ao trote. Suspeita de osteocondrose (OCD); radiografia solicitada.", kw: ["potro", "claudicacao", "posterior", "jarrete", "tarso", "ocd", "osteocondrose", "efusao", "jovem"] },
  { id: "p-bento", tipo: "prontuario", cluster: "tarso", titulo: "Bento · potro de 10 meses, claudicação leve no posterior", resumo: "Aumento de volume nas fises distais, dor leve. Epifisite associada ao crescimento rápido; ajuste de dieta e restrição de exercício.", kw: ["potro", "claudicacao", "posterior", "epifisite", "crescimento", "dieta", "jovem"], dx: 6, dy: 9 },
  { id: "p-estrela", tipo: "prontuario", cluster: "tarso", titulo: "Estrela Dalva · dor no jarrete após prova de laço", resumo: "Égua de laço, 11 anos. Dor à flexão do jarrete esquerdo, sem efusão. Anti-inflamatório e reavaliação em 10 dias.", kw: ["jarrete", "tarso", "flexao", "laco", "dor", "posterior"] },
  { id: "p-zorro", tipo: "prontuario", cluster: "tarso", titulo: "Zorro · reavaliação após infiltração de tarso", resumo: "Retorno de 30 dias: claudicação de 3/5 para 1/5. Liberado para trabalho leve.", kw: ["infiltracao", "tarso", "reavaliacao", "claudicacao", "triancinolona", "retorno"] },
  { id: "d-termo", tipo: "documento", cluster: "tarso", titulo: "Termo de consentimento · infiltração articular", resumo: "Modelo da clínica: procedimento, riscos e cuidados após a infiltração intra-articular.", kw: ["termo", "consentimento", "infiltracao", "articular", "documento"], dx: -4, dy: 10 },
  { id: "d-laudo", tipo: "documento", cluster: "tarso", titulo: "Laudo radiográfico · tarso do Trovão", resumo: "Estreitamento do espaço articular tarsometatarsiano e osteófitos discretos. Compatível com osteoartrite distal do tarso.", kw: ["laudo", "radiografia", "raio-x", "tarso", "osteoartrite", "trovao"] },

  // aulas do curso
  { id: "a-flexao", tipo: "aula", cluster: "aulas", titulo: "Aula 2.3 · Exame de flexão do jarrete na prática", resumo: "Como fazer o teste de flexão do posterior, tempo de flexão, leitura do resultado e erros comuns.", kw: ["aula", "flexao", "jarrete", "tarso", "teste", "posterior", "exame"], dx: -9, dy: -7 },
  { id: "a-intro", tipo: "aula", cluster: "aulas", titulo: "Aula 1.1 · Introdução à biomecânica do posterior", resumo: "Anatomia funcional do quadril, joelho e jarrete; aparelho recíproco e distribuição de carga.", kw: ["aula", "biomecanica", "posterior", "jarrete", "aparelho reciproco", "anatomia"] },
  { id: "a-claud", tipo: "aula", cluster: "aulas", titulo: "Aula 2.1 · Avaliação de claudicação em linha reta e no círculo", resumo: "Graus AAEP, assimetria de pelve e de cabeça, piso duro e macio.", kw: ["aula", "claudicacao", "avaliacao", "marcha", "trote", "aaep"], dx: -6 },
  { id: "a-bloq", tipo: "aula", cluster: "aulas", titulo: "Aula 3.2 · Bloqueios anestésicos do membro posterior", resumo: "Sequência de bloqueios perineurais e intra-articulares do posterior, com vídeos de casos.", kw: ["aula", "bloqueio", "anestesico", "posterior", "tarso", "intra-articular"] },
  { id: "a-salto", tipo: "aula", cluster: "aulas", titulo: "Aula 4.1 · Biomecânica do salto: impulsão e aterrissagem", resumo: "Fases do salto, papel do posterior na impulsão e sobrecarga do anterior na aterrissagem.", kw: ["aula", "salto", "impulsao", "aterrissagem", "biomecanica", "hipismo"], dx: 9, dy: -8 },
  { id: "a-live", tipo: "aula", cluster: "aulas", titulo: "Live com alunos · dúvidas sobre osteoartrite", resumo: "Perguntas da turma 3 sobre manejo de osteoartrite em atletas e quando infiltrar.", kw: ["aula", "live", "osteoartrite", "infiltracao", "tarso", "alunos"] },

  // biomecânica de salto
  { id: "p-rubi", tipo: "prontuario", cluster: "salto", titulo: "Rubi · perda de impulsão no salto", resumo: "Brasileiro de Hipismo, 9 anos. Encurtamento de passada no posterior direito e dor sacroilíaca.", kw: ["salto", "impulsao", "hipismo", "posterior", "sacroiliaca", "passada"] },
  { id: "p-atlas", tipo: "prontuario", cluster: "salto", titulo: "Atlas · recusas no obstáculo e dor lombar", resumo: "Dor à palpação toracolombar, sela inadequada. Fisioterapia e troca de sela.", kw: ["salto", "recusa", "lombar", "dorso", "hipismo", "sela"] },
  { id: "p-lua", tipo: "prontuario", cluster: "salto", titulo: "Lua · análise de vídeo do salto em câmera lenta", resumo: "Aterrissagem assimétrica, carga maior no anterior esquerdo. Plano de fortalecimento.", kw: ["salto", "video", "biomecanica", "aterrissagem", "anterior", "camera lenta"] },
  { id: "d-retorno", tipo: "documento", cluster: "salto", titulo: "Plano de treino · retorno ao salto após lesão", resumo: "Oito semanas: guia, trote, cavaletes e retorno gradual à altura de prova.", kw: ["treino", "salto", "retorno", "reabilitacao", "plano"] },

  // casco
  { id: "p-duque", tipo: "prontuario", cluster: "casco", titulo: "Duque · abscesso de casco no anterior direito", resumo: "Claudicação súbita 4/5, pinça positiva. Drenagem e bota com curativo.", kw: ["casco", "abscesso", "anterior", "claudicacao", "pinca"] },
  { id: "d-ferrador", tipo: "documento", cluster: "casco", titulo: "Orientação ao ferrador · ferradura de apoio", resumo: "Medidas, ângulo de pinça e tipo de ferradura indicados após a avaliação.", kw: ["ferradura", "ferrageamento", "casco", "ferrador"] },
  { id: "p-maya", tipo: "prontuario", cluster: "casco", titulo: "Maya · laminite, controle de dor e casqueamento", resumo: "Égua com sobrepeso, rotação discreta de falange. Analgesia, palmilhas e dieta.", kw: ["laminite", "casco", "dor", "sobrepeso", "dieta"] },

  // odontologia
  { id: "p-tufao", tipo: "prontuario", cluster: "odonto", titulo: "Tufão · desgaste dentário e perda de peso", resumo: "Pontas de esmalte e úlceras na bochecha. Odontoplastia e reavaliação do peso em 30 dias.", kw: ["dente", "odontologia", "peso", "mastigacao", "odontoplastia"] },
  { id: "p-perola", tipo: "prontuario", cluster: "odonto", titulo: "Pérola · extração de dente de lobo", resumo: "Incômodo com a embocadura. Extração sob sedação, sem intercorrências.", kw: ["dente", "lobo", "extracao", "odontologia", "embocadura", "freio"] },
  { id: "d-odonto", tipo: "documento", cluster: "odonto", titulo: "Protocolo · revisão odontológica semestral", resumo: "Checklist de exame da boca e intervalo recomendado para atletas.", kw: ["odontologia", "dente", "protocolo", "revisao"] },

  // nutrição
  { id: "p-ventania", tipo: "prontuario", cluster: "nutricao", titulo: "Ventania · ganho de peso e dieta para atleta", resumo: "Escore corporal 4/9 em temporada de provas. Ajuste de concentrado e óleo.", kw: ["dieta", "nutricao", "peso", "racao", "atleta", "concentrado"] },
  { id: "d-dieta", tipo: "documento", cluster: "nutricao", titulo: "Plano alimentar · potros em crescimento", resumo: "Relação cálcio:fósforo, minerais e ritmo de ganho para evitar doenças do desenvolvimento.", kw: ["potro", "dieta", "nutricao", "crescimento", "mineral", "epifisite"], dx: -5, dy: -6 },
  { id: "a-nutri", tipo: "aula", cluster: "nutricao", titulo: "Aula convidada · nutrição do cavalo atleta", resumo: "Energia, eletrólitos e suplementação em semana de prova.", kw: ["aula", "nutricao", "dieta", "atleta", "suplementacao"] },
  { id: "p-cometa", tipo: "prontuario", cluster: "nutricao", titulo: "Cometa · cólica leve após troca de ração", resumo: "Cólica espasmódica resolvida com analgesia; transição de ração em 10 dias.", kw: ["colica", "racao", "nutricao", "dieta", "troca"] },

  // financeiro
  { id: "f-nf", tipo: "financeiro", cluster: "financeiro", titulo: "Nota fiscal · atendimentos do Haras Santa Fé (outubro)", resumo: "Seis atendimentos, incluindo duas infiltrações e um exame de compra.", kw: ["nota", "fiscal", "haras", "cobranca", "pagamento"] },
  { id: "f-boleto", tipo: "financeiro", cluster: "financeiro", titulo: "Boleto · aluguel do aparelho de raio-x", resumo: "Vencimento todo dia 10; débito recorrente.", kw: ["boleto", "pagamento", "raio-x", "conta", "aluguel"] },
  { id: "f-vendas", tipo: "financeiro", cluster: "financeiro", titulo: "Relatório de vendas · turma 3 do curso", resumo: "Inscrições por origem e receita líquida da turma.", kw: ["vendas", "curso", "turma", "receita", "inscricoes"], dx: -8, dy: -6 },
  { id: "f-recibo", tipo: "financeiro", cluster: "financeiro", titulo: "Recibo · infiltração do Trovão", resumo: "Pagamento por Pix do tutor Ricardo Alves.", kw: ["recibo", "pagamento", "trovao", "infiltracao", "pix"] },
];

/** Espalha os itens em volta do centro do grupo (ângulo áureo, determinístico). */
export const CORPUS: (Item & { x: number; y: number })[] = (() => {
  const seen: Partial<Record<ClusterId, number>> = {};
  return RAW.map((it) => {
    const i = (seen[it.cluster] = (seen[it.cluster] ?? -1) + 1);
    const c = CLUSTERS[it.cluster];
    const r = 3.2 + 3 * Math.sqrt(i);
    const a = i * 2.39996 + it.id.length;
    return { ...it, x: c.x + r * Math.cos(a) + (it.dx ?? 0), y: c.y + r * Math.sin(a) * 0.85 + (it.dy ?? 0) };
  });
})();

export const byId = Object.fromEntries(CORPUS.map((c) => [c.id, c])) as Record<string, (typeof CORPUS)[number]>;
