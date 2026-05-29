#!/usr/bin/env bash
set -euo pipefail
WORKSPACE="${WORKSPACE:-/home/kavia/workspace/code-generation/dt3_bootcamp/ReactWebApp}"
[[ "$WORKSPACE" == *ReactWebApp* ]] || { echo "WORKSPACE must reference ReactWebApp" >&2; exit 2; }
# shellcheck disable=SC1090
[ -f /etc/profile.d/react_headless.sh ] && source /etc/profile.d/react_headless.sh || true
mkdir -p "$WORKSPACE" && cd "$WORKSPACE"
if [ -f package.json ]; then
  if grep -qi 'vite' package.json >/dev/null 2>&1; then echo "package.json indicates Vite; skipping scaffold" >&2; exit 0; fi
  if grep -q 'react-scripts' package.json >/dev/null 2>&1; then exit 0; fi
  echo "unknown_build_tool" > .scaffold_needs_attention
  echo "package.json exists with unknown build tool; left unchanged; see .scaffold_needs_attention" >&2
  exit 0
fi
cat >package.json <<'JSON'
{
  "name": "reactwebapp",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "jest --runInBand --silent",
    "serve": "serve -s build -l $PORT"
  },
  "dependencies": {"react": "^18.0.0","react-dom": "^18.0.0"},
  "devDependencies": {"react-scripts": "^5.0.0","jest": "^29.0.0","serve": "^14.0.0"}
}
JSON
mkdir -p src public && cat >src/index.js <<'JS'
import React from 'react'
import { createRoot } from 'react-dom/client'
const App = () => React.createElement('div', null, 'Hello')
const el = document.getElementById('root') || document.body.appendChild(document.createElement('div'))
createRoot(el).render(React.createElement(App))
JS
cat >public/index.html <<'HTML'
<!doctype html><html><head><meta charset="utf-8"><title>ReactWebApp</title></head><body><div id="root"></div></body></html>
HTML
