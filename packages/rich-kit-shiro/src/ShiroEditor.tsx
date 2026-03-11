import type { RichEditorProps } from '@haklex/rich-editor';
import { NestedContentRendererProvider, RichEditor } from '@haklex/rich-editor';
import { BlockHandlePlugin } from '@haklex/rich-plugin-block-handle';
import { FloatingToolbarPlugin } from '@haklex/rich-plugin-floating-toolbar';
import { FloatingLinkEditorPlugin } from '@haklex/rich-plugin-link-edit';
import type { MentionPlatformDef } from '@haklex/rich-plugin-mention';
import { MentionMenuPlugin } from '@haklex/rich-plugin-mention';
import { SlashMenuPlugin } from '@haklex/rich-plugin-slash-menu';
import { TableCellResizerPlugin, TableRowColumnHandlesPlugin } from '@haklex/rich-plugin-table';
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
} from '@haklex/rich-renderers-edit';
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical';
import type { ReactNode } from 'react';
import { useCallback, useMemo } from 'react';

import { ShiroRenderer } from './ShiroRenderer';

const defaultExtraNodes = [
  ExcalidrawEditNode,
  ...embedEditNodes,
  ...linkCardEditNodes,
  ...katexEditNodes,
  ...galleryEditNodes,
  ...codeSnippetEditNodes,
];

export interface ShiroEditorProps extends Omit<
  RichEditorProps,
  'rendererConfig' | 'extraNodes' | 'actions'
> {
  actions?: ReactNode;
  extraMentionPlatforms?: MentionPlatformDef[];
  extraNodes?: Array<Klass<LexicalNode>>;
  selfHostnames?: string[];
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
    () => (extraNodes ? [...defaultExtraNodes, ...extraNodes] : defaultExtraNodes),
    [extraNodes],
  );

  const renderNestedContent = useCallback(
    (value: SerializedEditorState, overrideVariant?: typeof variant) => (
      <ShiroRenderer theme={theme} value={value} variant={overrideVariant ?? variant} />
    ),
    [theme, variant],
  );

  const renderLinkExtraActions = useCallback(
    ({
      url,
      linkKey,
      actionButtonClassName,
    }: {
      url: string;
      linkKey: string;
      actionButtonClassName: string;
    }) => <ConvertToLinkCardAction className={actionButtonClassName} linkKey={linkKey} url={url} />,
    [],
  );

  return (
    <NestedContentRendererProvider value={renderNestedContent}>
      <RichEditor
        {...props}
        extraNodes={mergedNodes}
        rendererConfig={enhancedEditRendererConfig}
        theme={theme}
        variant={variant}
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
  );
}
