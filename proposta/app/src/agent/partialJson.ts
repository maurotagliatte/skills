/**
 * Faz parse de JSON incompleto (args de tool chegando em pedaços via TOOL_CALL_ARGS),
 * fechando strings, arrays e objetos abertos. É o que permite a UI "se preencher" ao vivo.
 */
export function parsePartialJson<T = unknown>(src: string): Partial<T> | undefined {
  if (!src.trim()) return undefined;
  try {
    return JSON.parse(src);
  } catch {
    /* completa abaixo */
  }
  const stack: string[] = [];
  let inString = false;
  let escaped = false;
  for (const ch of src) {
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") stack.push("}");
    else if (ch === "[") stack.push("]");
    else if (ch === "}" || ch === "]") stack.pop();
  }
  let fixed = src;
  if (inString) fixed += '"';
  // remove vírgula, dois-pontos ou chave sem valor no fim
  fixed = fixed.replace(/,\s*$/, "").replace(/,\s*"[^"]*"\s*:?\s*$/, "").replace(/:\s*$/, ': null');
  fixed += stack.reverse().join("");
  try {
    return JSON.parse(fixed);
  } catch {
    return undefined;
  }
}
