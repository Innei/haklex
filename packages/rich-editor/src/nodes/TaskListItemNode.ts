import type {
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'
import { ElementNode } from 'lexical'

export type SerializedTaskListItemNode = Spread<
  {
    checked: boolean
  },
  SerializedElementNode
>

export class TaskListItemNode extends ElementNode {
  __checked: boolean

  static getType(): string {
    return 'task-list-item'
  }

  static clone(node: TaskListItemNode): TaskListItemNode {
    return new TaskListItemNode(node.__checked, node.__key)
  }

  constructor(checked: boolean, key?: NodeKey) {
    super(key)
    this.__checked = checked
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const li = document.createElement('li')
    li.className = 'rich-task-list-item'
    li.setAttribute('role', 'listitem')

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = this.__checked
    checkbox.disabled = true
    checkbox.className = 'rich-task-checkbox'

    li.prepend(checkbox)

    if (this.__checked) {
      li.classList.add('rich-task-checked')
    }

    return li
  }

  updateDOM(prevNode: TaskListItemNode, dom: HTMLElement): boolean {
    if (prevNode.__checked !== this.__checked) {
      const checkbox = dom.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement | null
      if (checkbox) {
        checkbox.checked = this.__checked
      }
      dom.classList.toggle('rich-task-checked', this.__checked)
    }
    return false
  }

  static importJSON(
    serializedNode: SerializedTaskListItemNode,
  ): TaskListItemNode {
    return $createTaskListItemNode(serializedNode.checked)
  }

  exportJSON(): SerializedTaskListItemNode {
    return {
      ...super.exportJSON(),
      type: 'task-list-item',
      checked: this.__checked,
      version: 1,
    }
  }

  getChecked(): boolean {
    return this.getLatest().__checked
  }

  setChecked(checked: boolean): void {
    const writable = this.getWritable()
    writable.__checked = checked
  }

  toggleChecked(): void {
    this.setChecked(!this.getChecked())
  }

  isInline(): boolean {
    return false
  }
}

export function $createTaskListItemNode(
  checked = false,
): TaskListItemNode {
  return new TaskListItemNode(checked)
}

export function $isTaskListItemNode(
  node: LexicalNode | null | undefined,
): node is TaskListItemNode {
  return node instanceof TaskListItemNode
}
