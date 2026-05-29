#!/usr/bin/env bash
set -euo pipefail
WORKSPACE="${WORKSPACE:-/home/kavia/workspace/code-generation/dt3_bootcamp/ReactWebApp}"
cd "$WORKSPACE"
[ -f /etc/profile.d/react_headless.sh ] && source /etc/profile.d/react_headless.sh || true
export CI=true TERM=dumb BROWSER=none
if [ -x node_modules/.bin/jest ]; then node_modules/.bin/jest --runInBand --silent || { echo "tests failed" >&2; exit 40; }; else echo "local jest not found" >&2; exit 41; fi
