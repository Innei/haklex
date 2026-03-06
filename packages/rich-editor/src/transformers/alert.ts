import { GIT_ALERT_TRANSFORMER as BASE } from '@haklex/rich-headless/transformers'
import type { ElementTransformer } from '@lexical/markdown'
import type { SerializedEditorState } from 'lexical'

import { $createAlertQuoteEditNode } from '../nodes/AlertQuoteEditNode'
import { AlertQuoteNode, type AlertType } from '../nodes/AlertQuoteNode'

const ALERT_TYPE_MAP: Record<string, AlertType> = {
  NOTE: 'note',
  TIP: 'tip',
  IMPORTANT: 'important',
  WARNING: 'warning',
  CAUTION: 'caution',
}

export const GIT_ALERT_TRANSFORMER: ElementTransformer = {
  ...BASE,
  dependencies: [AlertQuoteNode],
  regExp: /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/,
  replace: (parentNode, children, match) => {
    const typeKey = match[1]
    const alertType = ALERT_TYPE_MAP[typeKey] || 'note'

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

    const alertNode = $createAlertQuoteEditNode(alertType, content)
    parentNode.replace(alertNode)
  },
}
