---
name: release-orchestrator
description: Use when releasing @haklex/* packages and propagating to downstream consumers (Yohaku, admin-vue3, mx-core, lobehub, mx-space). Owns end-to-end orchestration: change detection, per-package semver calc, peer-dep audit to prevent duplicate-instance bugs (e.g. lucide-react React Context mismatch), topologically-ordered publish with npm registry polling, parallel-worktree downstream smoke tests, auto-revert on failure, and direct push to downstream primary branches (no PRs). Supersedes the old /release command.
user_invocable: true
---

# Release Orchestrator

Owns the full multi-package release pipeline. Supersedes the old `.claude/commands/release.md`.

## Inputs (explicit contract — refuse to start if missing)

1. **Changeset description** — human summary. Scan for `LIN-\d+` to link Linear issues.
2. **Affected packages** — caller hint. **Always verify** against `git diff --name-only`.

If either is missing, ask the user.

## Repo layout

| Concern                  | Path / Rule                                                                                                                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| haklex root              | Run the release from the **same worktree** where `git status` is clean. Use `git worktree list` to confirm. Never switch checkouts mid-release.                                                                                                     |
| Published namespace      | `@haklex/*`, via `pnpm run publish:packages` (excludes `@haklex/rich-editor-demo`).                                                                                                                                                                 |
| Version strategy         | **Shared** — every `@haklex/*` lives on the same version (read from `packages/rich-editor/package.json`).                                                                                                                                           |
| Downstream: Yohaku       | `/Users/innei/git/innei-repo/Yohaku/apps/web/package.json` — `rich-editor`, `rich-kit-shiro`, `rich-static-renderer`                                                                                                                                |
| Downstream: admin-vue3   | `/Users/innei/git/innei-repo/admin-vue3/package.json` — `rich-diff`, `rich-ext-nested-doc`, `rich-editor`, `rich-editor-ui`, `rich-kit-shiro`, `rich-plugin-toolbar`, `rich-style-token`, `rich-agent-chat`, `rich-agent-core`, `rich-ext-ai-agent` |
| Downstream: mx-core      | `/Users/innei/git/innei-repo/mx-core/apps/core/package.json` — `rich-headless` only                                                                                                                                                                 |
| Downstream: lobehub apps | Ask user for path (not auto-discoverable).                                                                                                                                                                                                          |
| mx-space                 | Same repo as `mx-core` (mx-core is mx-space/core).                                                                                                                                                                                                  |

## Phase 1 — Pre-flight

1. `git status` clean in haklex worktree. If dirty, stop and ask.
2. Identify last release commit:

   ```bash
   LAST=$(git log --grep='^release: v' -n1 --format=%H)
   ```

3. Verify caller's affected-packages list against actual diff:

   ```bash
   git diff --name-only "$LAST"..HEAD -- 'packages/*/src/**' 'packages/*/package.json'
   ```

   A package is **changed** only if `src/**` has diffs. `package.json`-only or lockfile-only changes do **not** trigger a publish on their own.

## Phase 2 — Semver calc (highest-wins across shared version)

Per changed package, classify its diff:

| Diff signal                                                                                                                       | Bump  |
| --------------------------------------------------------------------------------------------------------------------------------- | ----- |
| Removed/renamed export, changed public function signature, changed React Context shape, removed/renamed CSS class in public theme | major |
| New export, new optional arg, new node type, new plugin, additive field, new peer                                                 | minor |
| Internal refactor, bug fix, style-only, private helper                                                                            | patch |

Detect export deltas mechanically:

```bash
diff \
  <(git show "$LAST":packages/ < pkg > /src/index.ts | grep -E '^export' | sort) \
  <(git show HEAD:packages/ < pkg > /src/index.ts | grep -E '^export' | sort)
# '<' only = removed → major;  '>' only = added → minor
```

Because haklex uses a **shared version**, compute `max(bumps)` across all changed packages and apply to all. Print the per-package classification table and get user approval before any `bumpp` call. Any `major` classification requires explicit confirmation.

## Phase 3 — peerDependencies audit (critical)

**Reference case — commit `88bb7a0`:** `rich-agent-chat` imported `lucide-react` transitively via `streamdown` but didn't declare it as a peer. Downstream installed a second copy → two `IconContext` instances → silent render failure. The fix added `"lucide-react": ">=1.0.0"` to peerDependencies.

**Rule:** any library that creates a React Context MUST be a `peerDependency`, never a `dependency`.

Candidates in this repo (always-peer list): `react`, `react-dom`, `lucide-react`, `shiki`, `@lexical/react`, `@base-ui/react`, `@excalidraw/excalidraw`, `katex`.

For each changed package:

```bash
jq '.dependencies // {}, .peerDependencies // {}' packages/ < pkg > /package.json
```

If any always-peer candidate appears under `dependencies`, move it to `peerDependencies` with `>=<currently-installed-minor>` as the floor. If it's a soft dep (e.g. `shiki`), also add to `peerDependenciesMeta.<lib>.optional = true`.

## Phase 4 — Build, publish in topological order, poll registry

```bash
pnpm bumpp -r < patch | minor | major > --no-git --no-tag
pnpm run build:packages
```

Do **not** use `pnpm run release:rich` here — that path runs bumpp + build + publish in one step and bypasses the ordered/polled publish this skill needs. Replace it with explicit phases.

Compute topological order from the workspace graph:

```bash
pnpm -r ls --depth -1 --json
```

Typical leaf-first order: `rich-style-token` → `rich-headless` → `rich-editor-ui` → `rich-editor` → renderer packages → plugin packages → extension packages → `rich-renderers` / `rich-renderers-edit` → `rich-static-renderer` → `rich-kit-shiro`.

Publish leaves first, one at a time, polling the registry after each (npm CDN propagation typically lags 30–120 s):

```bash
pnpm --filter "@haklex/$pkg" publish --no-git-checks
until npm view "@haklex/$pkg@$NEW_VERSION" version > /dev/null 2>&1; do sleep 5; done
```

Do **not** proceed to downstream updates until every published package is resolvable from the registry.

## Phase 5 — Commit and push haklex

```bash
git add packages/*/package.json pnpm-lock.yaml
git commit -m "release: v$NEW_VERSION"
git push
```

Only stage the bumped manifests and lockfile. If the worktree has unrelated edits, stop and ask the user.

## Phase 6 — Downstream update in parallel worktrees

**Record the primary branch per downstream** before touching anything — this is the branch we'll push back to in Phase 8b:

```bash
declare -A PRIMARY
for repo in Yohaku admin-vue3 mx-core; do
  PRIMARY[$repo]=$(git -C "/Users/innei/git/innei-repo/$repo" branch --show-current)
