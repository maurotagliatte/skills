// Uso: cd proposta/app && node src/chapters/financeiro/gerar-comprovantes.cjs public/comprovantes
// Gera os 3 comprovantes FICTÍCIOS do capítulo Financeiro (public/comprovantes/*.png).
const { chromium } = require("playwright");
const out = process.argv[2];
const bars = (seed) => {
  let s = seed, h = "";
  for (let i = 0; i < 95; i++) { s = (s * 9301 + 49297) % 233280; const w = 1 + (s % 3); h += `<i style="width:${w}px;margin-right:${1 + (s % 2)}px;background:${i % 2 ? "transparent" : "#111"}"></i>`; }
  return `<div class="bars">${h}</div>`;
};
const stamp = `<div class="stamp">EXEMPLO<small>documento fictício · sem valor</small></div>`;
const css = `
*{box-sizing:border-box} body{margin:0;background:#e9e6df;font-family:Inter,sans-serif;color:#1c1c1c}
.doc{position:relative;width:620px;padding:34px 36px;background:#fffdf8;margin:30px;box-shadow:0 2px 10px rgba(0,0,0,.12);overflow:hidden}
h1{font-size:20px;margin:0 0 2px;font-weight:700;letter-spacing:-.01em} .sub{font-size:11px;color:#666}
.row{display:flex;gap:0;border:1px solid #bbb;border-bottom:0} .row:last-of-type{border-bottom:1px solid #bbb}
.cell{flex:1;padding:6px 8px;border-right:1px solid #bbb;min-height:44px} .cell:last-child{border-right:0}
.lbl{font-size:9px;text-transform:uppercase;color:#666;letter-spacing:.04em} .val{font-size:13px;font-weight:600;margin-top:3px}
.big{font-size:17px} .hd{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #1c1c1c;padding-bottom:10px;margin-bottom:14px}
.mono{font-family:'JetBrains Mono',monospace} .bars{display:flex;height:54px;margin-top:16px} .bars i{display:block;height:100%}
.stamp{position:absolute;right:30px;bottom:26px;transform:rotate(-10deg);border:4px solid #d8341b;color:#d8341b;padding:6px 16px 8px;font:800 34px/1 Inter;letter-spacing:.12em;text-align:center;border-radius:8px;opacity:.85;background:rgba(255,253,248,.6)}
.stamp small{display:block;font-size:10px;letter-spacing:.08em;margin-top:4px;font-weight:700;text-transform:uppercase}
table{width:100%;border-collapse:collapse;font-size:12px;margin:10px 0} td,th{padding:7px 6px;border-bottom:1px solid #ddd;text-align:left} th{font-size:9px;text-transform:uppercase;color:#666;font-weight:600} td.r,th.r{text-align:right}
.paper{background:#fbf7ec;background-image:repeating-linear-gradient(transparent 0 31px,#d9e2ec 31px 32px)}
.sig{font-family:'DejaVu Serif',serif;font-style:italic;font-size:26px;margin-top:30px;border-bottom:1px solid #333;width:240px;padding-bottom:2px}
`;
const docs = {
  "casa-do-cavalo": `<div class="doc">
  <div class="hd"><div><h1>Casa do Cavalo Agropecuária</h1><div class="sub">Rações, selaria e suplementos · CNPJ 00.000.000/0000-00</div></div><div class="sub mono" style="text-align:right">BOLETO DE COBRANÇA<br/>Nº doc. 004812</div></div>
  <div class="row"><div class="cell" style="flex:2.4"><div class="lbl">Local de pagamento</div><div class="val" style="font-weight:500">Pagável em qualquer instituição até o vencimento</div></div><div class="cell"><div class="lbl">Vencimento</div><div class="val big">13/11/2026</div></div></div>
  <div class="row"><div class="cell" style="flex:2.4"><div class="lbl">Beneficiário</div><div class="val">Casa do Cavalo Agropecuária Ltda.</div></div><div class="cell"><div class="lbl">Valor do documento</div><div class="val big">R$ 2.340,00</div></div></div>
  <div class="row"><div class="cell"><div class="lbl">Data do documento</div><div class="val">29/10/2026</div></div><div class="cell"><div class="lbl">Nº do documento</div><div class="val">004812</div></div><div class="cell"><div class="lbl">Espécie</div><div class="val">DM</div></div></div>
  <div class="row"><div class="cell" style="min-height:120px"><div class="lbl">Instruções / descrição</div>
    <table><tr><th>Item</th><th class="r">Qtd.</th><th class="r">Total</th></tr>
    <tr><td>Ração extrusada equina 40 kg</td><td class="r">18 sc</td><td class="r">R$ 1.980,00</td></tr>
    <tr><td>Suplemento mineral 25 kg</td><td class="r">2 bd</td><td class="r">R$ 360,00</td></tr></table>
    <div class="sub">Após o vencimento, multa de 2% e juros de 1% a.m.</div></div></div>
  <div class="row"><div class="cell"><div class="lbl">Pagador</div><div class="val">Gabriela Guenka Medicina Veterinária</div></div></div>
  <div class="mono" style="margin-top:16px;font-size:13px;letter-spacing:.02em">00000.00000 00000.000000 00000.000000 0 00000000234000</div>
  ${bars(7)}${stamp}</div>`,
  "ferrador-silva": `<div class="doc paper" style="padding-bottom:130px">
  <div class="hd" style="border-color:#5b3b1e"><div><h1 style="color:#5b3b1e">Ferrador Silva</h1><div class="sub">Casqueamento e ferrageamento · atendimento em haras</div></div><div class="mono" style="font-size:22px;font-weight:700;color:#5b3b1e">COBRANÇA<div class="sub" style="text-align:right">nº 0217</div></div></div>
  <p style="font-size:14px;line-height:2;margin:6px 0">Serviço prestado para <b>Dra. Gabriela Guenka</b>, no valor de <b>seiscentos e oitenta reais</b>, a ser pago <b>até 13/11/2026 via PIX</b>.</p>
  <table><tr><th>Serviço</th><th>Animal</th><th class="r">Valor</th></tr>
  <tr><td>Ferrageamento completo</td><td>Trovão</td><td class="r">R$ 170,00</td></tr>
  <tr><td>Ferrageamento completo</td><td>Estrela Dalva</td><td class="r">R$ 170,00</td></tr>
  <tr><td>Ferrageamento completo</td><td>Zarco</td><td class="r">R$ 170,00</td></tr>
  <tr><td>Ferrageamento completo</td><td>Pérola</td><td class="r">R$ 170,00</td></tr>
  <tr><td colspan="2"><b>Total</b></td><td class="r"><b style="font-size:16px">R$ 680,00</b></td></tr></table>
  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:8px"><div class="sub">Haras Santa Fé, 30 de outubro de 2026<br/>Chave PIX: (exemplo)</div><div><div class="sig">J. Silva</div><div class="sub">José Silva · ferrador</div></div></div>
  <div class="stamp" style="left:36px;right:auto">EXEMPLO<small>documento fictício · sem valor</small></div></div>`,
  vetlab: `<div class="doc">
  <div class="hd" style="border-color:#1f5f7a"><div><h1 style="color:#1f5f7a">VetLab Análises</h1><div class="sub">Laboratório de análises clínicas veterinárias · CNPJ 00.000.000/0000-00</div></div><div class="sub mono" style="text-align:right">FATURA / BOLETO<br/>Nº 2026-1187</div></div>
  <div class="row"><div class="cell" style="flex:2.4"><div class="lbl">Cliente</div><div class="val">Gabriela Guenka Medicina Veterinária</div></div><div class="cell"><div class="lbl">Vencimento</div><div class="val big">13/11/2026</div></div></div>
  <div class="row"><div class="cell" style="flex:2.4"><div class="lbl">Paciente · requisição</div><div class="val">Trovão (equino, QM, 8 anos) · req. 55120</div></div><div class="cell"><div class="lbl">Valor a pagar</div><div class="val big">R$ 418,50</div></div></div>
  <table><tr><th>Exame</th><th>Data</th><th class="r">Valor</th></tr>
  <tr><td>Hemograma completo equino</td><td>28/10/2026</td><td class="r">R$ 96,00</td></tr>
  <tr><td>Bioquímico (CK, AST, GGT, creatinina)</td><td>28/10/2026</td><td class="r">R$ 214,50</td></tr>
  <tr><td>Fibrinogênio plasmático</td><td>28/10/2026</td><td class="r">R$ 48,00</td></tr>
  <tr><td>Coleta em propriedade</td><td>28/10/2026</td><td class="r">R$ 60,00</td></tr></table>
  <div class="sub">Laudos disponíveis no portal do laboratório. Pagamento por boleto.</div>
  <div class="mono" style="margin-top:16px;font-size:13px">00000.00000 00000.000000 00000.000000 0 00000000041850</div>
  ${bars(31)}${stamp}</div>`,
};
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 2 });
  for (const [id, html] of Object.entries(docs)) {
    await p.setContent(`<style>${css}</style>${html}`);
    await p.locator(".doc").screenshot({ path: `${out}/${id}.png` });
  }
  await b.close();
})();
