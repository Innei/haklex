#!/usr/bin/env bash
set -euo pipefail

NEW_VERSION=${NEW_VERSION:?set NEW_VERSION}
PUBLISH_SET=${PUBLISH_SET:?set PUBLISH_SET to newline-separated package names}
DOWNSTREAM_MANIFESTS=${DOWNSTREAM_MANIFESTS:?set DOWNSTREAM_MANIFESTS to newline-separated package.json paths}
PEER_FLOORS=${PEER_FLOORS:-}

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
      if cur_floor=$(node -e "console.log(require('semver').minVersion('$cur').version)" 2> /dev/null) \
        && new_floor=$(node -e "console.log(require('semver').minVersion('$new_range').version)" 2> /dev/null) \
        && node -e "process.exit(require('semver').gte('$cur_floor','$new_floor')?0:1)" 2> /dev/null; then
        continue
      fi
      printf 'peer\t%s\t%s\t%s\t%s\t%s\n' "$MANIFEST" "$section" "$lib" "$cur" "$new_range"
    done
  done <<< "$DOWNSTREAM_MANIFESTS"
done <<< "$PEER_FLOORS"
