#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

function parseArgs(argv) {
  const options = {
    aliases: 'scripts/history/package-aliases.json',
    dryRun: false,
    fromId: undefined,
    limit: undefined,
    sourceRepo: '/Users/innei/git/innei-repo/Shiroi',
    spec: 'scripts/history/curated-commits.json',
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--source-repo') {
      options.sourceRepo = argv[index + 1]
      index += 1
      continue
    }

    if (arg === '--spec') {
      options.spec = argv[index + 1]
      index += 1
      continue
    }

    if (arg === '--aliases') {
      options.aliases = argv[index + 1]
      index += 1
      continue
    }

    if (arg === '--limit') {
      options.limit = Number(argv[index + 1])
      index += 1
      continue
    }

    if (arg === '--from-id') {
      options.fromId = argv[index + 1]
      index += 1
      continue
    }
  }

  return options
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trim()
}

function runOk(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'ignore',
    ...options,
  })
  return result.status === 0
}

function git(sourceRepo, args) {
  return run('git', args, { cwd: sourceRepo })
}

function gitOk(sourceRepo, args) {
  return runOk('git', args, { cwd: sourceRepo })
}

function loadJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function resolvePackagePath(sourceRepo, sourceCommit, packageName, aliases) {
  const candidates = aliases[packageName] ?? [
    `haklex/${packageName}`,
    `packages/${packageName}`,
  ]

  for (const candidate of candidates) {
    if (gitOk(sourceRepo, ['cat-file', '-e', `${sourceCommit}:${candidate}`])) {
      return candidate
    }
  }

  throw new Error(`Unable to resolve package \`${packageName}\` at commit \`${sourceCommit}\``)
}

function resolveSourcePath(sourceRepo, sourceCommit, sourcePath) {
  if (gitOk(sourceRepo, ['cat-file', '-e', `${sourceCommit}:${sourcePath}`])) {
    return sourcePath
  }

  throw new Error(`Unable to resolve source path \`${sourcePath}\` at commit \`${sourceCommit}\``)
}

function extractSourcePath(sourceRepo, sourceCommit, sourcePath, tempRoot) {
  const result = spawnSync(
    'sh',
    [
      '-c',
      'git archive --format=tar "$SOURCE_COMMIT" "$SOURCE_PATH" | tar -xf - -C "$TEMP_ROOT"',
    ],
    {
      cwd: sourceRepo,
      env: {
        ...process.env,
        SOURCE_COMMIT: sourceCommit,
        SOURCE_PATH: sourcePath,
        TEMP_ROOT: tempRoot,
      },
      stdio: ['ignore', 'ignore', 'pipe'],
    },
  )

  if (result.status !== 0) {
    const stderr = result.stderr?.toString('utf8').trim()
    throw new Error(stderr || `Failed to extract ${sourcePath} from ${sourceCommit}`)
  }
}

function syncDirectory(sourcePath, targetPath) {
  rmSync(targetPath, { force: true, recursive: true })
  mkdirSync(path.dirname(targetPath), { recursive: true })
  cpSync(sourcePath, targetPath, { force: true, recursive: true })
}

function getAuthorInfo(sourceRepo, sourceCommit) {
  const output = git(sourceRepo, ['show', '-s', '--format=%an%n%ae%n%aI', sourceCommit])
  const [name, email, date] = output.split('\n')
  return { author: `${name} <${email}>`, date }
}

function stagePaths(targetRepo, targetPaths) {
  const roots = [...new Set(
    targetPaths
      .map((targetPath) => path.relative(targetRepo, targetPath))
      .map((relativePath) => relativePath.split(path.sep)[0])
      .filter(Boolean),
  )]

  run('git', ['add', '-A', '--', ...roots], { cwd: targetRepo })
}

function hasStagedChanges(targetRepo) {
  return !runOk('git', ['diff', '--cached', '--quiet'], { cwd: targetRepo })
}

function commitAll(targetRepo, message, authorInfo) {
  run('git', ['commit', '-m', message, '--author', authorInfo.author], {
    cwd: targetRepo,
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: authorInfo.date,
      GIT_COMMITTER_DATE: authorInfo.date,
    },
  })
}

const options = parseArgs(process.argv.slice(2))
const targetRepo = run('git', ['rev-parse', '--show-toplevel'], { cwd: process.cwd() })
const specPath = path.resolve(targetRepo, options.spec)
const aliasesPath = path.resolve(targetRepo, options.aliases)
const aliases = loadJson(aliasesPath)
const steps = loadJson(specPath)
const limitedSteps = Number.isFinite(options.limit) ? steps.slice(0, options.limit) : steps
const startIndex = options.fromId
  ? limitedSteps.findIndex((step) => step.id === options.fromId)
  : 0

if (startIndex === -1) {
  throw new Error(`Unknown step id: ${options.fromId}`)
}

const selectedSteps = limitedSteps.slice(startIndex)

for (const step of selectedSteps) {
  const authorInfo = getAuthorInfo(options.sourceRepo, step.sourceCommit)
  const packagePlan = (step.packages ?? []).map((packageName) => {
    const sourcePath = resolvePackagePath(options.sourceRepo, step.sourceCommit, packageName, aliases)
    return {
      packageName,
      sourcePath,
      targetPath: path.join(targetRepo, 'packages', packageName),
    }
  })
  const pathPlan = (step.paths ?? []).map((entry) => {
    const sourcePath = resolveSourcePath(options.sourceRepo, step.sourceCommit, entry.source)
    const target = entry.target ?? entry.source
    return {
      packageName: entry.id ?? target,
      sourcePath,
      targetPath: path.join(targetRepo, target),
    }
  })
  const copyPlan = [...packagePlan, ...pathPlan]
  const deletePaths = (step.deletePaths ?? []).map((target) => path.join(targetRepo, target))

  console.log(`\n[${step.id}] ${step.message}`)
  console.log(`  source: ${step.sourceCommit}`)
  for (const pkg of copyPlan) {
    console.log(`  - ${pkg.sourcePath} -> ${path.relative(targetRepo, pkg.targetPath)}`)
  }
  for (const target of deletePaths) {
    console.log(`  - delete ${path.relative(targetRepo, target)}`)
  }

  if (options.dryRun) {
    continue
  }

  const tempRoot = mkdtempSync(path.join(tmpdir(), 'haklex-replay-'))

  try {
    for (const pkg of copyPlan) {
      extractSourcePath(options.sourceRepo, step.sourceCommit, pkg.sourcePath, tempRoot)

      const extractedPath = path.join(tempRoot, pkg.sourcePath)
      if (!existsSync(extractedPath)) {
        throw new Error(`Expected extracted path missing: ${pkg.sourcePath}`)
      }

      syncDirectory(extractedPath, pkg.targetPath)
    }

    for (const deletePath of deletePaths) {
      rmSync(deletePath, { force: true, recursive: true })
    }

    stagePaths(
      targetRepo,
      [...copyPlan.map((item) => item.targetPath), ...deletePaths],
    )
    if (!hasStagedChanges(targetRepo)) {
      console.log('  no staged changes, skipping commit')
      continue
    }

    commitAll(targetRepo, step.message, authorInfo)
  } finally {
    rmSync(tempRoot, { force: true, recursive: true })
  }
}
