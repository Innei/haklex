import { describe, expect, it } from 'vitest';

import type { ChatParticipant } from '../src/types';
import { switchVariant } from '../src/variant-reducer';

describe('switchVariant', () => {
  const ua: ChatParticipant[] = [
    { id: 'p_1', kind: 'user', name: 'Alice', avatar: 'https://a.png' },
    { id: 'p_2', kind: 'agent', name: 'Claude' },
  ];

  it('user-agent → user-user flips second participant kind, preserves rest', () => {
    const result = switchVariant('user-user', ua);
    expect(result).toEqual([
      { id: 'p_1', kind: 'user', name: 'Alice', avatar: 'https://a.png' },
      { id: 'p_2', kind: 'user', name: 'Claude' },
    ]);
  });

  it('user-user → user-agent flips second participant kind to agent', () => {
    const uu: ChatParticipant[] = [
      { id: 'p_1', kind: 'user', name: 'Alice' },
      { id: 'p_2', kind: 'user', name: 'Bob' },
    ];
    const result = switchVariant('user-agent', uu);
    expect(result).toEqual([
      { id: 'p_1', kind: 'user', name: 'Alice' },
      { id: 'p_2', kind: 'agent', name: 'Bob' },
    ]);
  });

  it('preserves participant ids across switches (round-trip)', () => {
    const a = switchVariant('user-user', ua);
    const b = switchVariant('user-agent', a);
    expect(b.map((p) => p.id)).toEqual(['p_1', 'p_2']);
  });
});
