import { composeEditor } from '@haklex/rich-compose';
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
import { SlashMenuPlugin } from '@haklex/rich-plugin-slash-menu';
import { TableCellResizerPlugin, TableRowColumnHandlesPlugin } from '@haklex/rich-plugin-table';
import { ConvertToLinkCardAction } from '@haklex/rich-renderer-linkcard';
import type { ReactNode } from 'react';
import { useCallback } from 'react';

const ComposedEditor = composeEditor({ modules: allEditorModules });

async function demoFileUpload(
  file: File,
  opts?: { onProgress?: (percent: number) => void },
): Promise<{ src: string }> {
  for (let percent = 20; percent <= 80; percent += 30) {
    opts?.onProgress?.(percent);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsDataURL(file);
  });
  opts?.onProgress?.(100);
  return { src };
}

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
  fileUpload = demoFileUpload,
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
      fileUpload={fileUpload}
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
