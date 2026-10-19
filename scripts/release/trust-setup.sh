#!/usr/bin/env bash
set -euo pipefail

# One-time: register .github/workflows/release.yml as the npm trusted publisher
# for every public @haklex/* package. Needs an interactive npm login with 2FA;
# pick "skip 2FA for 5 minutes" on the first prompt so the loop runs through.

cd "$(dirname "$0")/../.."

NPM=(npx --yes npm@^11.15.0)
REPO=Innei/haklex
WORKFLOW=release.yml

for pkg in $(node scripts/release/publish.mjs list); do
  if "${NPM[@]}" trust list "$pkg" 2> /dev/null | grep -q "$WORKFLOW"; then
    echo "skip $pkg (already trusted)"
    continue
  fi
  "${NPM[@]}" trust github "$pkg" --repo "$REPO" --file "$WORKFLOW" --yes
  sleep 2
done
