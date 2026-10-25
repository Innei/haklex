import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const packagesDir = path.join(__dirname, '../..');

const exemptFiles = new Set([
  'rich-editor-ui/src/components/color-picker/styles.css.ts',
  'rich-ext-chart/src/palette.css.ts',
  'rich-ext-embed/src/styles.css.ts',
  'rich-ext-embed/src/styles-static.css.ts',
]);

const mediaOverlayFiles = new Set([
  'rich-editor-ui/src/components/dialog/styles.css.ts',
  'rich-ext-nested-doc/src/styles.css.ts',
  'rich-renderer-image/src/styles.css.ts',
  'rich-renderer-video/src/styles.css.ts',
]);

const rawColor = /#[\da-f]{3,8}\b|rgba?\(|hsla?\(/i;
const neutralOverlay =
  /^(?:[^#(]*?(?:#000\b|#fff\b|#000000[\da-f]{0,2}\b|rgba?\((?:0,\s?0,\s?0|255,\s?255,\s?255)\b|rgb\((?:0 0 0|255 255 255) \/))+[^#(]*$/i;

function collectStyleFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectStyleFiles(full, out);
    else if (entry.name.endsWith('.css.ts')) out.push(full);
  }
  return out;
}

function findViolations(): string[] {
  const violations: string[] = [];
  for (const pkg of readdirSync(packagesDir)) {
    if (pkg === 'rich-style-token') continue;
    const src = path.join(packagesDir, pkg, 'src');
    let files: string[];
    try {
      files = collectStyleFiles(src);
    } catch {
      continue;
    }
    for (const file of files) {
      const rel = path.relative(packagesDir, file);
      if (exemptFiles.has(rel)) continue;
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (!rawColor.test(line)) return;
          if (/\bmask(?:Image)?\b/.test(line)) return;
          if (mediaOverlayFiles.has(rel) && neutralOverlay.test(line)) return;
          violations.push(`${rel}:${index + 1}: ${line.trim()}`);
        });
    }
  }
  return violations;
}

describe('component styles', () => {
  it('read colors from --rc-* tokens instead of raw literals', () => {
    expect(findViolations()).toEqual([]);
  });
});
