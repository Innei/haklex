import type { LexicalEditor } from 'lexical'
import type { ReactNode } from 'react'

export interface SlashMenuItemConfig {
  title: string
  icon?: ReactNode
  description?: string
  keywords?: string[]
  section?: string
  onSelect: (editor: LexicalEditor, queryString: string) => void
}
