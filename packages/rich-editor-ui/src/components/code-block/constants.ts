export const languageToColorMap: Record<string, string> = {
  javascript: '#f7df1e',
  js: '#f7df1e',
  typescript: '#3178c6',
  ts: '#3178c6',
  jsx: '#61dafb',
  tsx: '#61dafb',
  html: '#e34f26',
  css: '#1572b6',
  scss: '#cc6699',
  json: '#f59e0b',
  markdown: '#737373',
  md: '#737373',
  bash: '#4eaa25',
  sh: '#4eaa25',
  shell: '#4eaa25',
  zsh: '#4eaa25',
  python: '#3776ab',
  py: '#3776ab',
  rust: '#dea584',
  go: '#00add8',
  java: '#b07219',
  c: '#a8b9cc',
  cpp: '#00599c',
  'c++': '#00599c',
  swift: '#fa7343',
  kotlin: '#7f52ff',
  yaml: '#cb171e',
  yml: '#cb171e',
  sql: '#e38c00',
};

export function normalizeLanguage(lang: string | undefined): string {
  if (!lang) return 'text';
  return lang.trim().toLowerCase() || 'text';
}

export function getLanguageDisplayName(lang: string): string {
  if (lang === 'text') return 'TEXT';
  return lang.toUpperCase();
}
