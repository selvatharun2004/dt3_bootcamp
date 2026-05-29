#!/usr/bin/env bash
set -euo pipefail
WORKSPACE="${WORKSPACE:-/home/kavia/workspace/code-generation/dt3_bootcamp/ReactWebApp}"
cd "$WORKSPACE"
[ -f /etc/profile.d/react_headless.sh ] && source /etc/profile.d/react_headless.sh || true
: "${PORT:=3000}"; : "${NODE_ENV:=production}"; export PORT NODE_ENV CI BROWSER TERM
NODE_ENV=production npm run build --silent || { echo "build failed" >&2; exit 30; }
