import { MarkdownShortcutPlugin as LexicalMarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'

import { ALL_TRANSFORMERS } from '../transformers'

export function MarkdownShortcutsPlugin() {
  return <LexicalMarkdownShortcutPlugin transformers={ALL_TRANSFORMERS} />
}
