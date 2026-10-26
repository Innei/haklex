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
import { $getRoot, $isElementNode } from 'lexical';
import {
  cloneElement,
  createElement,
  Fragment,
  isValidElement,
  type ReactNode,
  useMemo,
} from 'react';

import { createVirtualizationSurface } from '../virtualization/plugin';
import { renderBuiltinNode, textToSlug } from './engine/renderBuiltinNode';
import { renderTextNode } from './engine/renderTextNode';
import { groupRendererBlocks } from './flow';
import { preprocessFootnotes } from './preprocess/footnote';
import type { RendererDocument, RendererRow, RendererSurfaceProps } from './surface';
import type { BlockAnchorRenderer, BuiltinNodeRenderer, RichRendererProps } from './types';

export { createHeadlessEditor };

interface EditorConfig {
  namespace: string;
  theme: Record<string, any>;
}

interface RenderOptions {
  blockAnchor?: BlockAnchorRenderer;
  builtinNodeOverrides?: Record<string, BuiltinNodeRenderer>;
  headingIds?: Map<string, string>;
  recycleKeys?: boolean;
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

function domBlockAnchor(element: ReactNode, blockId: string, nodeKey: string): ReactNode {
  if (isValidElement(element) && typeof element.type === 'string') {
    return cloneElement(element as any, { 'data-block-id': blockId } as any);
  }

  return (
    <div className="rich-block-anchor" data-block-id={blockId} key={`${nodeKey}-block-anchor`}>
      {element}
    </div>
  );
}

function applyBlockId(
  element: ReactNode,
  blockId: string | undefined,
  nodeKey: string,
  options: RenderOptions,
): ReactNode {
  if (!blockId) return element;
  return (options.blockAnchor ?? domBlockAnchor)(element, blockId, nodeKey);
}

export function renderTree(
  node: any,
  editor: LexicalEditor,
  editorConfig: EditorConfig,
  headingSlugs: Map<string, number>,
  key: string,
  blockId: string | undefined,
  options: RenderOptions,
): ReactNode {
  const nodeKey = options.recycleKeys ? key : node.getKey ? node.getKey() : key;
  const headingSlug = options.headingIds?.get(node.getKey?.());
  const { builtinNodeOverrides } = options;

  if (typeof node.decorate === 'function') {
    let decoration: ReactNode = null;
    try {
      decoration = node.decorate(editor, editorConfig);
    } catch {
      /* fallthrough to builtin */
    }
    if (decoration != null) {
      const serialized = node.exportJSON ? node.exportJSON() : {};
      const override = builtinNodeOverrides?.[serialized.type];
      const wrapped = override
        ? override(serialized, nodeKey, [decoration], () =>
            wrapDecoration(serialized, nodeKey, decoration),
          )
        : wrapDecoration(serialized, nodeKey, decoration);
      return applyBlockId(wrapped, blockId, nodeKey, options);
    }
  }

  const serialized = node.exportJSON ? node.exportJSON() : {};

  if (serialized.type === 'text') {
    const override = builtinNodeOverrides?.text;
    if (override) {
      return override(serialized, nodeKey, null, () => renderTextNode(serialized, nodeKey));
    }
    return renderTextNode(serialized, nodeKey);
  }

  const childNodes: any[] = typeof node.getChildren === 'function' ? node.getChildren() : [];

  // Lexical's ElementNode.exportJSON() returns children: [] - child nodes
  // are not embedded in the serialized output. Restore minimal type info
  // from the live Lexical nodes so downstream structural checks (e.g.
  // nested-list detection in listitem rendering) work.
  if (
    Array.isArray(serialized.children) &&
    serialized.children.length === 0 &&
    childNodes.length > 0
  ) {
    serialized.children = childNodes.map((c: any) => ({
      type: typeof c.getType === 'function' ? c.getType() : c.__type,
    }));
  }

  let children: ReactNode[] | null = null;
  if (childNodes.length > 0) {
    children = childNodes.map((child: any, i: number) =>
      renderTree(child, editor, editorConfig, headingSlugs, `${nodeKey}-${i}`, undefined, options),
    );
  }

  const textContent = node.getTextContent ? node.getTextContent() : undefined;

  const override = builtinNodeOverrides?.[serialized.type];
  if (override) {
    const defaultRenderer = () =>
      renderBuiltinNode(serialized, nodeKey, children, headingSlugs, textContent, headingSlug);
    return applyBlockId(
      override(serialized, nodeKey, children, defaultRenderer),
      blockId,
      nodeKey,
      options,
    );
  }

  return applyBlockId(
    renderBuiltinNode(serialized, nodeKey, children, headingSlugs, textContent, headingSlug),
    blockId,
    nodeKey,
    options,
  );
}

function createRendererDocument(
  value: SerializedEditorState,
  nodes: any[],
  options: RenderOptions,
  noteLead: boolean,
): {
  document: RendererDocument;
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

  const headingIds = new Map<string, string>();
  const headingRows = new Map<string, number>();
  const paths = new Map<string, string>();
  const children = editorState.read(() => {
    const counts = new Map<string, number>();
    const walk = (node: any, row: number, path: string) => {
      paths.set(node.getKey(), path);
      if (node.getType() === 'heading') {
        const base = textToSlug(node.getTextContent());
        const count = counts.get(base) ?? 0;
        const slug = base ? `${base}${count ? `-${count}` : ''}` : '';
        counts.set(base, count + 1);
        headingIds.set(node.getKey(), slug);
        if (slug) headingRows.set(slug, row);
      }
      if ($isElementNode(node))
        node.getChildren().forEach((child, index) => walk(child, row, `${path}.${index}`));
    };
    const children = $getRoot().getChildren();
    children.forEach((node, index) => walk(node, index, `${index}:0`));
    return children;
  });
  const used = new Set<string>();
  const blocks = children.map((node, index) => {
    const data = rawRootChildren?.[index] ?? { type: node.getType(), version: 1 };
    let id = data.$?.blockId ?? `renderer-${index}`;
    while (used.has(id)) id = `${id}:${index}`;
    used.add(id);
    return {
      id,
      data,
      index,
      pool: `${data.type}:${data.type === 'dynamic' ? data.url : (data.tag ?? '')}`,
    };
  });
  const groups = groupRendererBlocks(
    blocks.map((block) => block.data),
    noteLead,
  );
  const rowByBlock = new Map<number, number>();
  const rows: RendererRow[] = groups.map((indices, index) => {
    const members = indices.map((i) => {
      rowByBlock.set(i, index);
      return blocks[i];
    });
    const first = members[0];
    return {
      blocks: members,
      id: first.id,
      data:
        members.length === 1
          ? first.data
          : { type: 'flow-group', version: 1, children: members.map((block) => block.data) },
      pool: members.length === 1 ? first.pool : 'flow-group',
    };
  });
  for (const [slug, index] of headingRows) headingRows.set(slug, rowByBlock.get(index)!);
  const render = (index: number, slot?: number) =>
    editorState.read(() => {
      const row = rows[index];
      return row ? (
        <Fragment key={slot === undefined ? row.id : `recycler-${slot}`}>
          {row.blocks.map((block, position) =>
            renderTree(
              children[block.index],
              editor,
              editorConfig,
              new Map(),
              slot === undefined ? `ssr-${block.index}` : `recycler-${slot}-${position}`,
              rawRootChildren?.[block.index]?.$?.blockId,
              { ...options, headingIds, recycleKeys: slot !== undefined },
            ),
          )}
        </Fragment>
      ) : null;
    });
  let fullContent: ReactNode;
  const document: RendererDocument = {
    editor,
    rows,
    headingRows,
    render,
    renderAll: () => (fullContent ??= <>{rows.map((_, index) => render(index))}</>),
    nodePath: (key) => (key ? (paths.get(key) ?? key) : '0'),
  };

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
            options,
          ),
        );
      nested = <>{ch}</>;
    });
    return nested;
  };

  return { document, footnoteData, renderNestedContent };
}

