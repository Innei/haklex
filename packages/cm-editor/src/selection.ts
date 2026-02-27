import type { EditorView } from '@codemirror/view'

export function isOnFirstLine(view: EditorView): boolean {
  const { main } = view.state.selection
  if (!main.empty) return false
  return view.state.doc.lineAt(main.head).number === 1
}

export function isOnLastLine(view: EditorView): boolean {
  const { main } = view.state.selection
  if (!main.empty) return false
  return view.state.doc.lineAt(main.head).number === view.state.doc.lines
}
