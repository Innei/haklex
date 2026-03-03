import type { LexicalEditor } from 'lexical'

import type { CommandItemConfig } from '../types/slash-menu'

export function collectCommandItems(
  editor: LexicalEditor,
): CommandItemConfig[] {
  const items: CommandItemConfig[] = []
  const nodes: Map<string, { klass: any }> = (editor as any)._nodes
  for (const { klass } of nodes.values()) {
    const configs: CommandItemConfig[] | undefined =
      klass.commandItems ?? klass.slashMenuItems
    if (configs) {
      for (const config of configs) {
        items.push(config)
      }
    }
  }
  return items
}
