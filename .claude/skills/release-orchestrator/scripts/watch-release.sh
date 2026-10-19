#!/usr/bin/env bash
set -euo pipefail

TAG=${1:?usage: watch-release.sh <tag>}
VERSION=${TAG#v}
REPO_ROOT=$(git rev-parse --show-toplevel)
GH_REPO=${GH_REPO:-Innei/haklex}
export GH_REPO

run_id=""
for _ in $(seq 1 24); do
  run_id=$(gh run list --workflow release.yml --limit 20 \
    --json databaseId,headBranch \
    --jq ".[] | select(.headBranch == \"$TAG\") | .databaseId" | head -n1)
  [ -n "$run_id" ] && break
  sleep 5
done

if [ -z "$run_id" ]; then
  echo "FAIL: no Release workflow run found for $TAG" >&2
  exit 1
fi

echo "Watching Release run $run_id for $TAG"
if ! gh run watch "$run_id" --exit-status --interval 30; then
  echo "FAIL: Release run $run_id did not succeed" >&2
  gh run view "$run_id" --log-failed | tail -n 60 >&2 || true
  exit 1
fi

missing=0
for pkg in $(node "$REPO_ROOT/scripts/release/publish.mjs" list); do
  if [ "$(npm view "$pkg@$VERSION" version 2> /dev/null)" != "$VERSION" ]; then
    echo "MISSING: $pkg@$VERSION"
    missing=1
  fi
done
[ "$missing" -eq 0 ] || exit 1

gh release view "$TAG" --json url --jq .url
