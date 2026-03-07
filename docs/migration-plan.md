# haklex migration plan

## Goal

Move the `@haklex` editor ecosystem out of `Shiroi` into `Innei/haklex`, while making the new repository history feel intentional instead of looking like a single bulk import.

## Current facts

- Source repo: `/Users/innei/git/innei-repo/Shiroi`
- Target repo: `/Users/innei/git/innei-repo/haklex`
- GitHub repo: `https://github.com/Innei/haklex`
- Current visibility: `PRIVATE`
- `rich-editor` related history spans both `packages/` and `haklex/`
- The path migration happened in commit `b29bac71` on `2026-03-02`
- `rich-editor` related history count is roughly `130` commits
- `haklex` ecosystem related history count is roughly `195` commits
- The source working tree currently has local modifications, so extraction should run in a clean clone or worktree

## Recommended scope

### Phase 1: core packages

These packages should move first because they define the editor foundation and are tightly coupled:

- `rich-style-token`
- `rich-editor-ui`
- `rich-headless`
- `rich-editor`

### Phase 2: editor runtime packages

These packages are closely related to the actual editing experience and usually belong in the same repo:

- `cm-editor`
- `rich-plugin-toolbar`
- `rich-plugin-slash-menu`
- `rich-plugin-link-edit`
- `rich-plugin-table`
- `rich-plugin-mention`
- `rich-plugin-floating-toolbar`
- `rich-plugin-block-handle`
- `rich-static-renderer`
- `rich-renderer-*`
- `rich-ext-*`

### Phase 3: optional packages

These can be migrated later or kept separate if you want a leaner repo:

- `rich-kit-shiro`
- `rich-editor-demo`
- `rich-diff`

## Recommended history strategy

Use two branches instead of trying to solve everything in one pass.

### Branch A: `raw-history`

Purpose: preserve provenance.

- Keep as much original author/date/message information as possible
- Import all relevant paths from both `packages/*` and `haklex/*`
- Allow mechanical version bump commits to exist here
- This branch is the audit trail and rollback source

### Branch B: `main`

Purpose: present a cleaner project history.

- Replay only meaningful commits from `raw-history`
- Keep `feat`, `fix`, `refactor`, and structural `chore` commits
- Drop or squash repetitive version bump commits
- Keep milestone commits that show real product evolution
- Rewrite path layout so the new repo looks native from day one

This gives us both authenticity and readability.

## Why not direct subtree split

A direct `git subtree split --prefix=haklex` is not enough because the older history lives under `packages/` before `2026-03-02`.

If we only split `haklex/`, the earlier editor history is lost.

## Extraction approach

### Step 1: create a clean extraction workspace

Use a temporary clone or worktree from `Shiroi`, not the current working tree.

Suggested temp path:

- `/Users/innei/git/innei-repo/.tmp-haklex-extract`

### Step 2: build the path map

We need one normalized target layout in the new repo.

Examples:

- `packages/rich-editor` -> `packages/rich-editor`
- `haklex/rich-editor` -> `packages/rich-editor`
- `packages/rich-editor-ui` -> `packages/rich-editor-ui`
- `haklex/rich-editor-ui` -> `packages/rich-editor-ui`

The same rule applies to the rest of the selected packages.

## Commit selection rules

### Keep directly

- package initialization
- new editor capabilities
- renderer and plugin additions
- node model changes
- meaningful refactors
- real fixes
- repository extraction or package renames

### Squash or drop

- pure version bump commits
- pure dependency bump commits with no behavior change
- noisy release tagging commits

### Review manually

- mixed commits touching editor code and unrelated app code
- commits that moved files and changed behavior at the same time
- commits where demo-only changes dominate the diff

## Initial milestone commits worth keeping on `main`

These are strong candidates for the curated history:

- `6574b7d1` `2026-02-09` init rich editor package
- `b923ca3c` `2026-02-09` custom renderer configuration and context
- `614132fa` `2026-02-10` Mermaid and slash menu support
- `1c1c6263` `2026-02-12` alert and code block enhancements
- `1a4a6855` `2026-02-16` edit/render node separation
- `379e0d20` `2026-02-16` table plugin and horizontal rule node
- `ad3d4b3c` `2026-02-20` footnote redesign
- `0290520a` `2026-03-01` LinkFavicon support
- `568fe9d8` `2026-03-02` horizontal rule plugin and link card demo
- `68d2af23` `2026-03-04` toolbar plugin and command registry
- `1ce5642d` `2026-03-07` NestedDoc node integration
- `36315e72` `2026-03-07` NestedDoc functionality integration

## Proposed execution order

1. Import exact history into `raw-history`
2. Validate that all selected packages are present and installable
3. Build a curated commit list from `raw-history`
4. Replay curated commits onto `main`
5. Add repo-level docs and release workflow after history is stable
6. Switch repository visibility to public when content is ready

## Validation after import

At minimum, verify:

- `pnpm install`
- package graph resolves with workspace dependencies
- selected packages build successfully
- at least one demo or smoke app can render the editor

## Notes for the next pass

- Keep the GitHub repo private until the curated history looks good
- Avoid touching the current dirty `Shiroi` worktree during extraction
- Prefer scripting the replay instead of doing manual cherry-picks
- Native `git filter-repo` is not currently installed, so replay scripting is likely the most controllable route
