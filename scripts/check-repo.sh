#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"

cd "$repo_root"
git diff --check
node scripts/repo-hygiene.mjs
node scripts/validate-workflows.mjs
node scripts/release-metadata.mjs validate
node scripts/classify-changes.mjs

if ! git check-ignore -q frontend/reports/quality-gates.json; then
  printf '%s\n' 'frontend/reports must remain ignored.' >&2
  exit 1
fi
