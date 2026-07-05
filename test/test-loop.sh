#!/usr/bin/env bash
set -uo pipefail
RIG="/Users/keremozguven/Projeler/yapayzeka-haber/bot-demo"
TMPWS="$(mktemp -d)"
cd "$TMPWS" && git init -q && git commit -q --allow-empty -m init

# workspace'i geçici dizine yönlendir
export WORKSPACE_DIR="$TMPWS"
export CLAUDE_BIN="$RIG/test/fake-claude"
export MAX_ITERS=10

cd "$RIG"
bash run-bot.sh

# Beklenti: tüm görevler işaretli
if grep -q '^- \[ \]' "$TMPWS/PLAN.md"; then
  echo "FAIL: işaretsiz görev kaldı"; exit 1
fi
commits="$(cd "$TMPWS" && git rev-list --count HEAD)"
# init + PLAN.md + 3 görev = en az 5 commit
if [ "$commits" -lt 5 ]; then
  echo "FAIL: beklenen commit sayısı oluşmadı ($commits)"; exit 1
fi
echo "PASS: döngü tüm görevleri tamamladı ($commits commit)"
