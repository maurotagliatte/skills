/**
 * Acervo de exemplo: relatórios, laudos, documentos e aulas da clínica (todos fictícios).
 * As posições no mapa são pré-definidas por assunto: o que fala da mesma coisa fica perto.
 */

export type Tipo = "relatorio" | "aula" | "documento";

export type ClusterId = "tarso" | "aulas" | "salto" | "casco" | "odonto" | "nutricao" | "compra";

export const CLUSTERS: Record<ClusterId, { label: string; x: number; y: number }> = {
  tarso: { label: "Claudicação · jarrete", x: 25, y: 33 },
  aulas: { label: "Aulas do curso", x: 50, y: 50 },
  salto: { label: "Biomecânica de salto", x: 74, y: 22 },
  casco: { label: "Casco e ferrageamento", x: 84, y: 54 },
  odonto: { label: "Odontologia", x: 15, y: 76 },
  nutricao: { label: "Nutrição", x: 42, y: 82 },
  compra: { label: "Exames de compra", x: 77, y: 83 },
};

export type Item = {
  id: string;
  tipo: Tipo;
  cluster: ClusterId;
  /** nome do animal ou do material */
  nome: string;
  /** o que é, em poucas palavras */
  titulo: string;
  /** quando foi */
  data: string;
  resumo: string;
  /** assunto curto, para a cena da leitura */
  assunto: string;
  /** deslocamento manual dentro do grupo (puxa itens para perto de outro assunto) */
  dx?: number;
  dy?: number;
};

