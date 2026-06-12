---
name: release-orchestrator
description: Use when releasing @haklex/* packages and propagating to downstream consumers (Yohaku, mx-core/apps/admin, mx-core/apps/core, mx-space). Owns end-to-end orchestration: change detection, per-package semver calc, peer-dep audit to prevent duplicate-instance bugs (e.g. lucide-react React Context mismatch), topologically-ordered publish with npm registry polling, parallel-worktree downstream smoke tests, auto-revert on failure, and direct push to downstream primary branches (no PRs). Fully autonomous — no user confirmation gates. Supersedes the old /release command.
user_invocable: true
---

# Release Orchestrator

Owns the full multi-package release pipeline. Supersedes the old `.claude/commands/release.md`.

## Invocation contract

Do not require caller-supplied release metadata. Infer the release context from repository state:

1. **Changeset summary** — derive from `git log --oneline "$LAST"..HEAD` and `git diff --stat "$LAST"..HEAD`.
2. **Affected packages** — derive mechanically from `git diff --name-only "$LAST"..HEAD`; do not ask the caller for a package list.
3. **Release mode** — see Phase 0.5; defaults to `incremental` (publish the workspace closure of changed packages — Phase 4 expands `CHANGED_PKGS` to `PUBLISH_SET` via forward closure over workspace cross-deps), upgradeable to `full` either by user opt-in keyword or by Phase 2 auto-fallback on a `major` bump.

If no package has publishable `src/**` changes, stop and report that there is no releasable package diff.

## Repo layout

| Concern             | Path / Rule                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| haklex root         | Run the release from the **same worktree** where `git status` is clean. Use `git worktree list` to confirm. Never switch checkouts mid-release.                                                                                                                                                                                                                                                    |
| Published namespace | `@haklex/*`, via `pnpm run publish:packages` (excludes `@haklex/rich-editor-demo`).                                                                                                                                                                                                                                                                                                                |
| CLI package         | `@haklex/rich-litexml-cli` ships the `litexml` binary. It depends on the published **dist assets** of `@haklex/rich-compose` (`dist/style.css`, `dist/litexml-html-preview-client.js`) at runtime via `require.resolve`, so the compose build must succeed before the CLI is published. Also one of the few packages whose installed binary should be sanity-checked post-publish — see Phase 4.5. |
| Version strategy    | **Shared** — every `@haklex/*` lives on the same version (read from `packages/rich-editor/package.json`).                                                                                                                                                                                                                                                                                          |
| Downstream: Yohaku  | `/Users/innei/git/innei-repo/Yohaku/apps/web/package.json` — actual pin set varies; derive via `grep '"@haklex/' apps/web/package.json` at release time                                                                                                                                                                                                                                            |
| Downstream: mx-core | Two manifests in one repo: `/Users/innei/git/innei-repo/mx-core/apps/admin/package.json` (React dashboard — actual pin set varies; derive via `grep '"@haklex/' apps/admin/package.json` at release time) and `/Users/innei/git/innei-repo/mx-core/apps/core/package.json` (`rich-headless` only). admin-vue3 is retired — do not touch it.                                                        |
| mx-space            | Same repo as `mx-core` (mx-core is mx-space/core).                                                                                                                                                                                                                                                                                                                                                 |
| Deleted packages    | `@haklex/rich-static-renderer` was retired. If a downstream's tracked branch still lists it, drop it entirely instead of bumping (re-pinning a deleted package will 404 at install).                                                                                                                                                                                                               |

## Phase 0.5 — Mode detection

Two release modes:

- **incremental** (default) — publish the **workspace closure** of packages whose `src/**` changed since `$LAST`. `CHANGED_PKGS` (from Phase 1) seeds the closure; Phase 4 walks workspace cross-deps + peerDeps until fixed point to produce `PUBLISH_SET`. Required because this repo uses `workspace:*` (pnpm publishes as exact version) — see Phase 2.
- **full** — publish every `@haklex/*` package (excluding `@haklex/rich-editor-demo`), regardless of diff. Matches the legacy "publish everything" behaviour.

Default to `incremental`. Promote to `full` only via one of:

1. **User opt-in keyword** — case-insensitive match for `full`, `全量`, or standalone `all` in the user's invocation text or skill args.
2. **Phase 2 auto-fallback** — any changed package classifies as `major` (see Phase 2 for rationale).

```bash
if grep -iqE '(^|[^a-z])(full|全量|all)([^a-z]|$)' <<< "$INVOCATION_TEXT"; then
  MODE=full
else
  MODE=incremental
fi
echo "Release mode: $MODE"
```

Print the chosen mode as a banner before Phase 1. If Phase 2 later flips the mode, print a second banner explaining the trigger (e.g. `Major bump detected → switching to full`). No interactive prompt — the skill remains autonomous.

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

4. Define `CHANGED_PKGS` as the set of unique package names (e.g. `rich-editor`, `rich-compose`) from step 3 that have `src/**` diffs. Print a one-line tally before Phase 2 so the user can confirm scope:

   ```
   Changed packages: rich-editor, rich-compose, rich-ext-chat (3 of 15)
   ```

   `CHANGED_PKGS` drives both Phase 2 (semver classification) and Phase 4 (publish set when `MODE=incremental`).

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

Because haklex uses a **shared version**, compute `max(bumps)` across all changed packages and apply to all. Print the per-package classification table for visibility, then proceed directly to Phase 3 — do **not** gate on user approval, including for `major` classifications. Run fully autonomously.

**Workspace-pinning reality (`workspace:*` → exact at publish):**

This repo writes every `@haklex/*` cross-dep as `workspace:*`. pnpm replaces `workspace:*` with the **exact** current workspace version at publish time — so `@haklex/rich-ext-ai-agent@0.21.0`'s tarball declares `"@haklex/rich-litexml": "0.21.0"`, not `^0.21.0`. The consequence is structural: every shared-version bump (patch / minor / major alike) requires the workspace closure of each changed package to be published in lockstep. If `rich-ext-ai-agent@0.21.0` is published but `rich-litexml@0.21.0` is not, downstream `pnpm install` fails with `ERR_PNPM_NO_MATCHING_VERSION`.

The old `^old.x.y` minor/patch reasoning is **wrong for this repo**. It would only be safe under `workspace:^` (publishes as `^0.21.0`) — which we don't use. Real-world failure: the v0.21.0 cycle initially published only `rich-agent-core` + `rich-ext-ai-agent`; downstream installs broke until `rich-litexml@0.21.0` + `rich-diff-core@0.21.0` were also published. See Real-world anchors.

`MODE=incremental` therefore always means **closure-expanded** incremental — `PUBLISH_SET` is computed by walking workspace cross-deps + peerDeps forward from `CHANGED_PKGS` until fixed point (algorithm in Phase 4). For a leaf package (e.g. a renderer that no other package imports as workspace dep), the closure equals `CHANGED_PKGS` and the savings vs `full` are real. For a deep dep (e.g. `rich-editor`), the closure can approach the full set — but `full` is still distinct: it includes packages whose closure wouldn't have reached them (e.g. the CLI), which is the right behaviour for `major` and for explicit user opt-in.

**Major-bump auto-fallback to full mode:**

If `max(bumps) == major` and `MODE == incremental`, flip `MODE=full` here and print:

```
Major bump detected → switching to full release mode.
Reason: every package's exact-pinned workspace cross-deps point at the new major.
Republishing the closure would still work, but full mode is safer at the major
boundary — it also catches packages whose closure happens not to reach them
(e.g. the CLI) but which downstream consumers still install at the new version.
```

`minor`/`patch` stay in closure-expanded `incremental` (see Phase 4) unless the user opts into `full`.

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

Bump and build always run **full** — shared version means every `package.json` must advance in lockstep, and the workspace dep graph requires every package's dist to be fresh in case it is consumed transitively at runtime:

```bash
pnpm bumpp -r < patch | minor | major > --no-git --no-tag
pnpm run build:packages
```

Do **not** use `pnpm run release:rich` here — that path runs bumpp + build + publish in one step and bypasses the ordered/polled publish this skill needs. Replace it with explicit phases.

**Publish set is mode-dependent. In `incremental` mode it is computed as the workspace-closure of `CHANGED_PKGS`, not `CHANGED_PKGS` itself** (see Phase 2 — workspace-pinning reality):

```bash
case "$MODE" in
  full)
    # Every @haklex/* except the demo
    PUBLISH_SET=$(pnpm -r ls --depth -1 --json \
      | jq -r '.[].name' | grep '^@haklex/' | grep -v '@haklex/rich-editor-demo')
    ;;
  incremental)
    # Forward closure: start with CHANGED_PKGS, then absorb every @haklex/*
    # that appears in any included package's dependencies / peerDependencies /
    # optionalDependencies under a "workspace:" specifier. Iterate to fixed point.
    declare -A IN_SET
    for p in $CHANGED_PKGS; do IN_SET["@haklex/$p"]=1; done
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
    done
    PUBLISH_SET=$(printf '%s\n' "${!IN_SET[@]}" | sort)
    ;;
esac
echo "Publish set ($MODE): $(wc -l <<< "$PUBLISH_SET") packages"
```

The closure walks **forward** (what a published package's tarball references), not backward (who imports it). It includes `dependencies` (mandatory for install graph) and `peerDependencies` (otherwise pnpm's `auto-install-peers` 404s on the new exact peer pin). `optionalDependencies` are included too — if a manifest declares one and we publish without it, the optional resolution still hits the registry. Devdeps are excluded (consumers never see them).

Print which packages were absorbed by closure expansion so the user can see why `PUBLISH_SET` is larger than `CHANGED_PKGS`:

```
Closure expansion: rich-agent-core, rich-ext-ai-agent (changed)
                 + rich-litexml, rich-diff-core (workspace deps of changed packages)
                 + rich-compose, rich-editor-ui, rich-editor, rich-style-token (peerDeps of rich-ext-ai-agent)
                 = 8 packages
```

Compute topological order from the workspace graph and **intersect** with `PUBLISH_SET`:

```bash
pnpm -r ls --depth -1 --json
```

Typical leaf-first order (full set): `rich-style-token` → `rich-headless` → `rich-litexml` → `rich-editor-ui` → `rich-editor` → renderer packages → plugin packages → extension packages → `rich-compose` (composition + SSR top of tree) → `rich-litexml-cli` (`litexml` binary; depends on the freshly built `rich-compose`/`rich-headless`/`rich-litexml` dists).

In incremental mode, walk the same topological order but skip any package not in `PUBLISH_SET`. Keep the leaf-first ordering — even when only a subset is published, leaves must land first so a downstream consumer never sees a publish that resolves against an unpublished dep.

Publish one at a time, polling the registry after each (npm CDN propagation typically lags 30–120 s):

```bash
for pkg in $PUBLISH_SET_TOPO; do
  pnpm --filter "$pkg" publish --no-git-checks
  until npm view "$pkg@$NEW_VERSION" version > /dev/null 2>&1; do sleep 5; done
done
```

Do **not** proceed to downstream updates until every published package is resolvable from the registry. Packages **not** in `PUBLISH_SET` remain on their previously published version on the registry — that is the desired behaviour in incremental mode and the reason downstream pin rewriting in Phase 6 is also scoped to `PUBLISH_SET`.

## Phase 4.5 — CLI binary smoke (`@haklex/rich-litexml-cli`)

**Run only if `@haklex/rich-litexml-cli` ∈ `PUBLISH_SET` OR `@haklex/rich-compose` ∈ `PUBLISH_SET`.** Otherwise the CLI binary in the wild is unchanged and resolves against an already-validated `rich-compose` tarball — print `CLI smoke skipped (neither rich-litexml-cli nor rich-compose in PUBLISH_SET)` and continue to Phase 5.

The CLI is the only published package that runs end-user code through a `bin` field, and it loads `@haklex/rich-compose` dist assets at runtime via `require.resolve`. A successful `pnpm publish` only proves the tarball uploaded — it does not prove the binary can boot. Run a one-shot smoke against the freshly published tarball:

Pin the CLI version under test to whichever copy actually exists on the registry: if the CLI was republished this cycle, that's `$NEW_VERSION`; otherwise it's the prior published version (read straight from the registry — the local `package.json` may have advanced under bumpp without a publish):

```bash
if grep -qxF '@haklex/rich-litexml-cli' <<< "$PUBLISH_SET"; then
  CLI_VER="$NEW_VERSION"
else
  CLI_VER=$(npm view @haklex/rich-litexml-cli version)
fi
npx --yes -p "@haklex/rich-litexml-cli@$CLI_VER" \
  litexml '<p>release smoke</p>' --format json --compact \
  | jq -e '.root.children[0].type == "paragraph"' > /dev/null
```

The smoke is still meaningful when only `rich-compose` was republished: the existing CLI tarball's `^x.y.z` range now resolves to the new compose, so we are validating exactly the install graph downstream users will see.

If the smoke fails, do **not** proceed to Phase 5 — fall back to Phase 8a. Typical causes:

- Missing `dist/style.css` or `dist/litexml-html-preview-client.js` in the published `@haklex/rich-compose` tarball → `pnpm run build:packages` did not run cleanly; republish `rich-compose` first.
- `dependencies.@haklex/rich-compose` pinned to a stale version (CLI republished but its manifest's compose pin didn't advance) → `pnpm bumpp -r` did not update workspace cross-deps; verify the CLI's `package.json` resolves to a range that satisfies the freshly published `rich-compose`. Only applies when CLI is in `PUBLISH_SET`.
- Bin missing the `#!/usr/bin/env node` shebang → vite config regression in `packages/rich-litexml-cli/vite.config.ts`.
- (Incremental, compose-only republish) The currently-published CLI's `^x.y.z` range doesn't cover the new `rich-compose` minor/major — should be impossible inside `incremental` (Phase 2 auto-fallback catches majors), but log it and fall through to `full` if it ever fires.

## Phase 5 — Commit, tag, push haklex

```bash
git add packages/*/package.json pnpm-lock.yaml
git commit -m "release: v$NEW_VERSION"
git tag "v$NEW_VERSION"
git push
git push origin "v$NEW_VERSION"
```

Only stage the bumped manifests and lockfile. If the worktree has unrelated edits, stop and ask the user.

Phase 4 invoked `bumpp -r --no-tag` to defer tagging until after manifests land on `main` — keep that flag so a single annotated tag points at the release commit, not at the pre-publish state.

## Phase 5.5 — Draft GitHub release (note authored by user)

Release notes (incl. breaking changes, new features, migration steps) live on GitHub Releases. The skill drafts the note from the changeset and creates a **draft** release — the user reviews and publishes from the GitHub UI.

1. Build the draft note from `git log` and Phase 2's classification. Group commits by type, surface breaking changes first:

   ```bash
   COMMITS=$(git log --pretty=format:'- %s (%h)' "$LAST"..HEAD)
   # Bucket lines by leading conventional-commit type:
   #   feat!: / fix!: / BREAKING CHANGE in body → ## Breaking Changes
   #   feat:                                    → ## Features
   #   fix:                                     → ## Bug Fixes
   #   refactor: / perf: / docs: / chore:       → ## Other
   ```

   Header the note with the Phase 2 bump classification table so reviewers see _why_ the level was chosen.

2. Write the draft to a temp file (`mktemp`) so the user can edit before publishing:

   ```bash
   NOTE=$(mktemp)
   cat > "$NOTE" << 'EOF'
   ## Summary
   <one-paragraph synthesis of the changeset — written by the orchestrator>
   
   ## Breaking Changes
   <bullets — explicit migration steps per item, or "None">
   
   ## Features
   <bullets>
   
   ## Bug Fixes
   <bullets>
   
   ## Bump rationale
   <Phase 2 table>
   EOF
   ```

3. Create the release as a **draft** bound to the pushed tag:

   ```bash
   gh release create "v$NEW_VERSION" \
     --title "v$NEW_VERSION" \
     --notes-file "$NOTE" \
     --draft \
     --verify-tag
   ```

   `--draft` means the release is invisible to the public until the user publishes it. `--verify-tag` fails fast if Phase 5's `git push origin "v$NEW_VERSION"` didn't land — do not silently fall back to `--target HEAD`.

4. Print the **edit** URL so the user lands directly in the editor with the "Publish release" button. `gh release view ... --json url` returns the `/releases/tag/<slug>` URL, which for an unpublished draft uses an `untagged-<hex>` slug and renders the read-only view page (no edit affordance). Swap `/tag/` → `/edit/` to surface the editor:

   ```bash
   EDIT_URL=$(gh release view "v$NEW_VERSION" --json url -q .url | sed 's#/releases/tag/#/releases/edit/#')
   echo "$EDIT_URL"
   ```

   Do **not** wait for publication — downstream propagation proceeds in parallel.

If `gh` is missing or unauthenticated (`gh auth status` fails), stop and ask the user — do not skip the release step and push downstream anyway. The release is a required artefact, not an optional convenience.

## Phase 6 — Downstream update in parallel worktrees

**Target branch is always the downstream's default branch** (`origin/HEAD` — typically `main` or `master`), regardless of what branch the local checkout is currently on. The bump lands there so all feature branches can rebase/merge it in. Never target a feature branch — that strands the bump in a silo.

Derive the default branch per repo — do not guess:

```bash
declare -A DEFAULT
for repo in Yohaku mx-core; do
  git -C "/Users/innei/git/innei-repo/$repo" remote set-head origin --auto > /dev/null 2>&1
  DEFAULT[$repo]=$(git -C "/Users/innei/git/innei-repo/$repo" symbolic-ref refs/remotes/origin/HEAD --short | sed 's#^origin/##')
