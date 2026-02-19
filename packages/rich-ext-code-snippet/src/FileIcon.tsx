import { getIconData, iconToHTML, iconToSVG } from '@iconify/utils'
import { icons } from '@iconify-json/material-icon-theme'
import type { FC } from 'react'
import { useMemo } from 'react'

const EXT_TO_ICON: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  tsx: 'react_ts',
  jsx: 'react',
  py: 'python',
  rs: 'rust',
  go: 'go',
  java: 'java',
  html: 'html',
  css: 'css',
  scss: 'sass',
  json: 'json',
  md: 'markdown',
  sh: 'console',
  yml: 'yaml',
  yaml: 'yaml',
  sql: 'database',
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
  dockerfile: 'docker',
  lua: 'lua',
  zig: 'zig',
}

function getIconSvg(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const iconName = EXT_TO_ICON[ext] ?? 'file'
  const data = getIconData(icons, iconName)
  if (!data) return null
  const svg = iconToSVG(data)
  return iconToHTML(svg.body, svg.attributes)
}

export const FileIcon: FC<{ filename: string; size?: number }> = ({
  filename,
  size = 16,
}) => {
  const html = useMemo(() => getIconSvg(filename), [filename])

  if (!html) {
    return (
      <span
        className="rcs-file-icon"
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.5,
          fontSize: size * 0.6,
        }}
      >
        F
      </span>
    )
  }

  return (
    <span
      className="rcs-file-icon"
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        flexShrink: 0,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
