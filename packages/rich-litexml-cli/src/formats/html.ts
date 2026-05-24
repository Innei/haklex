import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { SerializedEditorState } from 'lexical';

import type { HtmlOptions } from '../shared/types';

const require = createRequire(import.meta.url);

function resolveComposeAsset(name: string): string {
  const candidates: string[] = [];

  // Preferred: use the package's own exported subpath (e.g. `./style.css`).
  // Works under Node's strict exports enforcement regardless of where the
  // package is installed.
  try {
    candidates.push(require.resolve(`@haklex/rich-compose/${name}`));
  } catch {
    // fall through to other resolution strategies
  }

  // Fallback: locate the installed package via package.json and read dist/
  // directly. Requires `./package.json` to be in the exports field.
  try {
    const pkgPath = require.resolve('@haklex/rich-compose/package.json');
    candidates.push(path.join(path.dirname(pkgPath), 'dist', name));
  } catch {
    // fall through to filesystem candidates
  }

  candidates.push(
    fileURLToPath(new URL(`./${name}`, import.meta.url)),
    fileURLToPath(new URL(`../../node_modules/@haklex/rich-compose/dist/${name}`, import.meta.url)),
    path.resolve(process.cwd(), 'packages/rich-compose/dist', name),
    path.resolve(process.cwd(), 'node_modules/@haklex/rich-compose/dist', name),
  );

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return readFileSync(candidate, 'utf8');
    }
  }

  throw new Error(
    `Cannot resolve @haklex/rich-compose asset "${name}". ` +
      'Run `pnpm --filter @haklex/rich-compose build` first.',
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeJsonScript(value: unknown): string {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function renderHtml(
  state: SerializedEditorState,
  options: HtmlOptions,
  inputHint?: string,
): string {
  const staticCss = resolveComposeAsset('style.css');
  const previewClientJs = resolveComposeAsset('litexml-html-preview-client.js');
  const previewClientCss = tryResolveComposeAsset('litexml-html-preview-client.css') ?? '';

  const title = escapeHtml(options.title ?? defaultTitle(inputHint));
  const lang = escapeHtml(options.lang);
  const payload = escapeJsonScript({
    state,
    theme: options.theme,
    variant: options.variant,
  });

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="${options.theme}">
  <title>${title}</title>
  <style>
${staticCss}
${previewClientCss}

html {
  color-scheme: ${options.theme};
  max-width: 100%;
  overflow-x: clip;
}

body {
  margin: 0;
  background: ${options.theme === 'dark' ? '#0f1115' : '#ffffff'};
  max-width: 100%;
  overflow-x: clip;
}

.haklex-html-preview {
  box-sizing: border-box;
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  overflow-x: clip;
  padding: 48px 24px 64px;
}

.haklex-html-preview .rich-content {
  min-width: 0;
  max-width: 100%;
}

@media (max-width: 640px) {
  .haklex-html-preview {
    padding: 28px 16px 48px;
  }
}
  </style>
</head>
<body>
  <main class="haklex-html-preview" id="haklex-litexml-root"></main>
  <script id="haklex-litexml-payload" type="application/json">${payload}</script>
  <script>
${previewClientJs}
  </script>
</body>
</html>`;
}

function tryResolveComposeAsset(name: string): string | undefined {
  try {
    return resolveComposeAsset(name);
  } catch {
    return undefined;
  }
}

function defaultTitle(inputHint?: string): string {
  if (inputHint && inputHint !== '-' && existsSync(inputHint)) {
    return path.basename(inputHint);
  }
  return 'Haklex LiteXML Preview';
}
