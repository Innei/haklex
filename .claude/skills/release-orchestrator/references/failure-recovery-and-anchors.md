# Failure Recovery and Anchors

## Phase 8a: Failure Handling

On publish, CLI smoke, downstream install, typecheck, build, E2E, or duplicate-runtime failure:

1. Stop release progression immediately.
2. Preserve the current filesystem and git state for inspection.
3. Report the failing package, command, exit status, and most relevant output.
4. Classify the failure.
5. Ask before any recovery action that would remove commits, delete tags, delete GitHub releases, unpublish npm packages, remove worktrees, or alter branch history.

Do not use destructive reset, restore, checkout, or force-removal workflows to hide a failed state.

## Failure Classification

| Failure                             | Likely cause                                                            | Next action                                                            |
| ----------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Registry poll timeout               | npm propagation delay or failed publish                                 | Verify package page and retry poll before proceeding.                  |
| CLI smoke failure                   | Missing compose dist asset, stale CLI dependency range, missing shebang | Inspect published tarball and local build output.                      |
| Typecheck failure                   | Breaking API change not reflected in semver or downstream adaptation    | Revisit Phase 2 and affected public API.                               |
| Build failure                       | Missing export, peer dependency issue, circular workspace edge          | Inspect package graph and build logs.                                  |
| Duplicate-runtime invariant failure | Stranded sibling or downstream direct pin still floors old runtime      | Recompute peer drift, publish set, and downstream peer reconciliation. |
| E2E failure                         | Runtime regression                                                      | Correlate with Phase 2 diff hunks and smoke route.                     |

## Public Artefacts

| Artefact           | Rule                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| GitHub release     | Required. If already published and failure occurs, ask before deleting it.                                         |
| Git tag            | Ask before deleting local or remote tags.                                                                          |
| npm package        | Ask before `npm unpublish`. npm unpublish is public, time-limited, and should normally be replaced by a new patch. |
| Downstream commits | If already pushed, treat as consumed unless user confirms otherwise.                                               |

## Final Summary

Print a compact table:

| Repo    | Branch      | Commit SHA | Bump                  | Published       | Tests                     |
| ------- | ----------- | ---------- | --------------------- | --------------- | ------------------------- |
| haklex  | `main`      | `<sha>`    | `<patch/minor/major>` | `<n>/<total>`   | `build:packages`          |
| Yohaku  | `<default>` | `<sha>`    | `-`                   | `<pins bumped>` | `typecheck / build / e2e` |
| mx-core | `<default>` | `<sha>`    | `-`                   | `<pins bumped>` | `typecheck / build / e2e` |

Then print the live GitHub release URL:

```text
Release published: https://github.com/Innei/haklex/releases/tag/v$NEW_VERSION
```

## Common Mistakes

| Mistake                                      | Correction                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Asking the caller for release metadata       | Infer from `git log`, `git diff`, manifests, and registry state.                                |
| Equating `PUBLISH_SET` with `CHANGED_PKGS`   | `incremental` means closure-expanded incremental.                                               |
| Restricting backward closure to peers        | Scan `dependencies`, `optionalDependencies`, and `peerDependencies`.                            |
| Ignoring third-party peer-floor drift        | Audit sibling peer ranges, include carriers in `PUBLISH_SET`, reconcile downstream direct pins. |
| Trusting typecheck/build to catch duplicates | Run the explicit duplicate-runtime invariant.                                                   |
| Repinning unpublished downstream packages    | Rewrite only packages in `PUBLISH_SET`.                                                         |
| Running `pnpm run release:rich`              | Use explicit bump, build, publish, and registry-poll phases.                                    |
| Opening downstream PRs by default            | Push direct to downstream default branch after validation.                                      |
| Guessing downstream branch names             | Derive from `origin/HEAD`.                                                                      |
| Publishing GitHub release as draft           | Publish directly with `--verify-tag`.                                                           |
| Skipping CLI smoke                           | Smoke when CLI or compose is in `PUBLISH_SET`.                                                  |
| Using destructive recovery commands          | Preserve state and ask.                                                                         |

## Stop and Ask

- Haklex worktree is dirty before mutation.
- No releasable trigger exists.
- `MODE=incremental` and `CHANGED_PKGS` is empty.
- Registry poll exceeds the release window.
- User asks to skip peer audit.
- `gh auth status` fails.
- A GitHub release for `v$NEW_VERSION` already exists.
- Downstream default branch cannot be derived.
- Downstream rebase conflicts.
- Direct push is blocked.
- Any user-owned uncommitted change would be overwritten.
- Any public artefact rollback is required.

## Real-World Anchors

| Anchor             | Lesson                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `88bb7a0`          | `rich-agent-chat` imported `lucide-react` transitively through `streamdown` but did not declare it as a peer; duplicate `IconContext` caused silent rendering failure. |
| `0.0.106..0.0.108` | Pure patch cadence; first minor or major under this orchestrator deserves extra scrutiny.                                                                              |
| `v0.21.0`          | Forward closure miss: unpublished exact workspace dependencies caused `ERR_PNPM_NO_MATCHING_VERSION`.                                                                  |
| `v0.26.3`          | Backward peer closure miss: stale exact peer pins installed duplicate `@haklex/rich-editor` and duplicate Lexical runtimes.                                            |
| `v0.26.6`          | Backward dependency closure miss: `rich-compose` exact dependencies stranded old renderer/style-token pins; incremental converged to full.                             |
| `v0.29.0`          | Third-party peer-floor drift: stranded plugins and downstream direct `lexical` / `@lexical/*` pins installed Lexical 0.45 and 0.46 together.                           |

## v0.29.0 Specific Corrections

| Correction                | Requirement                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Registry peer aggregation | Treat empty `npm view ... peerDependencies --json` output as `{}` and ignore null/non-object entries. |
| Downstream dispatch       | Emit one concrete row per manifest/section/lib rewrite; every row requires an edit.                   |
| Runtime assertion         | Use `pnpm ls "$lib" -r --depth Infinity --json` and read versions from object keys, not `.name`.      |
| Manifest enumeration      | Use `grep -lrn '"@haklex/' ... --include=package.json`; do not rely on `**` globstar behavior.        |
| Commit proof              | Include single-version evidence in downstream commit footer.                                          |
