import { createEditor } from 'lexical';
import { describe, expect, it } from 'vitest';

import {
  $createWhiteboardNode,
  INSERT_WHITEBOARD_COMMAND,
  WHITEBOARD_NODE_KEY,
  WhiteboardEditNode,
  WhiteboardNode,
} from './index';

describe('whiteboard package identity', () => {
  it('keeps the stored lexical type as excalidraw', () => {
    expect(WhiteboardNode.getType()).toBe('excalidraw');
    expect(WhiteboardEditNode.getType()).toBe('excalidraw');
  });

  it('exposes the Whiteboard renderer slot and insert command', () => {
    expect(WHITEBOARD_NODE_KEY).toBe('Whiteboard');
    expect(INSERT_WHITEBOARD_COMMAND.type).toBe('INSERT_WHITEBOARD');
  });

  it('serializes nodes under the excalidraw type', () => {
    const editor = createEditor({
      nodes: [WhiteboardNode],
      onError: (e) => {
        throw e;
      },
    });
    let json: { type: string; snapshot: string } | undefined;
    editor.update(
      () => {
        json = $createWhiteboardNode('{"elements":[]}').exportJSON();
      },
      { discrete: true },
    );
    expect(json?.type).toBe('excalidraw');
    expect(json?.snapshot).toBe('{"elements":[]}');
  });
});
