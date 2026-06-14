import { composeEditor, type RichEditorModule } from '@haklex/rich-compose';
import { allEditorModules } from '@haklex/rich-compose/editor';
import type { RichEditorProps } from '@haklex/rich-editor';
import { EmbedPlugin } from '@haklex/rich-ext-embed';
import { BlockHandlePlugin } from '@haklex/rich-plugin-block-handle';
import { FloatingToolbarPlugin } from '@haklex/rich-plugin-floating-toolbar';
import { ImageEditModalPlugin } from '@haklex/rich-plugin-image-editor';
import { FloatingLinkEditorPlugin } from '@haklex/rich-plugin-link-edit';
import { LiteXmlPastePlugin } from '@haklex/rich-plugin-litexml-paste';
import type { MentionPlatformDef } from '@haklex/rich-plugin-mention';
import { MentionMenuPlugin } from '@haklex/rich-plugin-mention';
import { getBuiltinItems, SlashMenuPlugin } from '@haklex/rich-plugin-slash-menu';
import { TableCellResizerPlugin, TableRowColumnHandlesPlugin } from '@haklex/rich-plugin-table';
import { ConvertToLinkCardAction } from '@haklex/rich-renderer-linkcard';
import type { ReactNode } from 'react';
import { useCallback } from 'react';

const nestedEditorSlashItemTitles = new Set([
  'Text',
  'Heading 1',
  'Heading 2',
  'Heading 3',
  'Quote',
  'Bulleted List',
  'Numbered List',
]);

const nestedEditorSlashMenuModule: RichEditorModule = {
  name: 'nested-editor-slash-menu',
  nestedEditorPlugins: (
    <SlashMenuPlugin
      items={getBuiltinItems().filter((item) => nestedEditorSlashItemTitles.has(item.title))}
    />
  ),
};

const ComposedEditor = composeEditor({ modules: [...allEditorModules, nestedEditorSlashMenuModule] });

export interface LexicalEditorProps extends Omit<RichEditorProps, 'actions'> {
  actions?: ReactNode;
  extraMentionPlatforms?: MentionPlatformDef[];
  /** Extra controls rendered in the floating selection toolbar (e.g. Ask AI). */
  floatingToolbarActions?: ReactNode;
  selfHostnames?: string[];
}

export function LexicalEditor({
  actions,
  children,
  extraMentionPlatforms,
  floatingToolbarActions,
  selfHostnames,
  variant = 'article',
  theme = 'light',
  ...props
}: LexicalEditorProps) {
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
    <ComposedEditor
      {...props}
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
      <ImageEditModalPlugin />
      <LiteXmlPastePlugin />
      <FloatingToolbarPlugin actions={floatingToolbarActions} />
      <FloatingLinkEditorPlugin renderExtraActions={renderLinkExtraActions} />
      <EmbedPlugin selfHostnames={selfHostnames} />
      <TableRowColumnHandlesPlugin />
      <TableCellResizerPlugin />
      {children}
    </ComposedEditor>
  );
}
