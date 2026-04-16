import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let capturedPanelProps: Record<string, unknown> | null = null;

vi.mock('@lexical/react/LexicalComposerContext', () => ({
  useLexicalComposerContext: () => [
    {
      isEditable: () => true,
      update: vi.fn(),
    },
  ],
}));

vi.mock('@haklex/rich-editor/nodes', () => ({
  $isKaTeXBlockNode: () => false,
  $isKaTeXInlineNode: () => false,
}));

vi.mock('@haklex/rich-editor/renderers', () => ({
  KaTeXRenderer: () => null,
}));

vi.mock('@haklex/rich-editor-ui', () => ({
  ActionBar: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ActionButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
  AnimatedTabs: () => null,
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverPanel: (props: Record<string, unknown> & { children?: React.ReactNode }) => {
    capturedPanelProps = props;
    return <>{props.children}</>;
  },
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../src/styles.css', () => {
  const semanticClassNames = {
    editWrapper: '',
    panel: '',
    header: '',
    headerLeft: '',
    iconWrap: '',
    title: '',
    headerRight: '',
    mode: '',
    deleteButton: '',
    tabs: '',
    bodyScrollArea: '',
    body: '',
    field: '',
    label: '',
    inputWrap: '',
    textarea: '',
    inputActions: '',
    preview: '',
    previewEmpty: '',
    snippetSearchWrap: '',
    snippetSearchIcon: '',
    snippetSearchInput: '',
    snippetGroups: '',
    snippetGroup: '',
    snippetGroupLabel: '',
    snippetList: '',
    snippetButton: '',
    snippetMeta: '',
    snippetName: '',
    snippetHint: '',
    snippetPreview: '',
    snippetsPlaceholder: '',
    footer: '',
    charCount: '',
  };

  return {
    semanticClassNames,
    editWrapper: '',
    panel: '',
    header: '',
    headerLeft: '',
    iconWrap: '',
    title: '',
    headerRight: '',
    mode: '',
    deleteButton: '',
    tabs: '',
    bodyScrollArea: '',
    body: '',
    field: '',
    label: '',
    inputWrap: '',
    textarea: '',
    inputActions: '',
    preview: '',
    previewEmpty: '',
    snippetSearchWrap: '',
    snippetSearchIcon: '',
    snippetSearchInput: '',
    snippetGroups: '',
    snippetGroup: '',
    snippetGroupLabel: '',
    snippetList: '',
    snippetButton: '',
    snippetMeta: '',
    snippetName: '',
    snippetHint: '',
    snippetPreview: '',
    snippetsPlaceholder: '',
    footer: '',
    charCount: '',
  };
});

describe('KaTeXEditDecorator', () => {
  beforeEach(() => {
    capturedPanelProps = null;
  });

  it('passes the textarea ref to PopoverPanel.initialFocus', async () => {
    const { KaTeXEditDecorator } = await import('../src/KaTeXEditDecorator');

    renderToStaticMarkup(
      <KaTeXEditDecorator
        autoOpenOnMount
        displayMode
        equation="x^2 + y^2 = z^2"
        nodeKey="katex-node"
      >
        <span>preview</span>
      </KaTeXEditDecorator>,
    );

    expect(capturedPanelProps).not.toBeNull();
    expect(capturedPanelProps?.initialFocus).toBeTruthy();
    expect(typeof capturedPanelProps?.initialFocus).toBe('object');
    expect(capturedPanelProps?.initialFocus).toHaveProperty('current');
  });
});
