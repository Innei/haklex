import type { ElementTransformer } from '@lexical/markdown'
import { $isQuoteNode } from '@lexical/rich-text'
import type { LexicalNode, SerializedEditorState } from 'lexical'

import {
  $createAlertQuoteNode,
  $isAlertQuoteNode,
  AlertQuoteNode,
  type AlertType,
} from '../nodes/AlertQuoteNode'

/**
 * Git-style alert transformer: > [!NOTE] → AlertQuoteNode
 *
 * Supported types:
 * - [!NOTE] → note
 * - [!TIP] → tip
 * - [!IMPORTANT] → important
 * - [!WARNING] → warning
 * - [!CAUTION] → caution
 *
 * Example:
 * > [!NOTE]
 * > This is a note
 */

const ALERT_TYPE_MAP: Record<string, AlertType> = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'important',
  WARNING: 'warning',
  CAUTION: 'caution',
}

export const GIT_ALERT_TRANSFORMER: ElementTransformer = {
  dependencies: [AlertQuoteNode],
  export: (node: LexicalNode) => {
    if (!$isAlertQuoteNode(node)) {
      // Fallback to regular quote
      if ($isQuoteNode(node)) {
        const lines = node.getTextContent().split('\n')
        return lines.map((line) => `> ${line}`).join('\n')
      }
      return null
    }

    const type = node.getAlertType()
    const typeKey = Object.keys(ALERT_TYPE_MAP).find(
      (key) => ALERT_TYPE_MAP[key] === type,
    )

    const textContent = node.getTextContent()
    const lines = textContent.split('\n')
    const firstLine = `> [!${typeKey || 'NOTE'}]`
    const restLines = lines.map((line) => `> ${line}`)

    return [firstLine, ...restLines].join('\n')
  },
  regExp: /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/,
  replace: (parentNode, children, match) => {
    const typeKey = match[1]
    const alertType = ALERT_TYPE_MAP[typeKey] || 'note'

    const alertNode = $createAlertQuoteNode(alertType)

    // Serialize children into nested editor content
    const serializedChildren = children.map((child) => child.exportJSON())
    const content = {
      root: {
        children: [
          {
            type: 'paragraph',
            children: serializedChildren,
            direction: null,
            format: '',
            indent: 0,
            textFormat: 0,
            textStyle: '',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    } as unknown as SerializedEditorState

    const editorState = alertNode.getContentEditor().parseEditorState(content)
    alertNode.getContentEditor().setEditorState(editorState)

    parentNode.replace(alertNode)
  },
  type: 'element',
}
