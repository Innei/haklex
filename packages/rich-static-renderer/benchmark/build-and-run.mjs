#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { unlinkSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname,join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..', '..', '..')
const outfile = join(__dirname, '_bench_compiled.mjs')

const req = createRequire(join(root, 'node_modules/.pnpm/node_modules/esbuild/package.json'))
const esbuild = req('esbuild')

await esbuild.build({
  entryPoints: [join(__dirname, 'run.tsx')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  jsx: 'automatic',
  jsxImportSource: 'react',
  outfile,
  external: [
    'react',
    'react-dom',
    'react-dom/*',
    'react/*',
    'lexical',
    '@lexical/*',
  ],
  banner: {
    js: 'import{createRequire as $$cr}from"module";const require=$$cr(import.meta.url);',
  },
  alias: {
    '@vanilla-extract/css': join(__dirname, 've-stub.mjs'),
  },
  logLevel: 'warning',
})

try {
  execSync(`node ${outfile}`, { stdio: 'inherit', cwd: root })
} finally {
  try { unlinkSync(outfile) } catch {}
}
