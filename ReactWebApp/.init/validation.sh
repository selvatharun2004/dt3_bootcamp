#!/usr/bin/env bash
set -euo pipefail
WORKSPACE="${WORKSPACE:-/home/kavia/workspace/code-generation/dt3_bootcamp/ReactWebApp}"
[[ "$WORKSPACE" == *ReactWebApp* ]] || { echo "WORKSPACE must reference ReactWebApp" >&2; exit 2; }
[ -f /etc/profile.d/react_headless.sh ] && source /etc/profile.d/react_headless.sh || true
cd "$WORKSPACE"
: "${PORT:=3000}"; : "${NODE_ENV:=production}"; export PORT NODE_ENV CI BROWSER TERM
NODE_ENV=production npm run build --silent || { echo "build failed" >&2; exit 30; }
if [ -x node_modules/.bin/serve ]; then SERVER_BIN=(node_modules/.bin/serve -s build -l "$PORT"); elif [ -x node_modules/.bin/http-server ]; then SERVER_BIN=(node_modules/.bin/http-server build -p "$PORT"); else echo "no local static server found" >&2; exit 31; fi
LOG=/tmp/react_serve.log
TMPPID=/tmp/react_serve.pid
"${SERVER_BIN[@]}" >"$LOG" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" >"$TMPPID"
MAX=20; SLEEP=1
for i in $(seq 1 $MAX); do
  if curl -sSf "http://localhost:$PORT/" >/dev/null 2>&1; then
    echo "validation_success: http://localhost:$PORT/ pid=$SERVER_PID" > /tmp/react_validation_result.txt
    kill "$SERVER_PID" >/dev/null 2>&1 || true
    sleep 1
    if kill -0 "$SERVER_PID" >/dev/null 2>&1; then kill -TERM "$SERVER_PID" >/dev/null 2>&1 || true; sleep 1; kill -9 "$SERVER_PID" >/dev/null 2>&1 || true; fi
    rm -f "$TMPPID"
    exit 0
  fi
  sleep $SLEEP
done
# failure
echo "validation failed: server did not respond" >&2
[ -f "$LOG" ] && sed -n '1,200p' "$LOG" >&2 || true
if [ -f "$TMPPID" ]; then PID=$(cat "$TMPPID") || true; kill "$PID" >/dev/null 2>&1 || true; sleep 1; kill -9 "$PID" >/dev/null 2>&1 || true; rm -f "$TMPPID"; fi
exit 32
