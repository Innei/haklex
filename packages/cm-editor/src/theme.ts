import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language'
import type { Extension } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'

export const baseTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
  },
  '&.cm-editor': {
    outline: 'none',
  },
  '&.cm-editor.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'inherit',
  },
  '.cm-content': {
    minHeight: '1.5em',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(125, 125, 125, 0.26) !important',
  },
})

export function getThemeExtensions(colorScheme: 'light' | 'dark'): Extension {
  return colorScheme === 'dark'
    ? [oneDark, baseTheme]
    : [baseTheme, syntaxHighlighting(defaultHighlightStyle, { fallback: true })]
}
