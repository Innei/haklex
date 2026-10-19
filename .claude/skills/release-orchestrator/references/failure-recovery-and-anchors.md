# Failure Recovery and Anchors

## Phase 8a: Failure Handling

On `Release` workflow, downstream install, typecheck, build, E2E, or duplicate-runtime failure:

1. Stop release progression immediately.
2. Preserve the current filesystem and git state for inspection.
3. Report the failing package, command, exit status, and most relevant output.
4. Classify the failure.
5. Ask before any recovery action that would remove commits, delete tags, delete GitHub releases, unpublish npm packages, remove worktrees, or alter branch history.

Do not use destructive reset, restore, checkout, or force-removal workflows to hide a failed state.

## Failure Classification

| Failure                             | Likely cause                                                            | Next action                                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Release` run fails before publish  | Typecheck/test/build failure on the tagged commit                       | Fix forward on `main`, then cut a new patch release. Ask before deleting the tag.                                            |
| `Release` run fails during publish  | OIDC refused, npm outage, missing trusted publisher                     | Fix the cause (`trust-setup.sh` for a new package), then `gh run rerun <id> --failed`; publish skips what is already on npm. |
| `wait` step timeout                 | npm post-publish review delay                                           | Re-run the failed job; it resumes polling.                                                                                   |
| CLI smoke failure                   | Missing compose dist asset, stale CLI dependency range, missing shebang | Inspect published tarball and local build output.                                                                            |
| Typecheck failure                   | Breaking API change not reflected in semver or downstream adaptation    | Revisit Phase 2 and affected public API.                                                                                     |
| Build failure                       | Missing export, peer dependency issue, circular workspace edge          | Inspect package graph and build logs.                                                                                        |
| Duplicate-runtime invariant failure | Downstream direct pin still floors an old runtime                       | Recompute peer drift and downstream peer reconciliation.                                                                     |
| E2E failure                         | Runtime regression                                                      | Correlate with Phase 2 diff hunks and smoke route.                                                                           |

## Public Artefacts

| Artefact           | Rule                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------ |
| GitHub release     | Required. If already published and failure occurs, ask before deleting it.                                         |
| Git tag            | Ask before deleting local or remote tags.                                                                          |
| npm package        | Ask before `npm unpublish`. npm unpublish is public, time-limited, and should normally be replaced by a new patch. |
| Downstream commits | If already pushed, treat as consumed unless user confirms otherwise.                                               |

## Final Summary

Print a compact table:

| Repo    | Branch      | Commit SHA | Bump                  | Published                 | Tests                      |
| ------- | ----------- | ---------- | --------------------- | ------------------------- | -------------------------- |
| haklex  | `main`      | `<sha>`    | `<patch/minor/major>` | `<n>/<n>` (CI run `<id>`) | `Release` workflow         |
| Yohaku  | `<default>` | `<sha>`    | `-`                   | `<pins bumped>`           | `typecheck / build / e2e`  |
| mx-core | `<default>` | `<sha>`    | `-`                   | `<pins bumped>`           | `typecheck / build / e2e`  |
| ryugi   | `main`      | `<sha>`    | `<ryugi version>`     | `<pins bumped>`           | `typecheck / test / build` |

Then print the live GitHub release URL:

```text
Release published: https://github.com/Innei/haklex/releases/tag/v$NEW_VERSION
```

## Common Mistakes

| Mistake                                      | Correction                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| Asking the caller for release metadata       | Infer from `git log`, `git diff`, manifests, and registry state.        |
| Publishing a subset of packages              | Every release is full; CI publishes every public package.               |
| Publishing from the laptop                   | Only the `Release` workflow publishes. Locally: bump, tag, push, watch. |
| Starting downstream before CI is green       | Wait for `watch-release.sh` to exit 0.                                  |
| Ignoring third-party peer-floor drift        | Audit sibling peer ranges and reconcile downstream direct pins.         |
| Tag message headings vanish                  | `git tag -a --cleanup=verbatim`; default cleanup strips `#` lines.      |
| Trusting typecheck/build to catch duplicates | Run the explicit duplicate-runtime invariant.                           |
| Opening downstream PRs by default            | Push direct to downstream default branch after validation.              |
| Guessing downstream branch names             | Derive from `origin/HEAD`.                                              |
| Using destructive recovery commands          | Preserve state and ask.                                                 |

## Stop and Ask

- Haklex worktree is dirty before mutation.
- No releasable trigger exists.
- The `Release` run fails or is cancelled.
- User asks to skip peer audit.
- `gh auth status` fails.
- Tag `v$NEW_VERSION` already exists on origin.
- Downstream default branch cannot be derived.
- Downstream rebase conflicts.
- Direct push is blocked.
- Any user-owned uncommitted change would be overwritten.
- Any public artefact rollback is required.

## Real-World Anchors

| Anchor             | Lesson                                                                                                                                                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `88bb7a0`          | `rich-agent-chat` imported `lucide-react` transitively through `streamdown` but did not declare it as a peer; duplicate `IconContext` caused silent rendering failure.                                                                                                                     |
| `0.0.106..0.0.108` | Pure patch cadence; first minor or major under this orchestrator deserves extra scrutiny.                                                                                                                                                                                                  |
| `v0.21.0`          | Forward closure miss: unpublished exact workspace dependencies caused `ERR_PNPM_NO_MATCHING_VERSION`.                                                                                                                                                                                      |
| `v0.26.3`          | Backward peer closure miss: stale exact peer pins installed duplicate `@haklex/rich-editor` and duplicate Lexical runtimes.                                                                                                                                                                |
| `v0.26.6`          | Backward dependency closure miss: `rich-compose` exact dependencies stranded old renderer/style-token pins; incremental converged to full.                                                                                                                                                 |
| `v0.50.0`          | Last laptop-published release. Incremental closure already covered all 44 packages, and npm review serialised the publish loop (~2 min per package). Releases are full and CI-published from here on. Same release: a lagging `yohaku-oss` pin installed two `@haklex/rich-editor` copies. |
| `v0.29.0`          | Third-party peer-floor drift: stranded plugins and downstream direct `lexical` / `@lexical/*` pins installed Lexical 0.45 and 0.46 together.                                                                                                                                               |

## v0.29.0 Specific Corrections

| Correction                | Requirement                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Registry peer aggregation | Treat empty `npm view ... peerDependencies --json` output as `{}` and ignore null/non-object entries. |
| Downstream dispatch       | Emit one concrete row per manifest/section/lib rewrite; every row requires an edit.                   |
| Runtime assertion         | Use `pnpm ls "$lib" -r --depth Infinity --json` and read versions from object keys, not `.name`.      |
| Manifest enumeration      | Use `grep -lrn '"@haklex/' ... --include=package.json`; do not rely on `**` globstar behavior.        |
| Commit proof              | Include single-version evidence in downstream commit footer.                                          |
