// @vitest-environment happy-dom
import { allHeadlessNodes } from '@haklex/rich-headless';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
  $parseSerializedNode,
  createEditor,
  type LexicalEditor,
} from 'lexical';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { playAgentWrite } from '../src';
import { createAgentStreamPlayer, type PlaybackState } from '../src/player';

class FakeHighlight {
  ranges: Range[];
  constructor(...ranges: Range[]) {
    this.ranges = ranges;
  }
}

const highlights = new Map<string, FakeHighlight>();

beforeEach(() => {
  highlights.clear();
  Object.assign(globalThis, { Highlight: FakeHighlight });
  Object.defineProperty(globalThis, 'CSS', { configurable: true, value: { highlights } });
});

const disposers: (() => void)[] = [];
afterEach(() => {
  for (const dispose of disposers.splice(0)) dispose();
  document.body.innerHTML = '';
});

function setup() {
  const editor = createEditor({
    nodes: allHeadlessNodes,
    onError: (error) => {
      throw error;
    },
  });
  const root = document.createElement('div');
  root.contentEditable = 'true';
  document.body.append(root);
  editor.setRootElement(root);
  editor.update(
    () => {
      $getRoot().append($createParagraphNode().append($createTextNode('existing')));
    },
    { discrete: true },
  );
  const states: PlaybackState[] = [];
  const player = createAgentStreamPlayer(editor, () => ({
    agentName: 'AI',
    backlogSeconds: 6,
    charsPerSecond: 80,
    maxSeconds: 3,
    onPlaybackChange: (state) => states.push(state),
    scrollContainer: null,
  }));
  disposers.push(() => player.dispose());
  return { editor, root, states };
}

const hiddenText = () =>
  (highlights.get('agent-stream-hidden')?.ranges ?? []).map((range) => range.toString());

function appendParagraph(editor: LexicalEditor, text: string) {
  playAgentWrite(editor, () => {
    $getRoot().append($createParagraphNode().append($createTextNode(text)));
  });
}

const lastKey = (editor: LexicalEditor) =>
  editor.getEditorState().read(() => $getRoot().getLastChildOrThrow().getKey());

describe('createAgentStreamPlayer', () => {
  it('starts playback and hides the new text for an agent write', () => {
    const { editor, states } = setup();
    appendParagraph(editor, 'hello world');
    expect(states.at(-1)).toEqual({ playing: true, blockKey: lastKey(editor) });
    expect(hiddenText()).toEqual(['hello world']);
  });

  it('ignores an untagged update', () => {
    const { editor, states } = setup();
    editor.update(
      () => {
        $getRoot().append($createParagraphNode().append($createTextNode('typed')));
      },
      { discrete: true },
    );
    expect(states).toEqual([]);
    expect(hiddenText()).toEqual([]);
  });

  it('shows everything when the user presses a key in the editor', () => {
    const { editor, root, states } = setup();
    appendParagraph(editor, 'hello world');
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(states.at(-1)).toEqual({ playing: false, blockKey: null });
    expect(hiddenText()).toEqual([]);
  });

  it('reports exactly one start and one stop for an interrupted write', () => {
    const { editor, root, states } = setup();
    appendParagraph(editor, 'hello world');
    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(states).toEqual([
      { playing: true, blockKey: lastKey(editor) },
      { playing: false, blockKey: null },
    ]);
  });

  it('ends a block whose unrevealed text is changed by someone else', () => {
    const { editor, states } = setup();
    appendParagraph(editor, 'hello world');
    editor.update(
      () => {
        const block = $getRoot().getLastChild();
        if ($isElementNode(block)) block.clear().append($createTextNode('hello there'));
      },
      { discrete: true },
    );
    expect(hiddenText()).toEqual([]);
    expect(states.at(-1)).toEqual({ playing: false, blockKey: null });
  });

  it('keeps the pending text hidden when an agent appends to a playing block', () => {
    const { editor } = setup();
    appendParagraph(editor, 'hello world');
    playAgentWrite(editor, () => {
      const block = $getRoot().getLastChild();
      if ($isElementNode(block)) block.append($createTextNode(' again'));
    });
    expect(hiddenText()).toEqual(['hello world again']);
  });

  it('reports the end of playback when disposed mid-playback', () => {
    const { editor, states } = setup();
    appendParagraph(editor, 'hello world');
    disposers.splice(0).forEach((dispose) => dispose());
    expect(states.at(-1)).toEqual({ playing: false, blockKey: null });
  });

  it('shows everything when the page is hidden', () => {
    const { editor, states } = setup();
    appendParagraph(editor, 'hello world');
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    expect(hiddenText()).toEqual([]);
    expect(states.at(-1)).toEqual({ playing: false, blockKey: null });
  });

  it('keeps playing when someone else only changes block properties', () => {
    const { editor } = setup();
    appendParagraph(editor, 'hello world');
    editor.update(
      () => {
        const block = $getRoot().getLastChild();
        if ($isElementNode(block)) block.setIndent(1);
      },
      { discrete: true },
    );
    expect(hiddenText()).toEqual(['hello world']);
  });

  it('hides a new decorator block until the reveal reaches it', () => {
    const { editor } = setup();
    playAgentWrite(editor, () => {
      $getRoot().append(
        $createParagraphNode().append($createTextNode('before')),
        $parseSerializedNode({ type: 'image', version: 1, src: 'a.jpg', altText: '' } as never),
      );
    });
    const image = editor.getElementByKey(lastKey(editor));
    expect(image?.style.visibility).toBe('hidden');
  });
});
