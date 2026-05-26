# Product Requirements (PRD)

This folder holds the **what** and **why** of every goal in the project. The `/plan-step` skill writes here; `/next-step` reads here to choose what to build next.

## File conventions

- One markdown file per goal area (e.g. `types-api-coverage.md`, `transpiler-pipeline.md`, `cli-scaffold.md`).
- Filenames are kebab-case; no numeric prefixes — ordering is by dependency, not by date.
- Each file is a living document. Goals stay in the file even after they ship; they get marked done rather than deleted.

## File structure

Each PRD file follows this skeleton:

```markdown
# <Area name>

## Vision
One paragraph: what success looks like for this area.

## Goals

### goal-id-kebab-case
- **Status**: planned | in-progress | shipped
- **Why**: motivation, user pain, or strategic reason
- **What**: concrete acceptance criteria, bulleted
- **Depends on**: list of other goal-ids (or "none")
- **Impl**: link to `docs/impl/<step-file>.md` once `/plan-step` has produced one
```

`/next-step` ranks unplanned goals (those without an `Impl` link) by dependency depth and ships-now-ness, then hands the chosen `goal-id` to `/plan-step`.

## Bootstrapping

[vision.md](vision.md) seeds the project with top-level goals. Add new PRD files as new areas emerge; do not stuff unrelated goals into existing files.
