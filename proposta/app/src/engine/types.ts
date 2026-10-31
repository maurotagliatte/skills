import type { ComponentType } from "react";

/** Contrato de um capítulo. Cada capítulo vive em src/chapters/<id>/ e é registrado em src/chapters/index.ts. */
export type ChapterProps = {
  /** chamado quando ela clica em "Próximo" no cartão de escopo */
  onNext: () => void;
};

export type Chapter = {
  id: string;
  /** "01" … aparece no índice e no título grande ("Prontuário ⁽⁰¹⁾") */
  number: string;
  title: string;
  /** frase curta no índice */
  summary: string;
  Component: ComponentType<ChapterProps>;
};

/**
 * Fases de um capítulo:
 * scene → câmera roda o roteiro (vídeo)
 * pause → card curto com um botão de avançar (data-advance)
 * live  → a Donna respondendo pelo roteiro (AG-UI)
 * scope → cartão "Isso entra no projeto"
 */
export type Phase = "scene" | "pause" | "live" | "scope";
