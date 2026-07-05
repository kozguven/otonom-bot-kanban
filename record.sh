#!/usr/bin/env bash
set -euo pipefail
RIG="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$RIG/logs"
CAST="$RIG/logs/session-$(date +%Y%m%d-%H%M%S).cast"
echo "Kayıt: $CAST"
asciinema rec --command "bash $RIG/run-bot.sh" "$CAST"
echo "Bitti. Oynatmak için: asciinema play $CAST"
