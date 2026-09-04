# Node 1: prime

Prime yourself on the codebase, scoped to what `{{issue}}` actually touches.

The plan node is the expensive one; feeding it a cold read of the repository is how a
premium model gets spent re-deriving what a cheap one could have handed it.

## Read

- `git ls-files`, `git log -10 --oneline`, `git status`
- `MISSION.md`, `CLAUDE.md`, `README.md` if present
- `content/letters.js` in full — the content layer, the thing most issues touch
- the `src/` modules relevant to the issue (progress / quiz / tracing / audio / app glue)
- `.factory/locks/floor.json` — the ratchet floor the plan must stay inside

## Report to `{{rundir}}/priming.md`

Keep it scannable. Cover:

- **What the issue touches**: the capability area from `MISSION.md`, and the files
- **Existing patterns to mirror**, with `file:line`: how a screen is added in
  `src/app.js`, how a logic module stays DOM-free, how tests are written in `tests/`
- **Current gate counts**: unit tests, E2E steps, holdout assertions, and the floors in
  `.factory/locks/floor.json`, so the plan knows what the ratchet requires
- **Anything that looks already broken** in the area, distinct from the issue. Do not
  fix it. Name it, and note whether it is worth a separate issue.

You are read-only. If you find yourself wanting to edit something, that is a finding for
the report, not an action.
