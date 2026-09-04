#!/usr/bin/env bash
# Browser presence check for factory_doctor (harness.config.json browser.install_check
# points here). A script, not an inline `test -x "...path with spaces..."`, because the
# doctor splits the config value naively and the quotes arrive attached to the path.
set -u
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [ -x "$CHROME" ]; then
  echo "BROWSER_OK $CHROME"
  exit 0
fi
echo "BROWSER_MISSING: no executable at $CHROME - install Google Chrome or set CHROME" >&2
exit 1
