import type { LexicalEditor } from 'lexical'
import type { ReactNode } from 'react'

export type CommandPlacement = 'slash' | 'toolbar' | 'blockHandle'

export type ToolbarGroup =
  | 'history'
  | 'heading'
  | 'format'
  | 'color'
  | 'list'
  | 'align'
  | 'insert'

export interface CommandItemConfig {
  title: string
  icon?: ReactNode
  description?: string
  keywords?: string[]
  section?: string
  onSelect: (editor: LexicalEditor, queryString: string) => void

  placement?: CommandPlacement[]
  group?: ToolbarGroup
  shortcut?: string
  isActive?: (editor: LexicalEditor) => boolean
  isDisabled?: (editor: LexicalEditor) => boolean
}

/** @deprecated Use CommandItemConfig */
export type SlashMenuItemConfig = CommandItemConfig
