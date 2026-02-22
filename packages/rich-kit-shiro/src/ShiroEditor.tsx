import type { RichEditorProps } from '@haklex/rich-editor'
import { RichEditor } from '@haklex/rich-editor'
import { BlockHandlePlugin } from '@haklex/rich-plugin-block-handle'
import { FloatingToolbarPlugin } from '@haklex/rich-plugin-floating-toolbar'
import { FloatingLinkEditorPlugin } from '@haklex/rich-plugin-link-edit'
import { SlashMenuPlugin } from '@haklex/rich-plugin-slash-menu'
import {
  TableCellResizerPlugin,
  TableRowColumnHandlesPlugin,
} from '@haklex/rich-plugin-table'
import { galleryNodes, TldrawNode } from '@haklex/rich-renderers'
import {
  codeSnippetEditNodes,
  ConvertToLinkCardAction,
  embedEditNodes,
  EmbedPlugin,
  enhancedEditRendererConfig,
  katexEditNodes,
  linkCardEditNodes,
  PasteLinkCardPlugin,
  TldrawPlugin,
} from '@haklex/rich-renderers-edit'
import type { Klass, LexicalNode } from 'lexical'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'

const defaultExtraNodes = [
  TldrawNode,
  ...embedEditNodes,
  ...linkCardEditNodes,
  ...katexEditNodes,
  ...galleryNodes,
  ...codeSnippetEditNodes,
]

export interface ShiroEditorProps extends Omit<
  RichEditorProps,
  'rendererConfig' | 'extraNodes' | 'actions'
> {
  extraNodes?: Array<Klass<LexicalNode>>
  actions?: ReactNode
  selfHostnames?: string[]
}

export function ShiroEditor({
  extraNodes,
  actions,
  children,
  selfHostnames,
  ...props
}: ShiroEditorProps) {
  const mergedNodes = useMemo(
    () =>
      extraNodes ? [...defaultExtraNodes, ...extraNodes] : defaultExtraNodes,
    [extraNodes],
  )

  const renderLinkExtraActions = useCallback(
    ({
      url,
      linkKey,
      actionButtonClassName,
    }: {
      url: string
      linkKey: string
      actionButtonClassName: string
    }) => (
      <ConvertToLinkCardAction
        url={url}
        linkKey={linkKey}
        className={actionButtonClassName}
      />
    ),
    [],
  )

  return (
    <RichEditor
      {...props}
      extraNodes={mergedNodes}
      rendererConfig={enhancedEditRendererConfig}
      actions={
        <>
          <SlashMenuPlugin />
          {actions}
        </>
      }
    >
      <BlockHandlePlugin />
      <FloatingToolbarPlugin />
      <FloatingLinkEditorPlugin renderExtraActions={renderLinkExtraActions} />
      <TldrawPlugin />
      <EmbedPlugin selfHostnames={selfHostnames} />
      <PasteLinkCardPlugin />
      <TableRowColumnHandlesPlugin />
      <TableCellResizerPlugin />
      {children}
    </RichEditor>
  )
}
