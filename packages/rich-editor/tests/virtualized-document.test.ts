import { $getRoot, $isTextNode, createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';

import { VirtualDocument } from '../src/virtualization/document';
import { $syncChildren } from '../src/virtualization/sync';

const paragraph = (id: string, text: string) => ({
  type: 'paragraph',
  version: 1,
  format: '',
  indent: 0,
  direction: null,
  $: { blockId: id },
  children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
});

function setup() {
  const editor = createEditor({
    onError: (error) => {
      throw error;
    },
  });
  editor.setEditorState(
    editor.parseEditorState({
      root: {
        type: 'root',
        version: 1,
        format: '',
        indent: 0,
        direction: null,
        children: Array.from({ length: 2000 }, (_, i) => paragraph(`b${i}`, `Text ${i}`)),
      },
    }),
  );
  return { editor, document: new VirtualDocument(editor) };
}

describe('virtual editor document bridge', () => {
  it('refreshes a dirty descendant without serializing unchanged offscreen blocks again', () => {
    const { editor, document } = setup();
    const offscreen = document.rows[1999].data;
    editor.update(
      () => {
        const text = $getRoot().getFirstDescendant();
        if ($isTextNode(text)) text.setTextContent('External edit');
      },
      { discrete: true },
    );
    expect(document.rows[0].data.children?.[0].text).toBe('External edit');
    expect(document.rows[1999].data).toBe(offscreen);
    document.dispose();
  });

  it('rebinds compatible text nodes without replacing their Lexical identities', () => {
    const { editor, document } = setup();
    const keys = editor.read(() => [
      $getRoot().getFirstChild()!.getKey(),
      $getRoot().getFirstDescendant()!.getKey(),
    ]);
    editor.update(() => $syncChildren($getRoot(), [paragraph('new-block', 'New text')]), {
      discrete: true,
    });
    expect(
      editor.read(() => [
        $getRoot().getFirstChild()!.getKey(),
        $getRoot().getFirstDescendant()!.getKey(),
      ]),
    ).toEqual(keys);
    expect(document.rows[0].id).toBe('new-block');
    expect(document.rows[0].data.children?.[0].text).toBe('New text');
    document.dispose();
  });
  it('writes a visible edit into the full document without dropping offscreen blocks', () => {
    const { editor, document } = setup();
    document.replace(['b1000'], [paragraph('b1000', 'Edited')], 'test');
    const children = editor.getEditorState().toJSON().root.children as any[];
    expect(children).toHaveLength(2000);
    expect(children[0].children[0].text).toBe('Text 0');
    expect(children[1000].children[0].text).toBe('Edited');
    expect(children[1999].children[0].text).toBe('Text 1999');
    document.dispose();
  });

  it('preserves order and identities when an edited island splits and merges blocks', () => {
    const { editor, document } = setup();
    document.replace(['b7'], [paragraph('b7', 'Left'), paragraph('split', 'Right')], 'test');
    document.replace(['b7', 'split'], [paragraph('b7', 'Merged')], 'test');
    const children = editor.getEditorState().toJSON().root.children as any[];
    expect(children).toHaveLength(2000);
    expect(children.slice(6, 9).map((node) => node.$.blockId)).toEqual(['b6', 'b7', 'b8']);
    expect(children[7].children[0].text).toBe('Merged');
    document.dispose();
  });

  it('rejects a stale or noncontiguous island instead of replacing unrelated content', () => {
    const { editor, document } = setup();
    const before = editor.getEditorState();
    expect(() => document.replace(['b4', 'b6'], [paragraph('b4', 'Bad')], 'test')).toThrow();
    expect(editor.getEditorState()).toBe(before);
    document.dispose();
  });
});
