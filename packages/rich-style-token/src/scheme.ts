export function inDarkScheme(selectors: string): string {
  return selectors
    .split(',')
    .map((selector) => selector.trim())
    .flatMap((selector) => [
      `[data-theme='dark'] ${selector}:not([data-theme='dark'] [data-theme='light'] *)`,
      `[data-theme='light'] [data-theme='dark'] ${selector}`,
    ])
    .join(', ');
}
