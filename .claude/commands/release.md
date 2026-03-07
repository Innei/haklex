Release @haklex/* packages and update all downstream consumers.

## Steps

### 1. Pre-flight checks

Run `git status` in haklex repo. Ensure working tree is clean or all changes are committed. If not, stop and ask the user.

### 2. Version bump

Read current version from `packages/rich-editor/package.json` → `version` field. Default to patch bump (increment the last segment). Run:
```bash
pnpm bumpp <patch_version> -r --no-git --no-tag
```

After bumpp completes, read the new version from `packages/rich-editor/package.json` → `version` field. Store as `$NEW_VERSION`.

### 3. Build & Publish

```bash
cd /Users/innei/git/innei-repo/haklex && pnpm build:packages && pnpm -r publish --no-git-checks --filter '@haklex/*' --filter '!@haklex/rich-editor-demo'
```

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

Compare the haklex git log since the previous version tag to identify new exports, new packages, or breaking changes:
```bash
cd /Users/innei/git/innei-repo/haklex && git log --oneline HEAD~20..HEAD
```

Scan for:
- New package exports (new entry points in `package.json` exports)
- New renderer/plugin/extension packages that downstream projects might want
- Breaking changes (renamed exports, removed APIs)

If new features are found, ask the user whether to integrate them into specific downstream projects. Do NOT auto-integrate without confirmation.

### 8. Commit and push in downstream projects

For each downstream project with changes, stage, commit, and push immediately:
```bash
# Shiroi
cd /Users/innei/git/innei-repo/Shiroi && git add -A && git commit -m "chore(deps): bump @haklex/* to $NEW_VERSION" && git push

# admin-vue3
cd /Users/innei/git/innei-repo/admin-vue3 && git add -A && git commit -m "chore(deps): bump @haklex/* to $NEW_VERSION" && git push

# mx-core
cd /Users/innei/git/innei-repo/mx-core && git add -A && git commit -m "chore(deps): bump @haklex/* to $NEW_VERSION" && git push
```

### 9. Summary

Print a table:
| Project | Version | Packages Updated | New Features |
