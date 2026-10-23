import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { LexicalEditor } from 'lexical';
import { $getNodeByKey } from 'lexical';
import { useCallback, useMemo } from 'react';

import type { BannerType } from '../../nodes/BannerNode';
import { $isBannerNode } from '../../nodes/BannerNode';
import { BANNER_NODE_KEY } from '../../types/renderer-keys';
import { BannerRenderer } from '../renderers/BannerRenderer';
import { RendererWrapper } from '../RendererWrapper';
import { NestedEditorCorePlugins } from './NestedEditorCorePlugins';
import { useNestedEditorSync } from './useNestedEditorSync';

interface BannerEditDecoratorProps {
  bannerType: BannerType;
  contentEditor: LexicalEditor;
  nodeKey: string;
}

export function BannerEditDecorator({
  nodeKey,
  bannerType,
  contentEditor,
}: BannerEditDecoratorProps) {
  const [editor] = useLexicalComposerContext();
  const contentEditors = useMemo(() => [contentEditor], [contentEditor]);
  useNestedEditorSync(contentEditors, nodeKey);
  const editable = editor.isEditable();

  const handleTypeChange = useCallback(
    (newType: BannerType) => {
      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isBannerNode(node)) {
          node.setBannerType(newType);
        }
      });
    },
    [editor, nodeKey],
  );

  return (
    <div className="rich-banner-inner">
      <RendererWrapper
        defaultRenderer={BannerRenderer}
        rendererKey={BANNER_NODE_KEY}
        props={{
          type: bannerType,
          editable,
          onTypeChange: editable ? handleTypeChange : undefined,
        }}
      />
      <div className="rich-banner-content">
        <LexicalNestedComposer initialEditor={contentEditor}>
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={
              <ContentEditable
                aria-placeholder=""
                className="rich-banner-content-editable"
                placeholder={<span style={{ display: 'none' }} />}
                style={{ outline: 'none' }}
              />
            }
          />
          <NestedEditorCorePlugins />
        </LexicalNestedComposer>
      </div>
    </div>
  );
}