done
```

If `symbolic-ref` fails (no `origin/HEAD`), stop and ask the user which branch is canonical.

Create a disposable worktree per downstream, branched off `origin/${DEFAULT[$repo]}`:

```bash
for repo in Yohaku mx-core; do
  D="${DEFAULT[$repo]}"
  git -C "/Users/innei/git/innei-repo/$repo" fetch origin "$D"
  git -C "/Users/innei/git/innei-repo/$repo" worktree add \
    "/tmp/release-$repo-$NEW_VERSION" -b "chore/haklex-$NEW_VERSION" "origin/$D"
done
```

The `chore/haklex-$NEW_VERSION` branch is temp — it exists only for worktree isolation and is never pushed to origin.

In each worktree, **only rewrite pins for packages in `PUBLISH_SET`.** Packages that were not republished kept their old version on the registry — re-pinning them to `$NEW_VERSION` would 404. For each downstream file from the Repo layout table:

```bash
# Pseudo: walk every "@haklex/<pkg>": "<old>" line in the manifest, only
# rewrite when "@haklex/<pkg>" is in $PUBLISH_SET.
for pkg in $(jq -r '.dependencies | keys[] | select(startswith("@haklex/"))' "$MANIFEST"); do
  if grep -qxF "$pkg" <<< "$PUBLISH_SET"; then
    # Edit pkg pin → $NEW_VERSION
  fi
