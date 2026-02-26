export function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replaceAll(/[^\w\s\u3001-\u9fff\uac00-\ud7af\uff00-\uffef-]/g, '')
    .replaceAll(/[\s_]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
}
