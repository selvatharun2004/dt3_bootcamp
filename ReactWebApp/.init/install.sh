#!/usr/bin/env bash
set -euo pipefail
WORKSPACE="${WORKSPACE:-/home/kavia/workspace/code-generation/dt3_bootcamp/ReactWebApp}"
[[ "$WORKSPACE" == *ReactWebApp* ]] || { echo "WORKSPACE must reference ReactWebApp" >&2; exit 2; }
[ -f /etc/profile.d/react_headless.sh ] && source /etc/profile.d/react_headless.sh || true
cd "$WORKSPACE"
sudo chown -R "$(id -u):$(id -g)" "$WORKSPACE" || true
if [ -f yarn.lock ]; then
  command -v yarn >/dev/null 2>&1 || { echo "yarn not available" >&2; exit 10; }
  YARN_V=$(yarn -v 2>/dev/null || true); YARN_MAJOR=${YARN_V%%.*}
  [[ "$YARN_MAJOR" =~ ^[0-9]+$ && "$YARN_MAJOR" -ge 1 ]] || { echo "require yarn >=1 (found ${YARN_V:-unknown})" >&2; exit 11; }
  yarn install --frozen-lockfile --non-interactive --silent || { echo "yarn install failed" >&2; exit 12; }
  PKG_TOOL="yarn"
else
  NPM_V=$(npm -v); NPM_MAJOR=${NPM_V%%.*}
  [[ "$NPM_MAJOR" =~ ^[0-9]+$ && "$NPM_MAJOR" -ge 7 ]] || { echo "require npm >=7 (found ${NPM_V:-unknown})" >&2; exit 13; }
  [ -f package-lock.json ] || npm i --package-lock-only --no-audit --no-fund --silent
  npm ci --no-audit --no-fund --silent || { echo "npm ci failed" >&2; exit 15; }
  PKG_TOOL="npm"
fi
# Validate local CLIs used later
if [ -x node_modules/.bin/jest ]; then node_modules/.bin/jest --version >/dev/null 2>&1 || { echo "local jest failed to run" >&2; exit 16; }; else echo "local jest missing" >&2; exit 17; fi
if [ -x node_modules/.bin/serve ] || [ -x node_modules/.bin/http-server ]; then true; else echo "no local static server (serve or http-server) installed" >&2; exit 18; fi
