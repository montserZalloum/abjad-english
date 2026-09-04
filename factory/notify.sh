#!/usr/bin/env bash
# The escalation channel (FACTORY_NOTIFY_CMD points here).
# Contract: the whole message arrives on STDIN; argv[1] is the target, for the title only.
set -u
target="${1:-factory}"
message="$(cat)"
/usr/bin/osascript - "$target" "$message" <<'OSA' >/dev/null 2>&1 || true
on run argv
  display notification (item 2 of argv) with title "Dark factory" subtitle (item 1 of argv)
end run
OSA
# Never fail: an escalation whose notifier broke is still an escalation on disk.
exit 0
