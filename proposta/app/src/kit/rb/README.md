# React Bits (componentes de terceiros)

Copiados do registro oficial do React Bits (https://reactbits.dev, variante TS-CSS) com
`proposta/tools/rb-add.py`. Licença: MIT + Commons Clause — ver `LICENSE-react-bits.md`, que deve
acompanhar estes arquivos. Uso permitido dentro do produto; proibido vender/redistribuir os componentes em si.

Adaptações locais: ícones trocados de Hugeicons para `@tabler/icons-react` (regra do repositório).
Ao usar, adapte cores/tamanhos via props e CSS do capítulo; respeite `prefers-reduced-motion`.

Adaptações locais (marcadas com `(local)` no código):
- `Cubes`: `ref` com `ripple(x?, y?)` (devolve os segundos até a onda chegar à borda), ponteiro corrigido pela
  escala da câmera, `dpr` automático no zoom, grade CSS estática sem WebGL2.
- `SplitText`: prop `startDelay` (s) para encadear linhas.
- `SlideCommit`: classe `slide-commit--khard` (texto do trilho claro com alça vermelha).
