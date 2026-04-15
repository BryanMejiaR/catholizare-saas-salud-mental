# AI Specs for Skills-First Development

This project is a practical manual and starter kit for running a complete **Spec-Driven Development (SDD)** workflow with AI, from product requirements and implementation planning to coding, verification, and code review. It provides a skills-first, reusable structure you can copy into your own repository to operationalize SDD in day-to-day delivery.

It is useful because it turns SDD from a high-level idea into a repeatable system with shared standards, canonical prompts, and portable conventions that stay consistent across Codex, Cursor, and Claude.

It is highly recommended to use it with a spec-driven process such as OpenSpec.


If you want to try our best-practices in an Openspec-ready ecosystem, check out our [Openspec AI Specs alternative](https://github.com/LIDR-academy/ai-specs) 

## Repository Structure

```text
.
├── ai-specs/
│   ├── .agents/                 # Canonical agent role definitions
│   ├── .commands/               # Small set of shared utility commands
│   └── skills/                  # Canonical skill definitions (main workflow entrypoint)
│
├── .codex/
│   ├── agents -> ../ai-specs/.agents
│   ├── commands -> ../ai-specs/.commands
│   └── skills -> ../ai-specs/skills
│
├── .cursor/
│   ├── agents -> ../ai-specs/.agents
│   ├── commands -> ../ai-specs/.commands
│   ├── skills -> ../ai-specs/skills
│   └── rules/
│
├── .claude/
│   ├── agents -> ../ai-specs/.agents
│   ├── commands -> ../ai-specs/.commands
│   └── skills -> ../ai-specs/skills
│
├── docs/                        # Project technical context and reference docs
└── README.md
```

## Multi-Copilot Strategy

This repository keeps a single canonical source in `ai-specs/` and exposes it to each copilot folder using symlinks:

- `.codex/*` links to canonical resources
- `.cursor/*` links to canonical resources
- `.claude/*` links to canonical resources

### Why This Approach

- **Single source of truth**: one canonical definition for agents, commands, and skills
- **No duplicated maintenance**: update once, all copilot folders stay aligned
- **Tool compatibility**: each copilot reads from its expected folder structure
- **Safe evolution**: workflows can change without reorganizing every tool-specific folder

## Skills-First Workflow

Use skills as the default entrypoint for recurring tasks.

Current examples in this repository:

- `ai-specs/skills/enrich-user-story/SKILL.md`
- `ai-specs/skills/write-pr-report/SKILL.md`

Commands still exist as lightweight utilities in `ai-specs/.commands`, but the main functional workflows should be implemented as skills.

## Technical Context Location

Project-level technical context now belongs in `docs/`, for example:

- `docs/doc_architecture.md`
- `docs/doc_ai_planning_mode.md`
- `docs/doc_verification_guide.md`

If you bootstrap this setup into another project, replace these documents with your own architecture, planning, and verification references.

## Quick Start

1. Copy this structure into your project.
2. Keep `ai-specs/` as canonical.
3. Create symlinks from `.codex/`, `.cursor/`, and `.claude/` to `ai-specs/`.
4. Store project context in `docs/`.
5. Build new reusable workflows as skills under `ai-specs/skills/`.

## Customization Guidelines

- Update agent definitions in `ai-specs/.agents/`.
- Add or refine skills in `ai-specs/skills/`.
- Keep commands minimal and only for utility behavior.
- Keep symlinks relative so the repo stays portable.
- Document project-specific technical context in `docs/`.

## Contributing

When contributing:

1. Prefer creating/updating a skill over adding a new command.
2. Keep canonical content inside `ai-specs/`.
3. Preserve symlink-based sharing across copilot folders.
4. Keep `docs/` aligned with the real project state.

## Creator

This framework was created by **Javier Vargas**, Head of AI @ Mapal.

He is the original author of the approach, structure, and workflow design implemented in this repository.

Connect with him on [LinkedIn](https://www.linkedin.com/in/javiervargascaro/).

## License

Copyright (c) 2026 LIDR.co  
Licensed under the MIT License

This repository is part of the AI4Devs program by LIDR.co. Learn more at [LIDR.co](https://lidr.co/ia-devs).

