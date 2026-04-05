import {
  allNodes,
  ColorSchemeProvider,
  editorTheme,
  FootnoteDefinitionsProvider,
  getVariantClass,
  gridClassNames,
  gridStyles,
  NestedContentRendererProvider,
  normalizeSerializedEditorState,
  RendererConfigProvider,
  semanticClassNames,
  sharedStyles,
  useOptionalNestedContentRenderer,
} from '@haklex/rich-editor/static';
import { PortalThemeProvider } from '@haklex/rich-style-token';
import { createHeadlessEditor } from '@lexical/headless';
import type { LexicalEditor, SerializedEditorState } from 'lexical';
import { $getRoot } from 'lexical';
import { cloneElement, createElement, isValidElement, type ReactNode, useMemo } from 'react';

import { renderBuiltinNode } from './engine/renderBuiltinNode';
import { renderTextNode } from './engine/renderTextNode';
import { preprocessFootnotes } from './preprocess/footnote';
import type { BuiltinNodeRenderer, RichRendererProps } from './types';

interface EditorConfig {
  namespace: string;
  theme: Record<string, any>;
}

const alertClassName = (type: string) =>
  `${semanticClassNames.alert} ${sharedStyles.alert} rich-alert-${type}`;

function wrapDecoration(serialized: any, key: string, decoration: ReactNode): ReactNode {
  switch (serialized.type) {
    case 'alert-quote': {
      return createElement(
        'div',
        { key, className: alertClassName(serialized.alertType) },
        decoration,
      );
    }
    case 'banner': {
      return createElement(
        'div',
        { key, className: `rich-banner rich-banner-${serialized.bannerType}` },
        decoration,
      );
    }
    case 'grid-container': {
      return createElement(
        'div',
        {
          key,
          className: `${gridClassNames.container} ${gridStyles.container}`,
        },
        decoration,
      );
    }
    default: {
      if (isValidElement(decoration)) {
        return cloneElement(decoration, { key });
      }
      return decoration;
    }
  }
}

function applyBlockId(element: ReactNode, blockId: string | undefined, nodeKey: string): ReactNode {
  if (!blockId) return element;

  if (isValidElement(element) && typeof element.type === 'string') {
    return cloneElement(element as any, { 'data-block-id': blockId } as any);
  }

  return (
    <div className="rich-block-anchor" data-block-id={blockId} key={`${nodeKey}-block-anchor`}>
      {element}
    </div>
  );
}

function renderTree(
  node: any,
  editor: LexicalEditor,
  editorConfig: EditorConfig,
  headingSlugs: Map<string, number>,
  key: string,
  blockId?: string,
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>,
): ReactNode {
  const nodeKey = node.getKey ? node.getKey() : key;

  if (typeof node.decorate === 'function') {
    try {
      const decoration = node.decorate(editor, editorConfig);
      if (decoration != null) {
        const serialized = node.exportJSON ? node.exportJSON() : {};
        return applyBlockId(wrapDecoration(serialized, nodeKey, decoration), blockId, nodeKey);
      }
    } catch {
      /* fallthrough to builtin */
    }
  }

  const serialized = node.exportJSON ? node.exportJSON() : {};

  if (serialized.type === 'text') {
    return renderTextNode(serialized, nodeKey);
  }

  let children: ReactNode[] | null = null;
  if (node.getChildren) {
    const childNodes = node.getChildren();
    if (childNodes.length > 0) {
      children = childNodes.map((child: any, i: number) =>
        renderTree(
          child,
          editor,
          editorConfig,
          headingSlugs,
          `${nodeKey}-${i}`,
          undefined,
          builtinNodeOverrides,
        ),
      );
    }
  }

  const textContent = node.getTextContent ? node.getTextContent() : undefined;

  const override = builtinNodeOverrides?.[serialized.type];
  if (override) {
    const defaultRenderer = () =>
      renderBuiltinNode(serialized, nodeKey, children, headingSlugs, textContent);
    return applyBlockId(override(serialized, nodeKey, children, defaultRenderer), blockId, nodeKey);
  }

  return applyBlockId(
    renderBuiltinNode(serialized, nodeKey, children, headingSlugs, textContent),
    blockId,
    nodeKey,
  );
}

