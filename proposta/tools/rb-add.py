"""Baixa componentes do React Bits (registro shadcn, variante TS-CSS) para src/kit/rb/<Nome>/.

Uso: python3 -I proposta/tools/rb-add.py <Nome> [<Nome> ...]
Licença dos componentes: MIT + Commons Clause (ver referencias/REACT-BITS.md) — o aviso fica nos arquivos.
"""
import json, os, sys, urllib.request

DEST = os.path.join(os.path.dirname(__file__), "..", "app", "src", "kit", "rb")
deps_all = set()
for name in sys.argv[1:]:
    url = f"https://reactbits.dev/r/{name}-TS-CSS"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (proposta-khard rb-add)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        item = json.load(r)
    out = os.path.join(DEST, name)
    os.makedirs(out, exist_ok=True)
    for f in item.get("files", []):
        fn = os.path.basename(f.get("target") or f["path"])
        with open(os.path.join(out, fn), "w") as fh:
            fh.write(f["content"])
    deps = item.get("dependencies", []) + item.get("registryDependencies", [])
    deps_all.update(item.get("dependencies", []))
    print(f"{name}: {', '.join(sorted(os.listdir(out)))} | deps: {', '.join(deps) or '-'}")
print("dependências npm:", " ".join(sorted(deps_all)) or "-")
