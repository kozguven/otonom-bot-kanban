#!/usr/bin/env bash
set -uo pipefail

RIG="$(cd "$(dirname "$0")" && pwd)"
WS="${WORKSPACE_DIR:-$RIG/workspace}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
MAX_ITERS="${MAX_ITERS:-40}"
ITER_TIMEOUT="${ITER_TIMEOUT:-600}"
STUCK_LIMIT="${STUCK_LIMIT:-3}"

# portable timeout (macOS'ta 'timeout' yoktur; coreutils 'gtimeout')
if command -v timeout >/dev/null 2>&1; then TIMEOUT="timeout"
elif command -v gtimeout >/dev/null 2>&1; then TIMEOUT="gtimeout"
else echo "HATA: timeout/gtimeout gerekli (brew install coreutils)"; exit 1; fi

mkdir -p "$RIG/logs" "$WS"

next_task() { grep -n '^- \[ \]' "$WS/PLAN.md" 2>/dev/null | head -n1; }
head_commit() { ( cd "$WS" && git rev-parse HEAD 2>/dev/null || echo none ); }

stuck_count=0
prev_task=""

for ((i=1; i<=MAX_ITERS; i++)); do
  if [ ! -f "$WS/PLAN.md" ]; then
    prompt="$(cat "$RIG/prompts/plan.md")"; phase="plan"
  elif [ -n "$(next_task)" ]; then
    prompt="$(cat "$RIG/prompts/task.md")"; phase="task"
  else
    echo "Tüm görevler tamamlandı 🎉"; break
  fi

  cur_task="$(next_task)"
  before="$(head_commit)"

  echo "=== Tur $i ($phase) ==="
  ( cd "$WS" && $TIMEOUT "$ITER_TIMEOUT" "$CLAUDE_BIN" -p "$prompt" --dangerously-skip-permissions ) \
    2>&1 | tee "$RIG/logs/iter-$i.log"

  after="$(head_commit)"

  if [ "$phase" = "task" ]; then
    if [ "$cur_task" = "$prev_task" ] && [ "$before" = "$after" ]; then
      stuck_count=$((stuck_count+1))
    else
      stuck_count=0
    fi
    prev_task="$cur_task"
    if [ "$stuck_count" -ge "$STUCK_LIMIT" ]; then
      echo "⚠️  Bot aynı görevde $STUCK_LIMIT tur ilerleyemedi, durduruluyor:"
      echo "    $cur_task"
      exit 2
    fi
  fi
done
