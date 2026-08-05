#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
frontend_dir="$repo_root/frontend"

if [[ ! -d "$frontend_dir/node_modules" ]]; then
  printf '%s\n' 'Frontend dependencies are missing. Run: cd frontend && npm ci' >&2
  exit 1
fi

cd "$frontend_dir"
npm run lint
npm run format:check
npm run build
npm run quality
npm audit --omit=dev
