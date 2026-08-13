#!/usr/bin/env bash
set -euo pipefail

if ! command -v apt-get >/dev/null 2>&1; then
  echo 'CI media setup requires an Ubuntu/Debian runner with apt-get.' >&2
  exit 1
fi

apt-get update
apt-get install --yes --no-install-recommends ffmpeg

ffmpeg -version | sed -n '1p'
ffprobe -version | sed -n '1p'
