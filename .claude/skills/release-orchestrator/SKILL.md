---
name: release-orchestrator
description: Use when releasing @haklex/* packages and propagating to downstream consumers (Yohaku, mx-core/apps/admin, mx-core/apps/core, mx-space). Owns end-to-end orchestration: change detection, per-package semver calc, peer-dep audit (cross-package consistency for shared third-party peers like lexical, plus the always-peer Context-creating list) to prevent duplicate-instance bugs, tri-directional publish-set closure (forward workspace deps, backward exact-pin siblings, third-party peer-floor drift carriers), topologically-ordered publish with npm registry polling, downstream third-party pin reconciliation, parallel-worktree smoke tests with a duplicate-runtime invariant assertion, auto-revert on failure, and direct push to downstream primary branches (no PRs). Fully autonomous — no user confirmation gates. Supersedes the old /release command.
user_invocable: true
---

# Release Orchestrator

Owns the full multi-package release pipeline. Supersedes the old `.claude/commands/release.md`.

## Invocation contract

Do not require caller-supplied release metadata. Infer the release context from repository state:

1. **Changeset summary** — derive from `git log --oneline "$LAST"..HEAD` and `git diff --stat "$LAST"..HEAD`.
2. **Affected packages** — derive mechanically from `git diff --name-only "$LAST"..HEAD`; do not ask the caller for a package list.
3. **Release mode** — see Phase 0.5; defaults to `incremental` (publish the workspace closure of changed packages — Phase 4 expands `CHANGED_PKGS` to `PUBLISH_SET` via forward closure over workspace cross-deps), upgradeable to `full` either by user opt-in keyword or by Phase 2 auto-fallback on a `major` bump.

If no package has publishable `src/**` changes, no non-`@haklex/*` `peerDependencies` range advanced since `$LAST`, AND no `@haklex/*` package is behind its shared source version on the registry, stop and report that there is no releasable package diff. Any one of the three Phase 1 triggers — src diff, peer-range advance, or registry-version catch-up — is enough to require a release.

## Repo layout

| Concern             | Path / Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| haklex root         | Run the release from the **same worktree** where `git status` is clean. Use `git worktree list` to confirm. Never switch checkouts mid-release.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Published namespace | `@haklex/*`, via `pnpm run publish:packages` (excludes `@haklex/rich-editor-demo`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| CLI package         | `@haklex/rich-litexml-cli` ships the `litexml` binary. It depends on the published **dist assets** of `@haklex/rich-compose` (`dist/style.css`, `dist/litexml-html-preview-client.js`) at runtime via `require.resolve`, so the compose build must succeed before the CLI is published. Also one of the few packages whose installed binary should be sanity-checked post-publish — see Phase 4.5.                                                                                                                                                                                                                                                                                                    |
| Version strategy    | **Shared** — every `@haklex/*` lives on the same version (read from `packages/rich-editor/package.json`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Downstream: Yohaku  | `/Users/innei/git/innei-repo/Yohaku/apps/web/package.json` — actual pin set varies; derive via `grep -lrn '"@haklex/' --include=package.json` at release time. **Worktree quirk**: `Yohaku/packages/design-system` is a symlink to the sibling directory `../design-oss/design-system`. `git worktree add` does not materialize sibling-directory targets — `pnpm install` will fail with `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` for `@yohaku/design-system`. Workaround: `cp -R /Users/innei/git/innei-repo/Yohaku/design-oss/ /tmp/release-Yohaku-$V/design-oss/` after `worktree add` and before `pnpm install`, then `rm -rf /tmp/release-Yohaku-$V/design-oss/.git` so the symlink resolves locally. |
| Downstream: mx-core | Four manifests in one repo: `apps/admin/package.json` (React dashboard — broad `@haklex/*` pin set), `apps/core/package.json` (`rich-headless` only), `packages/cli/package.json` (`rich-headless`, `rich-litexml`, `rich-litexml-cli`), and `packages/editor/package.json` (`rich-headless`, `rich-litexml`). **Always grep all four** — `grep -lrn '"@haklex/' /Users/innei/git/innei-repo/mx-core/ --include=package.json \| grep -v node_modules` — and rewrite pins in every hit, not just `apps/*`. Missing the `packages/*` pins produces duplicate-version installs (TS2322 across `LitexmlRegistry` heap boundary on first downstream typecheck). admin-vue3 is retired — do not touch it.   |
| mx-space            | Same repo as `mx-core` (mx-core is mx-space/core).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Deleted packages    | `@haklex/rich-static-renderer` was retired. If a downstream's tracked branch still lists it, drop it entirely instead of bumping (re-pinning a deleted package will 404 at install).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

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

   A package is **changed** if any of:
   - **(a) `src/**`has diffs since`$LAST`\*\* — the conventional trigger; or
   - **(b) its `peerDependencies` range advanced for any non-`@haklex/*` library since `$LAST`** — a peer-range advance (range widened, floor raised) changes the published tarball's resolution behaviour for consumers, so it MUST trigger republish even when no source code changed; or
   - **(c) its currently-published registry version is behind the local source's shared version (catch-up trigger)** — if a previous cycle bumped shared version but did not publish this package, the on-registry tarball drifted from what current source would produce. The next release MUST catch up the stragglers, otherwise downstream consumers split across two `@haklex/*` cohorts (the bumped majority vs the stranded stragglers), and any third-party peer floor advance in the bumped majority triggers a duplicate-runtime install via the registry-version mismatch (v0.29.0 → v0.29.1 case — see anchor).

   Plain `package.json` cosmetic edits (description, keywords, scripts) and `@haklex/*` peer-range changes do **not** count under (a)/(b) — `@haklex/*` peer ranges are handled by Phase 4's bidirectional closure. Lockfile-only changes never trigger.

4. Define `CHANGED_PKGS` as the union of (a), (b), and (c):

   ```bash
   LOCAL_VERSION=$(jq -r .version packages/rich-editor/package.json)
   
   SRC_CHANGED=$(
     git diff --name-only "$LAST"..HEAD -- 'packages/*/src/**' \
       | awk -F/ '{print $2}' | sort -u
   )
   PEER_DRIFT=$(
     for manifest in $(git diff --name-only "$LAST"..HEAD -- 'packages/*/package.json'); do
       pkg=$(basename "$(dirname "$manifest")")
       old=$(git show "$LAST:$manifest" 2> /dev/null | jq -r '
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
   # Catch-up: any @haklex/* whose registry version != shared local version.
   # Skip rich-editor-demo (not published).
   CATCHUP=$(
     for manifest in packages/*/package.json; do
       pkg_name=$(jq -r .name "$manifest")
       [ "$pkg_name" = "@haklex/rich-editor-demo" ] && continue
       reg=$(npm view "$pkg_name" version 2> /dev/null || echo "404")
       [ "$reg" = "404" ] && continue # never-published, leave for Phase 4 closure
       if [ "$reg" != "$LOCAL_VERSION" ]; then
         basename "$(dirname "$manifest")"
       fi
     done | sort -u
   )
   CHANGED_PKGS=$(printf '%s\n%s\n%s\n' "$SRC_CHANGED" "$PEER_DRIFT" "$CATCHUP" \
     | sort -u | grep -v '^$')
   ```

   Print a one-line tally before Phase 2 so the user can confirm scope, distinguishing the three trigger sources:

   ```
   Changed packages: rich-editor, rich-compose, rich-ext-chat (src)
                   + rich-plugin-block-handle, rich-plugin-floating-toolbar (peer-drift: lexical 0.45→0.46)
                   + rich-plugin-link-edit, rich-plugin-slash-menu, rich-plugin-table,
                     rich-plugin-toolbar (catch-up: registry 0.28.0 < source 0.29.0)
                   = 9 of 33
   ```

   `CHANGED_PKGS` drives both Phase 2 (semver classification) and Phase 4 (publish set when `MODE=incremental`). For semver: peer-drift-only changes classify as `minor` (new floor is additive to consumers willing to upgrade) unless the range introduces a breaking semver crossing (e.g. `^0.45.0` → `^1.0.0`), in which case `major` and Phase 2's full-mode auto-fallback fires. Catch-up-only changes inherit the highest classification produced by (a) or (b); if (a) and (b) are empty (pure catch-up cycle), classify as `patch` — the catch-up release ships the same source the missed-cycle should have shipped, just at a fresh version number.

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

**Workspace-pinning reality (mixed `workspace:*` and `workspace:^`):**

This repo writes `@haklex/*` cross-deps under two distinct conventions, and pnpm publishes them differently:

- `dependencies` and `optionalDependencies` use `workspace:*` → pnpm publishes as **exact** `X.Y.Z`. So `@haklex/rich-ext-ai-agent@0.21.0`'s tarball declares `"@haklex/rich-litexml": "0.21.0"`, not `^0.21.0`. Forward closure (Phase 4) is required: every shared-version bump (patch / minor / major) of a package P requires every workspace package that exact-pins P in dependencies to be republished in lockstep, otherwise downstream `pnpm install` fails with `ERR_PNPM_NO_MATCHING_VERSION` (v0.21.0 anchor).
- `peerDependencies` use `workspace:^` → pnpm publishes as `^X.Y.Z`. Siblings tolerate minor/patch bumps without republish. Major bumps still break the range, but Phase 2's auto-fallback flips to `full` mode at `major` (below), so it does not matter.

The migration from `workspace:*` to `workspace:^` for peerDeps landed in the v0.26.3 cycle, after a backward-closure miss caused downstream `pnpm install` to allocate a duplicate copy of `@haklex/rich-editor` (Lexical error #8 — see Real-world anchors). Until every published `@haklex/*` tarball has been republished at least once post-migration, some on-registry tarballs still carry the old exact peer pins. Phase 4's backward closure walk handles those transitional cases; once all `@haklex/*` have been republished post-migration, the backward walk becomes a no-op (no `workspace:*` peers remain in source).

The old `^old.x.y` minor/patch reasoning is therefore **right for peers, wrong for deps** in this repo. Real-world failures (`ERR_PNPM_NO_MATCHING_VERSION` from forward miss, duplicate-instance from backward miss) both motivate the bidirectional closure algorithm in Phase 4.

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

**`@haklex/*` peer specifier rule** — every internal `@haklex/*` entry in `peerDependencies` MUST use `workspace:^`, never `workspace:*`. `workspace:*` publishes as an exact version, which causes a stale sibling tarball to force a duplicate install of any bumped peer (v0.26.3 anchor). Audit and rewrite during this phase:

```bash
jq -e '
  (.peerDependencies // {})
  | to_entries
  | map(select(.key | startswith("@haklex/")) | select(.value == "workspace:*"))
  | length == 0
' packages/ < pkg > /package.json
```

If any offender exists, fix it in-place before Phase 4's bump runs (otherwise `bumpp` writes the new exact peer pin straight into the tarball and the cycle is poisoned). `dependencies` and `optionalDependencies` keep `workspace:*` — those must publish as exact for the install graph to resolve.

**Shared third-party peer-floor consistency (critical)** — for every library that appears under `peerDependencies` of more than one `@haklex/*` package (always-peer candidates above, plus `lexical` and every `@lexical/*` subpackage), all carriers MUST declare the **same range floor**. Drift across siblings is the same failure mode as a stale `workspace:*` peer pin via a third-party route: an unchanged sibling whose published tarball still pins the old floor forces downstream `pnpm install` to allocate a second copy of the bumped runtime alongside the new one. Lexical (and its `@lexical/*` subpackages) is the most fragile case — two `lexical` copies on disk re-trigger the v0.26.3 duplicate-runtime bug (Lexical error #8 from cross-heap node-class lookup), and this is exactly what landed in the v0.29.0 cycle.

Scan the full workspace before `bumpp` runs and fail loudly on any divergence:

```bash
jq -s '
  [ .[]
    | .name as $p
    | (.peerDependencies // {})
    | to_entries[]
    | select(.key | startswith("@haklex/") | not)
    | {lib: .key, range: .value, pkg: $p}
  ]
  | group_by(.lib)
  | map({lib: .[0].lib, ranges: ([.[].range] | unique), pkgs: ([.[].pkg] | unique)})
  | map(select(.ranges | length > 1))
' packages/*/package.json
```

If the output is non-empty, two things MUST happen before Phase 4 proceeds:

1. **Realign every offending peer range to the highest floor.** Rewrite each carrier's `peerDependencies.<lib>` to the same range (typically the new floor's `^X.Y.Z`).
2. **Force every carrier into `PUBLISH_SET`.** Even siblings whose `src/**` did not change must be republished so their on-registry tarball carries the new peer floor. See Phase 4's third closure direction (third-party peer-floor advancement).

There is no safe way to publish an editor whose third-party peer floor advanced while siblings keep the old floor — pnpm resolves each carrier's peer locally, producing a duplicate runtime install. This is not a downstream concern that can be deferred to Phase 6; it is a release-blocking inconsistency.

## Phase 4 — Build, publish in topological order, poll registry

Bump and build always run **full** — shared version means every `package.json` must advance in lockstep, and the workspace dep graph requires every package's dist to be fresh in case it is consumed transitively at runtime:

```bash
pnpm bumpp -r < patch | minor | major > --no-git --no-tag
pnpm run build:packages
```

Do **not** use `pnpm run release:rich` here — that path runs bumpp + build + publish in one step and bypasses the ordered/polled publish this skill needs. Replace it with explicit phases.

**Publish set is mode-dependent. In `incremental` mode it is computed as the workspace-closure of `CHANGED_PKGS`, not `CHANGED_PKGS` itself** (see Phase 2 — workspace-pinning reality). The closure walks **three directions**:

- **Forward** — for each package P in the set, include every `@haklex/*` that P's `dependencies` / `peerDependencies` / `optionalDependencies` reference under a `workspace:` specifier. Prevents `ERR_PNPM_NO_MATCHING_VERSION` when a published tarball points at an unpublished workspace dep (v0.21.0 anchor).
- **Backward (exact-pin only)** — for each package P in the set, scan every other workspace package S. If S exact-pins P via `workspace:*` in **any** of `dependencies` / `optionalDependencies` / `peerDependencies` (all of which pnpm publishes as exact `X.Y.Z`), include S too. Prevents the dual failure mode where S's last published tarball still carries the **old** exact pin → downstream installs both new P and a duplicate **old** P to satisfy S's stale dep (v0.26.3 anchor — `peerDependencies` direction, Lexical error #8 from two `@haklex/rich-editor` copies on disk → two `lexical` runtimes → node-class mismatch; v0.26.6 anchor — `dependencies` direction, `rich-compose@old/dependencies` carried exact pins to bumped `rich-renderer-image` / `rich-style-token`, forcing a duplicate-version install across the whole renderer subtree).
- **Third-party peer-floor drift** — for every non-`@haklex/*` library L whose peerDependencies range advanced in **any** changed package since `$LAST`, scan every workspace sibling S. If S declares L under `peerDependencies` at the **old** range (or any range stricter than the new floor), include S too. Prevents the third-route variant of the duplicate-runtime bug: an unchanged sibling whose published tarball still floors L at the old version forces downstream to install L at both the old (to satisfy the stale sibling) and the new (to satisfy the bumped package) floor (v0.29.0 anchor — `lexical` and `@lexical/*` peer floor bumped from `^0.45.0` to `^0.46.0` in `rich-headless` + `rich-editor` + their immediate cluster, but every `rich-plugin-*` kept the old `^0.45.0` peer. The 6 stranded plugins were not in `CHANGED_PKGS` and the existing forward/backward walks did not pick them up, because their workspace cross-deps were already `workspace:^` (post-v0.26.3 migration). Downstream `mx-core` ended up with both lexical 0.45 and 0.46 in `node_modules` — same Lexical error #8 path, different trigger).

Note the asymmetry: forward walk follows any `workspace:` prefix (`*`, `^`, `~`, explicit), because pnpm publishes them all as **some** concrete version and the consumer must be able to resolve them. Backward walk fires **only** on `workspace:*` pins (any of deps / optional / peer), because `workspace:^` publishes as `^X.Y.Z` and tolerates sibling minor/patch bumps without republish. Bumps that cross the caret floor (i.e. `major`) still force `MODE=full` via Phase 2's auto-fallback, so backward walk does not need to handle them. Third-party peer-floor walk fires on **any** carrier of the drifted lib whose declared peer is stricter than the new floor — the trigger is the floor advance in the changed package, not the workspace-pin shape.

**Reality check on incremental savings.** Because the repo still has many `workspace:*` cross-deps under `dependencies` (notably `rich-compose` depending on every `rich-ext-*` / `rich-renderer-*` / `rich-litexml` / `rich-style-token` via `workspace:*`), the backward walk over `dependencies` can rapidly snowball: republishing any one of those forces `rich-compose` in, which forces all its other workspace deps in, which forces everything depending on them in, … In practice incremental closures touching the renderer / extension subtree converge on `full` anyway. That is expected behaviour, not a bug — the alternative is shipping a broken install graph. If you want incremental to stay genuinely small over time, the fix is migrating the offending `dependencies: workspace:*` to `workspace:^` (a tarball-format change requiring a one-time republish of every consumer), the same migration the v0.26.3 cycle did for `peerDependencies`.

```bash
case "$MODE" in
  full)
    # Every @haklex/* except the demo
    PUBLISH_SET=$(pnpm -r ls --depth -1 --json \
      | jq -r '.[].name' | grep '^@haklex/' | grep -v '@haklex/rich-editor-demo')
    ;;
  incremental)
    # Tri-directional closure: forward (deps/peers/optional) + backward (exact-pin
    # cross-pkgs) + third-party peer-floor drift carriers. Iterate to fixed point.
    declare -A IN_SET
    for p in $CHANGED_PKGS; do IN_SET["@haklex/$p"]=1; done

    # Pre-compute the set of non-@haklex/* peer libs whose floor advanced in any
    # changed package between $LAST and HEAD. Format per line: "<lib> <new-range>".
    DRIFTED_PEERS=$(
      for p in $CHANGED_PKGS; do
        manifest="packages/$p/package.json"
        [ -f "$manifest" ] || continue
        diff \
          <(git show "$LAST:$manifest" 2> /dev/null | jq -r '
            (.peerDependencies // {}) | to_entries[]
            | select(.key | startswith("@haklex/") | not)
            | "\(.key) \(.value)"' | sort) \
          <(jq -r '
            (.peerDependencies // {}) | to_entries[]
            | select(.key | startswith("@haklex/") | not)
            | "\(.key) \(.value)"' "$manifest" | sort) \
          | awk '/^> /{print $2" "$3}'
      done | sort -u
    )

    changed=1
    while [ "$changed" -eq 1 ]; do
      changed=0
      # Forward: pkg's workspace deps/peers/optional -> add target
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
      # Backward: any sibling whose deps/optional/peers exact-pin (workspace:*) a member of IN_SET
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
      # Third-party peer-floor drift: any sibling that peers a drifted lib at the
      # old (stricter-than-new-floor) range must be republished so its tarball
      # carries the new floor. Skip siblings whose own range already matches the
      # new floor — they don't need a republish for this lib.
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
    PUBLISH_SET=$(printf '%s\n' "${!IN_SET[@]}" | sort)
    ;;
esac
echo "Publish set ($MODE): $(wc -l <<< "$PUBLISH_SET") packages"
```

Devdeps are excluded from both directions (consumers never see them).

Print which packages were absorbed by closure expansion, separating forward / backward / third-party-peer-drift so the user can see why `PUBLISH_SET` is larger than `CHANGED_PKGS`:

```
Closure expansion: rich-editor, rich-editor-ui, rich-ext-gallery, rich-headless (changed)
                 + rich-style-token (forward: workspace dep of rich-editor)
                 + rich-ext-chat, rich-ext-code-snippet, rich-ext-dynamic, rich-ext-embed,
                   rich-ext-excalidraw, rich-ext-nested-doc, rich-renderer-*
                   (backward: exact peer-pin workspace:* on rich-editor / rich-editor-ui / rich-style-token)
                 + rich-plugin-block-handle, rich-plugin-floating-toolbar, rich-plugin-link-edit,
                   rich-plugin-slash-menu, rich-plugin-table, rich-plugin-toolbar
                   (third-party peer drift: lexical floor ^0.45.0 → ^0.46.0 in rich-headless / rich-editor)
                 = 33 packages
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

## Phase 5.5 — Publish GitHub release (note auto-authored, published directly)

Release notes (incl. breaking changes, new features, migration steps) live on GitHub Releases. The skill authors the note from the changeset and **publishes the release directly** — no draft, no review gate. The orchestrator is fully autonomous; downstream propagation in Phase 6+ proceeds in parallel with the release going live.

1. Build the note from `git log` and Phase 2's classification. Group commits by type, surface breaking changes first:

   ```bash
   COMMITS=$(git log --pretty=format:'- %s (%h)' "$LAST"..HEAD)
   # Bucket lines by leading conventional-commit type:
   #   feat!: / fix!: / BREAKING CHANGE in body → ## Breaking Changes
   #   feat:                                    → ## Features
   #   fix:                                     → ## Bug Fixes
   #   refactor: / perf: / docs: / chore:       → ## Other
   ```

   Header the note with the Phase 2 bump classification table so readers see _why_ the level was chosen.

2. Write the note to a temp file:

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

3. Publish the release bound to the pushed tag (no `--draft`):

   ```bash
   gh release create "v$NEW_VERSION" \
     --title "v$NEW_VERSION" \
     --notes-file "$NOTE" \
     --verify-tag
   ```

   `--verify-tag` fails fast if Phase 5's `git push origin "v$NEW_VERSION"` didn't land — do not silently fall back to `--target HEAD`. Print the published release URL in the Phase 9 summary; no edit URL is needed since the release is already live.

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

# Yohaku quirk: packages/design-system is a symlink to ../design-oss/design-system
# (sibling directory outside the repo). git worktree does NOT materialize that
# target, so pnpm install fails with ERR_PNPM_WORKSPACE_PKG_NOT_FOUND for
# @yohaku/design-system. Copy the sibling dir in, then strip its embedded .git
# so the symlink resolves locally.
if [ -d "/tmp/release-Yohaku-$NEW_VERSION" ]; then
  rm -rf "/tmp/release-Yohaku-$NEW_VERSION/design-oss"
  cp -R "/Users/innei/git/innei-repo/Yohaku/design-oss/" \
    "/tmp/release-Yohaku-$NEW_VERSION/design-oss/"
  rm -rf "/tmp/release-Yohaku-$NEW_VERSION/design-oss/.git"
fi
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

**Third-party peer reconciliation (critical when Phase 3 flagged drift)** — if any published `@haklex/*` advanced a non-`@haklex/*` peer floor this cycle (i.e. `DRIFTED_PEERS` from Phase 4 is non-empty, or Phase 3's consistency audit fired), downstream consumers' **own** direct pins for the same library must also lift. Otherwise pnpm satisfies the downstream's pin and haklex's peer independently, allocating two physical copies of the library and reproducing the duplicate-runtime bug via a third-party route (v0.29.0 anchor — mx-core kept `lexical: ^0.45.0` while haklex peers required `^0.46.0`; pnpm installed both, breaking the editor at runtime).

Collect the new peer ranges from registry-published manifests (not local source — local may have drifted past what was actually published this cycle), then rewrite any downstream direct pin that doesn't satisfy:

```bash
# Aggregate peer ranges from every freshly-published @haklex/*. Each row: "<lib>\t<range>"
PEER_FLOORS=$(
  for pkg in $PUBLISH_SET; do
    npm view "$pkg@$NEW_VERSION" peerDependencies --json 2> /dev/null
  done | jq -s '
    add // {}
    | to_entries
    | map(select(.key | startswith("@haklex/") | not))
    | map("\(.key)\t\(.value)")
    | .[]
  '
)

# For each (lib, range), rewrite the downstream manifest sections that pin lib at
# a range strictly older than the new floor. Skip libs the downstream does not list.
while IFS=$'\t' read -r lib new_range; do
  [ -z "$lib" ] && continue
  for section in dependencies devDependencies peerDependencies; do
    cur=$(jq -r --arg s "$section" --arg l "$lib" '(.[$s] // {})[$l] // empty' "$MANIFEST")
    [ -z "$cur" ] && continue
    [ "$cur" = "$new_range" ] && continue
    # Use Edit to rewrite "$lib": "$cur" → "$lib": "$new_range" in $MANIFEST.
  done
done <<< "$PEER_FLOORS"
```

`devDependencies` is included because downstream test/build tooling often pins the same lib (e.g. mx-core's `apps/core` lists `@lexical/headless` under `dependencies` but `@lexical/code-core` etc. need to track the same floor). Rewrite in-place; if the downstream's existing range is already `>=` the new floor (e.g. an explicit `^0.46.1` when the new floor is `^0.46.0`), leave it alone.

Stage these third-party pin changes alongside the `@haklex/*` pin rewrites — Phase 8b commits them together under the same `chore(deps): bump @haklex/*` message.

Commit-ready files per repo (re-derive at release time — these are the historically observed sets, not a guarantee):

| Repo    | Stage these                                                                                                                                                                                                                                         |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yohaku  | `apps/web/package.json`, root `pnpm-lock.yaml`. Next.js may regenerate `apps/web/next-env.d.ts` during install/build — `git checkout --` that file before committing.                                                                               |
| mx-core | `apps/admin/package.json`, `apps/core/package.json`, `packages/cli/package.json`, `packages/editor/package.json`, root `pnpm-lock.yaml`, and `pnpm-workspace.yaml` if `pnpm install` auto-added a `minimumReleaseAgeExclude` entry (benign — keep). |

**Always grep the full repo** for `@haklex/*` consumers — do NOT trust the table to be exhaustive. mx-core has historically grown new manifests under `packages/*` (cli, editor); missing them produces duplicate-version installs (TS2322 across `LitexmlRegistry` heap boundary in admin's typecheck — v0.26.6 anchor). At the start of Phase 6, run:

```bash
grep -lrn '"@haklex/' /tmp/release-$repo-$NEW_VERSION --include=package.json | grep -v node_modules
```

and apply the pin-rewrite loop to every hit, not just the ones in the table.

If the worktree is dirty beyond those files, stop and ask the user — do NOT `git add -A`.

## Phase 7 — Smoke tests (parallel)

In each downstream worktree, dispatch an independent subagent to run:

1. `pnpm typecheck` (or `pnpm -r exec tsc --noEmit` if no script)
2. `pnpm build`
3. **Duplicate-runtime invariant** — for every lib in `DRIFTED_PEERS` (Phase 4, the lib column only) plus the always-peer list (`lexical`, `react`, `react-dom`, `@lexical/react`, `lucide-react`, `shiki`), assert exactly one resolved version in the install graph. This catches the v0.26.3 / v0.29.0 family of duplicate-runtime bugs that typecheck and build silently tolerate:

   ```bash
   DRIFTED_LIBS=$(awk '{print $1}' <<< "$DRIFTED_PEERS" | sort -u)
   for lib in lexical react react-dom @lexical/react lucide-react shiki $DRIFTED_LIBS; do
     # extract distinct resolved versions across the workspace
     versions=$(pnpm ls "$lib" -r --depth Infinity --json 2> /dev/null \
       | jq -r '.. | objects | select(.name? == "'$lib'") | .version' | sort -u)
     count=$(wc -l <<< "$versions" | tr -d ' ')
     if [ "$count" -gt 1 ]; then
       echo "FAIL: $lib has $count distinct copies: $versions"
       exit 1
     fi
   done
   ```

   A single resolved version is mandatory for any Context-creating or runtime-anchored lib. If the assertion fails, fall through to Phase 8a — the bug is that a stranded sibling's published peer range is still pinning the old floor; the fix is republishing that sibling at the new floor (Phase 4's third-direction closure should have caught it, but didn't because either Phase 3's audit was skipped or the carrier doesn't list the lib as peer locally despite needing it).

4. One E2E — use the repo's existing smoke journey. If none exists, skip with a warning; do not invent one.

Run the repos in parallel (one subagent per worktree). Collect pass/fail per repo. Proceed only when all green.

## Phase 8a — Failure recovery (on smoke or publish failure)

1. **Local revert (safe, automatic):**

   ```bash
   # If the GitHub release already published in Phase 5.5, delete it. The
   # release page is technically visible to the public for the brief window
   # between Phase 5.5 and a Phase 7 failure, but no human is expected to
   # have consumed it yet — deletion is still the right call.
   gh release delete "v$NEW_VERSION" --yes --cleanup-tag 2> /dev/null || true
   # --cleanup-tag also drops the tag on the remote; fall through to the
   # local tag cleanup below in case the release was never created.
   git -C haklex tag -d "v$NEW_VERSION" 2> /dev/null || true
   git -C haklex push origin ":refs/tags/v$NEW_VERSION" 2> /dev/null || true
   
   git -C haklex reset --hard HEAD~1     # undo "release: v$NEW_VERSION"
   git -C haklex push --force-with-lease # ONLY if already pushed — ASK user first
   for repo in Yohaku mx-core; do
     git -C "/Users/innei/git/innei-repo/$repo" worktree remove "/tmp/release-$repo-$NEW_VERSION" --force
     git -C "/Users/innei/git/innei-repo/$repo" branch -D "chore/haklex-$NEW_VERSION"
   done
   ```

   The release was published live in Phase 5.5, so during the brief window between Phase 5.5 and a downstream failure it is technically public. If any downstream commit already merged or any external party has consumed the published note, treat the version as in-the-wild — fall through to step 2 (publish a fix as a new patch) instead of deleting the release.

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

Then surface the **published GitHub release URL** as a separate, prominent line:

```
✅ Release published: https://github.com/Innei/haklex/releases/tag/v$NEW_VERSION
```

The release is live — no further user action required. Mark the release as complete in the summary.

## Quick reference

| Step              | Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Last release SHA  | `git log --grep='^release: v' -n1 --format=%H`                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Mode detect       | `grep -iqE '(^\|[^a-z])(full\|全量\|all)([^a-z]\|$)' <<<"$INVOCATION_TEXT" && echo full \|\| echo incremental`                                                                                                                                                                                                                                                                                                                                                                                            |
| Changed pkgs      | `git diff --name-only $LAST..HEAD -- 'packages/*/src/**'`                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Publish set       | `full` → all `@haklex/*` sans demo. `incremental` → **tri-directional** closure of `CHANGED_PKGS`: forward over `dependencies + peerDependencies + optionalDependencies` (any `workspace:` prefix), backward over sibling exact-pins (`workspace:*` only — `workspace:^` is skipped) in **all three** sections, plus third-party peer-floor drift carriers (any sibling that peers a drifted non-`@haklex/*` lib at a stricter-than-new-floor range). Iterate to fixed point. See Phase 4 for the script. |
| Export diff       | `diff <(git show $LAST:…/index.ts \| grep ^export) <(git show HEAD:…/index.ts \| grep ^export)`                                                                                                                                                                                                                                                                                                                                                                                                           |
| Peer audit        | `jq '.dependencies, .peerDependencies' packages/<pkg>/package.json`; plus cross-package consistency: `jq -s 'map(...) \| group_by(.lib) \| map(select(.ranges \| length > 1))' packages/*/package.json` (see Phase 3 — must be `[]`)                                                                                                                                                                                                                                                                      |
| Drifted peers     | `for p in $CHANGED_PKGS; do diff <(git show $LAST:packages/$p/package.json \| jq -r '.peerDependencies\|to_entries[]\|select(.key\|startswith("@haklex/")\|not)\|"\(.key) \(.value)"') <(jq -r 'same' packages/$p/package.json) \| awk '/^> /{print $2,$3}'; done` (non-empty → Phase 6 must reconcile downstream pins)                                                                                                                                                                                   |
| Dup-runtime smoke | `pnpm ls <lib> -r --depth Infinity --json \| jq -r '.. \| objects \| select(.name? == "<lib>") \| .version' \| sort -u \| wc -l` must equal 1 for `lexical` / `react` / `react-dom` / `@lexical/react` / `lucide-react` / `shiki`                                                                                                                                                                                                                                                                         |
| Bump              | `pnpm bumpp -r <level> --no-git --no-tag`                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Build             | `pnpm run build:packages`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Publish one       | `pnpm --filter @haklex/<pkg> publish --no-git-checks`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Registry poll     | `until npm view @haklex/<pkg>@$V version; do sleep 5; done`                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| CLI smoke         | `npx --yes -p @haklex/rich-litexml-cli@$CLI_VER litexml '<p>x</p>' --format json --compact` (`$CLI_VER` = `$V` if in PUBLISH_SET, else `npm view @haklex/rich-litexml-cli version`)                                                                                                                                                                                                                                                                                                                       |
| Default branch    | `git -C <repo> symbolic-ref refs/remotes/origin/HEAD --short \| sed 's#^origin/##'` (main/master)                                                                                                                                                                                                                                                                                                                                                                                                         |
| Worktree          | `git worktree add /tmp/release-<repo>-$V -b chore/haklex-$V origin/$D`                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Push downstream   | `git push origin HEAD:$D` (after `git fetch origin $D && git rebase origin/$D`)                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Tag haklex        | `git tag v$V && git push origin v$V` (after commit, before downstream)                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Publish release   | `gh release create v$V --title v$V --notes-file $NOTE --verify-tag` (no `--draft` — publish directly)                                                                                                                                                                                                                                                                                                                                                                                                     |
| Release URL       | `https://github.com/Innei/haklex/releases/tag/v$V` (live immediately after publish)                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Rollback release  | `gh release delete v$V --yes --cleanup-tag` (only on Phase 8a failure path)                                                                                                                                                                                                                                                                                                                                                                                                                               |

## Common mistakes

| Mistake                                                                    | Fix                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Asking the caller for release metadata                                     | Infer the changeset summary and affected packages from `git log` and `git diff`                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Defaulting to full release every cycle                                     | Default is `incremental`. Only enter `full` via user keyword (`full`/`全量`/`all`) or Phase 2 major auto-fallback                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Treating a `major` bump as safely incremental                              | A major breaks every cross-dep pin in unpublished packages. Phase 2 must flip `MODE=full` and republish everything                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Equating `PUBLISH_SET` with `CHANGED_PKGS` in `incremental` mode           | This repo uses `workspace:*` — pnpm publishes those as exact versions. `PUBLISH_SET` must be the **bidirectional** closure of `CHANGED_PKGS`: forward over `dependencies + peerDependencies + optionalDependencies`, backward over **all three** sections' `workspace:*` exact-pins (not just peers). Forward-only misses the reverse failure mode — sibling tarballs with stale exact pins force downstream to install a duplicate old copy of the bumped package. Real-world hits: v0.21.0 (forward), v0.26.3 (backward — peers), v0.26.6 (backward — deps) |
| Restricting backward walk to `peerDependencies`                            | The v0.26.3 fix only migrated peers to `workspace:^`. `dependencies` / `optionalDependencies` workspace:\* still publish as exact and still trigger the duplicate-version failure when stale. Backward walk MUST scan all three manifest sections. Real-world hit: v0.26.6                                                                                                                                                                                                                                                                                    |
| Ignoring third-party peer-floor drift across `@haklex/*` siblings          | A third-party peer floor (e.g. `lexical`) that advances in some carriers while siblings keep the old floor reproduces the v0.26.3 duplicate-runtime bug via a third-party route. Phase 3 must audit cross-package consistency and fail; Phase 4's closure must walk a third direction (carriers of drifted peers); Phase 6 must reconcile downstream's direct pin to the new floor. Real-world hit: v0.29.0 (lexical 0.45→0.46 in editor + headless, but plugins stayed at 0.45)                                                                              |
| Trusting typecheck + build to catch duplicate-runtime bugs                 | Both pass with two physical copies of `lexical` / `react` / etc. in `node_modules` — the failure is runtime (Lexical error #8, React Context mismatch). Phase 7 must explicitly assert exactly one resolved version per Context-creating lib via `pnpm ls <lib> -r`                                                                                                                                                                                                                                                                                           |
| Rewriting only `@haklex/*` pins in downstream manifests                    | When a haklex peer floor for a third-party lib advances, downstream's own direct pin for the same lib must also lift. Otherwise pnpm satisfies each independently and installs both versions. Phase 6's third-party reconciliation step rewrites `dependencies` / `devDependencies` / `peerDependencies` entries for any lib in the new peer-floor set                                                                                                                                                                                                        |
| Treating `workspace:^` peerDeps as identical to `workspace:*`              | `workspace:*` publishes as **exact** `X.Y.Z` — a stale sibling will pin the old version and force downstream duplicates. `workspace:^` publishes as `^X.Y.Z` and tolerates sibling minor/patch bumps without republish. Backward walk in Phase 4 fires **only** on `workspace:*` peers; `workspace:^` peers are intentionally skipped. Phase 2's major auto-fallback covers the case where a bump exits the caret floor                                                                                                                                       |
| Re-pinning a downstream `@haklex/*` not in `PUBLISH_SET` to `$NEW_VERSION` | That version was never published for unchanged packages — `pnpm install` 404s. Only rewrite pins for packages in `PUBLISH_SET`                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Running the CLI smoke against `$NEW_VERSION` when CLI wasn't republished   | The version doesn't exist on the registry. Read the prior version via `npm view @haklex/rich-litexml-cli version` and smoke against that with the new `rich-compose` resolved at install                                                                                                                                                                                                                                                                                                                                                                      |
| Bumping `package.json` but skipping publish in `full` mode                 | `full` means publish every `@haklex/*` (sans demo). Don't conflate "didn't change" with "don't publish" when `MODE=full`                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Publishing before registry poll succeeds                                   | Downstream `pnpm install` 404s or resolves stale mirror                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Treating a Context-creating lib as a regular dep                           | Promote to peer (reference: commit 88bb7a0 — lucide-react)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Attempting per-package **bumps**                                           | Not supported — shared version; highest-wins. (Per-package **publish** in incremental mode is fine; it's the version field that stays shared)                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `git add -A` in a dirty downstream worktree                                | Stage only the pinned-version files per Repo layout table                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Running `pnpm run release:rich` inside this skill                          | That script compresses bump/build/publish into one step; this skill needs them separate                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `npm unpublish` without user confirmation                                  | Always ask — unpublish is public, permanent, and time-limited                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Force-pushing reverts without `--force-with-lease`                         | Use `--force-with-lease`; ask user before pushing any force                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Opening a PR for the downstream bump                                       | Bumps go direct to the default branch — no PR, no `gh pr create`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Pushing the `chore/haklex-$V` branch to origin                             | That branch is worktree-local; push commits as `HEAD:$D` where $D is the default branch                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Skipping `git fetch` + rebase before push                                  | Default branch may have advanced during the release; rebase on `origin/$D` first                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Targeting a feature branch or guessing `main`                              | Always derive `$D` from `origin/HEAD`; some repos use `master`, not `main`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Writing release notes into README                                          | Notes live on GitHub Releases — README only links there; never paste a "What's new" block back into any in-repo doc                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Adding `--draft` to `gh release create`                                    | The orchestrator is autonomous — publish directly. Drafts re-introduce a manual gate that defeats the point                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Skipping the `rich-litexml-cli` binary smoke                               | Bin packages can publish "successfully" yet fail to boot — always run Phase 4.5                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Skipping `--verify-tag` on `gh release create`                             | Without it, gh silently creates a tag at HEAD, decoupling the release from the bump commit                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Forgetting `--cleanup-tag` on rollback                                     | A lingering tag confuses the next release attempt. `gh release delete --cleanup-tag` drops both the release and the remote tag in one call                                                                                                                                                                                                                                                                                                                                                                                                                    |

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
- A release for `v$NEW_VERSION` already exists on GitHub (stale from a previous failed attempt) — delete it via `gh release delete v$NEW_VERSION --yes --cleanup-tag` before re-publishing, or `gh release create` will reject as duplicate
- Phase 3 audit finds any `@haklex/*` peerDep on `workspace:*` (must be `workspace:^`) — fix the manifest before Phase 4 runs `bumpp`, otherwise the exact pin gets baked into the published tarball and re-triggers the v0.26.3 duplicate-instance failure
- Phase 3 cross-package third-party peer audit finds any lib at >1 distinct range across `@haklex/*` siblings (e.g. `lexical: ^0.45.0` in `rich-plugin-*` but `^0.46.0` in `rich-headless`) — realign every offender to the highest floor and force them into `PUBLISH_SET` (Phase 4's third closure direction) before publishing. Releasing under this state guarantees a downstream duplicate-runtime install (v0.29.0 anchor)
- Phase 7 duplicate-runtime invariant fires (`pnpm ls <lib> -r` shows >1 resolved version for `lexical` / `react` / any Context-creating lib) — fall through to Phase 8a; the stranded carrier needs republishing at the new peer floor, not a Phase 6 retry

## Real-world anchors

- `88bb7a0` — rich-agent-chat + lucide-react peer dep (the motivating Context-mismatch bug)
- `0.0.106..0.0.108` — pure patch cadence; the first `minor`/`major` under this skill warrants extra caution
- `v0.21.0` — incremental closure bug, **forward** direction. Initial run published only `CHANGED_PKGS = {rich-agent-core, rich-ext-ai-agent}`. Downstreams hit `ERR_PNPM_NO_MATCHING_VERSION: No matching version found for @haklex/rich-diff-core@0.21.0` because `workspace:*` had published as exact `0.21.0` but the dep wasn't republished. Recovered by publishing `rich-litexml@0.21.0` + `rich-diff-core@0.21.0` after the fact. Motivated the Phase 4 forward closure-expansion algorithm.
- `v0.26.3` — incremental closure bug, **backward** direction, `peerDependencies` half. Initial run published only `CHANGED_PKGS = {rich-editor, rich-editor-ui, rich-ext-gallery, rich-headless}`. The forward closure stopped there because none of those reach the rest via deps. However, every unchanged `rich-ext-*` / `rich-plugin-*` / `rich-renderer-*` package's last published tarball (`0.26.2`) carried exact peer pins `"@haklex/rich-editor": "0.26.2"` (from `workspace:*`). When downstream bumped `rich-editor` to `0.26.3`, pnpm satisfied each unchanged ext's stale peer by installing a **second** copy of `rich-editor@0.26.2`, producing two physical `@haklex/rich-editor` directories under `node_modules`. Two `rich-editor` dirs → two bundled `lexical` runtimes → inserting `rich-ext-chat`'s `ChatNode` into the 0.26.3 editor triggered Lexical error #8 (`Cannot find node by key`) because the class registered against the 0.26.2 lexical heap was not the class the 0.26.3 editor reconciled against. Two-part fix: (1) migrated every `@haklex/*` peerDep in this repo from `workspace:*` to `workspace:^` so publish writes `^X.Y.Z` instead of exact, letting siblings tolerate minor/patch bumps without republish; (2) added the backward closure walk to Phase 4 so existing `workspace:*` peer pins (and any future ones) force the peer-pinner into `PUBLISH_SET`. The migration in (1) prevents recurrence going forward; the walk in (2) protects the transitional period during which already-published tarballs still carry exact peer pins.
- `v0.26.6` — incremental closure bug, **backward** direction, `dependencies` half (the other shoe dropping from v0.26.3). Initial run started incremental with `CHANGED_PKGS = {rich-renderer-image}` (manifest-only — `jotai` migrated from `dependencies` to `peerDependencies`). Forward closure expanded to 5 packages (rich-editor + ui + style-token + headless via `peerDependencies: workspace:^`). After publishing those 5, audit revealed `rich-compose@0.26.5/dependencies` still pinned `"@haklex/rich-renderer-image": "0.26.5"` and `"@haklex/rich-style-token": "0.26.5"` exactly — both bumped to 0.26.6 on the registry. The v0.26.3 fix only migrated `peerDependencies` to `workspace:^`; `dependencies` and `optionalDependencies` are still `workspace:*` and still publish as exact. Same backward failure mode, different manifest section. Re-publishing `rich-compose@0.26.6` would have cascaded into its own forward closure (every `rich-ext-*` / `rich-renderer-*` / `rich-litexml` it depends on at `workspace:*`), which in turn would force their backward-pinners in, … converging on the full set anyway. Resolution: switch to `MODE=full` and republish all 41. Fix in this skill: (1) backward walk now scans `dependencies + optionalDependencies + peerDependencies` (not just peers); (2) documented that incremental closures touching the renderer / extension subtree will snowball into full for as long as `dependencies: workspace:*` remains in use, and the lasting fix is migrating those to `workspace:^` too. Also caught: mx-core has additional `@haklex/*` consumers under `packages/cli` and `packages/editor` not listed in the original Repo layout table — added the "always grep" rule to Phase 6. Also caught: `Yohaku/packages/design-system` is a sibling-directory symlink that `git worktree` does not materialize — added the `cp -R design-oss/ + rm .git` workaround to Phase 6.
- `v0.29.0` — incremental closure bug, **third direction**: third-party peer-floor drift. The cycle bumped `lexical` and every `@lexical/*` subpackage peer floor from `^0.45.0` to `^0.46.0` in `rich-headless` and `rich-editor` (plus their immediate cluster). `CHANGED_PKGS` covered those; forward+backward closure expanded to most of the family. But the six `rich-plugin-*` packages (block-handle, floating-toolbar, link-edit, slash-menu, table, toolbar) had no `src/**` diff and no workspace-pin-shape trigger pulling them in (their `@haklex/*` cross-deps were already `workspace:^` post-v0.26.3), so they stayed at `0.28.0` on the registry. Their published 0.28.0 tarballs floor `lexical` at `^0.45.0`. Downstream `mx-core` consumed both the new `rich-editor@0.29.0` (peers `lexical^0.46.0`) and the stranded `rich-plugin-*@0.28.0` (peers `lexical^0.45.0`) — pnpm installed both `lexical@0.45.0` AND `lexical@0.46.0` in `node_modules`. Same Lexical error #8 path as v0.26.3, different trigger: the carrier was a third-party peer, not a workspace peer pin. Compounding bug: mx-core's own direct pins `lexical: ^0.45.0` / `@lexical/react: ^0.45.0` / etc. in `apps/admin`, `apps/core`, `packages/cli`, `packages/editor` were never rewritten by the orchestrator (Phase 6 only touched `@haklex/*` pins). Three fixes in this skill: (1) Phase 3 now audits cross-package consistency of shared third-party peer ranges and fails the release if siblings disagree; (2) Phase 4's closure walks a third direction — third-party peer-floor drift in any changed package forces every workspace carrier of that peer into `PUBLISH_SET`; (3) Phase 6 now reconciles downstream's direct third-party pins against the newly-published `@haklex/*` peer floors; (4) Phase 7 adds a duplicate-runtime invariant smoke (`pnpm ls <lib> -r` must show exactly one resolved version for any Context-creating lib).
- Previous per-repo playbook: `.claude/commands/release.md` (now superseded by this skill)
