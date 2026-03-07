import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { compiler, Priority } from 'markdown-to-jsx'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'

import { presets } from '../../../demo/src/fixtures/presets'
import { RichRenderer } from '../src/index'

// ── Config ──────────────────────────────────────────────────────────────────

const ITERATIONS = 100
const WARMUP = 10

// ── Stats helpers ───────────────────────────────────────────────────────────

function median(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function p95(arr: number[]): number {
  const sorted = [...arr].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length * 0.95)]
}

function stats(times: number[]) {
  const avg = times.reduce((s, t) => s + t, 0) / times.length
  const min = Math.min(...times)
  const max = Math.max(...times)
  return { avg, min, max, median: median(times), p95: p95(times) }
}

function fmt(ms: number): string {
  return `${ms.toFixed(2).padStart(8)} ms`
}

function printStats(label: string, times: number[], htmlSize: number) {
  const s = stats(times)
  console.log(`  ${label}`)
  console.log(`    HTML size: ${(htmlSize / 1024).toFixed(1)} KB`)
  console.log(
    `    avg: ${fmt(s.avg)}  median: ${fmt(s.median)}  p95: ${fmt(s.p95)}`,
  )
  console.log(`    min: ${fmt(s.min)}  max:    ${fmt(s.max)}`)
}

// ── Suppress RichRenderer errors for unknown node types ─────────────────────

// Suppress noisy warnings during benchmark (unknown node types, React key warnings)
const origError = console.error

