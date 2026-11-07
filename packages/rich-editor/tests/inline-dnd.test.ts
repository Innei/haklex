// @vitest-environment happy-dom
import type { LexicalEditor } from 'lexical';
import { $createParagraphNode, $createTextNode, $getRoot, createEditor } from 'lexical';
import { afterEach, describe, expect, it } from 'vitest';

import { $createMentionNode, MentionNode } from '../src/nodes/MentionNode';
import { moveInlineNodeBetweenEditors } from '../src/plugins/InlineDndPlugin';

function mount(build: () => void) {
  const editor = createEditor({
    nodes: [MentionNode],
    onError: (error) => {
      throw error;
    },
  });
  const root = document.createElement('div');
  root.contentEditable = 'true';
  document.body.append(root);
  editor.setRootElement(root);
  editor.update(build, { discrete: true });
  return { editor, root };
}

const content = (editor: LexicalEditor) =>
  editor.getEditorState().read(() =>
    $getRoot()
      .getChildren()
      .map((block) =>
        block
          .getChildren()
          .map((child) => (child.getType() === 'mention' ? '@' : child.getTextContent()))
          .join(''),
      ),
  );

afterEach(() => {
  document.body.innerHTML = '';
});

describe('moveInlineNodeBetweenEditors', () => {
  it('moves an inline node from one editor to a DOM point in another', () => {
    let mentionKey = '';
    const source = mount(() => {
      const mention = $createMentionNode('github', 'innei');
      mentionKey = mention.getKey();
      $getRoot().append($createParagraphNode().append($createTextNode('a '), mention));
    });
    const target = mount(() => {
      $getRoot().append($createParagraphNode().append($createTextNode('hello')));
    });

    const text = target.root.querySelector('span')!.firstChild!;
    const range = document.createRange();
    range.setStart(text, 2);
    range.collapse(true);

    moveInlineNodeBetweenEditors(source.editor, mentionKey, target.editor, range);

    expect(content(source.editor)).toEqual(['a ']);
    expect(content(target.editor)).toEqual(['he@llo']);
  });
});
