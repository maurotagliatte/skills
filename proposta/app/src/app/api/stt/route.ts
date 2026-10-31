export const runtime = "nodejs";

/**
 * Transcrição de áudio. O Claude não transcreve áudio, então usamos um STT dedicado.
 * Sem OPENAI_API_KEY responde 200 com { text: null, available: false } (não é erro: o capítulo
 * segue com a transcrição de exemplo). 400 = áudio inválido; 502 = o serviço falhou.
 * O áudio é processado e descartado — nada é armazenado.
 */
export async function POST(req: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return Response.json({ text: null, available: false });

  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof Blob) || audio.size > 25 * 1024 * 1024) return new Response(null, { status: 400 });

  const body = new FormData();
  body.append("file", audio, "audio.webm");
  body.append("model", "gpt-4o-mini-transcribe");
  body.append("language", "pt");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body,
  });
  if (!res.ok) return new Response(null, { status: 502 });
  const { text } = (await res.json()) as { text: string };
  return Response.json({ text, available: true });
}
