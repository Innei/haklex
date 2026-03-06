import type { LexicalEditor, SerializedEditorState } from 'lexical'
import type { ComponentType } from 'react'
import { createContext, use } from 'react'

export interface NestedDocDialogEditorProps {
  initialValue: SerializedEditorState
  onEditorReady: (editor: LexicalEditor | null) => void
}

export type NestedDocDialogEditorComponent =
  ComponentType<NestedDocDialogEditorProps>

const NestedDocDialogEditorContext =
  createContext<NestedDocDialogEditorComponent | null>(null)

export const NestedDocDialogEditorProvider =
  NestedDocDialogEditorContext.Provider

export function useNestedDocDialogEditor(): NestedDocDialogEditorComponent | null {
  return use(NestedDocDialogEditorContext)
}
