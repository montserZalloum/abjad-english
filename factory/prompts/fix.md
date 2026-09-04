# fix-pr

Fix the validator's findings:

- **the verdict** — `{{findings}}`
- **the raw validation output** — `{{gatelog}}`

Read the verdict first. Read the log when a finding names a check, because the log says
what the check actually printed and the verdict says what the judge made of it.

## What you get, and what you do not

You get **the findings and the issue**. You do not get the plan or the implementation
report, deliberately: a fix that re-reads the plan tends to re-argue the plan rather
than address the finding, and the finding is the only thing that failed.

## Fix the finding, not the symptom

Take the findings one at a time, highest severity first. For each, fix the cause in the
source.

**The prohibition that matters most here** (`FACTORY_RULES.md` §2.1, §6.4): when a check
is red, the cheapest repair is always to make the check quieter. Deleting the assertion,
weakening the quiz-position distribution test, lowering a count, special-casing the
journey's input, catching and swallowing — all of these turn the light off rather than
fix the wiring, and all of them are an auto-reject.

The paths that would let you do it are denied to this node, so the attempt will fail
rather than succeed quietly. Read that as the design working, not as an obstacle: if
fixing the finding genuinely requires changing a check, then the finding is not a code
bug and the correct move is to say so and stop. That is a `needs-human` escalation and
it is a perfectly good outcome.

## Attempt cap

You are attempt {{attempts}} of 2. On the second failure this escalates and stops. If
you do not believe the finding is fixable within scope, say so **now** rather than
spending the last attempt on a guess.

## Then

run **exactly this command, verbatim** — it is the only one on your allowlist:

```
{{quick}}
```

Do not substitute another way of running the tests. `npm test` typed by hand, `node
--test`, or anything you would normally reach for is denied to this node, and a denied
command is a fix that never got checked.

Then hand back to the independent validator. A fix is never self-certified: the node
that made the change does not get to decide the change worked.
