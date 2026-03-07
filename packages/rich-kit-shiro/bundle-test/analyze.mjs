import { readFileSync } from 'node:fs';

const content = readFileSync('dist/assets/index-CWYnySad.js', 'utf8');

const editorPatterns = [
  ['ExcalidrawEditRenderer', 'excalidraw edit renderer'],
  ['ExcalidrawDisplayRenderer', 'excalidraw display renderer'],
  ['presentDialog', 'editor-ui dialog'],
  ['FloatingToolbar', 'floating toolbar plugin'],
  ['SlashMenu', 'slash menu plugin'],
  ['BlockHandle', 'block handle plugin'],
  ['LexicalComposer', 'lexical composer (editor)'],
  ['ContentEditable', 'content editable (editor)'],
  ['RichTextPlugin', 'rich text plugin (editor)'],
  ['HistoryPlugin', 'history plugin (editor)'],
  ['CodeSnippetEditNode', 'code snippet edit node'],
  ['EmbedEditNode', 'embed edit node'],
  ['CodeSnippetEditRenderer', 'code snippet edit renderer'],
  ['codemirror', 'codemirror reference'],
  ['cm-editor', 'cm-editor package'],
  ['EditorView', 'codemirror editor view'],
  ['createHeadlessEditor', 'headless editor (static ok)'],
  ['createEditor', 'lexical createEditor'],
  ['react-tweet', 'react-tweet'],
  ['lucide-react', 'lucide icons'],
  ['base-ui', 'base-ui'],
  ['react-intersection-observer', 'intersection observer'],
];

for (const [pattern, label] of editorPatterns) {
  const regex = new RegExp(pattern.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&'), 'g');
  const matches = content.match(regex);
  if (matches) {
    const idx = content.indexOf(matches[0]);
    const ctx = content
      .slice(Math.max(0, idx - 30), Math.min(content.length, idx + 50))
      .replaceAll('\n', ' ');
    console.log(`[FOUND] ${label} (${matches.length}x)`);
    console.log(`  ctx: ...${ctx}...`);
  } else {
    console.log(`[CLEAN] ${label}`);
  }
}

// Check dynamic import chunk names
console.log('\n--- Dynamic imports that reference editor-like chunks ---');
const dynImports = content.match(/import\("[^"]+"\)/g) || [];
for (const d of dynImports) {
  const lower = d.toLowerCase();
  if (
    lower.includes('edit') ||
    lower.includes('excalidraw') ||
    lower.includes('codemirror') ||
    lower.includes('cm-')
  ) {
    console.log(`  ${d}`);
  }
}

// Estimate what's in the entry chunk (not dynamically loaded)
console.log('\n--- Entry chunk size ---');
console.log(`  ${(content.length / 1024).toFixed(1)} KB raw`);
