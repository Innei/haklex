#!/usr/bin/env node
/**
 * Extracts { id → displayName } from lobe-chat model-bank and writes
 * packages/rich-agent-chat/src/components/model-display-names.ts
 *
 * Usage:
 *   node scripts/gen-model-names.mjs [path-to-lobe-chat]
 *
 * Defaults to ../lobe-chat relative to this repo root.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const lobeChatRoot = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(repoRoot, '../lobe-chat');

const modelsDir = path.join(lobeChatRoot, 'packages/model-bank/src/aiModels');

const PROVIDERS = [
  'anthropic',
  'openai',
  'google',
  'deepseek',
  'mistral',
  'xai',
  'qwen',
  'groq',
  'perplexity',
  'cohere',
  'togetherai',
  'moonshot',
  'zhipu',
  'minimax',
  'stepfun',
  'hunyuan',
  'spark',
  'volcengine',
  'siliconcloud',
  'nvidia',
  'sambanova',
  'cerebras',
];

const map = {};

for (const p of PROVIDERS) {
  let content;
  try {
    content = readFileSync(path.join(modelsDir, `${p}.ts`), 'utf8');
  } catch {
    continue;
  }

  const blocks = content.split(/\n {2}\{/);
  for (const block of blocks) {
    const typeMatch = block.match(/^\s*type:\s*'([^']+)'/m);
    if (typeMatch && typeMatch[1] !== 'chat') continue;

    const idMatch = block.match(/^\s*id:\s*'([^']+)'/m);
    const dnMatch = block.match(/^\s*displayName:\s*'([^']+)'/m);
    if (!idMatch || !dnMatch || idMatch[1] === dnMatch[1]) continue;

    const id = idMatch[1];
    if (id.includes('/') || id.includes(':')) continue;

    map[id] = dnMatch[1];
  }
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b)));

let ts = '// Auto-generated from lobe-chat model-bank (`@lobechat/model-bank`).\n';
ts += '// To regenerate, run: node scripts/gen-model-names.mjs\n';
ts += 'export const MODEL_DISPLAY_NAMES: Record<string, string> = {\n';
for (const [id, name] of Object.entries(sorted)) {
  ts += `  ${JSON.stringify(id)}: ${JSON.stringify(name)},\n`;
}
ts += '};\n';

const outPath = path.join(
  repoRoot,
  'packages/rich-agent-chat/src/components/model-display-names.ts',
);
writeFileSync(outPath, ts);
console.log(`Wrote ${Object.keys(sorted).length} entries to ${outPath}`);
