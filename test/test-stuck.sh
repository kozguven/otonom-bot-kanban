#!/usr/bin/env bash
set -uo pipefail
RIG="/Users/keremozguven/Projeler/yapayzeka-haber/bot-demo"
TMPWS="$(mktemp -d)"
cd "$TMPWS" && git init -q && git commit -q --allow-empty -m init
export WORKSPACE_DIR="$TMPWS"
export CLAUDE_BIN="$RIG/test/fake-claude-stuck"
export MAX_ITERS=20 STUCK_LIMIT=3

cd "$RIG"
bash run-bot.sh; rc=$?

if [ "$rc" -ne 2 ]; then
  echo "FAIL: takılma tespiti exit 2 vermeliydi (aldık: $rc)"; exit 1
fi
echo "PASS: bot takılmayı tespit edip durdu (exit 2)"
