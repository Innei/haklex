import type { FC, ReactNode } from 'react'
import { useMemo } from 'react'

import { getMaterialIconSvg } from './material-icon'

/** Maps file extension to material-icon-theme icon name. */
export const EXT_TO_ICON: Record<string, string> = {
  ts: 'typescript',
  tsx: 'react-ts', // TSX → React icon (same as JSX)
  mts: 'typescript',
  cts: 'typescript',
  js: 'javascript',
  jsx: 'react',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  rs: 'rust',
  go: 'go',
  java: 'java',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'sass',
  sass: 'sass',
  less: 'sass',
  json: 'json',
  jsonc: 'json',
  json5: 'json',
  md: 'markdown',
  mdx: 'markdown',
  sh: 'console',
  bash: 'console',
  zsh: 'console',
  yml: 'yaml',
  yaml: 'yaml',
  sql: 'database',
  c: 'c',
  h: 'c',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  swift: 'swift',
  kt: 'kotlin',
  kts: 'kotlin',
  rb: 'ruby',
  php: 'php',
  vue: 'vue',
  svelte: 'svelte',
  toml: 'toml',
  xml: 'xml',
  graphql: 'graphql',
  gql: 'graphql',
  dockerfile: 'docker',
  lua: 'lua',
  zig: 'zig',
}

function getFileIconSvg(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const iconName = EXT_TO_ICON[ext] ?? 'file'
  return getMaterialIconSvg(iconName)
}

export interface FileIconProps {
  filename: string
  size?: number
  /** Optional class for the wrapper (e.g. consumer styles). */
  className?: string
  /** Fallback when no icon is found. Default "F". */
  fallback?: ReactNode
}

export const FileIcon: FC<FileIconProps> = ({
  filename,
  size = 16,
  className,
  fallback = 'F',
}) => {
  const html = useMemo(() => getFileIconSvg(filename), [filename])

  const wrapperStyle = {
    width: size,
    height: size,
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: html ? 1 : 0.5,
    fontSize: size * 0.6,
  }

  if (!html) {
    return (
      <span className={className} style={wrapperStyle}>
        {fallback}
      </span>
    )
  }

  return (
    <span
      className={className}
      style={{ width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
