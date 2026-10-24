#!/usr/bin/env bash
set -euo pipefail

NEW_VERSION=${1:?usage: registry-peer-floors.sh <new-version> [published-pkg ...]}
shift

HAKLEX_ROOT=$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)

if [ "$#" -eq 0 ]; then
  PKGS=$(node "$HAKLEX_ROOT/scripts/release/publish.mjs" list)
else
  PKGS=$(printf '%s\n' "$@")
fi

if [ -z "$PKGS" ]; then
  echo "FAIL: no published packages to inspect." >&2
  exit 1
fi

while read -r pkg; do
  [ -z "$pkg" ] && continue
  out=$(npm view "$pkg@$NEW_VERSION" peerDependencies --json 2> /dev/null || true)
  [ -z "$out" ] && out='{}'
  printf '%s\n' "$out"
done <<< "$PKGS" | jq -rs '
  map(select(. != null and type == "object"))
  | add // {}
  | to_entries
  | map(select(.key | startswith("@haklex/") | not))
  | .[]
  | "\(.key)\t\(.value)"
'
