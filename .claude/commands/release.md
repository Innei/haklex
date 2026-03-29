Release @haklex/\* packages and update all downstream consumers.

## Resolving haklex root and downstream paths

| Concern                           | Rule                                                                                                                                                                                                                                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Which haklex directory to use** | Run the entire release (bumpp → build → publish → commit → push) in the **same repository root** where you run `git status` (often a [git worktree](https://git-scm.com/docs/git-worktree)). Do not switch to another checkout of haklex unless the user asks; a second clone may be on a different branch or commit. |
| **Confirming paths**              | Run `git worktree list` if needed: it shows the main clone and all worktrees. The directory that contains the bumped `packages/rich-editor/package.json` is the one you build and publish from.                                                                                                                       |
| **Downstream repos**              | Consumers live **outside** haklex (sibling repos). Default locations on this machine: `/Users/innei/git/innei-repo/Shiroi`, `admin-vue3`, `mx-core`. If the workspace path differs, still edit those consumer paths—or ask the user for their `innei-repo` root.                                                      |

## Steps

### 1. Pre-flight checks

Run `git status` in haklex repo. Ensure working tree is clean or all changes are committed. If not, stop and ask the user.

### 2. Version bump

Read current version from `packages/rich-editor/package.json` → `version` field. Default to patch bump (increment the last segment). Run:

```bash
pnpm bumpp --no-git --no-tag < patch_version > -r
```

After bumpp completes, read the new version from `packages/rich-editor/package.json` → `version` field. Store as `$NEW_VERSION`.

### 3. Build & Publish

From the **haklex root used in steps 1–2** (the active workspace), run:

```bash
pnpm build:packages && pnpm -r publish --no-git-checks --filter '@haklex/*' --filter '!@haklex/rich-editor-demo'
```

Do **not** blindly `cd` into a second haklex path (for example a main clone under `innei-repo`) if your bump and commit live in a worktree; publish the tree you versioned.

`build:packages` only builds workspace packages under `packages/`; the dev playground now lives in top-level `demo/` and remains excluded from publish.

If publish fails, stop and report.

### 4. Commit and push the version bump in haklex

Stage and commit all changed `package.json` and `pnpm-lock.yaml` files:

```
release: v$NEW_VERSION
```

Then push to remote:

```bash
git push
```

### 5. Update downstream projects

For each downstream project, update all `@haklex/*` dependency versions to `$NEW_VERSION`:

**Shiroi** — `/Users/innei/git/innei-repo/Shiroi/apps/web/package.json`

- Update `@haklex/rich-editor`, `@haklex/rich-kit-shiro`, `@haklex/rich-static-renderer`

**admin-vue3** — `/Users/innei/git/innei-repo/admin-vue3/package.json`

- Update `@haklex/rich-diff`, `@haklex/rich-ext-nested-doc`, `@haklex/rich-editor`, `@haklex/rich-editor-ui`, `@haklex/rich-kit-shiro`, `@haklex/rich-plugin-toolbar`, `@haklex/rich-style-token`

**mx-core** — `/Users/innei/git/innei-repo/mx-core/apps/core/package.json`

- Update `@haklex/rich-headless`

Use sed or Edit to replace pinned version strings. Match pattern: `"@haklex/<pkg>": "<old_version>"` → `"@haklex/<pkg>": "$NEW_VERSION"`.

### 6. Install in downstream projects

Run `pnpm install` in each downstream project root:

```bash
cd /Users/innei/git/innei-repo/Shiroi && pnpm install
cd /Users/innei/git/innei-repo/admin-vue3 && pnpm install
cd /Users/innei/git/innei-repo/mx-core && pnpm install
```

### 7. Check for new features to integrate

Compare the haklex git log since the previous version tag to identify new exports, new packages, or breaking changes (run from the **same haklex root** as the release):

```bash
git log --oneline HEAD~20..HEAD
```

Scan for:

- New package exports (new entry points in `package.json` exports)
- New renderer/plugin/extension packages that downstream projects might want
- Breaking changes (renamed exports, removed APIs)

If new features are found, ask the user whether to integrate them into specific downstream projects. Do NOT auto-integrate without confirmation.

### 8. Commit and push in downstream projects

For each downstream project, run `git status` after `pnpm install`. **Prefer staging only the dependency bump**, not the entire working tree:

| Project    | Typical files to stage                          |
| ---------- | ----------------------------------------------- |
| Shiroi     | `apps/web/package.json`, root `pnpm-lock.yaml`  |
| admin-vue3 | `package.json`, `pnpm-lock.yaml`                |
| mx-core    | `apps/core/package.json`, root `pnpm-lock.yaml` |

Use explicit paths, for example:

```bash
# Shiroi
cd /Users/innei/git/innei-repo/Shiroi
git add apps/web/package.json pnpm-lock.yaml
git commit -m "chore(deps): bump @haklex/* to $NEW_VERSION"
git push

# admin-vue3
cd /Users/innei/git/innei-repo/admin-vue3
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): bump @haklex/* to $NEW_VERSION"
git push

# mx-core
cd /Users/innei/git/innei-repo/mx-core
git add apps/core/package.json pnpm-lock.yaml
git commit -m "chore(deps): bump @haklex/* to $NEW_VERSION"
git push
```

If `git status` shows **only** those files changed, `git add -A` is equivalent. If there are unrelated edits (WIP, generated noise, other packages), **do not** `git add -A`; keep the commit scoped to the bump. If the tree is dirty for reasons beyond the bump, stop and ask the user whether to commit everything or only the haklex pin updates.

### 9. Summary

Print a table:
| Project | Version | Packages Updated | New Features |
