import { createEditor } from 'lexical';
import { describe, expect, it, vi } from 'vitest';

import {
  $createChatNode,
  $isChatNode,
  ChatNode,
  type SerializedChatNode,
} from '../src/nodes/ChatNode';

vi.mock('@haklex/rich-editor/renderers', () => ({
  createRendererDecoration: vi.fn(),
}));

vi.mock('../src/ChatRenderer', () => ({
  ChatRenderer: vi.fn(),
}));

function makeEditor() {
  return createEditor({
    namespace: 'ChatNodeTest',
    nodes: [ChatNode],
    onError: (error) => {
      throw error;
    },
  });
}

describe('ChatNode', () => {
  it('getType returns "chat"', () => {
    expect(ChatNode.getType()).toBe('chat');
  });

  it('exportJSON / importJSON round-trip preserves all fields', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createChatNode({
        variant: 'user-agent',
        participants: [
          { id: 'p_1', kind: 'user', name: 'Innei' },
          { id: 'p_2', kind: 'agent' },
        ],
        messages: [
          { id: 'm_1', participantId: 'p_1', content: 'Hi' },
          { id: 'm_2', participantId: 'p_2', content: 'Hello.' },
        ],
      });

      const json = node.exportJSON();
      expect(json).toMatchObject({
        type: 'chat',
        version: 1,
        variant: 'user-agent',
        participants: [
          { id: 'p_1', kind: 'user', name: 'Innei' },
          { id: 'p_2', kind: 'agent' },
        ],
        messages: [
          { id: 'm_1', participantId: 'p_1', content: 'Hi' },
          { id: 'm_2', participantId: 'p_2', content: 'Hello.' },
        ],
      });

      const restored = ChatNode.importJSON(json as SerializedChatNode);
      expect(restored.exportJSON()).toEqual(json);
    });
  });

  it('clone preserves all fields and key', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createChatNode({
        variant: 'user-user',
        participants: [
          { id: 'p_a', kind: 'user' },
          { id: 'p_b', kind: 'user' },
        ],
        messages: [],
      });
      const cloned = ChatNode.clone(node);
      expect(cloned.exportJSON()).toEqual(node.exportJSON());
    });
  });

  it('$isChatNode returns true for ChatNode instances', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createChatNode({
        variant: 'user-agent',
        participants: [],
        messages: [],
      });
      expect($isChatNode(node)).toBe(true);
      expect($isChatNode(null)).toBe(false);
      expect($isChatNode(undefined)).toBe(false);
    });
  });

  it('synthesizes default participants when payload omits them', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createChatNode({ variant: 'user-agent' });
      const json = node.exportJSON();
      expect(json.participants).toHaveLength(2);
      expect(json.participants[0].kind).toBe('user');
      expect(json.participants[1].kind).toBe('agent');
      expect(json.participants[0].id).toMatch(/^p_/);
      expect(json.messages).toEqual([]);
    });
  });

  it('isInline returns false', () => {
    const editor = makeEditor();
    editor.update(() => {
      const node = $createChatNode({ variant: 'user-agent' });
      expect(node.isInline()).toBe(false);
    });
  });
});
