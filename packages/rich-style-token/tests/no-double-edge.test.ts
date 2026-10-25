import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const packagesDir = path.join(__dirname, '../..');
const ringShadow = /vars\.boxShadow\.(?:menu|topBar|xs|modal)\b/;
const solidBorder = /^\s*'?border'?:\s*`1px solid/m;

function collectStyleFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectStyleFiles(full, out);
    else if (entry.name.endsWith('.css.ts')) out.push(full);
  }
  return out;
}

function splitRules(source: string): string[] {
  return source.split(/\n(?=export const |const |globalStyle\()/);
}

describe('component styles', () => {
  it('never pair a 1px border with a shadow token that already draws a ring', () => {
    const violations: string[] = [];
    for (const pkg of readdirSync(packagesDir)) {
      let files: string[];
      try {
        files = collectStyleFiles(path.join(packagesDir, pkg, 'src'));
      } catch {
        continue;
      }
      for (const file of files) {
        for (const rule of splitRules(readFileSync(file, 'utf8'))) {
          if (ringShadow.test(rule) && solidBorder.test(rule)) {
            violations.push(`${path.relative(packagesDir, file)}: ${rule.split('\n')[0]}`);
          }
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
