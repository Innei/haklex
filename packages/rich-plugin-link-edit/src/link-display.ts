export function middleTruncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const keep = max - 1;
  const head = Math.ceil(keep / 2);
  const tail = keep - head;
  return `${text.slice(0, head)}…${text.slice(text.length - tail)}`;
}

export function isEmptyLink(url: string): boolean {
  const trimmed = url.trim();
  return trimmed === '' || /^https?:\/\/$/.test(trimmed);
}

export function displayUrl(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/, '');
}
