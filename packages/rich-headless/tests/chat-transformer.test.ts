import { createHeadlessEditor } from '@lexical/headless';
import { describe, expect, it } from 'vitest';

import { $toMarkdown, allHeadlessNodes } from '../src';

function snapshotToMarkdown(json: any): string {
  const editor = createHeadlessEditor({ nodes: allHeadlessNodes });
  const state = editor.parseEditorState(JSON.stringify(json));
  let md = '';
  state.read(() => {
    md = $toMarkdown();
  });
  return md;
}

describe('chat → markdown', () => {
  const wrap = (chatNode: any) => ({
    root: {
      type: 'root',
      version: 1,
      children: [chatNode],
      direction: 'ltr',
      format: '',
      indent: 0,
    },
  });

  it('user-agent: blockquote for user, paragraphs for agent', () => {
    const md = snapshotToMarkdown(
      wrap({
        type: 'chat',
        version: 1,
        variant: 'user-agent',
        participants: [
          { id: 'p_u', kind: 'user', name: 'Innei' },
          { id: 'p_a', kind: 'agent', name: 'Claude' },
        ],
        messages: [
          { id: 'm1', participantId: 'p_u', content: 'How does X work?' },
          { id: 'm2', participantId: 'p_a', content: 'It works like this.' },
        ],
      }),
    );
    expect(md).toContain('> **Innei:** How does X work?');
    expect(md).toContain('It works like this.');
  });

  it('user-user: blockquote for both speakers', () => {
    const md = snapshotToMarkdown(
      wrap({
        type: 'chat',
        version: 1,
        variant: 'user-user',
        participants: [
          { id: 'p_a', kind: 'user', name: 'Alice' },
          { id: 'p_b', kind: 'user', name: 'Bob' },
        ],
        messages: [
          { id: 'm1', participantId: 'p_a', content: 'Hi' },
          { id: 'm2', participantId: 'p_b', content: 'Hello' },
        ],
      }),
    );
    expect(md).toContain('> **Alice:** Hi');
    expect(md).toContain('> **Bob:** Hello');
  });

  it('falls back to default kind labels when name is unset', () => {
    const md = snapshotToMarkdown(
      wrap({
        type: 'chat',
        version: 1,
        variant: 'user-agent',
        participants: [
          { id: 'p_u', kind: 'user' },
          { id: 'p_a', kind: 'agent' },
        ],
        messages: [
          { id: 'm1', participantId: 'p_u', content: 'q' },
          { id: 'm2', participantId: 'p_a', content: 'a' },
        ],
      }),
    );
    expect(md).toContain('> **User:** q');
    expect(md).toContain('a');
  });
});