const suppress = (...args: any[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : ''
  if (msg.startsWith('[RichRenderer') || msg.includes('is not a prop')) return
  origError.apply(console, args)
}
console.error = suppress
console.warn = suppress

// ── markdown-to-jsx custom rules (ported from web app, render stubs) ────────

const INLINE_SKIP_R =
  '((?:\\[.*?\\][([].*?[)\\]]|<.*?>(?:.*?<.*?>)?|`.*?`|\\\\\\1|[\\s\\S])+?)'

function simpleInlineRegex(regex: RegExp) {
  const fn: any = (source: string, state: any) => {
    if (state.inline || state.simple) return regex.exec(source)
    return null
  }
  fn.inline = 1
  return fn
}

function blockRegex(regex: RegExp) {
  return (source: string, state: any) => {
    if (state.inline || state.simple) return null
    return regex.exec(source)
  }
}

function allowInline(fn: any) {
  fn.inline = 1
  return fn
}

function parseCaptureInline(capture: any, parse: any, state: any = {}) {
  const isCurrentlyInline = state.inline || false
  const isCurrentlySimple = state.simple || false
  state.inline = true
  state.simple = true
  const result = parse(capture[2], state)
  state.inline = isCurrentlyInline
  state.simple = isCurrentlySimple
  return { children: result }
}

const SpoilerRule = {
  match: simpleInlineRegex(
    new RegExp(
      `^(\\|\\|)((?:\\[.*?\\][([].*?[)\\]]|<.*?>(?:.*?<.*?>)?|\`.*?\`|\\\\\\1|\\|\\|.*?\\|\\||[\\s\\S])+?)\\1`,
    ),
  ),
  order: Priority.LOW,
  parse: parseCaptureInline,
  render(node: any, output: any, state: any) {
    return createElement(
      'span',
      { key: state?.key, className: 'spoiler' },
      output(node.children, state),
    )
  },
}

const MentionRule = {
  match: allowInline((source: string) => {
    return /^(\[(?<displayName>.*?)\])?\{((?<prefix>(GH)|(TW)|(TG))@(?<name>\w+\b))\}\s?(?!\[.*?\])/.exec(
      source,
    )
  }),
  order: Priority.LOW,
  parse(capture: any) {
    return { content: { ...capture.groups } }
  },
  render(result: any, _: any, state: any) {
    const { prefix, name, displayName } = result.content || {}
    if (!name) return null
    return createElement(
      'span',
      { key: state?.key, className: 'mention' },
      `@${displayName || name}`,
    )
  },
}

const InsertRule = {
  match: simpleInlineRegex(new RegExp(`^(\\+\\+)${INLINE_SKIP_R}\\1`)),
  order: Priority.MED,
  parse: parseCaptureInline,
  render(node: any, output: any, state: any) {
    return createElement(
      'ins',
      { key: state?.key },
      output(node.children, state),
    )
  },
}

const KateXRule = {
  match: simpleInlineRegex(new RegExp(`^(\\$)(${INLINE_SKIP_R})\\1`)),
  order: Priority.LOW,
  parse(capture: any) {
    return { type: 'kateX', katex: capture[2] }
  },
  render(node: any, _: any, state: any) {
    return createElement(
      'span',
      { key: state?.key, className: 'katex-inline' },
      node.katex,
    )
  },
}

const KateXBlockRule = {
  match: blockRegex(
    new RegExp(`^\\s*\\$\\$ *(?<content>[\\s\\S]+?)\\s*\\$\\$ *(?:\n *)+\n?`),
  ),
  order: Priority.MED,
  parse(capture: any) {
    return { type: 'kateXBlock', groups: capture.groups }
  },
  render(node: any, _: any, state: any) {
    if (!node.groups) return null
    return createElement(
      'div',
      { key: state?.key, className: 'katex-block' },
      node.groups.content,
    )
  },
}

const shouldCatchContainerName = [
  'gallery',
  'banner',
  'carousel',
  'warn',
  'error',
  'danger',
  'info',
  'success',
  'warning',
  'note',
  'grid',
  'masonry',
].join('|')

const ContainerRule = {
  match: (source: string) => {
    const result =
      /^\s*::: *(?<type>.*?) *(?:\{(?<params>.*?)\} *)?\n(?<content>[\s\S]+?)\s*::: *(?:\n *)+/.exec(
        source,
      )
    if (!result) return null
    const { type } = result.groups!
    if (!type || !type.match(shouldCatchContainerName)) return null
    return result
  },
  order: Priority.MED,
  parse(capture: any) {
    return { node: { ...(capture.groups as any) } }
  },
  render(node: any, _: any, state: any) {
    const { type, content } = node.node
    return createElement(
      'div',
      { key: state?.key, className: `container-${type}` },
      content,
    )
  },
}

// ── Compile markdown-to-jsx with matching parser rules ──────────────────────

function compileMarkdown(md: string): any {
  return compiler(md, {
    wrapper: null,
    doNotProcessHtmlElements: ['tab', 'style', 'script'] as any[],
    overrides: {
      video: (props: any) =>
        createElement('video', { ...props, key: props.key }),
      LinkCard: (props: any) =>
        createElement('div', { key: props.key, className: 'link-card' }),
      Gallery: (props: any) =>
        createElement('div', { key: props.key, className: 'gallery' }),
      Tabs: (props: any) =>
        createElement(
          'div',
          { key: props.key, className: 'tabs' },
          props.children,
        ),
      tab: (props: any) =>
        createElement(
          'div',
          { key: props.key, className: 'tab' },
          props.children,
        ),
      tag: (props: any) =>
        createElement(
          'span',
          { key: props.key, className: 'tag' },
          props.children,
        ),
    },
    extendsRules: {
      spoilder: SpoilerRule,
      mention: MentionRule,
      ins: InsertRule,
      kateX: KateXRule,
      kateXBlock: KateXBlockRule,
      container: ContainerRule,
    },
  } as any)
}

function renderMarkdownToString(md: string): string {
  const elements = compileMarkdown(md)
  return renderToString(createElement('div', null, elements))
}

// ── RichRenderer wrapper ────────────────────────────────────────────────────

function renderRichToString(data: any): string {
  return renderToString(
    createElement(RichRenderer, {
      value: data,
      variant: 'article',
      theme: 'light',
    }),
  )
}

// ── Benchmark runner ────────────────────────────────────────────────────────

function bench(
  label: string,
  fn: () => string,
): { times: number[]; htmlSize: number } {
  // warmup
  for (let i = 0; i < WARMUP; i++) fn()

  const times: number[] = []
  let htmlSize = 0
  for (let i = 0; i < ITERATIONS; i++) {
    const start = performance.now()
    const html = fn()
    times.push(performance.now() - start)
    if (i === 0) htmlSize = Buffer.byteLength(html, 'utf-8')
  }
  return { times, htmlSize }
}

// ── Main ────────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const testingMd = readFileSync(join(__dirname, '../md/testing.md'), 'utf-8')

const markdownTestPreset = presets.find((p) => p.key === 'markdown-test')!

console.log(`Rich Renderer vs markdown-to-jsx Benchmark`)
console.log(`Iterations: ${ITERATIONS} (warmup: ${WARMUP})`)
console.log(`Node: ${process.version}`)
console.log()

// ── Part 1: All presets with RichRenderer ───────────────────────────────────

console.log('═'.repeat(90))
console.log('  PART 1: RichRenderer — all presets')
console.log('═'.repeat(90))

const richAllTimes: number[] = []

for (const preset of presets) {
  const { times, htmlSize } = bench(preset.key, () =>
    renderRichToString(preset.data),
  )
  richAllTimes.push(...times)
  console.log()
  printStats(`${preset.key} (${preset.label})`, times, htmlSize)
}

console.log()
console.log('─'.repeat(90))
console.log('  RichRenderer AGGREGATE')
const richAgg = stats(richAllTimes)
console.log(
  `    avg: ${fmt(richAgg.avg)}  median: ${fmt(richAgg.median)}  p95: ${fmt(richAgg.p95)}`,
)
console.log(`    total samples: ${richAllTimes.length}`)
console.log()

// ── Part 2: Head-to-head comparison (markdown-test content) ─────────────────

console.log('═'.repeat(90))
console.log(
  '  PART 2: Head-to-head — same content (markdown-test / testing.md)',
)
console.log('═'.repeat(90))
console.log()

const richResult = bench('RichRenderer', () =>
  renderRichToString(markdownTestPreset.data),
)
printStats(
  'RichRenderer (Lexical headless → renderToString)',
  richResult.times,
  richResult.htmlSize,
)

console.log()

const mdResult = bench('markdown-to-jsx', () =>
  renderMarkdownToString(testingMd),
)
printStats(
  'markdown-to-jsx (compiler → renderToString)',
  mdResult.times,
  mdResult.htmlSize,
)

console.log()
console.log('─'.repeat(90))

const richMed = median(richResult.times)
const mdMed = median(mdResult.times)
const ratio = mdMed / richMed

console.log(`  Comparison (median):`)
console.log(`    RichRenderer:    ${fmt(richMed)}`)
console.log(`    markdown-to-jsx: ${fmt(mdMed)}`)
if (ratio > 1) {
  console.log(`    → RichRenderer is ${ratio.toFixed(1)}x faster`)
} else {
  console.log(`    → markdown-to-jsx is ${(1 / ratio).toFixed(1)}x faster`)
}
console.log()
