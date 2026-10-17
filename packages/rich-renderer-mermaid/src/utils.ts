import { render } from 'pele';

import { textMeasurer } from './text-measurer';

export function renderMermaid(content: string, colorScheme: 'light' | 'dark' = 'light') {
  const dark = colorScheme === 'dark';
  const result = render(content, { measurer: textMeasurer, links: false, images: false });
  // An SVG displayed as an image cannot inherit the page's theme variables.
  const palette = {
    'bg': dark ? '#171717' : '#ffffff',
    'fg': dark ? '#fafafa' : '#262626',
    'muted': dark ? '#a3a3a3' : '#737373',
    'line': dark ? '#fafafa' : '#262626',
    'surface': dark ? '#262626' : '#f3f3f3',
    'surface-alt': dark ? '#333333' : '#e6e6e6',
    'border': dark ? '#737373' : '#8a8a8a',
  };
  const theme = Object.entries(palette)
    .map(([key, value]) => `--pele-${key}:${value};`)
    .join('');
  const svg = result.svg
    .replace('style="', `style="${theme}`)
    .replace(/(<svg\b[^>]*>)/, `$1<rect width="100%" height="100%" fill="${palette.bg}"/>`);
  return { ...result, svg };
}
