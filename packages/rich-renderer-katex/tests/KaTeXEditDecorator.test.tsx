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

vi.mock('@haklex/rich-editor-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@haklex/rich-editor-ui')>()),
  Popover: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  PopoverPanel: (props: Record<string, unknown> & { children?: React.ReactNode }) => {
    capturedPanelProps = props;
    return <>{props.children}</>;
  },
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

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
