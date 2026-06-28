#!/usr/bin/env bash
set -euo pipefail

LAST=${1:-$(git log --grep='^release: v' -n1 --format=%H)}

if [ -z "$LAST" ]; then
  echo "FAIL: could not find last release commit matching '^release: v'." >&2
  exit 1
fi

LOCAL_VERSION=$(jq -r .version packages/rich-editor/package.json)

SRC_CHANGED=$(
  git diff --name-only "$LAST"..HEAD -- 'packages/*/src/**' \
    | awk -F/ '{print $2}' | sort -u
)

PEER_DRIFT=$(
  for manifest in $(git diff --name-only "$LAST"..HEAD -- 'packages/*/package.json'); do
    pkg=$(basename "$(dirname "$manifest")")
    old=$({ git show "$LAST:$manifest" 2> /dev/null || printf '{}'; } | jq -r '
      (.peerDependencies // {}) | to_entries[]
      | select(.key | startswith("@haklex/") | not)
      | "\(.key) \(.value)"' | sort)
    new=$(jq -r '
      (.peerDependencies // {}) | to_entries[]
      | select(.key | startswith("@haklex/") | not)
      | "\(.key) \(.value)"' "$manifest" | sort)
    [ "$old" != "$new" ] && echo "$pkg"
  done | sort -u
)

CATCHUP=$(
  for manifest in packages/*/package.json; do
    pkg_name=$(jq -r .name "$manifest")
    [ "$pkg_name" = "@haklex/rich-editor-demo" ] && continue
    reg=$(npm view "$pkg_name" version 2> /dev/null || echo "404")
    [ "$reg" = "404" ] && continue
    if [ "$reg" != "$LOCAL_VERSION" ]; then
      basename "$(dirname "$manifest")"
    fi
  done | sort -u
)

CHANGED_PKGS=$(printf '%s\n%s\n%s\n' "$SRC_CHANGED" "$PEER_DRIFT" "$CATCHUP" \
  | sort -u | grep -v '^$' || true)

printf 'LAST=%s\n' "$LAST"
printf 'LOCAL_VERSION=%s\n' "$LOCAL_VERSION"
printf 'SRC_CHANGED=%s\n' "$(tr '\n' ' ' <<< "$SRC_CHANGED" | xargs || true)"
printf 'PEER_DRIFT=%s\n' "$(tr '\n' ' ' <<< "$PEER_DRIFT" | xargs || true)"
printf 'CATCHUP=%s\n' "$(tr '\n' ' ' <<< "$CATCHUP" | xargs || true)"
printf 'CHANGED_PKGS=%s\n' "$(tr '\n' ' ' <<< "$CHANGED_PKGS" | xargs || true)"
