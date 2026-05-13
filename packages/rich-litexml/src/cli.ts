#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { createDefaultRegistry } from './default-registry';
import { deserializeFromXml } from './deserializer';

interface CliOptions {
  compact: boolean;
  input?: string;
  output?: string;
}

const HELP = `Usage:
  litexml-to-lexical <file.xml>
  litexml-to-lexical '<p>Hello</p>'
  litexml-to-lexical - < input.xml

Options:
  -o, --output <file>  Write JSON to a file instead of stdout.
  --compact           Emit compact JSON instead of pretty JSON.
  -h, --help          Show this help message.
`;

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = { compact: false };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    switch (arg) {
      case '--compact': {
        options.compact = true;
        break;
      }

      case '-o':
      case '--output': {
        const output = args[i + 1];
        if (!output) {
          throw new Error(`Missing value for ${arg}.`);
        }
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
          throw new Error('Expected a single LightXML input argument.');
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

function convertLiteXmlToLexicalJson(xml: string, compact: boolean): string {
  const trimmed = xml.trim();
  if (!trimmed) {
    throw new Error('LightXML input is empty.');
  }
  if (!hasElementTag(trimmed)) {
    throw new Error(
      'Input does not look like LightXML. Pass a file path, stdin, or an XML string.',
    );
  }

  const registry = createDefaultRegistry();
  const editorState = deserializeFromXml(trimmed, registry);
  return JSON.stringify(editorState, null, compact ? 0 : 2);
}

function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const xml = readInput(options.input);
    const output = convertLiteXmlToLexicalJson(xml, options.compact) + '\n';

    if (options.output) {
      writeFileSync(options.output, output);
    } else {
      process.stdout.write(output);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${path.basename(process.argv[1])}: ${message}\n\n${HELP}`);
    process.exit(1);
  }
}

main();
