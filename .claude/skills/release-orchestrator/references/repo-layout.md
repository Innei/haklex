# Repository Layout

## Haklex

| Concern             | Rule                                                                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Release root        | Run from the same haklex worktree where pre-flight passed. Confirm with `git worktree list`; do not switch checkouts mid-release.    |
| Published namespace | `@haklex/*`, excluding `@haklex/rich-editor-demo`.                                                                                   |
| Version strategy    | Shared version across all `@haklex/*` packages, read from `packages/rich-editor/package.json`.                                       |
| CLI package         | `@haklex/rich-litexml-cli` ships the `litexml` binary and loads `@haklex/rich-compose` dist assets at runtime via `require.resolve`. |
| Retired package     | `@haklex/rich-static-renderer` is deleted. Remove it from downstream manifests if present; do not repin it.                          |

## Downstream Consumers

| Repo                | Location                                  | Rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yohaku              | `/Users/innei/git/innei-repo/Yohaku`      | Grep package manifests at release time, including the `yohaku-oss` submodule (`packages/rich-content`, `apps/mobile`). All of them move together; see the submodule section.                                                                                                                                                                                                                                                                                                                                          |
| mx-core / mx-space  | `/Users/innei/git/innei-repo/mx-core`     | Grep all manifests. Historical consumers include `apps/admin/package.json`, `apps/core/package.json`, `packages/cli/package.json`, and `packages/editor/package.json`.                                                                                                                                                                                                                                                                                                                                                |
| ryugi (superpowers) | `/Users/innei/git/innei-repo/superpowers` | `artifacts/package.json` (own lockfile and `pnpm-workspace.yaml` under `artifacts/`). Ship a ryugi release after pinning, in this order: commit the pin bump, `git fetch && git rebase origin/main`, **then** read `artifacts/package.json` and run `scripts/bump-version.sh <its next patch>`, commit, `git tag v<version>`, `git push --atomic origin HEAD:main v<version>`. Computing the version before the rebase can move it backwards (v1.4.2 after v1.5.0: npm refused it and main pinned a missing version). |

## Yohaku Worktree and Submodule

`Yohaku/packages/{design-system,rich-content,dom-webview}` and `apps/mobile` are symlinks into the `yohaku-oss` submodule. A fresh worktree has an empty `yohaku-oss/`, so initialise it before installing:

```bash
git -C "/tmp/release-Yohaku-$NEW_VERSION" submodule update --init yohaku-oss
git -C "/tmp/release-Yohaku-$NEW_VERSION/yohaku-oss" switch -c "chore/haklex-$NEW_VERSION"
```

Pin every `@haklex/*` entry in `apps/web`, `yohaku-oss/packages/rich-content` (dev + peer) and `yohaku-oss/apps/mobile` to the same version. A lagging `rich-content` pin installs a second `@haklex/rich-editor` and breaks web types (v0.50.0: `RichEditorVariant` mismatch).

`yohaku-oss` keeps its own `pnpm-lock.yaml` and `pnpm-workspace.yaml`. After the root `pnpm install`, refresh it without touching `node_modules` (which is a symlink to the root store):

```bash
cd "/tmp/release-Yohaku-$NEW_VERSION/yohaku-oss" && pnpm install --lockfile-only
```

Commit and push `yohaku-oss` first (`chore(deps): bump @haklex/* to $NEW_VERSION`), then in Yohaku commit `apps/web/package.json` + `pnpm-lock.yaml`, then the pin bump `chore(mobile): bump public iOS source — <oss subject>` (Yohaku `AGENTS.md`).

Known baselines that are not release regressions (verify against the main checkout before treating as new): web `tsc` errors in `textures.ts` and `Gallery.tsx`; mobile drizzle `BaseSQLiteDatabase` errors (two drizzle peer instances); mobile `native-dependency-policy` AVIF test. The web build skips type validation (`ignoreBuildErrors`), so run `pnpm --filter @yohaku/web exec tsc --noEmit` separately and diff against main.

## Manifest Enumeration

Never rely solely on historical paths. Always derive actual downstream consumers:

```bash
DOWNSTREAM_MANIFESTS=$(
  grep -lrn '"@haklex/' "/tmp/release-$repo-$NEW_VERSION" --include=package.json \
    | grep -v node_modules
)
```

The same `$DOWNSTREAM_MANIFESTS` list feeds `@haklex/*` pin rewrites, third-party peer-floor reconciliation, duplicate-runtime checks, and staging decisions.
