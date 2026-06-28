# Downstream Propagation

## Phase 5.5: GitHub Release

Release notes live on GitHub Releases. Publish directly; do not create a draft.

Required checks:

| Check            | Requirement                                                                 |
| ---------------- | --------------------------------------------------------------------------- |
| `gh auth status` | Must pass before downstream propagation.                                    |
| Tag              | `gh release create` must use `--verify-tag`.                                |
| Notes            | Include summary, breaking changes, features, bug fixes, and bump rationale. |

```bash
gh release create "v$NEW_VERSION" \
  --title "v$NEW_VERSION" \
  --notes-file "$NOTE" \
  --verify-tag
```

If `gh` is missing or unauthenticated, stop. The release artefact is required.

## Phase 6: Downstream Worktrees

Target each downstream default branch from `origin/HEAD`; do not guess `main` or `master`.

```bash
git -C "/Users/innei/git/innei-repo/$repo" remote set-head origin --auto > /dev/null 2>&1
D=$(git -C "/Users/innei/git/innei-repo/$repo" \
  symbolic-ref refs/remotes/origin/HEAD --short | sed 's#^origin/##')
```

Create disposable worktrees from `origin/$D`:

```bash
git -C "/Users/innei/git/innei-repo/$repo" fetch origin "$D"
git -C "/Users/innei/git/innei-repo/$repo" worktree add \
  "/tmp/release-$repo-$NEW_VERSION" \
  -b "chore/haklex-$NEW_VERSION" \
  "origin/$D"
```

The branch is local only. Never push `chore/haklex-$NEW_VERSION` to origin.

## Haklex Pin Rewrites

Enumerate every downstream manifest that lists `@haklex/*`:

```bash
DOWNSTREAM_MANIFESTS=$(
  grep -lrn '"@haklex/' "/tmp/release-$repo-$NEW_VERSION" --include=package.json \
    | grep -v node_modules
)
```

Only rewrite `@haklex/*` packages present in `PUBLISH_SET`. Packages outside `PUBLISH_SET` were not published at `$NEW_VERSION` and must keep their prior pin.

Use [../scripts/downstream-dispatch.sh](../scripts/downstream-dispatch.sh) to emit rewrite rows. Apply each row with an explicit file edit; do not use blanket `sed -i`.

## Third-Party Peer-Floor Reconciliation

If any published haklex package advanced a non-`@haklex/*` peer floor, downstream direct pins for the same libraries must also lift. Otherwise pnpm can install both the downstream-pinned old version and the haklex-required new version.

Use [../scripts/registry-peer-floors.sh](../scripts/registry-peer-floors.sh) to aggregate peer floors from the actual registry-published manifests. Use [../scripts/downstream-dispatch.sh](../scripts/downstream-dispatch.sh) to produce concrete rewrite rows:

```text
peer<TAB><manifest><TAB><section><TAB><lib><TAB><current><TAB><new>
```

Every emitted row is mandatory. The v0.29.0 failure path came from treating this loop as illustrative rather than dispatching edits.

`dependencies`, `devDependencies`, and `peerDependencies` are all in scope. The semver guard leaves a downstream range unchanged if it already satisfies the new floor.

## Install-Time Dedup Gate

Run after install and before staging. This gate duplicates the Phase 7 runtime check earlier in the workflow so incomplete reconciliation cannot reach `git add`.

```bash
DRIFTED_PEERS="$DRIFTED_PEERS" \
  DOWNSTREAM_MANIFESTS="$DOWNSTREAM_MANIFESTS" \
  ./.claude/skills/release-orchestrator/scripts/duplicate-runtime-invariant.sh
```

The check must cover:

- `lexical`
- `react`
- `react-dom`
- `@lexical/react`
- `lucide-react`
- `shiki`
- every library in `DRIFTED_PEERS`
- every `@lexical/*` subpackage listed by downstream manifests

## Commit-Ready Files

Re-derive at release time. Historical sets:

| Repo    | Stage                                                                                                                                                                                                                          |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Yohaku  | `apps/web/package.json`, root `pnpm-lock.yaml`, and any reconciled direct `lexical` / `@lexical/*` pins in the same manifest.                                                                                                  |
| mx-core | `apps/admin/package.json`, `apps/core/package.json`, `packages/cli/package.json`, `packages/editor/package.json`, root `pnpm-lock.yaml`, and `pnpm-workspace.yaml` if `pnpm install` adds a benign `minimumReleaseAgeExclude`. |

Do not discard generated file churn with reset/restore commands. If generated files changed, inspect them and either include them deliberately or ask the user how to proceed.

Commit footer requirement: before `git add`, record the install-time gate's concrete proof in the commit message footer, one line per checked library:

```text
pnpm why <lib> -r -> <version>
```

## Phase 7: Downstream Smoke Tests

Run Yohaku and mx-core worktrees in parallel where practical.

| Test                        | Requirement                                                                                   |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| Typecheck                   | `pnpm typecheck`, or `pnpm -r exec tsc --noEmit` if no script exists.                         |
| Build                       | `pnpm build`.                                                                                 |
| Duplicate-runtime invariant | Run `duplicate-runtime-invariant.sh` again after build.                                       |
| E2E                         | Use the repo's existing smoke journey if one exists; otherwise skip with an explicit warning. |

Proceed only when every downstream is green.

## Phase 8b: Direct Downstream Push

```bash
D="${DEFAULT[$repo]}"
git add <explicit files>
COMMIT_MSG=$(mktemp)
{
  printf 'chore(deps): bump @haklex/* to %s\n\n' "$NEW_VERSION"
  printf 'Upstream:\n'
  git -C /Users/innei/git/innei-repo/haklex log --oneline "$LAST"..HEAD
  printf '\n'
  printf '<dedup proof footer>\n'
} > "$COMMIT_MSG"
git commit -F "$COMMIT_MSG"

git fetch origin "$D"
git rebase "origin/$D"
git push origin "HEAD:$D"
```

If rebase conflicts occur, stop and ask. Do not skip, abort, or resolve by overwriting without explicit user direction.

After successful push, remove disposable worktrees and local temp branches only after confirming they contain no uncommitted changes.
