// QA visual de um capítulo: node proposta/tools/qa.js <capitulo> <pasta-saida> [porta] [segundos]
// Tira um print a cada 1,5 s e clica no botão de avançar visível ([data-advance]), sem sair do capítulo
// (o "Próximo…" do cartão de escopo leva data-advance="chapter" e fica de fora).
const { chromium } = require("playwright");
const [, , chapter = "abertura", out = "qa", port = "3000", secs = "40"] = process.argv;
const ADVANCE = '[data-advance]:not([data-advance="chapter"])';
(async () => {
  const fs = require("fs");
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && !/404/.test(m.text()) && errs.push(m.text()));
  await p.goto(`http://localhost:${port}/?c=${chapter}`);
  for (let t = 0; t < Number(secs); t += 1.5) {
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/${String(Math.round(t * 10)).padStart(4, "0")}.png` });
    const adv = p.locator(ADVANCE).filter({ visible: true }).first();
    if ((await adv.count().catch(() => 0)) && (await adv.isEnabled().catch(() => false))) await adv.click().catch(() => {});
  }
  console.log(errs.join("\n") || "sem erros no console");
  await b.close();
})();
