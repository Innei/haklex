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

| Repo               | Location                              | Rules                                                                                                                                                                  |
| ------------------ | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Yohaku             | `/Users/innei/git/innei-repo/Yohaku`  | Grep package manifests at release time. Historical primary manifest: `apps/web/package.json`.                                                                          |
| mx-core / mx-space | `/Users/innei/git/innei-repo/mx-core` | Grep all manifests. Historical consumers include `apps/admin/package.json`, `apps/core/package.json`, `packages/cli/package.json`, and `packages/editor/package.json`. |

## Yohaku Worktree Quirk

`Yohaku/packages/design-system` is a symlink to `../design-oss/design-system`. A `git worktree add` operation does not materialize sibling-directory targets, so `pnpm install` may fail with `ERR_PNPM_WORKSPACE_PKG_NOT_FOUND` for `@yohaku/design-system`.

After creating `/tmp/release-Yohaku-$NEW_VERSION`, copy the sibling directory into the worktree:

```bash
cp -R "/Users/innei/git/innei-repo/Yohaku/design-oss/" \
  "/tmp/release-Yohaku-$NEW_VERSION/design-oss/"
rm -rf "/tmp/release-Yohaku-$NEW_VERSION/design-oss/.git"
```

## Manifest Enumeration

Never rely solely on historical paths. Always derive actual downstream consumers:

```bash
DOWNSTREAM_MANIFESTS=$(
  grep -lrn '"@haklex/' "/tmp/release-$repo-$NEW_VERSION" --include=package.json \
    | grep -v node_modules
)
```

The same `$DOWNSTREAM_MANIFESTS` list feeds `@haklex/*` pin rewrites, third-party peer-floor reconciliation, duplicate-runtime checks, and staging decisions.
