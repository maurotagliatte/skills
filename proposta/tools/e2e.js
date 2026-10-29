// Percorre a proposta inteira como a cliente: clica "Pular e ver um exemplo" e avança.
// node proposta/tools/e2e.js <pasta-saida> [porta]
const { chromium } = require("playwright");
const [, , out = "e2e", port = "3000"] = process.argv;
const NEXT = ["Começar", "Próximo capítulo", "Continuar", "Ver o que entra no projeto"];
(async () => {
  require("fs").mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(`http://localhost:${port}/`);
  const t0 = Date.now();
  let last = "", n = 0;
  while (Date.now() - t0 < 12 * 60 * 1000) {
    await p.waitForTimeout(1500);
    const ch = (await p.locator("header span.mono").last().textContent()) ?? "";
    if (ch !== last) { console.log(`${((Date.now() - t0) / 1000).toFixed(0)}s  capítulo ${ch}`); last = ch; }
    if (n++ % 3 === 0) await p.screenshot({ path: `${out}/${String(n).padStart(4, "0")}.png` });
    const skip = p.getByText("Pular e ver um exemplo", { exact: true });
    if (await skip.first().isVisible().catch(() => false)) { await skip.first().click().catch(() => {}); continue; }
    let clicked = false;
    for (const name of NEXT) {
      const btn = p.getByRole("button", { name, exact: true });
      if (await btn.first().isVisible().catch(() => false) && await btn.first().isEnabled().catch(() => false)) {
        await btn.first().click().catch(() => {}); clicked = true; break;
      }
    }
    if (!clicked && ch.startsWith("10")) {
      const tab = p.getByRole("button", { name: /Aceite/ });
      if (await tab.first().isVisible().catch(() => false)) await tab.first().click().catch(() => {});
      const ok = p.getByRole("button", { name: /Quero seguir/ });
      if (await ok.first().isVisible().catch(() => false)) { await ok.first().click(); await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/fim.png` }); break; }
    }
  }
  console.log(`total ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  console.log(errs.join("\n") || "sem erros no console");
  await b.close();
})();
