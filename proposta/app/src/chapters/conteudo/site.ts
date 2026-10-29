/** Blog do site da Dra. Gabriela (EXEMPLO, [confirmar se ela tem blog]). Vai no prompt do agente na aba Post. */
export type Post = {
  titulo: string;
  slug: string;
  status: "publicado" | "rascunho";
  formato: "Caso clínico" | "Guia" | "Lista" | "Opinião";
  tema: string;
  palavras: number;
  cliques: number; // cliques orgânicos/mês
  posicao: number; // posição média
  data: string;
};

export const POSTS: Post[] = [
  { titulo: "Caso clínico: esparavão em cavalo de tambor", slug: "caso-esparavao-cavalo-tambor", status: "publicado", formato: "Caso clínico", tema: "Claudicação", palavras: 2100, cliques: 1380, posicao: 4.1, data: "12 set" },
  { titulo: "Como fazer o teste de flexão em equinos", slug: "teste-de-flexao-em-equinos", status: "publicado", formato: "Guia", tema: "Claudicação", palavras: 1750, cliques: 1120, posicao: 5.3, data: "28 ago" },
  { titulo: "Bloqueios anestésicos diagnósticos: sequência", slug: "bloqueios-anestesicos-diagnosticos", status: "publicado", formato: "Guia", tema: "Claudicação", palavras: 2400, cliques: 940, posicao: 6.0, data: "02 ago" },
  { titulo: "Ferrageamento corretivo: o que o veterinário avalia", slug: "ferrageamento-corretivo", status: "publicado", formato: "Guia", tema: "Ferrageamento", palavras: 1600, cliques: 640, posicao: 8.7, data: "15 jul" },
  { titulo: "Reabilitação de tendão: as primeiras 8 semanas", slug: "reabilitacao-tendao-8-semanas", status: "publicado", formato: "Caso clínico", tema: "Reabilitação", palavras: 1900, cliques: 590, posicao: 9.2, data: "30 jun" },
  { titulo: "7 sinais de dor no dorso do cavalo atleta", slug: "sinais-dor-dorso-cavalo", status: "publicado", formato: "Lista", tema: "Biomecânica", palavras: 900, cliques: 420, posicao: 11.4, data: "18 jun" },
  { titulo: "Suplementação articular funciona?", slug: "suplementacao-articular", status: "publicado", formato: "Opinião", tema: "Nutrição", palavras: 700, cliques: 140, posicao: 23.8, data: "04 jun" },
  { titulo: "Biomecânica do galope: o que muda no salto", slug: "biomecanica-galope-salto", status: "rascunho", formato: "Guia", tema: "Biomecânica", palavras: 0, cliques: 0, posicao: 0, data: "—" },
];

export const PERFORMANCE = {
  formato: [
    { k: "Caso clínico", v: 985 },
    { k: "Guia passo a passo", v: 900 },
    { k: "Lista", v: 420 },
    { k: "Opinião", v: 140 },
  ],
  tamanho: [
    { k: "menos de 800 palavras", v: 140 },
    { k: "800 – 1.500", v: 420 },
    { k: "1.500 – 2.500", v: 930 },
  ],
  tema: [
    { k: "Claudicação", v: 1150 },
    { k: "Ferrageamento", v: 640 },
    { k: "Reabilitação", v: 590 },
    { k: "Biomecânica", v: 420 },
    { k: "Nutrição", v: 140 },
  ],
};

export function contextoSite() {
  const publicados = POSTS.filter((p) => p.status === "publicado").map((p) => ({ titulo: p.titulo, url: `/blog/${p.slug}`, formato: p.formato, tema: p.tema, palavras: p.palavras, cliques_mes: p.cliques }));
  return JSON.stringify({ site: "gabrielaguenka.com.br", cursos: ["/cursos"], aviso: "blog de exemplo [confirmar se ela tem blog]", posts_publicados: publicados, media_cliques_por_post: PERFORMANCE }, null, 1);
}
