import type { SerializedEditorState } from 'lexical'

export function extractTextContent(state: SerializedEditorState): string {
  function walk(node: any): string {
    if (node.text) return node.text
    if (node.children) return node.children.map(walk).join('')
    if (node.root) return walk(node.root)
    return ''
  }
  return walk(state)
}
