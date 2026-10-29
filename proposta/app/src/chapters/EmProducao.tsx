"use client";

import type { ChapterProps } from "@/engine/types";
import { Overlay } from "@/engine/ChapterFrame";
import { Button } from "@/kit";

/** Marcador para capítulos ainda em produção. */
export function emProducao(title: string, resumo: string) {
  return function EmProducao({ onNext }: ChapterProps) {
    return (
      <Overlay show side="center">
        <div style={{ width: 520, color: "var(--text-inv)", textAlign: "center" }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Em produção
          </div>
          <div className="display" style={{ fontSize: 40, marginBottom: 12 }}>
            {title}
          </div>
          <p style={{ color: "var(--text-inv-2)", fontSize: 16, lineHeight: 1.55, marginBottom: 24 }}>{resumo}</p>
          <Button onClick={onNext}>Próximo capítulo</Button>
        </div>
      </Overlay>
    );
  };
}
