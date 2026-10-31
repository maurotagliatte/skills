# Deploy no Cloudflare Workers

O app roda no worker `khard-content` via [OpenNext](https://opennext.js.org/cloudflare)
(`wrangler.jsonc` + `open-next.config.ts`). O Workers Builds está conectado ao repositório
`maurotagliatte/skills`:

| Campo | Valor |
|---|---|
| Root directory | `proposta/app` |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Preview command | `npx opennextjs-cloudflare upload` |

Segredos do worker (Settings → Variables and Secrets):

- `ANTHROPIC_API_KEY` — liga o agente ao vivo; sem ela tudo roda no modo demo.
- `ANTHROPIC_MODEL` — opcional (padrão `claude-sonnet-5-5`).
- `OPENAI_API_KEY` — opcional, transcrição de áudio real.

Testar o build localmente no runtime do Workers:

```bash
npm run cf:preview
```
