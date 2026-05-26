# Implementation steps

This folder holds the **how** for every goal that `/plan-step` has touched. Each file is one TDD-ready step: failing test first, then minimal code to green.

## File conventions

- One markdown file per step: `<goal-id>--<step-slug>.md` (e.g. `types-api-coverage--vmath-vector3.md`).
- Steps stay in the folder after they ship — they become the audit trail.
- Step status is the first line of the file (`Status: planned | in-progress | shipped`).

## File structure

```markdown
# <Step title>
Status: planned
Goal: <goal-id from docs/prd/*>
PRD: docs/prd/<file>.md#<goal-id>

## Context
What the reader needs to know that isn't in the code yet.

## Tests to write first
- [ ] <test description, path, and assertion>
- [ ] ...

## Implementation
Numbered, terse steps. Reference exact files. No prose.

## Definition of done
Bulleted: build green, lint green, tests green, docs updated, etc.
```

## Index

`/implement-step` reads this README's index, picks the next `planned` step, and works through it. Add new steps to the table below as `/plan-step` produces them.

| Step file | Goal | Status |
| --------- | ---- | ------ |
| _(none yet — run `/next-step` to start)_ | | |