function renderEditorToReact(
  value: SerializedEditorState,
  nodes: any[],
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>,
): {
  content: ReactNode;
  footnoteData: ReturnType<typeof preprocessFootnotes>;
  renderNestedContent: (state: SerializedEditorState) => ReactNode;
} {
  const editor = createHeadlessEditor({
    nodes,
    theme: editorTheme,
    editable: false,
    onError: (error: Error) => {
      console.error('[RichRenderer]', error);
    },
  });

  const editorConfig: EditorConfig = { namespace: 'ssr', theme: editorTheme };
  const normalizedValue = normalizeSerializedEditorState(value);

  const editorState = editor.parseEditorState(normalizedValue);
  editor.setEditorState(editorState);

  const footnoteData = preprocessFootnotes(normalizedValue);

  const rawRootChildren = (normalizedValue as any).root?.children as any[] | undefined;

  let content: ReactNode = null;
  editorState.read(() => {
    const root = $getRoot();
    const headingSlugs = new Map<string, number>();
    const children = root
      .getChildren()
      .map((child: any, i: number) =>
        renderTree(
          child,
          editor,
          editorConfig,
          headingSlugs,
          `ssr-${i}`,
          rawRootChildren?.[i]?.$?.blockId,
          builtinNodeOverrides,
        ),
      );
    content = <>{children}</>;
  });

  const renderNestedContent = (state: SerializedEditorState): ReactNode => {
    const nestedEditor = createHeadlessEditor({
      nodes,
      theme: editorTheme,
      editable: false,
      onError: (error: Error) => {
        console.error('[RichRenderer:nested]', error);
      },
    });
    const nestedEditorConfig: EditorConfig = {
      namespace: 'ssr-nested',
      theme: editorTheme,
    };
    const normalizedState = normalizeSerializedEditorState(state);
    const nestedState = nestedEditor.parseEditorState(normalizedState);
    nestedEditor.setEditorState(nestedState);
    let nested: ReactNode = null;
    const nestedRawChildren = (normalizedState as any).root?.children as any[] | undefined;
    nestedState.read(() => {
      const root = $getRoot();
      const headingSlugs = new Map<string, number>();
      const ch = root
        .getChildren()
        .map((child: any, i: number) =>
          renderTree(
            child,
            nestedEditor,
            nestedEditorConfig,
            headingSlugs,
            `nested-${i}`,
            nestedRawChildren?.[i]?.$?.blockId,
            builtinNodeOverrides,
          ),
        );
      nested = <>{ch}</>;
    });
    return nested;
  };

  return { content, footnoteData, renderNestedContent };
}

export function RichRenderer({
  value,
  variant = 'article',
  theme = 'light',
  className,
  style,
  as: Component = 'div',
  nested = false,
  rendererConfig,
  extraNodes,
  builtinNodeOverrides,
}: RichRendererProps) {
  const variantClass = getVariantClass(variant);

  const outerRenderNestedContent = useOptionalNestedContentRenderer();

  const { content, footnoteData, renderNestedContent } = useMemo(() => {
    const nodes = extraNodes ? [...allNodes, ...extraNodes] : allNodes;
    return renderEditorToReact(value, nodes, builtinNodeOverrides);
  }, [builtinNodeOverrides, extraNodes, value]);

  const classes = ['rich-content', variantClass, className].filter(Boolean).join(' ');

  return (
    <PortalThemeProvider className={variantClass} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <RendererConfigProvider config={rendererConfig} mode="renderer" variant={variant}>
          <FootnoteDefinitionsProvider
            definitions={footnoteData.definitions}
            displayNumberMap={footnoteData.displayNumberMap}
          >
            <NestedContentRendererProvider value={outerRenderNestedContent ?? renderNestedContent}>
              <Component
                suppressHydrationWarning
                className={classes}
                data-rich-nested={nested ? 'true' : undefined}
                data-theme={theme}
                style={style}
              >
                {content}
              </Component>
            </NestedContentRendererProvider>
          </FootnoteDefinitionsProvider>
        </RendererConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
