import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@haklex/rich-style-token', () => ({
  PortalThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@haklex/rich-editor/static', () => ({
  allNodes: [],
  ColorSchemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  editorTheme: {},
  FootnoteDefinitionsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  getVariantClass: () => '',
  gridClassNames: { container: '' },
  gridStyles: { container: '' },
  NestedContentRendererProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  normalizeSerializedEditorState: (state: any) =>
    state?.root?.children?.length
      ? state
      : {
          ...state,
          root: {
            ...state?.root,
            children: [
              {
                children: [],
                direction: null,
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: state?.root?.direction ?? null,
            format: state?.root?.format ?? '',
            indent: state?.root?.indent ?? 0,
            type: 'root',
            version: state?.root?.version ?? 1,
          },
        },
  RendererConfigProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  semanticClassNames: new Proxy({}, { get: () => '' }),
  sharedStyles: new Proxy({}, { get: () => '' }),
  useOptionalNestedContentRenderer: () => null,
}));

vi.mock('../src/engine/renderBuiltinNode', () => ({
  renderBuiltinNode: (node: any, key: string, children: React.ReactNode[] | null) => {
    if (node.type === 'paragraph') {
      return <p key={key}>{children}</p>;
    }
    return <div key={key}>{children}</div>;
  },
}));

vi.mock('../src/preprocess/footnote', () => ({
  preprocessFootnotes: () => ({
    footnotes: [],
    footnotesById: new Map(),
    numbersById: new Map(),
  }),
}));

describe('RichRenderer', () => {
  it('does not throw when given an empty root state', async () => {
    const { RichRenderer } = await import('../src/RichRenderer');
    const emptyState = {
      root: {
        children: [],
        direction: null,
        format: '',
        indent: 0,
        type: 'root',
        version: 1,
      },
    };

    expect(() => renderToStaticMarkup(<RichRenderer value={emptyState as any} />)).not.toThrow();
  });
});
