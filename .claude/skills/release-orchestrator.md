---
name: release-orchestrator
description: Use when releasing @haklex/* packages and propagating to downstream consumers (Yohaku, admin-vue3, mx-core, mx-space). Owns end-to-end orchestration: change detection, per-package semver calc, peer-dep audit to prevent duplicate-instance bugs (e.g. lucide-react React Context mismatch), topologically-ordered publish with npm registry polling, parallel-worktree downstream smoke tests, auto-revert on failure, and direct push to downstream primary branches (no PRs). Supersedes the old /release command.
user_invocable: true
---

# Release Orchestrator

Owns the full multi-package release pipeline. Supersedes the old `.claude/commands/release.md`.

## Invocation contract

Do not require caller-supplied release metadata. Infer the release context from repository state:

1. **Changeset summary** — derive from `git log --oneline "$LAST"..HEAD` and `git diff --stat "$LAST"..HEAD`.
2. **Affected packages** — derive mechanically from `git diff --name-only "$LAST"..HEAD`; do not ask the caller for a package list.

If no package has publishable `src/**` changes, stop and report that there is no releasable package diff.

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

3. Derive affected packages from the actual diff:

   ```bash
   git diff --name-only "$LAST"..HEAD -- 'packages/*/src/**' 'packages/*/package.json'
   ```

   A package is **changed** only if `src/**` has diffs. `package.json`-only or lockfile-only changes do **not** trigger a publish on their own. Use the full diff and commit log to infer a terse changeset summary for downstream commit messages and final reporting.

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

**Target branch is always the downstream's default branch** (`origin/HEAD` — typically `main` or `master`), regardless of what branch the local checkout is currently on. The bump lands there so all feature branches can rebase/merge it in. Never target a feature branch — that strands the bump in a silo.

Derive the default branch per repo — do not guess:

```bash
declare -A DEFAULT
for repo in Yohaku admin-vue3 mx-core; do
  git -C "/Users/innei/git/innei-repo/$repo" remote set-head origin --auto > /dev/null 2>&1
  DEFAULT[$repo]=$(git -C "/Users/innei/git/innei-repo/$repo" symbolic-ref refs/remotes/origin/HEAD --short | sed 's#^origin/##')
done
```

If `symbolic-ref` fails (no `origin/HEAD`), stop and ask the user which branch is canonical.

Create a disposable worktree per downstream, branched off `origin/${DEFAULT[$repo]}`:

```bash
for repo in Yohaku admin-vue3 mx-core; do
  D="${DEFAULT[$repo]}"
  git -C "/Users/innei/git/innei-repo/$repo" fetch origin "$D"
  git -C "/Users/innei/git/innei-repo/$repo" worktree add \
    "/tmp/release-$repo-$NEW_VERSION" -b "chore/haklex-$NEW_VERSION" "origin/$D"
done
```

The `chore/haklex-$NEW_VERSION` branch is temp — it exists only for worktree isolation and is never pushed to origin.

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

## Phase 8b — Success: push commit directly to downstream default branch

Downstream bumps are pure version pins — no code review needed. Push direct, no PR. Never target a feature branch.

In each worktree (branched off `origin/${DEFAULT[$repo]}` in Phase 6):

```bash
D="${DEFAULT[$repo]}"   # e.g. main or master
git add <files from table>
git commit -m "$(cat <<EOF
chore(deps): bump @haklex/* to $NEW_VERSION

Upstream: <git log --oneline $LAST..HEAD from haklex>
EOF
)"

# Refresh in case the default branch advanced during the release window
git fetch origin "$D"
git rebase "origin/$D"

# Push the commit straight to the default branch
git push origin "HEAD:$D"
```

If `git rebase` surfaces conflicts, stop and ask the user. Do not `--skip` or `--abort` silently.

After a successful push, clean up the disposable temp branch:

```bash
git -C "/Users/innei/git/innei-repo/$repo" worktree remove "/tmp/release-$repo-$NEW_VERSION"
git -C "/Users/innei/git/innei-repo/$repo" branch -D "chore/haklex-$NEW_VERSION"
```

**Never** push the `chore/haklex-$NEW_VERSION` branch itself to origin — it exists purely for worktree isolation.

## Phase 9 — Final summary

Print:

| Repo       | Branch | Commit SHA | Bump | Tests (typecheck / build / e2e) |
| ---------- | ------ | ---------- | ---- | ------------------------------- |
| haklex     | main   | …          | …    | —                               |
| Yohaku     | main   | …          | —    | ✅ / ✅ / ✅                    |
| admin-vue3 | main   | …          | —    | ✅ / ✅ / ✅                    |
| mx-core    | main   | …          | —    | ✅ / ✅ / (skipped)             |

## Quick reference

| Step             | Command                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| Last release SHA | `git log --grep='^release: v' -n1 --format=%H`                                                    |
| Changed pkgs     | `git diff --name-only $LAST..HEAD -- 'packages/*/src/**'`                                         |
| Export diff      | `diff <(git show $LAST:…/index.ts \| grep ^export) <(git show HEAD:…/index.ts \| grep ^export)`   |
| Peer audit       | `jq '.dependencies, .peerDependencies' packages/<pkg>/package.json`                               |
| Bump             | `pnpm bumpp -r <level> --no-git --no-tag`                                                         |
| Build            | `pnpm run build:packages`                                                                         |
| Publish one      | `pnpm --filter @haklex/<pkg> publish --no-git-checks`                                             |
| Registry poll    | `until npm view @haklex/<pkg>@$V version; do sleep 5; done`                                       |
| Default branch   | `git -C <repo> symbolic-ref refs/remotes/origin/HEAD --short \| sed 's#^origin/##'` (main/master) |
| Worktree         | `git worktree add /tmp/release-<repo>-$V -b chore/haklex-$V origin/$D`                            |
| Push downstream  | `git push origin HEAD:$D` (after `git fetch origin $D && git rebase origin/$D`)                   |

## Common mistakes

| Mistake                                            | Fix                                                                                     |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Asking the caller for release metadata             | Infer the changeset summary and affected packages from `git log` and `git diff`         |
| Publishing before registry poll succeeds           | Downstream `pnpm install` 404s or resolves stale mirror                                 |
| Treating a Context-creating lib as a regular dep   | Promote to peer (reference: commit 88bb7a0 — lucide-react)                              |
| Attempting per-package bumps                       | Not supported — shared version; highest-wins                                            |
| `git add -A` in a dirty downstream worktree        | Stage only the pinned-version files per Repo layout table                               |
| Running `pnpm run release:rich` inside this skill  | That script compresses bump/build/publish into one step; this skill needs them separate |
| `npm unpublish` without user confirmation          | Always ask — unpublish is public, permanent, and time-limited                           |
| Force-pushing reverts without `--force-with-lease` | Use `--force-with-lease`; ask user before pushing any force                             |
| Guessing lobehub path                              | Ask the user; skip that downstream if not provided                                      |
| Opening a PR for the downstream bump               | Bumps go direct to the default branch — no PR, no `gh pr create`                        |
| Pushing the `chore/haklex-$V` branch to origin     | That branch is worktree-local; push commits as `HEAD:$D` where $D is the default branch |
| Skipping `git fetch` + rebase before push          | Default branch may have advanced during the release; rebase on `origin/$D` first        |
| Targeting a feature branch or guessing `main`      | Always derive `$D` from `origin/HEAD`; some repos use `master`, not `main`              |

## Red flags — STOP and ask

- No publishable package diff under `packages/*/src/**`
- `git status` dirty in haklex
- A published package still 404s from the registry after 5 minutes of polling
- User asks to skip peer-dep audit ("it worked last time")
- Any `major` classification
- Downstream smoke tests pass but build artefacts differ in size >30% from previous release
- Being asked to `npm unpublish`, force-push, or revert commits already consumed by others
- Downstream repo has no `main` branch (ask the user which branch is canonical; never guess)
- Rebase against `origin/main` surfaces conflicts (something else landed during the release)
- `main` is protected in a way that rejects direct push (fall back to opening a PR, but ask first)

## Real-world anchors

- `88bb7a0` — rich-agent-chat + lucide-react peer dep (the motivating Context-mismatch bug)
- `0.0.106..0.0.108` — pure patch cadence; the first `minor`/`major` under this skill warrants extra caution
- Previous per-repo playbook: `.claude/commands/release.md` (now superseded by this skill)
