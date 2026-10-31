"use client";

import { IconUsersGroup, IconPhoto, IconNotes, IconCash, IconSparkles, IconChecks } from "@tabler/icons-react";
import { Chip } from "@/kit";

/** Notas da semana do Zarco (paciente de exemplo) que a Donna juntou num texto só. */
const NOTAS = [
  { dia: "sex, 06/11", texto: "Chegou para internação. Curativo no casco anterior direito." },
  { dia: "seg, 09/11", texto: "Comendo bem, sem febre. Curativo trocado." },
  { dia: "ter, 10/11", texto: "Caminhada à mão, 10 minutos, sem claudicação." },
  { dia: "qua, 11/11", texto: "Ultrassom de controle: boa evolução." },
];

export type EstadoGrupo = "pronta" | "aberta";

/** A atualização semanal da internação, preparada para ela conferir na quinta e mandar ao grupo. */
export function Internacao({ estado }: { estado: EstadoGrupo }) {
  return (
    <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 12, boxShadow: "var(--shadow-window)", overflow: "hidden", display: "grid", gridTemplateRows: "auto 1fr auto", color: "var(--text-1)", fontSize: 14.5 }}>
      <div style={{ padding: "14px 18px", background: "#f5f6f6", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 34, height: 34, borderRadius: 99, background: "#3a3d40", color: "#fff", display: "grid", placeItems: "center" }}>
          <IconUsersGroup size={18} />
        </span>
        <span style={{ minWidth: 0 }}>
          <b style={{ display: "block", fontWeight: 600, fontSize: 14 }}>Grupo · internação Zarco</b>
          <span style={{ color: "var(--text-3)" }}>proprietário, tratador e você</span>
        </span>
        <span style={{ marginLeft: "auto" }}>
          <Chip>exemplo</Chip>
        </span>
      </div>

      <div style={{ padding: "16px 18px", display: "grid", alignContent: "start", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="display" style={{ fontSize: 26 }}>
            Atualização da semana
          </span>
          {estado === "aberta" ? (
            <Chip tone="green" icon={IconChecks}>
              aberta no grupo
            </Chip>
          ) : (
            <Chip tone="amber">para você conferir hoje</Chip>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <Chip icon={IconPhoto}>6 fotos da semana</Chip>
          <Chip icon={IconNotes}>4 notas da equipe</Chip>
          <Chip tone="red" icon={IconSparkles}>
            montada pela Donna
          </Chip>
        </div>
        <div style={{ borderRadius: "4px 12px 12px 12px", background: estado === "aberta" ? "#e3f4e8" : "#f3f4f4", padding: "12px 14px", lineHeight: 1.5, transition: "background .5s" }}>
          <p style={{ margin: "0 0 8px" }}>Bom dia, pessoal! A semana do Zarco:</p>
          <div style={{ display: "grid", gap: 6 }}>
            {NOTAS.map((n) => (
              <div key={n.dia} style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 8 }}>
                <span style={{ color: "var(--text-3)" }}>{n.dia}</span>
                <span>{n.texto}</span>
              </div>
            ))}
          </div>
          <p style={{ margin: "8px 0 0" }}>Seguimos com o mesmo manejo. Qualquer dúvida, me chamem aqui.</p>
        </div>
      </div>

      <div style={{ padding: "12px 18px", background: "#f5f6f6", display: "flex", alignItems: "center", gap: 8, color: "var(--text-2)" }}>
        <IconCash size={16} />
        <span>
          A conta da semana, <b style={{ fontWeight: 600, color: "var(--text-1)" }}>R$ 2.380,00</b>, vai no grupo na sexta, 13/11.
        </span>
      </div>
    </div>
  );
}
