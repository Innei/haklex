import type { SerializedEditorState } from 'lexical'

export function truncateEditorState(
  state: SerializedEditorState,
  maxNodes: number,
): SerializedEditorState {
  const root = state.root
  if (!root?.children || root.children.length <= maxNodes) return state

  return {
    ...state,
    root: {
      ...root,
      children: root.children.slice(0, maxNodes),
    },
  }
}

export function hasRenderableEditorState(
  state: SerializedEditorState,
): boolean {
  const children = state.root?.children ?? []
  if (children.length === 0) return false
  if (children.length > 1) return true

  const first = children[0] as
    | {
        type?: string
        children?: Array<{
          type?: string
          text?: string
        }>
      }
    | undefined

  if (!first) return false
  if (first.type !== 'paragraph') return true

  return (
    first.children?.some((child) => {
      if (child.type !== 'text') return true
      return Boolean(child.text?.trim())
    }) ?? false
  )
}
