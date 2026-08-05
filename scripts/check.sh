#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

"$script_dir/check-frontend.sh"
"$script_dir/check-backend.sh"
"$script_dir/check-repo.sh"
