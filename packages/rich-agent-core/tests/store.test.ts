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

  it('dispatch updates state and notifies subscribers', () => {
    const store = createAgentStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.dispatch({ type: 'set_status', status: 'running' });

    expect(store.getState().status).toBe('running');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(store.getState());
  });

  it('add_bubble appends to bubbles array', () => {
    const store = createAgentStore();
    store.dispatch({
      type: 'add_bubble',
      bubble: { type: 'user', content: 'hello' },
    });
    expect(store.getState().bubbles).toHaveLength(1);
    expect(store.getState().bubbles[0]).toEqual({ type: 'user', content: 'hello' });
  });

  it('update_last_bubble modifies the last bubble', () => {
    const store = createAgentStore();
    store.dispatch({
      type: 'add_bubble',
      bubble: { type: 'assistant', content: 'hel', streaming: true },
    });
    store.dispatch({
      type: 'update_last_bubble',
      bubble: { type: 'assistant', content: 'hello world', streaming: false },
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
    store.dispatch({ type: 'set_diff_state', diffState: diff });
    expect(store.getState().diffState).toBe(diff);
  });

  it('reset clears everything', () => {
    const store = createAgentStore();
    store.dispatch({ type: 'set_status', status: 'running' });
    store.dispatch({
      type: 'add_bubble',
      bubble: { type: 'user', content: 'hi' },
    });
    store.dispatch({ type: 'reset' });

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
    store.dispatch({ type: 'set_status', status: 'running' });
    expect(listener).not.toHaveBeenCalled();
  });
});
