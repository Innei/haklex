import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const packagesDir = path.join(__dirname, '../..');

/**
 * `color` inherits, so an icon follows its owner's text color for free. A rule
 * that colors `svg` from an ancestor selector, though, out-specifies the icon's
 * own class: variants and consumer overrides stop reaching it. Declare the
 * color on the element that owns it instead.
 */
function svgColorDeclarations(source: string): string[] {
  const found: string[] = [];
  const push = (selector: string, body: string) => {
    if (/\bsvg\b/.test(selector) && /\bcolor\s*:/.test(body)) found.push(selector.trim());
  };

  // globalStyle(`<selector>`, { ... })
  for (
    let i = source.indexOf('globalStyle(');
    i !== -1;
    i = source.indexOf('globalStyle(', i + 1)
  ) {
    const start = skipWs(source, i + 'globalStyle('.length);
    if (!isQuote(source[start])) continue;
    const selectorEnd = skipString(source, start);
    const bodyStart = skipWs(source, skipWs(source, selectorEnd) + 1); // past `,`
    if (source[bodyStart] !== '{') continue;
    push(
      source.slice(start + 1, selectorEnd - 1),
      source.slice(bodyStart, matchBrace(source, bodyStart)),
    );
  }

  // `selectors: { '<selector>': { ... } }`
  for (let i = 0; i < source.length; i++) {
    if (!isQuote(source[i])) continue;
    const selectorEnd = skipString(source, i);
    const colon = skipWs(source, selectorEnd);
    if (source[colon] === ':') {
      const bodyStart = skipWs(source, colon + 1);
      if (source[bodyStart] === '{') {
        push(
          source.slice(i + 1, selectorEnd - 1),
          source.slice(bodyStart, matchBrace(source, bodyStart)),
        );
      }
    }
    i = selectorEnd - 1;
  }

  return found;
}

function isQuote(ch: string | undefined): boolean {
  return ch === "'" || ch === '"' || ch === '`';
}

function skipWs(source: string, index: number): number {
  let i = index;
  while (i < source.length && /\s/.test(source[i])) i += 1;
  return i;
}

/** Returns the index just past the string starting at `start`. */
function skipString(source: string, start: number): number {
  const quote = source[start];
  let i = start + 1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '\\') {
      i += 2;
    } else if (quote === '`' && ch === '$' && source[i + 1] === '{') {
      i = matchBrace(source, i + 1);
    } else if (ch === quote) {
      return i + 1;
    } else {
      i += 1;
    }
  }
  return i;
}

/** `start` sits on `{`; returns the index just past the matching `}`. */
function matchBrace(source: string, start: number): number {
  let depth = 0;
  let i = start;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '{') {
      depth += 1;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return i + 1;
    } else if (isQuote(ch)) {
      i = skipString(source, i);
      continue;
    }
    i += 1;
  }
  return i;
}

function collectCssTs(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) collectCssTs(full, out);
    else if (entry.name.endsWith('.css.ts')) out.push(full);
  }
  return out;
}

function repoViolations(): string[] {
  const found: string[] = [];
  const packages = readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('rich-'))
    .map((entry) => path.join(packagesDir, entry.name, 'src'));
  for (const src of packages) {
    for (const file of collectCssTs(src)) {
      const rel = path.relative(packagesDir, file);
      for (const selector of svgColorDeclarations(readFileSync(file, 'utf8'))) {
        found.push(`${rel}: ${selector}`);
      }
    }
  }
  return found;
}

describe('icon colors come from the icon, not from an ancestor rule', () => {
  it('flags a color declared on a descendant svg rule', () => {
    expect(
      svgColorDeclarations(
        "globalStyle(`${item} svg`, { width: '16px', color: vars.color.textSecondary });",
      ),
    ).toEqual(['${item} svg']);
    expect(
      svgColorDeclarations(
        "const a = style({ selectors: { '& svg': { color: vars.color.text } } });",
      ),
    ).toEqual(['& svg']);
  });

  it('accepts sizing-only descendant rules and colors on the owner', () => {
    expect(svgColorDeclarations("globalStyle(`${icon} svg`, { width: '16px' });")).toEqual([]);
    expect(
      svgColorDeclarations(
        "export const icon = style({ color: vars.color.textTertiary });\nglobalStyle(`${icon} svg`, { width: '1em' });",
      ),
    ).toEqual([]);
  });

  it('finds no violation in any package', () => {
    expect(repoViolations()).toEqual([]);
  });
});
