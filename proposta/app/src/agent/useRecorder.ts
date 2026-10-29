"use client";

import { useCallback, useRef, useState } from "react";

export type RecorderState = "idle" | "asking" | "recording" | "transcribing" | "denied";

/**
 * Grava áudio no navegador e transcreve em /api/stt.
 * Sem microfone ou sem serviço de transcrição, devolve `undefined` e o capítulo usa o exemplo.
 */
export function useRecorder() {
  const [state, setState] = useState<RecorderState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [level, setLevel] = useState(0);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const raf = useRef<number | null>(null);

  const start = useCallback(async () => {
    setState("asking");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("denied");
      return false;
    }
    // nível do microfone para a onda na tela
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const loop = () => {
      analyser.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128) / 128);
      setLevel(peak);
      raf.current = requestAnimationFrame(loop);
    };
    loop();

    chunks.current = [];
    const r = new MediaRecorder(stream);
    r.ondataavailable = (e) => chunks.current.push(e.data);
    r.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      ctx.close();
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    r.start();
    rec.current = r;
    setSeconds(0);
    timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    setState("recording");
    return true;
  }, []);

  /** para e devolve a transcrição (ou undefined se não houver serviço) */
  const stop = useCallback(async (): Promise<string | undefined> => {
    const r = rec.current;
    if (!r) return undefined;
    if (timer.current) clearInterval(timer.current);
    const done = new Promise<void>((res) => r.addEventListener("stop", () => res(), { once: true }));
    r.stop();
    await done;
    setLevel(0);
    setState("transcribing");
    try {
      const body = new FormData();
      body.append("audio", new Blob(chunks.current, { type: r.mimeType }), "exame.webm");
      const res = await fetch("/api/stt", { method: "POST", body });
      if (!res.ok) return undefined;
      const { text } = (await res.json()) as { text?: string };
      return text?.trim() || undefined;
    } catch {
      return undefined;
    } finally {
      setState("idle");
    }
  }, []);

  return { state, seconds, level, start, stop };
}
