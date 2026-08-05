import { COMMAND_PRIORITY_EDITOR, createCommand, createEditor, type LexicalEditor } from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import { createNestedEditor } from '../src/nodes/shared';

vi.mock('../src/styles/theme', () => ({
  editorTheme: {},
}));

vi.mock('../src/styles/shared.css', () => {
  const identityProxy = new Proxy({}, { get: (_target, prop: string) => prop });
  return {
    semanticClassNames: identityProxy,
    sharedStyles: identityProxy,
  };
});

vi.mock('../src/styles/katex.css', () => {
  const identityProxy = new Proxy({}, { get: (_target, prop: string) => prop });
  return {
    katexClassNames: identityProxy,
    katexStyles: identityProxy,
  };
});

vi.mock('../src/components/utils', () => ({
  clsx: (...args: Array<string | undefined | null | false>) => args.filter(Boolean).join(' '),
  getVariantClass: () => '',
}));

describe('command propagation to the originating editor', () => {
  it('passes the nested editor as the second argument to a root-registered listener', () => {
    const TEST_COMMAND = createCommand<void>('TEST_COMMAND');
    const root = createEditor({
      namespace: 'CommandPropagationRootTest',
      onError: (error) => {
        throw error;
      },
    });

    let nested: LexicalEditor | undefined;
    root.update(() => {
      nested = createNestedEditor('CommandPropagationNestedTest');
    });
    if (!nested) throw new Error('nested editor was not created');

    const listener = vi.fn((_payload: void, fromEditor: LexicalEditor) => {
      expect(fromEditor).toBe(nested);
      return true;
    });

    root.registerCommand(TEST_COMMAND, listener, COMMAND_PRIORITY_EDITOR);

    nested.dispatchCommand(TEST_COMMAND, undefined);

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
