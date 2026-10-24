#!/usr/bin/env bash
set -euo pipefail

HAKLEX_ROOT=$(git -C "$(dirname "${BASH_SOURCE[0]}")" rev-parse --show-toplevel)

NEW_VERSION=${NEW_VERSION:?set NEW_VERSION}
DOWNSTREAM_MANIFESTS=${DOWNSTREAM_MANIFESTS:?set DOWNSTREAM_MANIFESTS to newline-separated package.json paths}
PUBLISH_SET=${PUBLISH_SET:-$(node "$HAKLEX_ROOT/scripts/release/publish.mjs" list)}
PEER_FLOORS=${PEER_FLOORS:-}

# Resolved from haklex, not the cwd: a fresh downstream worktree has no
# node_modules, and a failed require used to let every peer row through.
if ! SEMVER=$(node -e 'console.log(require.resolve("semver", { paths: [process.argv[1]] }))' "$HAKLEX_ROOT" 2> /dev/null); then
  echo "FAIL: cannot resolve semver from $HAKLEX_ROOT; run pnpm install there." >&2
  exit 1
fi

floor_satisfied() {
  node -e '
    const semver = require(process.argv[1]);
    try {
      const cur = semver.minVersion(process.argv[2]);
      const next = semver.minVersion(process.argv[3]);
      if (!cur || !next) process.exit(2);
      process.exit(semver.gte(cur, next) ? 0 : 1);
    } catch {
      process.exit(2);
    }
  ' "$SEMVER" "$1" "$2"
}

echo "== haklex pin rewrites =="
while read -r MANIFEST; do
  [ -z "$MANIFEST" ] && continue
  jq -r '
    ((.dependencies // {}) + (.devDependencies // {}) + (.peerDependencies // {}))
    | keys[]
    | select(startswith("@haklex/"))
  ' "$MANIFEST" | while read -r pkg; do
    [ -z "$pkg" ] && continue
    if grep -qxF "$pkg" <<< "$PUBLISH_SET"; then
      cur=$(jq -r --arg pkg "$pkg" '
        ((.dependencies // {})[$pkg]
          // (.devDependencies // {})[$pkg]
          // (.peerDependencies // {})[$pkg]
          // empty)
      ' "$MANIFEST")
      printf 'haklex\t%s\t%s\t%s\t%s\n' "$MANIFEST" "$pkg" "$cur" "$NEW_VERSION"
    fi
  done
done <<< "$DOWNSTREAM_MANIFESTS"

echo "== third-party peer-floor rewrites =="
while IFS=$'\t' read -r lib new_range; do
  [ -z "$lib" ] && continue
  while read -r MANIFEST; do
    [ -z "$MANIFEST" ] && continue
    for section in dependencies devDependencies peerDependencies; do
      cur=$(jq -r --arg s "$section" --arg l "$lib" '(.[$s] // {})[$l] // empty' "$MANIFEST")
      [ -z "$cur" ] && continue
      [ "$cur" = "$new_range" ] && continue
      rc=0
      floor_satisfied "$cur" "$new_range" || rc=$?
      case "$rc" in
        0) continue ;;
        1) printf 'peer\t%s\t%s\t%s\t%s\t%s\n' "$MANIFEST" "$section" "$lib" "$cur" "$new_range" ;;
        *)
          echo "FAIL: cannot compare $lib '$cur' against '$new_range' in $MANIFEST ($section)." >&2
          exit 1
          ;;
      esac
    done
  done <<< "$DOWNSTREAM_MANIFESTS"
done <<< "$PEER_FLOORS"
