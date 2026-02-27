export type CodeBlockCursorPlacement = 'start' | 'end'

const codeBlockCursorIntentMap = new Map<string, CodeBlockCursorPlacement>()

export function setCodeBlockCursorIntent(
  nodeKey: string,
  placement: CodeBlockCursorPlacement,
) {
  codeBlockCursorIntentMap.set(nodeKey, placement)
}

export function consumeCodeBlockCursorIntent(
  nodeKey: string,
): CodeBlockCursorPlacement | null {
  const placement = codeBlockCursorIntentMap.get(nodeKey)
  if (!placement) return null
  codeBlockCursorIntentMap.delete(nodeKey)
  return placement
}
