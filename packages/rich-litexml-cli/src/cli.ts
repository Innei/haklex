import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { SerializedEditorState } from 'lexical';

import { renderHtml } from './formats/html';
import { renderJson } from './formats/json';
import { renderMarkdown } from './formats/markdown';
import { detectInputFormat, readInput } from './input';
import { HELP } from './shared/help';
import { parseLiteXmlToState } from './shared/parse-litexml';
import type { CliOptions, InputFormat, OutputFormat, Theme, Variant } from './shared/types';

process.stdout.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EPIPE') {
    process.exit(0);
  }
  throw error;
});

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    compact: false,
    lang: 'en',
    open: false,
    theme: 'light',
    variant: 'article',
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    switch (arg) {
      case '-f':
      case '--format': {
        const value = args[i + 1];
        if (!value) throw new Error(`Missing value for ${arg}.`);
        if (value !== 'html' && value !== 'json' && value !== 'markdown') {
          throw new Error('Expected --format to be "html", "json", or "markdown".');
        }
        options.format = value as OutputFormat;
        i += 1;
        break;
      }

      case '-i':
      case '--input-format': {
        const value = args[i + 1];
        if (!value) throw new Error(`Missing value for ${arg}.`);
        if (value !== 'litexml' && value !== 'json') {
          throw new Error('Expected --input-format to be "litexml" or "json".');
        }
        options.inputFormat = value as InputFormat;
        i += 1;
        break;
      }

      case '-o':
      case '--output': {
        const value = args[i + 1];
        if (!value) throw new Error(`Missing value for ${arg}.`);
        options.output = value;
        i += 1;
        break;
      }

      case '--compact': {
        options.compact = true;
        break;
      }

      case '--theme': {
        const value = args[i + 1];
        if (value !== 'light' && value !== 'dark') {
          throw new Error('Expected --theme to be "light" or "dark".');
        }
        options.theme = value as Theme;
        i += 1;
        break;
      }

      case '--variant': {
        const value = args[i + 1];
        if (value !== 'article' && value !== 'note' && value !== 'comment') {
          throw new Error('Expected --variant to be "article", "note", or "comment".');
        }
        options.variant = value as Variant;
        i += 1;
        break;
      }

      case '--title': {
        const value = args[i + 1];
        if (!value) throw new Error('Missing value for --title.');
        options.title = value;
        i += 1;
        break;
      }

      case '--lang': {
        const value = args[i + 1];
        if (!value) throw new Error('Missing value for --lang.');
        options.lang = value;
        i += 1;
        break;
      }

      case '--open': {
        options.open = true;
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
        if (options.input !== undefined) {
          throw new Error('Expected a single input argument.');
        }
        options.input = arg;
      }
    }
  }

  return options;
}

function warnIrrelevantFlags(options: CliOptions): void {
  const format = options.format;
  if (!format) return;

  const irrelevant: string[] = [];
  if (format !== 'json' && options.compact) irrelevant.push('--compact');
  if (format !== 'html') {
    if (options.theme !== 'light') irrelevant.push('--theme');
    if (options.variant !== 'article') irrelevant.push('--variant');
    if (options.title !== undefined) irrelevant.push('--title');
    if (options.lang !== 'en') irrelevant.push('--lang');
    if (options.open) irrelevant.push('--open');
  }

  if (irrelevant.length > 0) {
    process.stderr.write(
      `Warning: ignoring options not applicable to --format ${format}: ${irrelevant.join(', ')}\n`,
    );
  }
}

function toEditorState(raw: string, forced: InputFormat | undefined): SerializedEditorState {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('Input is empty.');
  }

  const format = forced ?? detectInputFormat(trimmed);

  if (format === 'json') {
    try {
      return JSON.parse(trimmed) as SerializedEditorState;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid JSON input: ${message}`, { cause: error });
    }
  }

  return parseLiteXmlToState(trimmed);
}

function openHtmlFile(filePath: string): void {
  const resolved = path.resolve(filePath);
  const result =
    process.platform === 'darwin'
      ? spawnSync('open', [resolved], { stdio: 'ignore' })
      : process.platform === 'win32'
        ? spawnSync('cmd', ['/c', 'start', '', resolved], { stdio: 'ignore' })
        : spawnSync('xdg-open', [resolved], { stdio: 'ignore' });

  if (result.error) throw result.error;
  if (typeof result.status === 'number' && result.status !== 0) {
    throw new Error(`Failed to open ${resolved}.`);
  }
}

function runFormat(state: SerializedEditorState, options: CliOptions): string {
  switch (options.format) {
    case 'json': {
      return renderJson(state, options.compact);
    }
    case 'markdown': {
      return renderMarkdown(state);
    }
    case 'html': {
      return renderHtml(
        state,
        {
          lang: options.lang,
          theme: options.theme,
          title: options.title,
          variant: options.variant,
        },
        options.input,
      );
    }
    default: {
      throw new Error('Missing required option: --format <html|json|markdown>.');
    }
  }
}

function main(): void {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (!options.format) {
      throw new Error('Missing required option: --format <html|json|markdown>.');
    }
    warnIrrelevantFlags(options);

    const raw = readInput(options.input);
    const state = toEditorState(raw, options.inputFormat);
    const rendered = runFormat(state, options) + '\n';

    if (options.format === 'html') {
      if (options.output) {
        writeFileSync(options.output, rendered);
        if (options.open) openHtmlFile(options.output);
        return;
      }
      if (options.open) {
        const dir = mkdtempSync(path.join(tmpdir(), 'haklex-litexml-'));
        const target = path.join(dir, 'preview.html');
        writeFileSync(target, rendered);
        openHtmlFile(target);
        return;
      }
    }

    if (options.output) {
      writeFileSync(options.output, rendered);
    } else {
      process.stdout.write(rendered);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cmd = path.basename(process.argv[1] ?? 'litexml');
    process.stderr.write(`${cmd}: ${message}\n\n${HELP}`);
    process.exit(1);
  }
}

main();
