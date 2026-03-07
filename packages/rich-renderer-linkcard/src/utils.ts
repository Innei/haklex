import type { LinkCardFetchContext } from './types';

function toCamelCase(str: string): string {
  return str.replaceAll(/_([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function camelcaseKeys<T = any>(obj: any): T {
  if (Array.isArray(obj)) return obj.map(camelcaseKeys) as T;
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [toCamelCase(k), camelcaseKeys(v)]),
    ) as T;
  }
  return obj as T;
}

export async function fetchJsonWithContext<T = any>(
  url: string,
  context?: LinkCardFetchContext,
  provider?: string,
  init?: RequestInit,
): Promise<T> {
  const providerAdapter = provider && context?.adapters ? context.adapters[provider] : undefined;

  if (providerAdapter) {
    return providerAdapter.request<T>(url, init);
  }

  if (context?.fetchJson) {
    return context.fetchJson<T>(url, init);
  }

  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchGitHubApi<T = any>(
  url: string,
  context?: LinkCardFetchContext,
): Promise<T> {
  const path = url.replace('https://api.github.com', '');
  return fetchJsonWithContext<T>(`https://api.github.com${path}`, context, 'github');
}

export const LanguageToColorMap: Record<string, string> = {
  'typescript': '#2b7489',
  'javascript': '#f1e05a',
  'html': '#e34c26',
  'java': '#b07219',
  'go': '#00add8',
  'vue': '#2c3e50',
  'css': '#563d7c',
  'yaml': '#cb171e',
  'json': '#292929',
  'markdown': '#083fa1',
  'csharp': '#178600',
  'c#': '#178600',
  'c': '#555555',
  'cpp': '#f34b7d',
  'c++': '#f34b7d',
  'python': '#3572a5',
  'lua': '#000080',
  'vimscript': '#199f4b',
  'shell': '#89e051',
  'dockerfile': '#384d54',
  'ruby': '#701516',
  'php': '#4f5d95',
  'lisp': '#3fb68b',
  'kotlin': '#F18E33',
  'rust': '#dea584',
  'dart': '#00B4AB',
  'swift': '#ffac45',
  'objective-c': '#438eff',
  'objective-c++': '#6866fb',
  'r': '#198ce7',
  'matlab': '#e16737',
  'scala': '#c22d40',
  'sql': '#e38c00',
  'perl': '#0298c3',
};

export const bangumiTypeMap: Record<string, string> = {
  subject: 'subjects',
  character: 'characters',
  person: 'persons',
};
export const allowedBangumiTypes = Object.keys(bangumiTypeMap);

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateColor(
  str: string,
  saturation: [number, number] = [30, 35],
  lightness: [number, number] = [60, 70],
): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const sRange = saturation[1] - saturation[0] + 1;
  const lRange = lightness[1] - lightness[0] + 1;
  const h = Math.abs(hash) % 360;
  const s = saturation[0] + (Math.abs(hash >> 8) % sRange);
  const l = lightness[0] + (Math.abs(hash >> 16) % lRange);
  return hslToHex(h, s, l);
}

export function stripMarkdown(text: string): string {
  return text
    .replaceAll(/!\[.*?\]\(.*?\)/g, '')
    .replaceAll(/\[([^\]]*)\]\(.*?\)/g, '$1')
    .replaceAll(/[#*>_`~]/g, '')
    .replaceAll(/\n+/g, ' ')
    .trim();
}
