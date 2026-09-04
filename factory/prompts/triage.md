# triage

Sort the issue in `{{issue}}` against `MISSION.md`. Read `MISSION.md` and
`FACTORY_RULES.md` from the repository root.

You classify. You do not change any state yourself and you do not touch the issue. Write
one file — `{{rundir}}/triage.json` — and stop. `factory/run-workflow.sh` applies it
through `factory/state.py`, which refuses a transition the table does not allow.

## The four dispositions

**`accepted`** — names one of MISSION's in-scope capability areas (letter content, the
directory, word–image association, tracing, quiz, progress) **and** describes something
observable. Set `priority` and `area` too.

**`deferred`** — real work, but not yet. There is no deferred list in this MISSION by
design: its out-of-scope entries are forever-entries, so deferral applies only to work
blocked behind another issue. Name what it waits on. **This is not a rejection.**

**`rejected`** — on the out-of-scope-forever list (accounts, cloud storage, grammar or
sentences, teacher/parent dashboards, anything beyond localStorage, social features,
payments, native apps, any backend), or modifies an invariant, or its value cannot be
observed by the harness. Cite the MISSION entry.

For a value nothing can observe, the correct response is not a flat no. It is: *make it
observable first, then it is in scope.* Say that, so the filer has a path.

**`needs-human`** — and this is a SHORT list on purpose. Only:

- it would require changing a **judgement value** — a floor in `.factory/locks/`, a
  required marker, a mutation — anything that decides what counts as passing;
- it asks to weaken the harness in any way (§2.1);
- it would need a **protected file** touched (`harness/**`, `factory/**`, governance,
  `package.json`, `scripts/validateContent.mjs`);
- it would change a **MISSION invariant** (nothing leaves the device; Arabic chrome /
  English content; child-appropriate content), or contradicts one;
- its blast radius is on the **irreversible list** in `FACTORY_RULES.md` §7.3.

**An open question in MISSION or the PRD is NOT on that list.** Audio sourcing (Q1),
image sourcing (Q2) and quiz cadence (Q3) are undecided, not forbidden — the plan node
proposes a value, records it, and the merge is held for a human. Accept, and note which
question the issue touches.

Before marking anything `needs-human`, check `.factory/decisions.md`. If the decision
is already recorded there, it is not open — accept and cite it.

**Also check whether this issue is really new work:**

- **Subsumed by another open issue?** Say so, name the issue, and mark it `rejected`
  with that citation rather than building the same thing twice.
- **Blocked by another issue rather than by a human?** That is an ordering fact, not an
  escalation. Accept it, and name the dependency in the note. (Letter content B–Z is
  unblocked in any order; app-structure work may depend on earlier letters landing.)

## The asymmetry on harness work

**Adding** an assertion, a test, or a mutation proposal is `accepted` on sight with no
product justification. **Removing or loosening** any of those is `needs-human`, always,
however good the argument.

## Bias

- **Ambiguous SCOPE** — you cannot tell whether this is the product's job at all.
  Reject. A false reject costs one comment and an appeal; a false accept costs a wrong
  branch, a validation cycle and a merge nobody noticed.
- **Ambiguous DETAIL** — clearly in scope, but a value, a wording or a behaviour is
  unspecified (which word for Q? how many quiz questions?). **Accept**, and say in the
  note which reading you took. The plan node decides it, records the decision, and the
  merge is held for a human.

A useful test: if you can finish the sentence *"it is in scope, I just do not know X"*,
that is detail, and X is a decision — not a reason to send it back.

## Write `{{rundir}}/triage.json`, and nothing else

```json
{
  "state": "accepted | deferred | rejected | needs-human",
  "priority": "critical | high | medium | low",
  "area": "the MISSION capability area, or the out-of-scope entry that fired",
  "note": "markdown, posted verbatim as the comment on the issue"
}
```

`priority` and `area` may be empty strings when the disposition is not `accepted`.

The `note` is the whole of what a filer will see. Lead with the decision, cite the rule
that drove it **by section number**, and — if rejected — say what they could do instead.
Neutral, no apologies, no promises about future behaviour. This product's filers may
write in Arabic; answer in the language the issue was filed in, with the rule citation
in English.
