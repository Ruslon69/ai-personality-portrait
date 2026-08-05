#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
backend_dir="$repo_root/backend"

if [[ -x "$backend_dir/.venv/bin/python" ]]; then
  python_bin="$backend_dir/.venv/bin/python"
else
  python_bin="${PYTHON:-python3}"
fi

if [[ -x "$backend_dir/.venv/bin/ruff" ]]; then
  ruff_command=("$backend_dir/.venv/bin/ruff")
elif "$python_bin" -m ruff --version >/dev/null 2>&1; then
  ruff_command=("$python_bin" -m ruff)
else
  printf '%s\n' 'Ruff is unavailable. Install backend development dependencies first.' >&2
  exit 1
fi

cd "$backend_dir"
"${ruff_command[@]}" check .
"${ruff_command[@]}" format --check .
"$python_bin" -c 'from app.main import app; assert app is not None'
"$python_bin" "$repo_root/scripts/backend-health-smoke.py"
