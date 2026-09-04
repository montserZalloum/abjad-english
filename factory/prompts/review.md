# Node 5: review, and open the PR record

Review the diff as code, then write the PR record. This is the only node that reads the
diff *as code* rather than as a set of markers.

## Review

`git diff {{base}}...{{branch}}`, then read each changed file in full — not just the
hunks. Look for:

- **Logic errors**: off-by-one, inverted conditionals, a branch that cannot be reached
- **Scope**: anything here unrelated to the issue
- **Conventions** (`CLAUDE.md`): logic DOM-free and importable, Arabic chrome / English
  content, errors surfaced, content in `content/letters.js` not in code
- **Invariants** (`MISSION.md`): no external network calls, nothing child-inappropriate,
  no English in the UI chrome
- **Quiz correctness specifically**: the correct answer's position must come from the
  shuffle, never a fixed slot; distractors must never include the answer. This is the
  defect this factory was explicitly built to catch.
- **A test or assertion made weaker**: same count, less asserted. A block.

Governance files are read from the **base branch**. A change is not judged against a
rulebook it just edited.

## Then write `{{prfile}}`

One file, at exactly that path. On the GitHub backend this becomes the body of a real
pull request, opened by `factory/run-workflow.sh` after you exit — you do not open it
and you are not given `gh`. Same rule as the merge: a model's only output is a record,
and code decides what happens to it.

```markdown
---
issue: {{issue_ref}}
title: <the change, in the imperative>
branch: {{branch}}
state: open
attempts: 0
---

## What changed
<2-4 sentences, in terms of what a child using the app would notice, not the files>

## Files
<path - why it changed>

## Gate
<the counts from the run: content checks, unit tests, E2E steps, holdout assertions,
 mutations caught/total>

## Review findings
<severity / file:line / what and why - or "none">

## Assumptions to confirm
<any ASSUMPTIONS entries from the plan a human should answer at the merge - or "none">

## Floor raise to apply
<if assertions were added, the new .factory/locks/floor.json values for a human to
 commit, since that file is protected - or "none">
```

`state: open` hands it to the independent validator. **Do not merge.** Your only
merge-related output is this record; `factory/gate.sh` and `factory/merge.sh` decide,
and they re-check the markers themselves rather than trusting this file.

The front matter is read by the script that opens the PR: `title` becomes the PR title
and everything below the second `---` becomes the PR body. Keep the body readable by a
human who has not seen the issue.
