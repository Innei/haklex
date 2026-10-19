# Publish Pipeline

Publishing runs in GitHub Actions only. Locally, the skill bumps, gates, tags, pushes, and watches.

## Phase 4: Bump, Local Gate, Tag

```bash
LEVEL=minor # patch | minor | major, from Phase 2
pnpm bumpp -r "$LEVEL" --no-git --no-tag --yes
NEW_VERSION=$(jq -r .version packages/rich-editor/package.json)
node scripts/release/publish.mjs check "v$NEW_VERSION"
pnpm run build:packages
```

The local build is a cheap gate so a broken tag never reaches CI; CI rebuilds from scratch.

Write the release notes (summary, breaking changes, features, bug fixes, bump rationale) into the tag message. CI turns the tag body into the GitHub release notes, so the first line is the subject and the notes start after a blank line:

```bash
TAG_MSG=$(mktemp)
{
  printf 'release: v%s\n\n' "$NEW_VERSION"
  cat "$NOTE"
} > "$TAG_MSG"

git add packages/*/package.json pnpm-lock.yaml
git commit -m "release: v$NEW_VERSION"
git tag -a "v$NEW_VERSION" --cleanup=verbatim -F "$TAG_MSG"
```

`--cleanup=verbatim` is required: the default cleanup strips every line starting with `#`, which deletes Markdown headings from the notes.

## Phase 5: Push and Watch CI

Push the commit and the tag in one atomic operation, so `main` never carries a release commit without its tag (or the reverse):

```bash
git push --atomic origin main "v$NEW_VERSION"
./.claude/skills/release-orchestrator/scripts/watch-release.sh "v$NEW_VERSION"
```

`watch-release.sh`:

1. Waits for the `Release` workflow run whose `headBranch` is the tag (up to 2 minutes for it to appear).
2. Streams it with `gh run watch --exit-status`.
3. On success, re-checks that every package in `publish.mjs list` resolves at `$NEW_VERSION` and that the GitHub release exists.

Expect 10–30 minutes: npm's post-publish review can hold each version for a few minutes, and the workflow's `wait` step absorbs that.

Do not start downstream work until the script exits 0.

## What the Workflow Guarantees

| Step                     | Guarantee                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `publish.mjs check`      | All public packages share the version; the tag equals it.                                        |
| typecheck / test / build | Same gates as `ci.yml`, on the tagged commit.                                                    |
| `publish.mjs publish`    | Leaf-first `pnpm pack` + `npm publish` via OIDC trusted publishing, with provenance. Idempotent. |
| `publish.mjs wait 90`    | Every package resolvable from npm before the job continues.                                      |
| CLI smoke                | `@haklex/rich-litexml-cli@$NEW_VERSION` runs and emits a paragraph.                              |
| GitHub release           | Created from the tag body, `--verify-tag`; skipped if it already exists.                         |

`pnpm pack` rewrites `workspace:*` / `workspace:^` specifiers and applies `publishConfig`; `npm publish <tarball>` performs the trusted-publishing token exchange. Publishing the tarball with npm instead of `pnpm publish` keeps the OIDC path on npm's own implementation.

## Trusted Publishing Setup

Each package must list `Innei/haklex` + `release.yml` as its trusted publisher on npmjs.com. `scripts/release/trust-setup.sh` registers every package in one interactive run (npm ≥ 11.15, account 2FA; choose "skip 2FA for 5 minutes" on the first prompt). It skips packages that are already configured.

Trusted publishing cannot create a package. A new `@haklex/*` package needs its first version published by hand, then `trust-setup.sh`, before the next tag.