const RAW: Item[] = [
  // claudicação · jarrete
  { id: "p-trovao", tipo: "relatorio", cluster: "tarso", nome: "Trovão", titulo: "claudicação no posterior esquerdo", data: "09/11/2026", assunto: "jarrete", resumo: "Quarto de Milha, 8 anos, tambor. Claudicação 3/5 no posterior esquerdo, flexão do jarrete positiva, bloqueio tarsometatarsiano com 80% de melhora. Desgaste no tarso; infiltração com triancinolona." },
  { id: "p-pampa", tipo: "relatorio", cluster: "tarso", nome: "Pampa", titulo: "tambor, posterior esquerdo e desgaste no tarso", data: "03/2025", assunto: "jarrete", resumo: "Quarto de Milha, 9 anos, tambor. Claudicação 2/5 no posterior esquerdo, flexão do jarrete positiva, desgaste na tarsometatarsiana. Infiltração e volta às provas em oito semanas." },
  { id: "p-zorro", tipo: "relatorio", cluster: "tarso", nome: "Zorro", titulo: "reavaliação após infiltração do jarrete", data: "08/2025", assunto: "jarrete", resumo: "Retorno de 30 dias: claudicação de 3/5 para 1/5. Liberado para trabalho leve." },
  { id: "p-estrela", tipo: "relatorio", cluster: "tarso", nome: "Estrela Dalva", titulo: "dor no jarrete após prova de laço", data: "05/2026", assunto: "jarrete", resumo: "Égua de laço, 11 anos. Dor à flexão do jarrete esquerdo, sem efusão. Anti-inflamatório e reavaliação em 10 dias." },
  { id: "p-faisca", tipo: "relatorio", cluster: "tarso", nome: "Faísca", titulo: "potra de 14 meses, posterior direito", data: "02/2026", assunto: "jarrete", resumo: "Efusão na articulação do jarrete, claudicação 2/5 ao trote. Raio-x: osteocondrose." },
  { id: "d-laudo", tipo: "documento", cluster: "tarso", nome: "Laudo de raio-x", titulo: "tarso do Pampa", data: "03/2025", assunto: "jarrete", resumo: "Estreitamento da tarsometatarsiana e osteófitos discretos.", dx: -4, dy: 10 },

  // aulas do curso
  { id: "a-flexao", tipo: "aula", cluster: "aulas", nome: "Aula 2.3", titulo: "exame de flexão do jarrete na prática", data: "turma 3", assunto: "aula", resumo: "Como fazer o teste de flexão do posterior e ler o resultado.", dx: -9, dy: -7 },
  { id: "a-intro", tipo: "aula", cluster: "aulas", nome: "Aula 1.1", titulo: "biomecânica do posterior", data: "turma 3", assunto: "aula", resumo: "Quadril, joelho e jarrete; distribuição de carga." },
  { id: "a-claud", tipo: "aula", cluster: "aulas", nome: "Aula 2.1", titulo: "avaliação de claudicação", data: "turma 3", assunto: "aula", resumo: "Graus de claudicação, linha reta e círculo, piso duro e macio.", dx: -6 },
  { id: "a-bloq", tipo: "aula", cluster: "aulas", nome: "Aula 3.2", titulo: "bloqueios do membro posterior", data: "turma 3", assunto: "aula", resumo: "Sequência de bloqueios do posterior, com vídeos de casos." },
  { id: "a-salto", tipo: "aula", cluster: "aulas", nome: "Aula 4.1", titulo: "impulsão e aterrissagem no salto", data: "turma 3", assunto: "aula", resumo: "O posterior na impulsão e o anterior na aterrissagem.", dx: 9, dy: -8 },

  // biomecânica de salto
  { id: "p-rubi", tipo: "relatorio", cluster: "salto", nome: "Rubi", titulo: "perda de impulsão no salto", data: "10/2025", assunto: "salto", resumo: "Brasileiro de Hipismo, 9 anos. Passada curta no posterior direito." },
  { id: "p-atlas", tipo: "relatorio", cluster: "salto", nome: "Atlas", titulo: "recusas no obstáculo e dor lombar", data: "06/2026", assunto: "salto", resumo: "Dor à palpação do dorso; fisioterapia e troca de sela." },
  { id: "p-lua", tipo: "relatorio", cluster: "salto", nome: "Lua", titulo: "vídeo do salto em câmera lenta", data: "04/2026", assunto: "salto", resumo: "Aterrissagem assimétrica, mais carga no anterior esquerdo." },
  { id: "d-retorno", tipo: "documento", cluster: "salto", nome: "Plano de treino", titulo: "retorno ao salto após lesão", data: "2025", assunto: "salto", resumo: "Oito semanas: guia, trote, cavaletes e altura de prova." },

  // casco
  { id: "p-duque", tipo: "relatorio", cluster: "casco", nome: "Duque", titulo: "abscesso de casco no anterior direito", data: "09/2026", assunto: "casco", resumo: "Claudicação súbita 4/5. Drenagem e bota com curativo." },
  { id: "d-ferrador", tipo: "documento", cluster: "casco", nome: "Orientação ao ferrador", titulo: "ferradura de apoio", data: "2026", assunto: "casco", resumo: "Medidas e tipo de ferradura indicados após a avaliação." },
  { id: "p-maya", tipo: "relatorio", cluster: "casco", nome: "Maya", titulo: "laminite e casqueamento", data: "01/2026", assunto: "casco", resumo: "Égua com sobrepeso; analgesia, palmilhas e dieta." },

  // odontologia
  { id: "p-tufao", tipo: "relatorio", cluster: "odonto", nome: "Tufão", titulo: "desgaste dentário e perda de peso", data: "07/2026", assunto: "dentes", resumo: "Pontas de esmalte; odontoplastia e reavaliação do peso." },
  { id: "p-perola", tipo: "relatorio", cluster: "odonto", nome: "Pérola", titulo: "extração de dente de lobo", data: "03/2026", assunto: "dentes", resumo: "Incômodo com a embocadura; extração sob sedação." },
  { id: "d-odonto", tipo: "documento", cluster: "odonto", nome: "Protocolo", titulo: "revisão odontológica semestral", data: "2025", assunto: "dentes", resumo: "Checklist de exame da boca para atletas." },

  // nutrição
  { id: "p-ventania", tipo: "relatorio", cluster: "nutricao", nome: "Ventania", titulo: "ganho de peso em temporada de provas", data: "08/2026", assunto: "nutrição", resumo: "Escore corporal 4/9; ajuste de concentrado e óleo." },
  { id: "d-dieta", tipo: "documento", cluster: "nutricao", nome: "Plano alimentar", titulo: "potros em crescimento", data: "2025", assunto: "nutrição", resumo: "Cálcio, fósforo e ritmo de ganho.", dx: -5, dy: -6 },
  { id: "p-cometa", tipo: "relatorio", cluster: "nutricao", nome: "Cometa", titulo: "cólica leve após troca de ração", data: "05/2026", assunto: "nutrição", resumo: "Resolvida com analgesia; transição de ração em 10 dias." },

  // exames de compra
  { id: "p-ouro", tipo: "relatorio", cluster: "compra", nome: "Ouro Preto", titulo: "exame de compra com raio-x do jarrete", data: "11/2025", assunto: "compra", resumo: "Sem dor à flexão; raio-x do tarso sem alterações.", dx: -7, dy: -7 },
  { id: "p-saara", tipo: "relatorio", cluster: "compra", nome: "Saara", titulo: "exame de compra, sem achados", data: "09/2026", assunto: "compra", resumo: "Aprovada para tambor." },
  { id: "d-compra", tipo: "documento", cluster: "compra", nome: "Modelo de laudo", titulo: "exame de compra", data: "2026", assunto: "compra", resumo: "Itens do exame clínico e de imagem." },
];

/** Espalha os itens em volta do centro do grupo (ângulo áureo, determinístico). */
export const CORPUS: (Item & { x: number; y: number })[] = (() => {
  const seen: Partial<Record<ClusterId, number>> = {};
  return RAW.map((it) => {
    const i = (seen[it.cluster] = (seen[it.cluster] ?? -1) + 1);
    const c = CLUSTERS[it.cluster];
    // o grupo do Trovão fica mais aberto, para os nomes dos casos achados caberem
    const r = (3.6 + 3.4 * Math.sqrt(i)) * (it.cluster === "tarso" ? 1.7 : 1);
    const a = i * 2.39996 + it.id.length;
    return { ...it, x: c.x + r * Math.cos(a) + (it.dx ?? 0), y: c.y + r * Math.sin(a) * 0.85 + (it.dy ?? 0) };
  });
})();

export const byId = Object.fromEntries(CORPUS.map((c) => [c.id, c])) as Record<string, (typeof CORPUS)[number]>;

/** O caso de hoje, de onde parte a pergunta (capítulo 01). */
export const TROVAO = byId["p-trovao"];
