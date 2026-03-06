import './styles.css.ts'

import type { Klass, LexicalNode } from 'lexical'

import { NestedDocEditNode } from './NestedDocEditNode'
import { NestedDocNode } from './NestedDocNode'

export type {
  NestedDocDialogEditorComponent,
  NestedDocDialogEditorProps,
} from './NestedDocDialogEditorContext'
export {
  NestedDocDialogEditorProvider,
  useNestedDocDialogEditor,
} from './NestedDocDialogEditorContext'
export { NestedDocEditDecorator } from './NestedDocEditDecorator'
export {
  $createNestedDocEditNode,
  $isNestedDocEditNode,
  NestedDocEditNode,
} from './NestedDocEditNode'
export type { SerializedNestedDocNode } from './NestedDocNode'
export {
  $createNestedDocNode,
  $isNestedDocNode,
  NestedDocNode,
} from './NestedDocNode'
export { INSERT_NESTED_DOC_COMMAND, NestedDocPlugin } from './NestedDocPlugin'
export { NestedDocRenderer } from './NestedDocRenderer'
export { NestedDocStaticDecorator } from './NestedDocStaticDecorator'
export { NESTED_DOC_BLOCK_TRANSFORMER } from './transformer'

export const nestedDocNodes: Array<Klass<LexicalNode>> = [NestedDocNode]
export const nestedDocEditNodes: Array<Klass<LexicalNode>> = [NestedDocEditNode]
