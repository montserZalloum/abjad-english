"""The end-to-end path: ONE journey, the most valuable one, as the real user does it.

The journey itself is `harness/journey.mjs` - headless Chrome over CDP, because this
product's correctness is visual and interactive. This file is the thin wrapper that
runs it and reports the assertion count to the ladder.

Two mechanical rules from the harness README, both learned from real hangs:

  1. NEVER capture_output=True on a browser-driving process. Redirect to a real file
     handle instead, then read the file back.
  2. A driver that returns nothing is a FAILURE (None), never zero assertions.
"""
from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RUNS = ROOT / ".factory" / "runs"


def run_e2e(app) -> int | None:
    """Drive the app as a child does. Returns the assertion count, or None on failure."""
    RUNS.mkdir(parents=True, exist_ok=True)
    log = RUNS / f"e2e-{os.getpid()}.log"

    with open(log, "w", encoding="utf-8") as fh:
        try:
            proc = subprocess.run(
                ["node", str(Path(__file__).parent / "journey.mjs"),
                 str(app.port), str(RUNS)],
                cwd=ROOT, stdout=fh, stderr=subprocess.STDOUT, timeout=280)
        except subprocess.TimeoutExpired:
            print("  FAIL  the journey did not return in time", flush=True)
            return None

    out = log.read_text(encoding="utf-8", errors="replace")
    # Echo the journey into the gate log: the runner appends us to gate.log, and the
    # per-step lines are what a human reads when deciding whether to trust the loop.
    print(out.strip(), flush=True)

    if proc.returncode != 0:
        return None
    m = re.search(r"JOURNEY_STEPS=(\d+)", out)
    if not m:
        # Exited 0 without reporting a count is not a pass - it is a journey that
        # forgot to say what it did.
        print("  FAIL  journey exited 0 but printed no JOURNEY_STEPS count", flush=True)
        return None
    return int(m.group(1))
