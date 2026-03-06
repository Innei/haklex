/* eslint-disable unicorn/no-process-exit */
import { readdirSync, readFileSync, statSync } from 'node:fs'

const files = readdirSync('dist/assets').filter((f) => f.endsWith('.js'))

// Find entry chunk from index.html
const html = readFileSync('dist/index.html', 'utf-8')
const entryMatch = html.match(/src="\/assets\/(index-[^"]+\.js)"/)
const entryName = entryMatch ? entryMatch[1] : null
if (!entryName) {
  console.error('Cannot find entry chunk')
  process.exit(1)
}

const entry = readFileSync(`dist/assets/${entryName}`, 'utf-8')
const entrySize = entry.length

const chunks = files
  .map((f) => ({ name: f, size: statSync(`dist/assets/${f}`).size }))
  .sort((a, b) => b.size - a.size)

let totalSize = 0
for (const c of chunks) totalSize += c.size

// lang chunks
let langChunkSize = 0,
  langCount = 0
for (const f of files) {
  if (
    /^[a-z]+-[\w-]+\.js$/.test(f) &&
    !f.startsWith('index') &&
    !f.startsWith('bundle')
  ) {
    const name = f.split('-')[0]
    if (!['mermaid', 'katex', 'treemap', 'cytoscape'].includes(name)) {
      langChunkSize += statSync(`dist/assets/${f}`).size
      langCount++
    }
  }
}

// mermaid
let mermaidSize = 0
for (const f of files) {
  if (
    f.includes('mermaid') ||
    f.includes('Diagram') ||
    f.includes('cytoscape') ||
    f.includes('treemap') ||
    f.includes('cose-bilkent')
  ) {
    mermaidSize += statSync(`dist/assets/${f}`).size
  }
}

// katex
let katexSize = 0
for (const f of files) {
  if (f.startsWith('katex-')) katexSize += statSync(`dist/assets/${f}`).size
}

// wasm (shiki)
let wasmSize = 0
for (const f of files) {
  if (f.includes('wasm')) wasmSize += statSync(`dist/assets/${f}`).size
}

// excalidraw renderers
let excalidrawChunkSize = 0
for (const f of files) {
  if (f.startsWith('Excalidraw') || f.startsWith('useExcalidraw'))
    excalidrawChunkSize += statSync(`dist/assets/${f}`).size
}

console.log('=== ShiroRenderer Bundle 分析 (修复后) ===')
console.log()
console.log(`总计 JS: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)
console.log(`Chunk 数: ${files.length}`)
console.log()
console.log('--- 初始加载（入口 chunk）---')
console.log(`  入口 chunk: ${(entrySize / 1024).toFixed(0)} KB  (${entryName})`)
console.log(
  `  对比修复前: 2167 KB → ${(entrySize / 1024).toFixed(0)} KB (减少 ${(2167 - entrySize / 1024).toFixed(0)} KB)`,
)
console.log()
console.log('--- 动态加载 chunks ---')
console.log(`  Top 5 chunks:`)
for (const c of chunks.slice(0, 5)) {
  console.log(`    ${(c.size / 1024).toFixed(0)} KB  ${c.name}`)
}
console.log(`  Excalidraw renderers: ${(excalidrawChunkSize / 1024).toFixed(0)} KB`)
console.log(
  `  CM 语言 chunks:  ${(langChunkSize / 1024).toFixed(0)} KB (${langCount} chunks)`,
)
console.log(`  Mermaid 相关:    ${(mermaidSize / 1024).toFixed(0)} KB`)
console.log(`  KaTeX:           ${(katexSize / 1024).toFixed(0)} KB`)
console.log(`  Shiki WASM:      ${(wasmSize / 1024).toFixed(0)} KB`)
console.log()

console.log('--- 入口 chunk 重型模块检查 ---')
const checks = [
  ['@codemirror/state', '@codemirror/state'],
  ['@codemirror/view', '@codemirror/view'],
  ['cm-editor', 'cm-editor (CodeMirror CSS)'],
  ['base-ui', '@base-ui/react'],
  ['lucide', 'lucide-react'],
  ['createHeadlessEditor', 'lexical headless editor'],
  ['LexicalComposer', 'LexicalComposer (full editor)'],
  ['ContentEditable', 'ContentEditable'],
  ['presentDialog', 'presentDialog (editor-ui)'],
  ['FloatingToolbar', 'FloatingToolbar'],
  ['SlashMenu', 'SlashMenu'],
  ['shiki', 'shiki'],
  ['react-tweet', 'react-tweet'],
  ['dnd-kit', 'dnd-kit'],
  ['CodeEditorModal', 'CodeEditorModal'],
]

for (const [pattern, label] of checks) {
  const escaped = pattern.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const count = (entry.match(new RegExp(escaped, 'g')) || []).length
  const status = count > 0 ? `IN BUNDLE (${count}x)` : 'CLEAN'
  console.log(`  ${status.padEnd(20)} ${label}`)
}

console.log()
console.log('--- 编辑器相关 Dynamic imports ---')
const dynImports = entry.match(/import\("[^"]+"\)/g) || []
let hasEditorDyn = false
for (const d of dynImports) {
  const lower = d.toLowerCase()
  if (
    lower.includes('edit') ||
    lower.includes('excalidraw') ||
    lower.includes('codemirror') ||
    lower.includes('cm-')
  ) {
    console.log(`  ${d}`)
    hasEditorDyn = true
  }
}
if (!hasEditorDyn) console.log('  (none)')

console.log()
console.log(`总 dynamic imports: ${dynImports.length}`)
