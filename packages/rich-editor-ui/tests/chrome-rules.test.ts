import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const packagesDir = path.join(__dirname, '../..');
const roots = [
  'rich-editor-ui',
  ...readdirSync(packagesDir).filter((name) => name.startsWith('rich-plugin-')),
].map((name) => path.join(packagesDir, name, 'src'));
const statusComponents = ['components/alert/', 'components/badge/', 'components/status-dot/'];

const rules: { allow?: (file: string) => boolean; name: string; pattern: RegExp }[] = [
  { name: 'variant spacing', pattern: /vars\.spacing\./ },
  { name: 'variant radius', pattern: /vars\.borderRadius\./ },
  {
    name: 'em chrome type',
    pattern:
      /vars\.typography\.(?:fontSize(?:2xs|Xs|Sm|Md|Lg|Small)|lineHeight(?:Tight|Compact))\b/,
  },
  {
    name: 'text color-mix',
    pattern: /color-mix\([^)]*vars\.color\.(?:text|textSecondary|textTertiary)\b/,
  },
  {
    name: 'accent fill',
    pattern: /background(?:Color)?:\s*vars\.color\.accent(?![A-Za-z])/,
    allow: (file) => statusComponents.some((dir) => file.includes(dir)),
  },
  { name: 'outline focus', pattern: /outline:\s*`?\d+px solid/ },
];

function collect(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(full, out);
    else if (entry.name.endsWith('.css.ts')) out.push(full);
  }
  return out;
}

function violations() {
  const found: string[] = [];
  for (const file of roots.flatMap((root) => collect(root))) {
    const rel = path.relative(packagesDir, file);
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const rule of rules) {
        if (rule.allow?.(rel)) continue;
        if (rule.pattern.test(line)) found.push(`${rel}:${i + 1} ${rule.name}`);
      }
    });
  }
  return found;
}

function inlineColorViolations() {
  const found: string[] = [];
  const rawColor = /(?:color|background(?:color)?):\s*["']#[\da-f]{3,8}["']/i;
  for (const root of roots) {
    for (const file of collectTsx(root)) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (rawColor.test(line)) found.push(`${path.relative(packagesDir, file)}:${i + 1}`);
        });
    }
  }
  return found;
}

function collectTsx(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectTsx(full, out);
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

const editOverlayFile = /(?:Edit|Inspector|Dialog|Modal|Popover|Menu|Toolbar|Panel)[A-Za-z]*\.tsx$/;
const contentRoots = readdirSync(packagesDir)
  .filter((name) => name.startsWith('rich-renderer-') || name.startsWith('rich-ext-'))
  .map((name) => path.join(packagesDir, name, 'src'));

function editOverlayColorViolations() {
  const found: string[] = [];
  const rawColor = /(?:color|background(?:color)?):\s*["'](?:#[\da-f]{3,8}|rgba?\()/i;
  for (const root of contentRoots) {
    for (const file of collectTsx(root).filter((f) => editOverlayFile.test(f))) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (rawColor.test(line)) found.push(`${path.relative(packagesDir, file)}:${i + 1}`);
        });
    }
  }
  return found;
}

describe('chrome styles follow the Quiet Ink chrome rules', () => {
  it('sets no raw colors inline in renderer and extension edit overlays', () => {
    expect(editOverlayColorViolations()).toEqual([]);
  });

  it('sets no raw hex colors in inline styles', () => {
    expect(inlineColorViolations()).toEqual([]);
  });

  it('reads no variant tokens, em sizes, ad-hoc mixes, accent fills or outline focus', () => {
    expect(violations()).toEqual([]);
  });
});
