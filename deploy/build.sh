#!/usr/bin/env bash
set -euo pipefail

npm install -g pnpm@10
pnpm install --frozen-lockfile
pnpm test
pnpm build