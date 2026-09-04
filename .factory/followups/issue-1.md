# FOLLOWUP — issue #1, conditional unblock

This file matters **only if the implement run aborted at plan Task 1** (audio
generation). Everything else about the issue is already decided and specified in
`plan.md`.

## The blocker

The implement node's Bash allowlist contains only
`python3 harness/ci.py --quick`. Generating `assets/audio/B.m4a` needs:

```
say -o assets/audio/B.m4a "B"
```

which is outside that allowlist. No node in this workflow has general shell
access, and no text-writable file format can carry speech audio, so the factory
cannot self-serve this one file as currently configured. (The image asset is
hand-authored SVG via the Write tool and is not blocked.)

## How a human unblocks it — either of:

1. Run `say -o assets/audio/B.m4a "B"` at the repo root and commit the file
   (or leave it in the worktree), then re-dispatch issue #1; or
2. Widen the implement node's Bash allowlist with that one command shape
   (`say -o assets/audio/*.m4a *`) and re-dispatch issue #1.

On re-dispatch the plan stands as written: word=Ball, arabic=كرة,
transliteration=بول, SVG content specified verbatim in plan.md Task 2, entry
edit specified verbatim in plan.md Task 3.

## Note for the Q1 decision

This run is itself evidence for MISSION Q1 (audio sourcing): the
`say`-generated-placeholder path works for a human at a keyboard but is not
autonomously reproducible by the factory without an allowlist entry. If the
intended steady state is "factory completes letters C–Z unattended", the Q1
answer needs to include that allowlist entry (or an accepted alternative the
factory can produce with Write-only tools).
