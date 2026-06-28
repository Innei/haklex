#!/usr/bin/env bash
set -euo pipefail

NEW_VERSION=${1:?usage: registry-peer-floors.sh <new-version> <published-pkg ...>}
shift

if [ "$#" -eq 0 ]; then
  echo "FAIL: provide at least one published package." >&2
  exit 1
fi

for pkg in "$@"; do
  out=$(npm view "$pkg@$NEW_VERSION" peerDependencies --json 2> /dev/null || true)
  [ -z "$out" ] && out='{}'
  printf '%s\n' "$out"
done | jq -s '
  map(select(. != null and type == "object"))
  | add // {}
  | to_entries
  | map(select(.key | startswith("@haklex/") | not))
  | map("\(.key)\t\(.value)")
  | .[]
'
