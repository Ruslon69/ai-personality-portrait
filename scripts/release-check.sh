#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"
simulation=false

if [[ "${1:-}" == "--simulate" ]]; then
  simulation=true
  shift
fi
tag="${1:-}"

if [[ "$simulation" == true ]]; then
  node "$script_dir/release-preconditions.mjs" --simulate "$tag"
  node "$script_dir/release-metadata.mjs" summary --tag="$tag"
  exit 0
fi

node "$script_dir/release-preconditions.mjs" "$tag"
"$script_dir/check.sh"
node "$script_dir/build-reproducibility.mjs"
node "$script_dir/release-metadata.mjs" summary --tag="$tag"

cd "$repo_root"
git diff --exit-code -- . ':!frontend/reports'