function FullSurface({ document }: RendererSurfaceProps) {
  return document.renderAll();
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
  blockAnchor,
  surface,
  virtualization,
}: RichRendererProps) {
  const variantClass = getVariantClass(variant);

  const outerRenderNestedContent = useOptionalNestedContentRenderer();

  const { document, footnoteData, renderNestedContent } = useMemo(() => {
    const nodes = extraNodes ? [...allNodes, ...extraNodes] : allNodes;
    return createRendererDocument(
      value,
      nodes,
      { blockAnchor, builtinNodeOverrides },
      variant === 'note',
    );
  }, [blockAnchor, builtinNodeOverrides, extraNodes, value, variant]);

  const { scrollContainer, overscan, estimateBlockHeight, preserveCapacity } =
    typeof virtualization === 'object' ? virtualization : {};
  const enabled = !!virtualization;
  const disabled = virtualization === false;
  const Surface = useMemo(() => {
    if (disabled) return FullSurface;
    if (enabled)
      return createVirtualizationSurface({
        scrollContainer,
        overscan,
        estimateBlockHeight,
        preserveCapacity,
      });
    return surface ?? FullSurface;
  }, [
    surface,
    enabled,
    disabled,
    scrollContainer,
    overscan,
    estimateBlockHeight,
    preserveCapacity,
  ]);

  const classes = ['rich-content', variantClass, className].filter(Boolean).join(' ');
  const hostProps =
    typeof Component === 'string'
      ? {
          'suppressHydrationWarning': true,
          'className': classes,
          'data-rich-nested': nested ? 'true' : undefined,
          'data-theme': theme,
        }
      : {};

  return (
    <PortalThemeProvider className={variantClass} theme={theme}>
      <ColorSchemeProvider colorScheme={theme}>
        <RendererConfigProvider config={rendererConfig} mode="renderer" variant={variant}>
          <FootnoteDefinitionsProvider
            definitions={footnoteData.definitions}
            displayNumberMap={footnoteData.displayNumberMap}
          >
            <NestedContentRendererProvider value={outerRenderNestedContent ?? renderNestedContent}>
              <Component {...hostProps} style={style}>
                <Surface document={document} />
              </Component>
            </NestedContentRendererProvider>
          </FootnoteDefinitionsProvider>
        </RendererConfigProvider>
      </ColorSchemeProvider>
    </PortalThemeProvider>
  );
}
