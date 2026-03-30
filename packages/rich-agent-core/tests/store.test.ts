import { describe, expect, it, vi } from 'vitest';

import { createAgentStore } from '../src/store';

describe('createAgentStore', () => {
  it('initial state is idle with empty bubbles', () => {
    const store = createAgentStore();
    const state = store.getState();
    expect(state.status).toBe('idle');
    expect(state.bubbles).toEqual([]);
    expect(state.diffState).toBeNull();
  });

  it('actions update state and notify subscribers', () => {
    const store = createAgentStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.getState().setStatus('running');

    expect(store.getState().status).toBe('running');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].status).toBe('running');
  });

  it('add_bubble appends to bubbles array', () => {
    const store = createAgentStore();
    store.getState().addBubble({ type: 'user', content: 'hello' });
    expect(store.getState().bubbles).toHaveLength(1);
    expect(store.getState().bubbles[0]).toEqual({ type: 'user', content: 'hello' });
  });

  it('update_last_bubble modifies the last bubble', () => {
    const store = createAgentStore();
    store.getState().addBubble({ type: 'assistant', content: 'hel', streaming: true });
    store.getState().updateLastBubble({
      type: 'assistant',
      content: 'hello world',
      streaming: false,
    });
    expect(store.getState().bubbles).toHaveLength(1);
    expect(store.getState().bubbles[0]).toEqual({
      type: 'assistant',
      content: 'hello world',
      streaming: false,
    });
  });

  it('set_diff_state replaces diff state', () => {
    const store = createAgentStore();
    const diff = {
      entries: [],
      getByBlockId: () => undefined,
      getPending: () => [],
    };
    store.getState().setDiffState(diff);
    expect(store.getState().diffState).toBe(diff);
  });

  it('reset clears everything', () => {
    const store = createAgentStore();
    store.getState().setStatus('running');
    store.getState().addBubble({ type: 'user', content: 'hi' });
    store.getState().reset();

    const state = store.getState();
    expect(state.status).toBe('idle');
    expect(state.bubbles).toEqual([]);
    expect(state.diffState).toBeNull();
  });

  it('unsubscribe stops notifications', () => {
    const store = createAgentStore();
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    unsub();
    store.getState().setStatus('running');
    expect(listener).not.toHaveBeenCalled();
  });

  it('accepts tool_call_group bubble', () => {
    const store = createAgentStore();
    store.getState().addBubble({
      type: 'tool_call_group',
      id: 'g1',
      items: [
        {
          id: 'tc1',
          toolName: 'replace_node',
          description: 'replacing paragraph at block-3',
          params: { blockId: 'p3' },
          status: 'pending',
        },
      ],
    });
    expect(store.getState().bubbles).toHaveLength(1);
    const bubble = store.getState().bubbles[0];
    expect(bubble.type).toBe('tool_call_group');
    if (bubble.type === 'tool_call_group') {
      expect(bubble.items[0].status).toBe('pending');
    }
  });

  it('updateToolCallItem patches an item by groupId and itemId', () => {
    const store = createAgentStore();
    store.getState().addBubble({
      type: 'tool_call_group',
      id: 'g1',
      items: [
        { id: 'tc1', toolName: 'read_selection', params: {}, status: 'pending' },
        { id: 'tc2', toolName: 'replace_node', params: { blockId: 'p1' }, status: 'pending' },
      ],
    });

    store.getState().updateToolCallItem('g1', 'tc1', {
      status: 'running',
      startedAt: 1000,
    });

    const bubble = store.getState().bubbles[0];
    if (bubble.type === 'tool_call_group') {
      expect(bubble.items[0].status).toBe('running');
      expect(bubble.items[0].startedAt).toBe(1000);
      expect(bubble.items[1].status).toBe('pending');
    }
  });

  it('updateToolCallItem completes an item with result', () => {
    const store = createAgentStore();
    store.getState().addBubble({
      type: 'tool_call_group',
      id: 'g1',
      items: [
        {
          id: 'tc1',
          toolName: 'delete_node',
          params: { blockId: 'p1' },
          status: 'running',
          startedAt: 1000,
        },
      ],
    });

    store.getState().updateToolCallItem('g1', 'tc1', {
      status: 'completed',
      result: 'Deleted block "p1"',
      resultPreview: 'Deleted block "p1"',
      finishedAt: 1050,
    });

    const bubble = store.getState().bubbles[0];
    if (bubble.type === 'tool_call_group') {
      expect(bubble.items[0].status).toBe('completed');
      expect(bubble.items[0].result).toBe('Deleted block "p1"');
      expect(bubble.items[0].finishedAt).toBe(1050);
    }
  });

  it('updateToolCallItem is a no-op for unknown groupId', () => {
    const store = createAgentStore();
    store.getState().addBubble({
      type: 'tool_call_group',
      id: 'g1',
      items: [{ id: 'tc1', toolName: 'x', params: {}, status: 'pending' }],
    });
    const before = store.getState().bubbles;
    store.getState().updateToolCallItem('unknown', 'tc1', { status: 'running' });
    expect(store.getState().bubbles).toBe(before);
  });

  it('accepts enhanced thinking bubble with steps', () => {
    const store = createAgentStore();
    store.getState().addBubble({
      type: 'thinking',
      content: 'Step one.\n\nStep two.',
      id: 'th1',
      rawText: 'Step one.\n\nStep two.',
      steps: ['Step one.', 'Step two.'],
      isStreaming: false,
    });
    const bubble = store.getState().bubbles[0];
    expect(bubble.type).toBe('thinking');
    if (bubble.type === 'thinking') {
      expect(bubble.steps).toEqual(['Step one.', 'Step two.']);
    }
  });
});
