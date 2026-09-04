#!/usr/bin/env python3
"""HOLDOUT SCENARIOS. Lives in `.factory/holdout/`, NOT `harness/`.

The builder cannot read this directory: the runner passes
`--disallowedTools Read/Glob/Grep(.factory/holdout/**)` to every node, and guard.py
treats it as protected. That is the whole independence argument.

The scenarios are `journey.mjs` next to this file - a headless-Chrome run that
composes features the way the failure modes actually arrive. This wrapper starts the
app, runs that journey, and emits the marker with a COUNT, because a skipped scenario
and a passed scenario are indistinguishable without one.

Browser subprocess output goes to a real file handle, never capture_output - a
browser daemon inheriting the pipe hangs the gate on EOF.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
HARNESS = ROOT / "harness"
sys.path.insert(0, str(HARNESS))
# The DRIVER is shared (starting a process is not an assertion); the SCENARIOS are not.
from appproc import make_driver                                # noqa: E402

CONFIG = json.loads((HARNESS / "harness.config.json").read_text(encoding="utf-8"))

SCENARIOS = 4  # S1..S4 in journey.mjs; bump in the same commit that adds one.


def main() -> int:
    with make_driver(CONFIG) as app:
        log = ROOT / ".factory" / "runs" / f"holdout-{os.getpid()}.log"
        log.parent.mkdir(parents=True, exist_ok=True)
        with open(log, "w", encoding="utf-8") as fh:
            try:
                proc = subprocess.run(
                    ["node", str(HERE / "journey.mjs"), str(app.port)],
                    cwd=ROOT, stdout=fh, stderr=subprocess.STDOUT, timeout=280)
            except subprocess.TimeoutExpired:
                print("HOLDOUT_FAILED the journey did not return in time", flush=True)
                return 1

    out = log.read_text(encoding="utf-8", errors="replace")
    print(out.strip(), flush=True)

    m = re.search(r"HOLDOUT_ASSERTIONS=(\d+)", out)
    if proc.returncode != 0 or not m:
        if not m:
            print("HOLDOUT_FAILED journey exited without an assertion count", flush=True)
        return 1
    print(f"HOLDOUT_PASSED scenarios={SCENARIOS} assertions={m.group(1)}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
