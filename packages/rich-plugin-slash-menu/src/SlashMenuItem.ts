import { MenuOption } from '@lexical/react/LexicalTypeaheadMenuPlugin'
import type { LexicalEditor } from 'lexical'
import type { ReactNode } from 'react'

export class SlashMenuItem extends MenuOption {
  title: string
  icon: ReactNode
  description: string
  keywords: string[]
  section: string
  onSelect: (editor: LexicalEditor, queryString: string) => void

  constructor(
    title: string,
    options: {
      icon?: ReactNode
      description?: string
      keywords?: string[]
      section?: string
      onSelect: (editor: LexicalEditor, queryString: string) => void
    },
  ) {
    super(title)
    this.title = title
    this.icon = options.icon ?? ''
    this.description = options.description ?? ''
    this.keywords = options.keywords ?? []
    this.section = options.section ?? 'BASIC BLOCKS'
    this.onSelect = options.onSelect
  }
}
