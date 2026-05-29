#!/usr/bin/env bash
set -euo pipefail
WORKSPACE="${WORKSPACE:-/home/kavia/workspace/code-generation/dt3_bootcamp/ReactWebApp}"
cd "$WORKSPACE"
[ -f /etc/profile.d/react_headless.sh ] && source /etc/profile.d/react_headless.sh || true
: "${PORT:=3000}"; : "${NODE_ENV:=production}"; export PORT NODE_ENV CI BROWSER TERM
LOG=/tmp/react_serve.log
if [ -x node_modules/.bin/serve ]; then CMD=(node_modules/.bin/serve -s build -l "$PORT"); elif [ -x node_modules/.bin/http-server ]; then CMD=(node_modules/.bin/http-server build -p "$PORT"); else echo "no local static server found" >&2; exit 31; fi
"${CMD[@]}" >"$LOG" 2>&1 &
echo $! >/tmp/react_serve.pid
sleep 0.3
