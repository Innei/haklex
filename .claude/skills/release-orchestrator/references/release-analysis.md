# Release Analysis

## Invocation Contract

Do not require caller-supplied release metadata.

| Datum             | Derivation                                                            |
| ----------------- | --------------------------------------------------------------------- |
| Changeset summary | `git log --oneline "$LAST"..HEAD` and `git diff --stat "$LAST"..HEAD` |
| Affected packages | `git diff --name-only "$LAST"..HEAD`                                  |
| Publish set       | Always every public `@haklex/*` package (`publish.mjs list`)          |

Every release is full. Affected packages only feed the semver classification and the release notes; they never narrow what gets published.

## Phase 1: Pre-Flight and Triggers

```bash
git switch main
git fetch origin
test -z "$(git status --porcelain)"
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
LAST=$(git log --grep='^release: v' -n1 --format=%H)
./.claude/skills/release-orchestrator/scripts/release-context.sh "$LAST"
```

Continue if either trigger fires:

| Trigger     | Meaning                                                           |
| ----------- | ----------------------------------------------------------------- |
| Source diff | `packages/<pkg>/src/**` changed since `$LAST`.                    |
| Peer drift  | A non-`@haklex/*` `peerDependencies` entry changed since `$LAST`. |

Plain manifest metadata edits, internal `@haklex/*` peer range changes, and lockfile-only changes do not independently trigger a release.

A previous tag whose `Release` run failed part-way is not a new release: re-run that workflow (`gh run rerun <id> --failed`). `publish.mjs publish` skips versions already on npm.

## Phase 2: Shared Semver Classification

Classify every changed package, then apply the highest bump to the shared version.

| Diff signal                                                                                                         | Bump    |
| ------------------------------------------------------------------------------------------------------------------- | ------- |
| Removed or renamed export, public function signature change, React Context shape change, public theme class removal | `major` |
| New export, optional arg, node type, plugin, additive field, or peer dependency                                     | `minor` |
| Internal refactor, bug fix, style-only change, private helper                                                       | `patch` |

Non-source triggers:

| Trigger         | Classification                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| Peer-drift only | `minor`, unless the new range crosses a breaking semver boundary such as `^0.45.0` to `^1.0.0`; then `major`. |

Detect export deltas mechanically:

```bash
diff \
  <(git show "$LAST":packages/ < pkg > /src/index.ts | grep -E '^export' | sort) \
  <(git show HEAD:packages/ < pkg > /src/index.ts | grep -E '^export' | sort)
```

`<` only implies a removal and usually `major`; `>` only implies an additive export and usually `minor`. Check every entry file a package exports (`static.ts`, `*-entry.ts`), not only `index.ts`.

## Phase 3: Peer Dependency Audit

Run [../scripts/peer-audit.sh](../scripts/peer-audit.sh) before bumping. A non-zero exit is release-blocking.

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

Every internal `@haklex/*` entry in `peerDependencies` must use `workspace:^`, never `workspace:*`. `dependencies` and `optionalDependencies` keep `workspace:*` so they publish as exact versions.

### Shared Third-Party Peer Floors

For every non-`@haklex/*` library that appears in multiple package `peerDependencies`, all carriers must declare the same range floor. Divergence is release-blocking: realign every offending range to the highest floor before bumping.
