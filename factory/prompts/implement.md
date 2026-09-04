# Node 3: implement

Implement `{{rundir}}/plan.md`, task by task, in order, running each task's validation
command as you go.

## Absolute prohibitions (`FACTORY_RULES.md` §2)

1. **Never modify a test, assertion, or floor to make something pass.** Fix the source.
   If a check is genuinely wrong, say so in the report and stop — that is a
   `needs-human` escalation, not a change you make.
2. **Never touch a protected file** — governance, `.factory/**`, `factory/**`,
   `harness/**`, `scripts/validateContent.mjs`, `docs/PRD.md`, `package.json`.
3. **Never add a dependency.** The app is vanilla JS; browser APIs and the standard
   library are the dependency policy (`CLAUDE.md`).
4. **Never build beyond what the plan asked for.** No opportunistic refactors, no
   "while I was in here". The plan's non-goals section is binding.
5. **Never add a runtime network call.** The app fetches only its own static assets
   (MISSION invariant 1). No CDNs, no fonts, no analytics.
6. **Stay under 500 changed lines and 12 files.** Over the cap, stop and report — the
   work needs splitting.

## The architectural contract (`CLAUDE.md`)

- **Logic is importable, DOM is glue.** New rules go in a `src/` module that a node
  test can import and call; `src/app.js` renders and wires, and imports the logic —
  never the reverse. If a rule only exists inside a render path, it cannot be tested
  and the factory cannot defend it.
- **Chrome is Arabic, content is English.** No English instruction strings, no Arabic
  letter content.
- **Errors surface.** A missing asset or a corrupt save throws or renders an obvious
  error state — never silently continues.
- **Content is data.** Letters, words, translations and transliterations live in
  `content/letters.js`, not in logic.

## Coverage ships with the change

A new feature comes with the unit tests that pin its logic, in `tests/`. New coverage
goes there, **never** in `harness/` — the harness is the judge and it is protected.

If you added assertions and the observed counts moved, the floor in
`.factory/locks/floor.json` should rise to match — but that file is protected, so write
the new values into your report for a human to apply rather than editing it.

## Validate as you go

After each task, run **exactly this command, verbatim**:

```
{{quick}}
```

It is the only one on your allowlist; any other way of running the tests is denied and
your work goes unchecked until the validator sees it.

**Do not run the full gate.** It belongs to the validator. A builder that can run the
gate it is judged by will iterate against the gate rather than against the problem.

## Report

Write `{{rundir}}/report.md`: what was built, tasks completed, tests added, validation
results, **deviations from the plan and why**, and any floor raise a human should
apply. A documented deviation is a decision; an undocumented one is a bug.