done
```

Use `Edit` (not `sed -i`) so the diff is reviewable. Then `pnpm install`. In incremental mode some downstream `@haklex/*` pins will remain at their prior version — that is correct.

Commit-ready files per repo:

| Repo    | Stage these                                                                |
| ------- | -------------------------------------------------------------------------- |
| Yohaku  | `apps/web/package.json`, root `pnpm-lock.yaml`                             |
| mx-core | `apps/admin/package.json`, `apps/core/package.json`, root `pnpm-lock.yaml` |

If the worktree is dirty beyond those files, stop and ask the user — do NOT `git add -A`.

## Phase 7 — Smoke tests (parallel)

In each downstream worktree, dispatch an independent subagent to run:

1. `pnpm typecheck` (or `pnpm -r exec tsc --noEmit` if no script)
2. `pnpm build`
3. One E2E — use the repo's existing smoke journey. If none exists, skip with a warning; do not invent one.

Run the repos in parallel (one subagent per worktree). Collect pass/fail per repo. Proceed only when all green.

## Phase 8a — Failure recovery (on smoke or publish failure)

1. **Local revert (safe, automatic):**

   ```bash
   # Delete draft release first (safe — never published, never indexed)
   gh release delete "v$NEW_VERSION" --yes 2> /dev/null || true
   # Delete the tag locally and on the remote
   git -C haklex tag -d "v$NEW_VERSION" 2> /dev/null || true
   git -C haklex push origin ":refs/tags/v$NEW_VERSION" 2> /dev/null || true
   
   git -C haklex reset --hard HEAD~1     # undo "release: v$NEW_VERSION"
   git -C haklex push --force-with-lease # ONLY if already pushed — ASK user first
   for repo in Yohaku mx-core; do
     git -C "/Users/innei/git/innei-repo/$repo" worktree remove "/tmp/release-$repo-$NEW_VERSION" --force
     git -C "/Users/innei/git/innei-repo/$repo" branch -D "chore/haklex-$NEW_VERSION"
   done
   ```

   If the user has **already published** the draft release on GitHub, treat the version as in-the-wild — fall through to step 2 (publish a fix as a new patch) instead of deleting the release.

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

| Repo    | Branch | Commit SHA | Bump | Published (n / total)                             | Tests (typecheck / build / e2e) |
| ------- | ------ | ---------- | ---- | ------------------------------------------------- | ------------------------------- |
| haklex  | main   | …          | …    | 3 / 15 (rich-editor, rich-compose, rich-ext-chat) | —                               |
| Yohaku  | main   | …          | —    | 3 pins bumped                                     | ✅ / ✅ / ✅                    |
| mx-core | master | …          | —    | admin: 3 pins, core: 1 pin (rich-headless)        | ✅ / ✅ / (skipped)             |

For `MODE=full`, the haklex row reads `15 / 15 (full)` and each downstream row reads `N pins bumped (full)`. For `MODE=incremental`, list the actually-published package names inline so the user can verify the scope matched intent.

Then surface the **draft GitHub release URL** as a separate, prominent line — this is the user's next action:

```
👉 Draft release pending review: <EDIT_URL from Phase 5.5 step 4>
   Edit the auto-drafted notes (breaking changes, features, migration steps) and click "Publish release".
```

The URL must point at `/releases/edit/<slug>`, not `/releases/tag/<slug>`. The latter is the read-only view page; for an unpublished draft it has no edit affordance and the user has to manually click into the editor. Always surface the edit form so the next click is "Publish release".

Do not mark the release as "complete" in the summary until the user publishes it.

## Quick reference

| Step             | Command                                                                                                                                                                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last release SHA | `git log --grep='^release: v' -n1 --format=%H`                                                                                                                                                                                                |
| Mode detect      | `grep -iqE '(^\|[^a-z])(full\|全量\|all)([^a-z]\|$)' <<<"$INVOCATION_TEXT" && echo full \|\| echo incremental`                                                                                                                                |
| Changed pkgs     | `git diff --name-only $LAST..HEAD -- 'packages/*/src/**'`                                                                                                                                                                                     |
| Publish set      | `full` → all `@haklex/*` sans demo. `incremental` → forward closure of `CHANGED_PKGS` over `dependencies + peerDependencies + optionalDependencies` whose value starts with `workspace:`; iterate to fixed point. See Phase 4 for the script. |
| Export diff      | `diff <(git show $LAST:…/index.ts \| grep ^export) <(git show HEAD:…/index.ts \| grep ^export)`                                                                                                                                               |
| Peer audit       | `jq '.dependencies, .peerDependencies' packages/<pkg>/package.json`                                                                                                                                                                           |
| Bump             | `pnpm bumpp -r <level> --no-git --no-tag`                                                                                                                                                                                                     |
| Build            | `pnpm run build:packages`                                                                                                                                                                                                                     |
| Publish one      | `pnpm --filter @haklex/<pkg> publish --no-git-checks`                                                                                                                                                                                         |
| Registry poll    | `until npm view @haklex/<pkg>@$V version; do sleep 5; done`                                                                                                                                                                                   |
| CLI smoke        | `npx --yes -p @haklex/rich-litexml-cli@$CLI_VER litexml '<p>x</p>' --format json --compact` (`$CLI_VER` = `$V` if in PUBLISH_SET, else `npm view @haklex/rich-litexml-cli version`)                                                           |
| Default branch   | `git -C <repo> symbolic-ref refs/remotes/origin/HEAD --short \| sed 's#^origin/##'` (main/master)                                                                                                                                             |
| Worktree         | `git worktree add /tmp/release-<repo>-$V -b chore/haklex-$V origin/$D`                                                                                                                                                                        |
| Push downstream  | `git push origin HEAD:$D` (after `git fetch origin $D && git rebase origin/$D`)                                                                                                                                                               |
| Tag haklex       | `git tag v$V && git push origin v$V` (after commit, before downstream)                                                                                                                                                                        |
| Draft release    | `gh release create v$V --title v$V --notes-file $NOTE --draft --verify-tag`                                                                                                                                                                   |
| Draft edit URL   | `gh release view v$V --json url -q .url \| sed 's#/releases/tag/#/releases/edit/#'`                                                                                                                                                           |
| Delete draft     | `gh release delete v$V --yes && git push origin :refs/tags/v$V` (rollback only)                                                                                                                                                               |

## Common mistakes

| Mistake                                                                    | Fix                                                                                                                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Asking the caller for release metadata                                     | Infer the changeset summary and affected packages from `git log` and `git diff`                                                                                                                                                                                                                                                                                    |
| Defaulting to full release every cycle                                     | Default is `incremental`. Only enter `full` via user keyword (`full`/`全量`/`all`) or Phase 2 major auto-fallback                                                                                                                                                                                                                                                  |
| Treating a `major` bump as safely incremental                              | A major breaks every cross-dep pin in unpublished packages. Phase 2 must flip `MODE=full` and republish everything                                                                                                                                                                                                                                                 |
| Equating `PUBLISH_SET` with `CHANGED_PKGS` in `incremental` mode           | This repo uses `workspace:*` — pnpm publishes those as exact versions. `PUBLISH_SET` must be the forward closure of `CHANGED_PKGS` over `dependencies + peerDependencies + optionalDependencies` (Phase 4). Publishing only `CHANGED_PKGS` leaves transitive workspace deps unpublished → downstream `ERR_PNPM_NO_MATCHING_VERSION`. Real-world hit: v0.21.0 cycle |
| Re-pinning a downstream `@haklex/*` not in `PUBLISH_SET` to `$NEW_VERSION` | That version was never published for unchanged packages — `pnpm install` 404s. Only rewrite pins for packages in `PUBLISH_SET`                                                                                                                                                                                                                                     |
| Running the CLI smoke against `$NEW_VERSION` when CLI wasn't republished   | The version doesn't exist on the registry. Read the prior version via `npm view @haklex/rich-litexml-cli version` and smoke against that with the new `rich-compose` resolved at install                                                                                                                                                                           |
| Bumping `package.json` but skipping publish in `full` mode                 | `full` means publish every `@haklex/*` (sans demo). Don't conflate "didn't change" with "don't publish" when `MODE=full`                                                                                                                                                                                                                                           |
| Publishing before registry poll succeeds                                   | Downstream `pnpm install` 404s or resolves stale mirror                                                                                                                                                                                                                                                                                                            |
| Treating a Context-creating lib as a regular dep                           | Promote to peer (reference: commit 88bb7a0 — lucide-react)                                                                                                                                                                                                                                                                                                         |
| Attempting per-package **bumps**                                           | Not supported — shared version; highest-wins. (Per-package **publish** in incremental mode is fine; it's the version field that stays shared)                                                                                                                                                                                                                      |
| `git add -A` in a dirty downstream worktree                                | Stage only the pinned-version files per Repo layout table                                                                                                                                                                                                                                                                                                          |
| Running `pnpm run release:rich` inside this skill                          | That script compresses bump/build/publish into one step; this skill needs them separate                                                                                                                                                                                                                                                                            |
| `npm unpublish` without user confirmation                                  | Always ask — unpublish is public, permanent, and time-limited                                                                                                                                                                                                                                                                                                      |
| Force-pushing reverts without `--force-with-lease`                         | Use `--force-with-lease`; ask user before pushing any force                                                                                                                                                                                                                                                                                                        |
| Opening a PR for the downstream bump                                       | Bumps go direct to the default branch — no PR, no `gh pr create`                                                                                                                                                                                                                                                                                                   |
| Pushing the `chore/haklex-$V` branch to origin                             | That branch is worktree-local; push commits as `HEAD:$D` where $D is the default branch                                                                                                                                                                                                                                                                            |
| Skipping `git fetch` + rebase before push                                  | Default branch may have advanced during the release; rebase on `origin/$D` first                                                                                                                                                                                                                                                                                   |
| Targeting a feature branch or guessing `main`                              | Always derive `$D` from `origin/HEAD`; some repos use `master`, not `main`                                                                                                                                                                                                                                                                                         |
| Writing release notes into README                                          | Notes live on GitHub Releases — README only links there; never paste a "What's new" block back into any in-repo doc                                                                                                                                                                                                                                                |
| Publishing the GitHub release as non-draft                                 | Always `--draft` from the skill; the user reviews and publishes from the GitHub UI                                                                                                                                                                                                                                                                                 |
| Skipping the `rich-litexml-cli` binary smoke                               | Bin packages can publish "successfully" yet fail to boot — always run Phase 4.5                                                                                                                                                                                                                                                                                    |
| Skipping `--verify-tag` on `gh release create`                             | Without it, gh silently creates a tag at HEAD, decoupling the release from the bump commit                                                                                                                                                                                                                                                                         |
| Forgetting to delete the draft on rollback                                 | A lingering draft + tag confuses the next release attempt — always clean up in Phase 8a                                                                                                                                                                                                                                                                            |
| Surfacing the `/releases/tag/` URL for a draft                             | That's the read-only view page; for unpublished drafts it has no "Publish release" button. Swap to `/releases/edit/` so the user lands in the editor with the publish action one click away                                                                                                                                                                        |

## Red flags — STOP and ask

- No publishable package diff under `packages/*/src/**` (regardless of mode — same rule as before; in `full` mode this means there is genuinely nothing to release)
- `MODE=incremental` but `CHANGED_PKGS` is empty — there is nothing to publish; do not silently fall back to `full`
- `git status` dirty in haklex
- A published package still 404s from the registry after 5 minutes of polling
- User asks to skip peer-dep audit ("it worked last time")
- Downstream smoke tests pass but build artefacts differ in size >30% from previous release
- Being asked to `npm unpublish`, force-push, or revert commits already consumed by others
- Downstream repo has no `main` branch (ask the user which branch is canonical; never guess)
- Rebase against `origin/main` surfaces conflicts (something else landed during the release)
- `main` is protected in a way that rejects direct push (fall back to opening a PR, but ask first)
- `gh auth status` fails or `gh` is not installed — release artefact is required, do not skip
- A draft release for `v$NEW_VERSION` already exists (stale from a previous failed attempt) — delete it before re-creating, or the user will edit the wrong one

## Real-world anchors

- `88bb7a0` — rich-agent-chat + lucide-react peer dep (the motivating Context-mismatch bug)
- `0.0.106..0.0.108` — pure patch cadence; the first `minor`/`major` under this skill warrants extra caution
- `v0.21.0` — incremental closure bug. Initial run published only `CHANGED_PKGS = {rich-agent-core, rich-ext-ai-agent}`. Downstreams hit `ERR_PNPM_NO_MATCHING_VERSION: No matching version found for @haklex/rich-diff-core@0.21.0` because `workspace:*` had published as exact `0.21.0` but the dep wasn't republished. Recovered by publishing `rich-litexml@0.21.0` + `rich-diff-core@0.21.0` after the fact. Motivated the Phase 4 closure-expansion algorithm.
- Previous per-repo playbook: `.claude/commands/release.md` (now superseded by this skill)
