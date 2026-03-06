import type { RichEditorProps } from '@haklex/rich-editor'
import { NestedContentRendererProvider, RichEditor } from '@haklex/rich-editor'
import { BlockHandlePlugin } from '@haklex/rich-plugin-block-handle'
import { FloatingToolbarPlugin } from '@haklex/rich-plugin-floating-toolbar'
import { FloatingLinkEditorPlugin } from '@haklex/rich-plugin-link-edit'
import type { MentionPlatformDef } from '@haklex/rich-plugin-mention'
import { MentionMenuPlugin } from '@haklex/rich-plugin-mention'
import { SlashMenuPlugin } from '@haklex/rich-plugin-slash-menu'
import {
  TableCellResizerPlugin,
  TableRowColumnHandlesPlugin,
} from '@haklex/rich-plugin-table'
import {
  codeSnippetEditNodes,
  ConvertToLinkCardAction,
  embedEditNodes,
  EmbedPlugin,
  enhancedEditRendererConfig,
  ExcalidrawEditNode,
  ExcalidrawPlugin,
  galleryEditNodes,
  katexEditNodes,
  linkCardEditNodes,
  PasteLinkCardPlugin,
} from '@haklex/rich-renderers-edit'
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical'
import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'

import { ShiroRenderer } from './ShiroRenderer'

const defaultExtraNodes = [
  ExcalidrawEditNode,
  ...embedEditNodes,
  ...linkCardEditNodes,
  ...katexEditNodes,
  ...galleryEditNodes,
  ...codeSnippetEditNodes,
]

export interface ShiroEditorProps extends Omit<
  RichEditorProps,
  'rendererConfig' | 'extraNodes' | 'actions'
> {
  extraNodes?: Array<Klass<LexicalNode>>
  actions?: ReactNode
  selfHostnames?: string[]
  extraMentionPlatforms?: MentionPlatformDef[]
}

export function ShiroEditor({
  extraNodes,
  actions,
  children,
  selfHostnames,
  extraMentionPlatforms,
  variant = 'article',
  theme = 'light',
  ...props
}: ShiroEditorProps) {
  const mergedNodes = useMemo(
    () =>
      extraNodes ? [...defaultExtraNodes, ...extraNodes] : defaultExtraNodes,
    [extraNodes],
  )

  const renderNestedContent = useCallback(
    (value: SerializedEditorState) => (
      <ShiroRenderer value={value} variant={variant} theme={theme} />
    ),
    [theme, variant],
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
    <NestedContentRendererProvider value={renderNestedContent}>
      <RichEditor
        {...props}
        variant={variant}
        theme={theme}
        extraNodes={mergedNodes}
        rendererConfig={enhancedEditRendererConfig}
        actions={
          <>
            <SlashMenuPlugin />
            <MentionMenuPlugin extraPlatforms={extraMentionPlatforms} />
            {actions}
          </>
        }
      >
        <BlockHandlePlugin />
        <FloatingToolbarPlugin />
        <FloatingLinkEditorPlugin renderExtraActions={renderLinkExtraActions} />
        <ExcalidrawPlugin />
        <EmbedPlugin selfHostnames={selfHostnames} />
        <PasteLinkCardPlugin />
        <TableRowColumnHandlesPlugin />
        <TableCellResizerPlugin />
        {children}
      </RichEditor>
    </NestedContentRendererProvider>
  )
}
