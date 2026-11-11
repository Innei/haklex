const SVG_NS = 'http://www.w3.org/2000/svg';

const ROOT = /<svg\b[^>]*>/i;

export function isSvgSource(src: unknown): src is string {
  return (
    typeof src === 'string' &&
    /^\s*(?:<\?xml[^>]*>\s*)?(?:<!--[\s\S]*?-->\s*)*<svg[\s/>]/i.test(src)
  );
}

export function normalizeSvgSource(src: string): string {
  const root = ROOT.exec(src);
  if (!root || /\sxmlns\s*=/.test(root[0])) return src;
  const at = root.index + 4;
  return `${src.slice(0, at)} xmlns="${SVG_NS}"${src.slice(at)}`;
}

export function svgDataUrl(src: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalizeSvgSource(src))}`;
}

function attr(tag: string, name: string): string | null {
  const match = new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(tag);
  return match ? match[1] : null;
}

function length(value: string | null): number | null {
  if (!value) return null;
  const match = /^\s*(\d+(?:\.\d+)?)\s*(?:px\s*)?$/i.exec(value);
  return match ? Number(match[1]) : null;
}

export function parseSvgSize(src: string): { height: number; width: number } | null {
  const root = ROOT.exec(src)?.[0];
  if (!root) return null;
  const width = length(attr(root, 'width'));
  const height = length(attr(root, 'height'));
  if (width && height) return { width, height };
  const box = attr(root, 'viewBox')
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  if (box && box.length === 4 && box[2] > 0 && box[3] > 0) return { width: box[2], height: box[3] };
  return null;
}
