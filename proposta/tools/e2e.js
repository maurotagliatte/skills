// Percorre a proposta inteira como a cliente: clica o botão de avançar visível ([data-advance]) e segue.
// node proposta/tools/e2e.js <pasta-saida> [porta | URL]
const { chromium } = require("playwright");
const [, , out = "e2e", port = "3000"] = process.argv;
// rótulos exatos + os "Próximo: …" do fio (COPY.md) e o "Ver a proposta" do cap. 06
const NEXT = ["Começar", "Próximo capítulo", "Continuar", "Ver o que entra no projeto", /^Próximo:/, /^Ver a proposta/];
(async () => {
  require("fs").mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e)));
  p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
  await p.goto(port.startsWith("http") ? port : `http://localhost:${port}/`);
  const t0 = Date.now();
  let last = "", n = 0;
  while (Date.now() - t0 < 12 * 60 * 1000) {
    await p.waitForTimeout(1500);
    // capítulo atual: data-chapter na casca (o contador "00 / 10" do cabeçalho saiu)
    const ch = (await p.locator("[data-chapter]").first().getAttribute("data-chapter").catch(() => "")) ?? "";
    if (ch !== last) { console.log(`${((Date.now() - t0) / 1000).toFixed(0)}s  capítulo ${ch}`); last = ch; }
    if (n++ % 3 === 0) await p.screenshot({ path: `${out}/${String(n).padStart(4, "0")}.png` });
    const adv = p.locator("[data-advance]").filter({ visible: true }).first();
    if ((await adv.count().catch(() => 0)) && (await adv.isEnabled().catch(() => false))) { await adv.click().catch(() => {}); continue; }
    let clicked = false;
    for (const name of NEXT) {
      const btn = typeof name === "string" ? p.getByRole("button", { name, exact: true }) : p.getByRole("button", { name });
      if (await btn.first().isVisible().catch(() => false) && await btn.first().isEnabled().catch(() => false)) {
        await btn.first().click().catch(() => {}); clicked = true; break;
      }
    }
    // fim: a tela final do fechamento (preço à vista, sem aceite) não tem mais botão de avançar
    if (!clicked && ch === "fechamento" && (await p.locator("[data-proposta-final]").first().isVisible().catch(() => false))) {
      await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/fim.png` }); break;
    }
  }
  console.log(`total ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  console.log(errs.join("\n") || "sem erros no console");
  await b.close();
})();
