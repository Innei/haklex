export interface FontFace {
  family: string;
  format?: string;
  style?: string;
  unicodeRange?: string;
  url: string;
  weight?: string;
}

export interface FontUsage {
  families: ReadonlySet<string>;
  text: string;
}

const unquote = (value: string) => value.trim().replace(/^(['"])(.*)\1$/, '$2');

const descriptor = (block: string, name: string): string | undefined => {
  const match = new RegExp(`(?:^|[;{\\s])${name}\\s*:\\s*([^;}]+)`, 'i').exec(block);
  return match ? match[1].trim() : undefined;
};

function rangeCovers(range: string, codePoints: ReadonlySet<number>): boolean {
  for (const part of range.split(',')) {
    const match = /^u\+([\da-f?]+)(?:-([\da-f]+))?$/i.exec(part.trim());
    if (!match) continue;
    const from = Number.parseInt(match[1].replaceAll('?', '0'), 16);
    const to = Number.parseInt(match[2] ?? match[1].replaceAll('?', 'f'), 16);
    for (const point of codePoints) if (point >= from && point <= to) return true;
  }
  return false;
}

export function familiesOf(stack: string): string[] {
  return stack.split(',').map((name) => unquote(name).toLowerCase());
}

export function collectFontFaces(cssText: string, baseHref: string, usage: FontUsage): FontFace[] {
  const codePoints = new Set<number>();
  for (const char of usage.text) codePoints.add(char.codePointAt(0)!);
  const faces: FontFace[] = [];
  for (const [, block] of cssText.matchAll(/@font-face\s*\{([^}]*)\}/gi)) {
    const family = unquote(descriptor(block, 'font-family') ?? '');
    if (!usage.families.has(family.toLowerCase())) continue;
    const unicodeRange = descriptor(block, 'unicode-range');
    if (unicodeRange && !rangeCovers(unicodeRange, codePoints)) continue;
    const src = /url\(([^)]*)\)(?:\s*format\(([^)]*)\))?/i.exec(block);
    if (!src) continue;
    let url: string;
    try {
      url = new URL(unquote(src[1]), baseHref).href;
    } catch {
      continue;
    }
    faces.push({
      family,
      format: src[2] === undefined ? undefined : unquote(src[2]),
      style: descriptor(block, 'font-style'),
      unicodeRange,
      url,
      weight: descriptor(block, 'font-weight'),
    });
  }
  return faces;
}

export async function toDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export interface CssSource {
  baseHref: string;
  cssText: string;
}

const MAX_IMPORT_DEPTH = 4;

export async function expandImports(
  cssText: string,
  baseHref: string,
  fetchText: (url: string) => Promise<string>,
  depth = 0,
): Promise<CssSource[]> {
  const own: CssSource = { baseHref, cssText };
  if (depth >= MAX_IMPORT_DEPTH) return [own];
  const nested = await Promise.all(
    [...cssText.matchAll(/@import\s+(?:url\(([^)]*)\)|(["'][^"']*["']))/gi)].map(async (match) => {
      try {
        const href = new URL(unquote(match[1] ?? match[2]), baseHref).href;
        return await expandImports(await fetchText(href), href, fetchText, depth + 1);
      } catch {
        return [];
      }
    }),
  );
  return [...nested.flat(), own];
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function sheetSources(): Promise<CssSource[]> {
  const sources = await Promise.all(
    [...document.styleSheets].map(async (sheet) => {
      const baseHref = sheet.href ?? document.baseURI;
      let cssText: string;
      try {
        cssText = [...sheet.cssRules]
          .map((rule) => rule.cssText)
          .filter((text) => text.startsWith('@font-face') || text.startsWith('@import'))
          .join('\n');
      } catch {
        if (!sheet.href) return [];
        try {
          cssText = await fetchText(sheet.href);
        } catch {
          return [];
        }
      }
      return expandImports(cssText, baseHref, fetchText);
    }),
  );
  return sources.flat();
}

export async function embeddedFontCss(usage: FontUsage): Promise<string> {
  if (typeof document === 'undefined' || usage.families.size === 0) return '';
  const faces = (await sheetSources()).flatMap((source) =>
    collectFontFaces(source.cssText, source.baseHref, usage),
  );
  const rules = await Promise.all(
    faces.map(async (face) => {
      try {
        const data = await toDataUrl(face.url);
        return [
          `@font-face{font-family:"${face.family}";src:url("${data}")${face.format ? ` format("${face.format}")` : ''}`,
          face.weight && `font-weight:${face.weight}`,
          face.style && `font-style:${face.style}`,
          face.unicodeRange && `unicode-range:${face.unicodeRange}`,
        ]
          .filter(Boolean)
          .join(';')
          .concat('}');
      } catch {
        return '';
      }
    }),
  );
  return rules.join('');
}
