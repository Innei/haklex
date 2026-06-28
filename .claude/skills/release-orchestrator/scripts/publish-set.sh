#!/usr/bin/env bash
set -euo pipefail

MODE=${1:?usage: publish-set.sh <incremental|full> <last-release-sha> [changed-pkg ...]}
LAST=${2:?usage: publish-set.sh <incremental|full> <last-release-sha> [changed-pkg ...]}
shift 2
CHANGED_PKGS=("$@")

case "$MODE" in
  full)
    pnpm -r ls --depth -1 --json \
      | jq -r '.[].name' \
      | grep '^@haklex/' \
      | grep -v '^@haklex/rich-editor-demo$'
    exit 0
    ;;
  incremental) ;;
  *)
    echo "FAIL: mode must be incremental or full." >&2
    exit 1
    ;;
esac

if [ "${#CHANGED_PKGS[@]}" -eq 0 ]; then
  echo "FAIL: incremental mode requires at least one changed package." >&2
  exit 1
fi

declare -A IN_SET
for p in "${CHANGED_PKGS[@]}"; do
  [ -z "$p" ] && continue
  case "$p" in
    @haklex/*) IN_SET["$p"]=1 ;;
    *) IN_SET["@haklex/$p"]=1 ;;
  esac
done

DRIFTED_PEERS=$(
  for p in "${CHANGED_PKGS[@]}"; do
    p=${p#@haklex/}
    manifest="packages/$p/package.json"
    [ -f "$manifest" ] || continue
    {
      diff \
        <({ git show "$LAST:$manifest" 2> /dev/null || printf '{}'; } | jq -r '
          (.peerDependencies // {}) | to_entries[]
          | select(.key | startswith("@haklex/") | not)
          | "\(.key) \(.value)"' | sort) \
        <(jq -r '
          (.peerDependencies // {}) | to_entries[]
          | select(.key | startswith("@haklex/") | not)
          | "\(.key) \(.value)"' "$manifest" | sort) \
        || true
    } \
      | awk '/^> /{print $2" "$3}'
  done | sort -u
)

changed=1
while [ "$changed" -eq 1 ]; do
  changed=0

  for pkg in "${!IN_SET[@]}"; do
    manifest="packages/${pkg#@haklex/}/package.json"
    [ -f "$manifest" ] || continue
    while read -r dep; do
      [ -z "$dep" ] && continue
      [ "$dep" = "@haklex/rich-editor-demo" ] && continue
      if [ -z "${IN_SET[$dep]:-}" ]; then
        IN_SET[$dep]=1
        changed=1
      fi
    done < <(jq -r '
      ((.dependencies // {}) + (.peerDependencies // {}) + (.optionalDependencies // {}))
      | to_entries[]
      | select(.key | startswith("@haklex/"))
      | select(.value | startswith("workspace:"))
      | .key
    ' "$manifest")
  done

  for sib in packages/*/package.json; do
    sib_name=$(jq -r '.name' "$sib")
    [ "$sib_name" = "@haklex/rich-editor-demo" ] && continue
    [ -n "${IN_SET[$sib_name]:-}" ] && continue
    while read -r ref; do
      [ -z "$ref" ] && continue
      if [ -n "${IN_SET[$ref]:-}" ]; then
        IN_SET[$sib_name]=1
        changed=1
        break
      fi
    done < <(jq -r '
      ((.dependencies // {}) + (.optionalDependencies // {}) + (.peerDependencies // {}))
      | to_entries[]
      | select(.key | startswith("@haklex/"))
      | select(.value == "workspace:*")
      | .key
    ' "$sib")
  done

  if [ -n "$DRIFTED_PEERS" ]; then
    for sib in packages/*/package.json; do
      sib_name=$(jq -r '.name' "$sib")
      [ "$sib_name" = "@haklex/rich-editor-demo" ] && continue
      [ -n "${IN_SET[$sib_name]:-}" ] && continue
      while read -r lib new_range; do
        [ -z "$lib" ] && continue
        sib_range=$(jq -r --arg lib "$lib" '(.peerDependencies // {})[$lib] // empty' "$sib")
        [ -z "$sib_range" ] && continue
        if [ "$sib_range" != "$new_range" ]; then
          IN_SET[$sib_name]=1
          changed=1
          break
        fi
      done <<< "$DRIFTED_PEERS"
    done
  fi
done

printf '%s\n' "${!IN_SET[@]}" | sort
