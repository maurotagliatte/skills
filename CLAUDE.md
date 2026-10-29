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
