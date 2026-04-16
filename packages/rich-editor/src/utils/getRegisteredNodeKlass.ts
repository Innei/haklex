import type { Klass, LexicalNode } from 'lexical'
import { $getEditor, getRegisteredNode } from 'lexical'

function isMissingActiveEditorError(error: unknown): boolean {
  return (
    error instanceof Error
    && error.message.includes('Unable to find an active editor')
  )
}

export function getRegisteredNodeKlass<TNode extends LexicalNode>(
  nodeType: string,
  fallbackKlass: Klass<TNode>,
): Klass<TNode> {
  try {
    const registeredNode = getRegisteredNode($getEditor(), nodeType)
    const registeredKlass = registeredNode?.klass

    if (
      registeredKlass
      && (
        registeredKlass === fallbackKlass
        || registeredKlass.prototype instanceof fallbackKlass
      )
    ) {
      return registeredKlass as Klass<TNode>
    }
  } catch (error) {
    if (!isMissingActiveEditorError(error)) {
      throw error
    }
  }

  return fallbackKlass
}
