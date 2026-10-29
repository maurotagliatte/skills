# Skills

Este repositório guarda uma coleção de skills de agente em `.agents/skills/`
(instaladas via `skills-lock.json`). O Claude Code carrega skills de
`.claude/skills/`, que é um link simbólico para `.agents/skills/` — edite
sempre em `.agents/skills/`.

Ao adicionar ou atualizar uma skill:
- Cada skill fica em `.agents/skills/<nome>/SKILL.md`, com `name` e
  `description` no frontmatter YAML.
- Registre a origem em `skills-lock.json`.
- Use a skill `skill-creator` para criar, ajustar ou avaliar skills.

Skills para vídeo e mídia: `hyperframes-cli`, `media-use`,
`remotion-best-practices`, `ai-video-generation`.

## Regra: nunca recriar marca, logo ou fonte
- Nunca desenhe SVG à mão nem "imite" um logotipo, e nunca substitua a fonte de uma marca por outra parecida.
- Logos, ícones e imagens vêm sempre de fonte oficial: arquivo enviado pelo usuário, export do Figma
  (MCP do Figma, bibliotecas do workspace) ou banco/vetorização do MCP do Magnific.
- Ícones de UI: use a biblioteca do design system (Tabler, a mesma do Krm no Figma), nunca ícones desenhados.
- Se o arquivo oficial não estiver disponível, deixe um espaço reservado explícito e peça o arquivo.
