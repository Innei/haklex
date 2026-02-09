import type { ElementTransformer } from '@lexical/markdown'
import type { LexicalNode } from 'lexical'

import {
  $createTaskListItemNode,
  $isTaskListItemNode,
  TaskListItemNode,
} from '../nodes/TaskListItemNode'

/**
 * Task list transformer: - [ ] / - [x] → TaskListItemNode
 *
 * Matches:
 * - [ ] Unchecked item
 * - [x] Checked item
 * - [X] Checked item (uppercase)
 */
export const TASK_LIST_ITEM_TRANSFORMER: ElementTransformer = {
  dependencies: [TaskListItemNode],
  export: (node: LexicalNode) => {
    if (!$isTaskListItemNode(node)) return null

    const checked = node.getChecked()
    const checkbox = checked ? '[x]' : '[ ]'

    // Get text content from children
    const textContent = node.getTextContent()

    return `- ${checkbox} ${textContent}`
  },
  regExp: /^(\s*)- \[([ x])\]\s/i,
  replace: (parentNode, children, match) => {
    const isChecked = match[2].toLowerCase() === 'x'
    const taskItem = $createTaskListItemNode(isChecked)

    // Append children to task item
    children.forEach((child) => {
      taskItem.append(child)
    })

    parentNode.replace(taskItem)
  },
  type: 'element',
}
