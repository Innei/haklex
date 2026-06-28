#!/usr/bin/env bash
set -euo pipefail

DRIFTED_PEERS=${DRIFTED_PEERS:-}
DOWNSTREAM_MANIFESTS=${DOWNSTREAM_MANIFESTS:-}

DRIFTED_LIBS=$(awk '{print $1}' <<< "$DRIFTED_PEERS" | sort -u)

DOWNSTREAM_LEXICAL=""
if [ -n "$DOWNSTREAM_MANIFESTS" ]; then
  DOWNSTREAM_LEXICAL=$(grep -hoE '"@lexical/[a-z-]+"' $DOWNSTREAM_MANIFESTS 2> /dev/null \
    | tr -d '"' | sort -u || true)
fi

LIBS=$(printf '%s\n' lexical react react-dom @lexical/react lucide-react shiki $DRIFTED_LIBS $DOWNSTREAM_LEXICAL \
  | sort -u | grep -v '^$')

status=0
while read -r lib; do
  [ -z "$lib" ] && continue
  versions=$(pnpm ls "$lib" -r --depth Infinity --json 2> /dev/null \
    | jq -r --arg lib "$lib" '[.. | objects | .[$lib]?.version | select(. != null)] | unique | .[]')
  count=$(printf '%s\n' "$versions" | grep -c . || true)
  if [ "$count" -gt 1 ]; then
    echo "FAIL: $lib has $count distinct copies:"
    printf '  %s\n' $versions
    status=1
  else
    printf 'OK: %s -> %s\n' "$lib" "${versions:-not installed}"
  fi
done <<< "$LIBS"

exit "$status"
