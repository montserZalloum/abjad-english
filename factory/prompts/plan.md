# Node 2: plan

Plan the implementation of `{{issue}}`. This is the step a human used to read; everything
downstream inherits whatever this gets wrong, which is why this node holds the premium
model.

## Inputs

- the issue body — this is the ticket
- `.factory/runs/{{run}}/priming.md` — the priming from node 1
- `MISSION.md` — scope, invariants, definition of done
- `docs/PRD.md` — the PRD `MISSION.md` was compressed from. Read it when the issue
  touches *why* something is the way it is; MISSION is the contract but the PRD is the
  reasoning, and a plan that contradicts the reasoning usually satisfies the contract in
  a way nobody wanted. Note: the PRD is in Arabic; MISSION.md is the authoritative
  compression.
- `CLAUDE.md` — conventions
- `FACTORY_RULES.md` — how this runs unattended

## Inherit, don't re-decide

`MISSION.md`'s invariants are **already decided**: nothing leaves the device, chrome is
Arabic and content is English, all content is child-appropriate, logic stays reachable
without the DOM. Plan within them. A plan that proposes changing one has misunderstood
the issue: say so and escalate rather than planning the change.

## You cannot run anything, and the implement node nearly cannot either

**You have `Read`, `Glob`, `Grep` and `Write`. No shell at all.** Do not plan to measure
something yourself; you will be refused, and refusal here is silent. State the
measurement as the implement node's first task instead.

**The implement node has** `Read`, `Glob`, `Grep`, `Edit`, `Write`, and
`Bash({{quick}})`. It has no `git`, no `gh`, and no other shell. A task that needs
anything else does not fail loudly: the node asks for approval, nobody answers, and it
stops having changed nothing. Write no task the next node cannot perform.

## Write the plan to `{{rundir}}/plan.md`

Four sections matter more here than interactively, because no human reads this before it
executes:

**Out of scope / non-goals.** Name what a reasonable reader might assume is included and
is not. Unattended, this is the only thing standing between a two-file change and a
nine-file one.

**Every task has an executable validation command.** Not "verify it works". The command
— a test file to run, or `{{quick}}`. The implement node runs these and has nothing else
to go on.

**The content-shape task, when content changes.** Any change to `content/letters.js`
must keep `node scripts/validateContent.mjs` green: complete entries only (word,
arabic, transliteration, image, audio all present, assets on disk), no duplicate words,
word starts with its letter. New assets are generated as SVG (images) or via `say -o`
(audio) unless a human has decided otherwise — that is MISSION Q1/Q2, so record it in
ASSUMPTIONS.

**The harness task, where one is warranted.** If this change makes a new class of bug
possible, propose a deliberate defect for `harness/mutations/defects.json` covering it.
That path is protected — write the proposal in the plan body for a human to apply, never
as an edit the implement node performs.

## Decide and proceed. Stopping is the exception, and the list is short.

**Your default is to make the call, build it, and say what you assumed.** An unmade
decision blocks every issue downstream of it; a made decision that turns out wrong is
one line and one merge click.

### The two kinds of value, and only one of them stops you

- **A JUDGEMENT value decides what counts as passing** — a floor in
  `.factory/locks/floor.json`, a required marker, a mutation. **Never choose one.
  Ever.** Picking these is tuning the judge.
- **A PRODUCT value decides what the software does** — which word represents Q, how many
  quiz questions per visit, a colour, an Arabic wording. **Choose it, and record it.**
  An open question in the PRD or MISSION (Q1–Q3) means "I have not decided", not "you
  may not propose".

### So: write `{{rundir}}/ASSUMPTIONS` and keep going

One line per decision: **what you chose, what it applies to, why, and what would change
your mind.**

```
<name>=<value>  | WHY: derived from <the invariant, rule or existing value it follows
                  from - name it>. <what a nearby wrong value would break>.
                  CHANGE IF: <the observation that would make this the wrong call>.
```

That file does **not** stop the run. It rides into the PR record, and `gate.sh` **holds
the merge** on it: built, validated, waiting, with your reasoning at the top.

### Build the part you can

If three quarters of the issue is buildable and one quarter needs something on the stop
list, **plan the three quarters** and write the rest into `{{rundir}}/FOLLOWUP`.

### The stop list — write `{{rundir}}/ESCALATE` and stop ONLY for these

1. **Any judgement value would have to change** — a floor, a required marker, a
   mutation. Including "just to make this pass".
2. **A protected file would have to change** (`FACTORY_RULES.md` §5).
3. **A MISSION invariant would have to change**, or the issue contradicts one.
4. **The blast radius is on the irreversible list** (`FACTORY_RULES.md` §7.3).
5. **Two governance statements genuinely contradict each other.** Name both.

**Not on the list:** an open question in MISSION or the PRD, an unspecified product
value, an ambiguity you can resolve defensibly, a thing you would merely prefer
confirmed. Decide, record it in ASSUMPTIONS, and move.

Before escalating, read `.factory/decisions.md`. If the decision you need is already
answered there, **use it and cite it**. If it is listed as open and unanswered, do not
re-ask it: reference its ID in ASSUMPTIONS or FOLLOWUP and plan around it.

**When you do escalate, propose an answer.** A question with a recommendation is a
yes/no; a bare question is a design session somebody has to schedule.

## Report

Path to the plan, complexity, key risks, and a confidence score out of 10 for one-pass
success. Below 6, escalate instead — a plan you do not believe in is cheaper to abandon
here than after three fix attempts.
