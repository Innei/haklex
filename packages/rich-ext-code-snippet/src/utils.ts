const EXT_TO_LANG: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  py: 'python',
  rs: 'rust',
  go: 'go',
  java: 'java',
  html: 'html',
  css: 'css',
  scss: 'scss',
  json: 'json',
  md: 'markdown',
  sh: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  sql: 'sql',
  c: 'c',
  cpp: 'cpp',
  swift: 'swift',
  kt: 'kotlin',
  rb: 'ruby',
  php: 'php',
  vue: 'vue',
  svelte: 'svelte',
  toml: 'toml',
  xml: 'xml',
  graphql: 'graphql',
  gql: 'graphql',
  dockerfile: 'dockerfile',
  lua: 'lua',
  zig: 'zig',
}

export function getLanguageFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  return EXT_TO_LANG[ext] ?? 'text'
}
