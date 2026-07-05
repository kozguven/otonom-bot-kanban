#!/usr/bin/env bash
set -euo pipefail
RIG="$(cd "$(dirname "$0")" && pwd)"
WS="$RIG/workspace"

if [ -e "$WS" ]; then
  echo "workspace/ zaten var. Temiz başlangıç için silinsin mi? (yes/no)"
  read -r ans
  [ "$ans" = "yes" ] || { echo "İptal."; exit 1; }
  rm -rf "$WS"
fi

mkdir -p "$WS"
cp "$RIG/GOAL.md" "$WS/GOAL.md"
( cd "$WS" && git init -q && git add GOAL.md && git commit -q -m "chore: hedef" )

echo "workspace/ hazır. Gerçek bot çalıştırması (asciinema kayıtlı) başlıyor..."
bash "$RIG/record.sh"
