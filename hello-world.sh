#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

ARCH="$(uname -m)"
PLATFORM_ARGS=()
if [[ "$ARCH" == "arm64" ]]; then
  PLATFORM_ARGS=(--platform linux/arm64)
elif [[ "$ARCH" == "x86_64" ]]; then
  PLATFORM_ARGS=(--platform linux/amd64)
fi

echo "Installing bvisor inside Linux container..."
docker run --rm "${PLATFORM_ARGS[@]}" \
  --security-opt seccomp=unconfined \
  -v "$(pwd):/app" -w /app \
  oven/bun:alpine \
  sh -c 'bun install && bun hello-world.ts'
