import {
  buildEditorFromExtensions,
  NestedEditorExtension,
} from '@lexical/extension';
import {
  $getEditor,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalEditor,
} from 'lexical';
import { describe, expect, it, vi } from 'vitest';

describe('nested editor command bubbling', () => {
  it('delegates commands to the parent synchronously when the parent is idle', () => {
    const TEST_COMMAND = createCommand<string>('TEST_COMMAND');
    const parentEditor = buildEditorFromExtensions({ name: 'parent' });
    const childEditor = parentEditor.read(() =>
      buildEditorFromExtensions({
        dependencies: [NestedEditorExtension],
        name: 'child',
      }),
    );

    const parentListener = vi.fn((_payload: string, editor: LexicalEditor) => {
      expect(editor).toBe(childEditor);
      expect($getEditor()).toBe(parentEditor);
      return true;
    });
    const childListener = vi.fn((_payload: string, editor: LexicalEditor) => {
      expect(editor).toBe(childEditor);
      expect($getEditor()).toBe(childEditor);
      return false;
    });

    childEditor.registerCommand(
      TEST_COMMAND,
      childListener,
      COMMAND_PRIORITY_EDITOR,
    );
    parentEditor.registerCommand(
      TEST_COMMAND,
      parentListener,
      COMMAND_PRIORITY_EDITOR,
    );

    childEditor.update(
      () => {
        const result = childEditor.dispatchCommand(TEST_COMMAND, 'test-payload');

        expect(childListener).toHaveBeenCalledTimes(1);
        expect(parentListener).toHaveBeenCalledTimes(1);
        expect(result).toBe(true);
      },
      { discrete: true },
    );

    expect(childListener).toHaveBeenCalledTimes(1);
    expect(parentListener).toHaveBeenCalledTimes(1);
  });

  it('replays commands after the parent update completes', () => {
    const TEST_COMMAND = createCommand<string>('TEST_COMMAND');
    const parentEditor = buildEditorFromExtensions({ name: 'parent' });
    const childEditor = parentEditor.read(() =>
      buildEditorFromExtensions({
        dependencies: [NestedEditorExtension],
        name: 'child',
      }),
    );

    const parentListener = vi.fn((_payload: string, editor: LexicalEditor) => {
      expect(editor).toBe(childEditor);
      expect($getEditor()).toBe(parentEditor);
      return true;
    });
    const childListener = vi.fn((_payload: string, editor: LexicalEditor) => {
      expect(editor).toBe(childEditor);
      expect($getEditor()).toBe(childEditor);
      return false;
    });

    childEditor.registerCommand(
      TEST_COMMAND,
      childListener,
      COMMAND_PRIORITY_EDITOR,
    );
    parentEditor.registerCommand(
      TEST_COMMAND,
      parentListener,
      COMMAND_PRIORITY_EDITOR,
    );

    parentEditor.update(
      () => {
        const result = childEditor.dispatchCommand(TEST_COMMAND, 'test-payload');

        expect(childListener).toHaveBeenCalledTimes(1);
        expect(parentListener).toHaveBeenCalledTimes(0);
        expect(result).toBe(false);
      },
      { discrete: true },
    );

    expect(parentListener).toHaveBeenCalledTimes(1);
  });
});
