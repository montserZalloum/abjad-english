# Abjad English conventions

## Stack and commands

Vanilla HTML/CSS/JS. No framework, no build step, no transpiler — the app is static
files served as-is. Node (>=20) is used only for the dev server, scripts, and tests.

```bash
npm run dev          # serve the app locally
npm test             # unit tests (node, no browser)
npm run validate     # content validation: letter data complete, distinct, assets exist
npm run check        # validate + test + headless-browser E2E — the gate
```

**No dependencies in the shipped app.** Browser APIs and the standard library are the
dependency policy. Dev-only tooling (the headless browser driver) is the sole
exception and still needs PR-body justification.

## Where things live

| path | what belongs there |
|---|---|
| `index.html`, `src/`, `styles/`, `content/` | the app itself |
| `content/` | letter data (word, image, audio, Arabic translation/transliteration) as data, not code |
| `assets/` (or `content/assets/`) | images and audio files |
| `scripts/` | dev server, validators, tests |
| `tests/` | unit tests. New coverage goes here, never into `harness/` |
| `harness/` | the gate. Protected — see `FACTORY_RULES.md` §5 |
| `factory/`, `.factory/` | the factory machinery. Protected |

**The one architectural rule that matters: the logic is reachable without the screen.**
Letter data, quiz logic, and progress logic live in plain JS modules that a test can
import and call directly; the DOM layer imports them, never the reverse. If a rule
only exists inside a render path, it cannot be tested and the factory cannot defend
it.

## Code style

Only what a reviewer would actually send back:

- UI strings: Arabic for chrome (RTL), English for teaching content. Both live in
  data/objects, never concatenated into logic.
- Errors: fail visibly. A missing asset or corrupt save throws or renders an obvious
  error state — never silently continues (see `FACTORY_RULES.md` §2.9).
- Keep files small and single-purpose; one screen or one module per file.

## Tests

- Unit tests live in `tests/`, named after the module they cover.
- A new feature comes with the unit tests that pin its logic.
- **New coverage goes in `tests/`, never in the harness.** The harness is protected:
  it is the definition of "working", and a builder that can edit its own judge can
  make any claim true. Growing coverage is expected and welcome — over here.

## Dependencies

No new runtime dependencies, full stop. Dev dependencies require a PR-body section
explaining what it does, why the standard library does not, and evidence of active
maintenance.

## What is NOT in this file

- **What the product is, and what it will never be** → `MISSION.md`
- **How the factory behaves unsupervised** — PR size caps, protected paths, never
  editing a test to make it pass → `FACTORY_RULES.md`

If you are about to write a rule here that starts "the agent must never...", it almost
certainly belongs in `FACTORY_RULES.md` instead.