done
```

If a repo is in detached HEAD state, stop and ask the user which branch to target. Never guess.

Create a disposable worktree per repo on a temp branch (isolation only — this branch is never pushed):

```bash
for repo in Yohaku admin-vue3 mx-core; do
  git -C "/Users/innei/git/innei-repo/$repo" worktree add \
    "/tmp/release-$repo-$NEW_VERSION" -b "chore/haklex-$NEW_VERSION"
done
```

Before editing, `git fetch origin` inside each worktree so the rebase in Phase 8b has fresh refs.

In each worktree, replace pinned `"@haklex/<pkg>": "<old>"` → `"$NEW_VERSION"` in the file(s) from the Repo layout table. Use `Edit` (not `sed -i`) so the diff is reviewable. Then `pnpm install`.

Commit-ready files per repo:

| Repo       | Stage these                                     |
| ---------- | ----------------------------------------------- |
| Yohaku     | `apps/web/package.json`, root `pnpm-lock.yaml`  |
| admin-vue3 | `package.json`, `pnpm-lock.yaml`                |
| mx-core    | `apps/core/package.json`, root `pnpm-lock.yaml` |

If the worktree is dirty beyond those files, stop and ask the user — do NOT `git add -A`.

## Phase 7 — Smoke tests (parallel)

In each downstream worktree, dispatch an independent subagent to run:

1. `pnpm typecheck` (or `pnpm -r exec tsc --noEmit` if no script)
2. `pnpm build`
3. One E2E — use the repo's existing smoke journey. If none exists, skip with a warning; do not invent one.

Run the three repos in parallel (one subagent per worktree). Collect pass/fail per repo. Proceed only when all green.

## Phase 8a — Failure recovery (on smoke or publish failure)

1. **Local revert (safe, automatic):**

   ```bash
   git -C haklex reset --hard HEAD~1     # undo "release: v$NEW_VERSION"
   git -C haklex push --force-with-lease # ONLY if already pushed — ASK user first
   for repo in Yohaku admin-vue3 mx-core; do
     git -C "/Users/innei/git/innei-repo/$repo" worktree remove "/tmp/release-$repo-$NEW_VERSION" --force
     git -C "/Users/innei/git/innei-repo/$repo" branch -D "chore/haklex-$NEW_VERSION"
   done
   ```

2. **npm unpublish (risky — always ask user first):** within 72 h of publish, if no other package has installed it:

   ```bash
   npm unpublish "@haklex/$pkg@$NEW_VERSION"
   ```

   Never unpublish without explicit user confirmation. Once the 72 h window is gone, publish a new patch with the fix instead.

3. **Root-cause triage** — classify:
   - `typecheck` fail → breaking API change not reflected in semver; re-run Phase 2
   - `build` fail → missing export / peer dep / circular workspace edge
   - `e2e` fail → runtime regression; correlate with Phase 2 diff hunks

   Report the offending package, the diff, and the recommended fix.

## Phase 8b — Success: push commit directly to downstream primary branch

Downstream bumps are pure version pins — no code review needed. Push direct, no PR.

In each worktree:

```bash
PRIMARY_BRANCH="${PRIMARY[$repo]}"   # recorded in Phase 6
git add <files from table>
git commit -m "$(cat <<EOF
chore(deps): bump @haklex/* to $NEW_VERSION

Upstream: <git log --oneline $LAST..HEAD from haklex>
$( [[ -n "$LIN_REFS" ]] && printf 'Linear: %s\n' "$LIN_REFS" )
EOF
)"

# Rebase on the latest primary branch in case it moved during the release
git fetch origin "$PRIMARY_BRANCH"
git rebase "origin/$PRIMARY_BRANCH"

# Push the commit to the primary branch
git push origin "HEAD:$PRIMARY_BRANCH"
```

If `git rebase` surfaces conflicts, stop and ask the user. Do not `--skip` or `--abort` silently.

After a successful push, clean up the disposable temp branch:

```bash
git -C "/Users/innei/git/innei-repo/$repo" worktree remove "/tmp/release-$repo-$NEW_VERSION"
git -C "/Users/innei/git/innei-repo/$repo" branch -D "chore/haklex-$NEW_VERSION"
```

**Never** push the `chore/haklex-$NEW_VERSION` branch itself to origin — it exists purely for worktree isolation.

Emit `LIN-\d+` references (parsed from the caller's changeset description) inside the commit body. Do not invent Linear links.

## Phase 9 — Final summary

Print:

| Repo       | Branch    | Commit SHA | Bump | Tests (typecheck / build / e2e) | Linear |
| ---------- | --------- | ---------- | ---- | ------------------------------- | ------ |
| haklex     | main      | …          | …    | —                               | …      |
| Yohaku     | main      | …          | —    | ✅ / ✅ / ✅                    | …      |
| admin-vue3 | <primary> | …          | —    | ✅ / ✅ / ✅                    | …      |
| mx-core    | <primary> | …          | —    | ✅ / ✅ / (skipped)             | …      |

## Quick reference

| Step             | Command                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Last release SHA | `git log --grep='^release: v' -n1 --format=%H`                                                  |
| Changed pkgs     | `git diff --name-only $LAST..HEAD -- 'packages/*/src/**'`                                       |
| Export diff      | `diff <(git show $LAST:…/index.ts \| grep ^export) <(git show HEAD:…/index.ts \| grep ^export)` |
| Peer audit       | `jq '.dependencies, .peerDependencies' packages/<pkg>/package.json`                             |
| Bump             | `pnpm bumpp -r <level> --no-git --no-tag`                                                       |
| Build            | `pnpm run build:packages`                                                                       |
| Publish one      | `pnpm --filter @haklex/<pkg> publish --no-git-checks`                                           |
| Registry poll    | `until npm view @haklex/<pkg>@$V version; do sleep 5; done`                                     |
| Worktree         | `git worktree add /tmp/release-<repo>-$V -b chore/haklex-$V`                                    |
| Primary branch   | `git -C <repo> branch --show-current` (record BEFORE worktree creation)                         |
| Push downstream  | `git push origin HEAD:$PRIMARY_BRANCH` (rebase on `origin/$PRIMARY_BRANCH` first)               |

## Common mistakes

| Mistake                                             | Fix                                                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Trusting caller's "affected packages" list verbatim | Always re-derive from `git diff --name-only … src/**`                                   |
| Publishing before registry poll succeeds            | Downstream `pnpm install` 404s or resolves stale mirror                                 |
| Treating a Context-creating lib as a regular dep    | Promote to peer (reference: commit 88bb7a0 — lucide-react)                              |
| Attempting per-package bumps                        | Not supported — shared version; highest-wins                                            |
| `git add -A` in a dirty downstream worktree         | Stage only the pinned-version files per Repo layout table                               |
| Running `pnpm run release:rich` inside this skill   | That script compresses bump/build/publish into one step; this skill needs them separate |
| `npm unpublish` without user confirmation           | Always ask — unpublish is public, permanent, and time-limited                           |
| Force-pushing reverts without `--force-with-lease`  | Use `--force-with-lease`; ask user before pushing any force                             |
| Guessing lobehub path                               | Ask the user; skip that downstream if not provided                                      |
| Inventing Linear issue IDs                          | Only emit `LIN-\d+` IDs present in the user's changeset description                     |
| Opening a PR for the downstream bump                | Bumps go direct to the primary branch — no PR, no `gh pr create`                        |
| Pushing the `chore/haklex-$V` branch to origin      | That branch is worktree-local; push commits as `HEAD:$PRIMARY_BRANCH` instead           |
| Skipping `git fetch` + rebase before push           | Primary may have advanced during the release; rebase on `origin/$PRIMARY_BRANCH` first  |

## Red flags — STOP and ask

- Changeset description or package list missing
- `git status` dirty in haklex
- A published package still 404s from the registry after 5 minutes of polling
- User asks to skip peer-dep audit ("it worked last time")
- Any `major` classification
- Downstream smoke tests pass but build artefacts differ in size >30% from previous release
- Being asked to `npm unpublish`, force-push, or revert commits already consumed by others
- Downstream repo in detached-HEAD state (can't derive primary branch)
- Rebase against `origin/$PRIMARY_BRANCH` surfaces conflicts (something else landed during the release)
- Primary branch is protected in a way that rejects direct push (fall back to opening a PR, but ask first)

## Real-world anchors

- `88bb7a0` — rich-agent-chat + lucide-react peer dep (the motivating Context-mismatch bug)
- `0.0.106..0.0.108` — pure patch cadence; the first `minor`/`major` under this skill warrants extra caution
- Previous per-repo playbook: `.claude/commands/release.md` (now superseded by this skill)
