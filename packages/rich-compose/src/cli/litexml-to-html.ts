#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Theme = 'light' | 'dark';
type Variant = 'article' | 'note' | 'comment';

interface CliOptions {
  input?: string;
  lang: string;
  open: boolean;
  output?: string;
  theme: Theme;
  title?: string;
  variant: Variant;
}

const HELP = `Usage:
  litexml-to-html <file.xml>
  litexml-to-html '<p>Hello</p>' -o article.html
  litexml-to-html - < input.xml > article.html
  litexml-to-html input.xml --open

Options:
  -o, --output <file>      Write HTML to a file instead of stdout.
  --open                  Open the generated HTML in the system browser.
  --theme <light|dark>    Preview color scheme. Default: light.
  --variant <variant>     Render variant: article, note, or comment. Default: article.
  --title <title>         HTML document title.
  --lang <lang>           HTML document language. Default: en.
  -h, --help              Show this help message.
`;

process.stdout.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EPIPE') {
    process.exit(0);
  }
  throw error;
});

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    lang: 'en',
    open: false,
    theme: 'light',
    variant: 'article',
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    switch (arg) {
      case '--open': {
        options.open = true;
        break;
      }

      case '--theme': {
        const theme = args[i + 1];
        if (theme !== 'light' && theme !== 'dark') {
          throw new Error('Expected --theme to be "light" or "dark".');
        }
        options.theme = theme;
        i += 1;
        break;
      }

      case '--variant': {
        const variant = args[i + 1];
        if (variant !== 'article' && variant !== 'note' && variant !== 'comment') {
          throw new Error('Expected --variant to be "article", "note", or "comment".');
        }
        options.variant = variant;
        i += 1;
        break;
      }

      case '--title': {
        const title = args[i + 1];
        if (!title) throw new Error('Missing value for --title.');
        options.title = title;
        i += 1;
        break;
      }

      case '--lang': {
        const lang = args[i + 1];
        if (!lang) throw new Error('Missing value for --lang.');
        options.lang = lang;
        i += 1;
        break;
      }

      case '-o':
      case '--output': {
        const output = args[i + 1];
        if (!output) throw new Error(`Missing value for ${arg}.`);
        options.output = output;
        i += 1;
        break;
      }

      case '-h':
      case '--help': {
        process.stdout.write(HELP);
        process.exit(0);
        break;
      }

      default: {
        if (arg.startsWith('-') && arg !== '-') {
          throw new Error(`Unknown option: ${arg}.`);
        }
        if (options.input) {
          throw new Error('Expected a single LiteXML input argument.');
        }
        options.input = arg;
      }
    }
  }

  return options;
}

function hasElementTag(value: string): boolean {
  return /<[!/]?[a-z][\w:-]*(?:\s|>|\/>)/i.test(value);
}

function readInput(input?: string): string {
  if (!input || input === '-') {
    return readFileSync(0, 'utf8');
  }

  if (existsSync(input)) {
    return readFileSync(input, 'utf8');
  }

  return input;
}

function defaultTitle(input?: string): string {
  if (input && input !== '-' && existsSync(input)) {
    return path.basename(input);
  }
  return 'Haklex LiteXML Preview';
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

function readStaticRenderCss(): string {
  const candidates = [
    fileURLToPath(new URL('./style.css', import.meta.url)),
    fileURLToPath(new URL('../../dist/style.css', import.meta.url)),
    path.resolve(process.cwd(), 'packages/rich-compose/dist/style.css'),
    path.resolve(process.cwd(), 'dist/style.css'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return readFileSync(candidate, 'utf8');
    }
  }

  throw new Error(
    'Cannot find rich-compose static render CSS. Run `pnpm --filter @haklex/rich-compose build` first.',
  );
}

function readPreviewClientJs(): string {
  const candidates = [
    fileURLToPath(new URL('./litexml-html-preview-client.js', import.meta.url)),
    path.resolve(process.cwd(), 'packages/rich-compose/dist/litexml-html-preview-client.js'),
    path.resolve(process.cwd(), 'dist/litexml-html-preview-client.js'),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return readFileSync(candidate, 'utf8');
    }
  }

  throw new Error(
    'Cannot find LiteXML HTML preview client bundle. Run `pnpm --filter @haklex/rich-compose build` first.',
  );
}

function readPreviewClientCss(): string {
  const candidates = [
    fileURLToPath(new URL('./litexml-html-preview-client.css', import.meta.url)),
    path.resolve(process.cwd(), 'packages/rich-compose/dist/litexml-html-preview-client.css'),
    path.resolve(process.cwd(), 'dist/litexml-html-preview-client.css'),
  ];

  return candidates
    .filter(existsSync)
    .map((candidate) => readFileSync(candidate, 'utf8'))
    .join('\n');
}

async function convertLiteXmlToHtml(xml: string, options: CliOptions): Promise<string> {
  const trimmed = xml.trim();
  if (!trimmed) {
    throw new Error('LiteXML input is empty.');
  }
  if (!hasElementTag(trimmed)) {
    throw new Error('Input does not look like LiteXML. Pass a file path, stdin, or an XML string.');
  }

  const staticCss = readStaticRenderCss();
  const previewClientCss = readPreviewClientCss();
  const previewClientJs = readPreviewClientJs();
  const title = escapeHtml(options.title ?? defaultTitle(options.input));
  const lang = escapeHtml(options.lang);
  const payload = escapeJsonScript({
    theme: options.theme,
    variant: options.variant,
    xml: trimmed,
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

function openHtmlFile(filePath: string): void {
  const resolved = path.resolve(filePath);
  const result =
    process.platform === 'darwin'
      ? spawnSync('open', [resolved], { stdio: 'ignore' })
      : process.platform === 'win32'
        ? spawnSync('cmd', ['/c', 'start', '', resolved], { stdio: 'ignore' })
        : spawnSync('xdg-open', [resolved], { stdio: 'ignore' });

  if (result.error) {
    throw result.error;
  }
  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error(`Failed to open ${resolved}.`);
  }
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const xml = readInput(options.input);
    const html = `${await convertLiteXmlToHtml(xml, options)}\n`;

    if (options.output) {
      writeFileSync(options.output, html);
      if (options.open) openHtmlFile(options.output);
      return;
    }

    if (options.open) {
      const dir = mkdtempSync(path.join(tmpdir(), 'haklex-litexml-'));
      const output = path.join(dir, 'preview.html');
      writeFileSync(output, html);
      openHtmlFile(output);
      return;
    }

    process.stdout.write(html);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${path.basename(process.argv[1])}: ${message}\n\n${HELP}`);
    process.exit(1);
  }
}

void main();
