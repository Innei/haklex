# Release Analysis

## Invocation Contract

Do not require caller-supplied release metadata.

| Datum             | Derivation                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------- |
| Changeset summary | `git log --oneline "$LAST"..HEAD` and `git diff --stat "$LAST"..HEAD`                    |
| Affected packages | `git diff --name-only "$LAST"..HEAD`                                                     |
| Release mode      | Default `incremental`; opt into `full` by invocation text or Phase 2 major auto-fallback |

Stop if all are true:

- No publishable `packages/*/src/**` changes.
- No non-`@haklex/*` peer dependency range advanced since `$LAST`.
- No published `@haklex/*` package is behind the local shared source version.

Any one of those triggers is enough to continue.

## Phase 0.5: Mode Detection

| Mode          | Meaning                                                              |
| ------------- | -------------------------------------------------------------------- |
| `incremental` | Publish the tri-directional workspace closure of `CHANGED_PKGS`.     |
| `full`        | Publish every `@haklex/*` package except `@haklex/rich-editor-demo`. |

```bash
if grep -iqE '(^|[^a-z])(full|全量|all)([^a-z]|$)' <<< "$INVOCATION_TEXT"; then
  MODE=full
else
  MODE=incremental
fi
```

Print the selected mode before Phase 1. If Phase 2 later promotes to `full`, print the reason.

## Phase 1: Changed Package Detection

Use [../scripts/release-context.sh](../scripts/release-context.sh) for the mechanical scan.

`CHANGED_PKGS` is the union of:

| Trigger     | Meaning                                                           |
| ----------- | ----------------------------------------------------------------- |
| Source diff | `packages/<pkg>/src/**` changed since `$LAST`.                    |
| Peer drift  | A non-`@haklex/*` `peerDependencies` entry changed since `$LAST`. |
| Catch-up    | Registry version differs from local shared source version.        |

Plain manifest metadata edits, internal `@haklex/*` peer range changes, and lockfile-only changes do not independently trigger a release.

Semver rules for non-source triggers:

| Trigger         | Classification                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| Peer-drift only | `minor`, unless the new range crosses a breaking semver boundary such as `^0.45.0` to `^1.0.0`; then `major`. |
| Catch-up only   | Highest classification from source or peer drift; if pure catch-up, `patch`.                                  |

## Phase 2: Shared Semver Classification

Classify every changed package, then apply the highest bump to the shared version.

| Diff signal                                                                                                         | Bump    |
| ------------------------------------------------------------------------------------------------------------------- | ------- |
| Removed or renamed export, public function signature change, React Context shape change, public theme class removal | `major` |
| New export, optional arg, node type, plugin, additive field, or peer dependency                                     | `minor` |
| Internal refactor, bug fix, style-only change, private helper                                                       | `patch` |

Detect export deltas mechanically:

```bash
diff \
  <(git show "$LAST":packages/ < pkg > /src/index.ts | grep -E '^export' | sort) \
  <(git show HEAD:packages/ < pkg > /src/index.ts | grep -E '^export' | sort)
```

`<` only implies a removal and usually `major`; `>` only implies an additive export and usually `minor`.

If the maximum bump is `major` and `MODE=incremental`, set `MODE=full`.

## Workspace Pinning Reality

| Section                                | Local specifier           | Published behavior | Release implication                                                    |
| -------------------------------------- | ------------------------- | ------------------ | ---------------------------------------------------------------------- |
| `dependencies`, `optionalDependencies` | `workspace:*`             | Exact `X.Y.Z`      | Forward and backward closure are mandatory.                            |
| `peerDependencies`                     | `workspace:^`             | Caret `^X.Y.Z`     | Minor and patch tolerate unchanged siblings; major promotes to `full`. |
| Legacy peer tarballs                   | Older `workspace:*` peers | Exact `X.Y.Z`      | Backward exact-pin closure protects the transition.                    |

The old minor/patch caret reasoning is valid for peers and invalid for `dependencies`. `incremental` therefore always means closure-expanded incremental.

## Phase 3: Peer Dependency Audit

Run [../scripts/peer-audit.sh](../scripts/peer-audit.sh) before bumping.

### Always-Peer Libraries

Any library that creates a React Context or anchors runtime identity must be a peer dependency, not a dependency.

| Library group                                       | Requirement                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------ |
| `react`, `react-dom`                                | Always peer.                                                       |
| `lucide-react`                                      | Always peer; motivated by commit `88bb7a0`.                        |
| `shiki`                                             | Peer; if soft dependency, mark optional in `peerDependenciesMeta`. |
| `@lexical/react`, `lexical`, `@lexical/*`           | Peer floor must be consistent across carriers.                     |
| `@base-ui/react`, `@excalidraw/excalidraw`, `katex` | Always peer when used by a package.                                |

### Internal Peer Specifier Rule

Every internal `@haklex/*` entry in `peerDependencies` must use `workspace:^`, never `workspace:*`.

`dependencies` and `optionalDependencies` keep `workspace:*` because those must publish as exact versions for the install graph to resolve.

### Shared Third-Party Peer Floors

For every non-`@haklex/*` library that appears in multiple package `peerDependencies`, all carriers must declare the same range floor. Divergence is release-blocking.

If divergence exists:

1. Realign every offending peer range to the highest floor.
2. Force every carrier into `PUBLISH_SET`.

There is no safe downstream-only fix for a published haklex sibling set with divergent third-party peer floors.
