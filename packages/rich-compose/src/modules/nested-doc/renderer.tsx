import {
  ColorSchemeProvider,
  NestedContentRendererProvider,
  useColorScheme,
  useOptionalNestedContentRenderer,
  useVariant,
} from '@haklex/rich-editor/static';
import {
  NestedDocPreviewCard,
  NestedDocRenderer,
  type NestedDocRendererProps,
} from '@haklex/rich-ext-nested-doc/static';
import type { SerializedEditorState } from 'lexical';
import { type ComponentType, useCallback, useMemo } from 'react';

import { useNestedDocConfig } from './module-config';

const TITLE_MAX_LENGTH = 80;

function extractTitle(state: SerializedEditorState): string {
  const first = state.root?.children?.[0] as
    | { children?: Array<{ text?: string; children?: any[] }>; text?: string }
    | undefined;
  if (!first) return '';
  const walk = (node: any): string => {
    if (node.text) return node.text;
    if (node.children) return node.children.map(walk).join('');
    return '';
  };
  return walk(first).slice(0, TITLE_MAX_LENGTH);
}

export const ComposedNestedDocStaticRenderer: ComponentType<NestedDocRendererProps> = ({
  contentState,
}) => {
  const { onExpand } = useNestedDocConfig();
  const colorScheme = useColorScheme();
  const variant = useVariant();
  const renderNestedContent = useOptionalNestedContentRenderer();

  const title = useMemo(() => extractTitle(contentState), [contentState]);

  const handleActivate = useCallback(
    (target: HTMLElement) => {
      if (!onExpand) return;
      const content = (
        <ColorSchemeProvider colorScheme={colorScheme}>
          <NestedContentRendererProvider value={renderNestedContent}>
            <NestedDocRenderer value={contentState} variant={variant} />
          </NestedContentRendererProvider>
        </ColorSchemeProvider>
      );
      onExpand({ contentState, title: title || undefined, content, target });
    },
    [onExpand, colorScheme, variant, renderNestedContent, contentState, title],
  );

  return (
    <NestedDocPreviewCard
      contentState={contentState}
      onActivate={onExpand ? handleActivate : undefined}
    />
  );
};
