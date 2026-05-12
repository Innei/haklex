// Post-build CSS aggregator for @haklex/rich-compose.
//
// After `vite build` emits `dist/rich-compose.css` (rich-compose's own
// vanilla-extract output: foundation tokens + variant classes + built-in
// table renderer), this script:
//
//   1. Splits `rich-compose.css` into `dist/style/foundation.css` and
//      `dist/style/table.css`.
//   2. Inlines `@haklex/rich-editor`'s compiled CSS at the top of
//      `style/foundation.css` so consumers of the static renderer never
//      need to import from rich-editor directly.
//   3. Copies each workspace renderer/ext package's compiled CSS into
//      `dist/style/<module>.css` (one file per `modules/<module>`).
//   4. Concatenates everything into `dist/style.css` — the all-in-one
//      bundle consumers can import with a single line.
//
// The split lets downstream consumers pick the granularity they want:
//   - "I didn't override anything" → `import '@haklex/rich-compose/style.css'`
//   - "I replaced X" → import `style/foundation.css` + per-module subpaths
//     for the modules they actually use.

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF_DIR = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(SELF_DIR, '..');
const DIST = path.join(PKG_ROOT, 'dist');
const STYLE_DIR = path.join(DIST, 'style');
const PACKAGES_DIR = path.resolve(PKG_ROOT, '..');

// Module subpath name → upstream workspace package directory.
// The subpath name must match `modules/<name>` in src.
const MODULE_TO_PACKAGE: Record<string, string> = {
  'alert': 'rich-renderer-alert',
  'banner': 'rich-renderer-banner',
  'chat': 'rich-ext-chat',
  'code-block': 'rich-renderer-codeblock',
  'code-snippet': 'rich-ext-code-snippet',
  'embed': 'rich-ext-embed',
  'excalidraw': 'rich-ext-excalidraw',
  'gallery': 'rich-ext-gallery',
  'image': 'rich-renderer-image',
  'katex': 'rich-renderer-katex',
  'link-card': 'rich-renderer-linkcard',
  'mention': 'rich-renderer-mention',
  'mermaid': 'rich-renderer-mermaid',
  'nested-doc': 'rich-ext-nested-doc',
  'poll': 'rich-ext-poll',
  'ruby': 'rich-renderer-ruby',
  'video': 'rich-renderer-video',
};

const PROSE_PACKAGE_DIR = 'rich-editor';

function readCss(filePath: string): string {
  if (!existsSync(filePath)) return '';
  return readFileSync(filePath, 'utf8');
}

// Walk top-level rule blocks. Each rule block runs from the start of a
// selector to its matching '}'. We classify by whether every selector
// clause targets the table renderer (.icqzyn*).
function splitTableRules(css: string): { foundation: string; table: string } {
  const tableRules: string[] = [];
  const foundationRules: string[] = [];

  let i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i]!)) i++;
    if (i >= css.length) break;

    const ruleStart = i;
    while (i < css.length && css[i] !== '{') i++;
    if (i >= css.length) break;

    let depth = 1;
    i++;
    while (i < css.length && depth > 0) {
      const ch = css[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      i++;
    }

    const rule = css.slice(ruleStart, i);
    const braceIdx = rule.indexOf('{');
    const selectors = rule.slice(0, braceIdx).trim();
    const clauses = selectors
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const allTable = clauses.length > 0 && clauses.every((c) => /\.icqzyn\d/.test(c));
    if (allTable) tableRules.push(rule);
    else foundationRules.push(rule);
  }

  const joiner = (rules: string[]) => rules.join('\n');
  return { foundation: joiner(foundationRules), table: joiner(tableRules) };
}

function modulePkgCssPath(pkgDir: string): string {
  // Each workspace renderer/ext package emits its CSS as
  // `dist/<package-name>.css`.
  return path.join(PACKAGES_DIR, pkgDir, 'dist', `${pkgDir}.css`);
}

mkdirSync(STYLE_DIR, { recursive: true });

// 1. Split rich-compose's own CSS
const composeCss = readCss(path.join(DIST, 'rich-compose.css'));
if (!composeCss) {
  console.error('[build-css] dist/rich-compose.css not found — run `vite build` first');
  process.exit(1);
}
const { foundation: composeFoundation, table } = splitTableRules(composeCss);

// 2. Inline rich-editor's prose body CSS into foundation
const proseCss = readCss(modulePkgCssPath(PROSE_PACKAGE_DIR));

const foundationCss =
  `/* @haklex/rich-compose — foundation: prose body + theme tokens + variants. */\n` +
  proseCss +
  (proseCss && composeFoundation ? '\n' : '') +
  composeFoundation +
  '\n';

writeFileSync(path.join(STYLE_DIR, 'foundation.css'), foundationCss);
writeFileSync(
  path.join(STYLE_DIR, 'table.css'),
  `/* @haklex/rich-compose — built-in table renderer. */\n${table}\n`,
);

// 3. Copy each module's CSS
const copied: string[] = [];
const missing: string[] = [];
for (const [moduleName, pkgDir] of Object.entries(MODULE_TO_PACKAGE)) {
  const src = modulePkgCssPath(pkgDir);
  if (!existsSync(src)) {
    missing.push(`${moduleName} (${pkgDir})`);
    continue;
  }
  copyFileSync(src, path.join(STYLE_DIR, `${moduleName}.css`));
  copied.push(moduleName);
}
copied.sort();

// 4. All-in-one bundle: foundation + alphabetical modules + table.
// Inline-concat rather than @import to stay portable across bundlers
// that don't resolve @import paths inside node_modules.
const moduleSegments = copied.map((name) => {
  const css = readCss(path.join(STYLE_DIR, `${name}.css`));
  return `/* --- module: ${name} --- */\n${css.trimEnd()}`;
});
const tableSegment = `/* --- built-in: table --- */\n${readCss(path.join(STYLE_DIR, 'table.css')).trimEnd()}`;
const segments = [
  `/* @haklex/rich-compose — all-in-one (foundation + modules + table). Do not edit. */`,
  foundationCss.trimEnd(),
  ...moduleSegments,
  tableSegment,
];
writeFileSync(path.join(DIST, 'style.css'), `${segments.join('\n\n')}\n`);

// vite emits dist/rich-compose.css; after splitting it into style/* it is no
// longer referenced from any export and would just bloat the published tarball
rmSync(path.join(DIST, 'rich-compose.css'), { force: true });

if (missing.length > 0) {
  console.warn(`[build-css] missing CSS for: ${missing.join(', ')}`);
}
console.log(`[build-css] wrote dist/style.css + ${copied.length} per-module + foundation + table`);
