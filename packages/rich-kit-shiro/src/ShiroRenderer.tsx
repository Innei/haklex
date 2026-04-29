import type { RendererConfig, RichEditorVariant } from '@haklex/rich-editor';
import { NestedContentRendererProvider } from '@haklex/rich-editor';
import { nestedDocNodes } from '@haklex/rich-ext-nested-doc/static';
import {
  chatNodes,
  codeSnippetNodes,
  embedNodes,
  enhancedRendererConfig,
  ExcalidrawNode,
  galleryNodes,
} from '@haklex/rich-renderers';
import type { RichRendererProps } from '@haklex/rich-static-renderer';
import { RichRenderer } from '@haklex/rich-static-renderer';
import type { Klass, LexicalNode, SerializedEditorState } from 'lexical';
import { useCallback, useMemo } from 'react';

const defaultExtraNodes = [
  ExcalidrawNode,
  ...embedNodes,
  ...galleryNodes,
  ...codeSnippetNodes,
  ...chatNodes,
  ...nestedDocNodes,
];

export interface ShiroRendererProps extends Omit<
  RichRendererProps,
  'rendererConfig' | 'extraNodes'
> {
  extraNodes?: Array<Klass<LexicalNode>>;
  rendererConfig?: Partial<RendererConfig>;
}

export function ShiroRenderer({ extraNodes, rendererConfig, ...props }: ShiroRendererProps) {
  const mergedNodes = useMemo(
    () => (extraNodes ? [...defaultExtraNodes, ...extraNodes] : defaultExtraNodes),
    [extraNodes],
  );

  const mergedConfig = useMemo(
    () =>
      rendererConfig ? { ...enhancedRendererConfig, ...rendererConfig } : enhancedRendererConfig,
    [rendererConfig],
  );

  const renderNestedContent = useCallback(
    (value: SerializedEditorState, overrideVariant?: RichEditorVariant) => (
      <ShiroRenderer
        nested
        extraNodes={extraNodes}
        rendererConfig={rendererConfig}
        theme={props.theme}
        value={value}
        variant={overrideVariant ?? props.variant}
      />
    ),
    [extraNodes, props.theme, props.variant, rendererConfig],
  );

  return (
    <NestedContentRendererProvider value={renderNestedContent}>
      <RichRenderer {...props} extraNodes={mergedNodes} rendererConfig={mergedConfig} />
    </NestedContentRendererProvider>
  );
}
