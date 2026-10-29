// @vitest-environment happy-dom
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor } from 'lexical';
import { COMMAND_PRIORITY_CRITICAL } from 'lexical';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { AGENT_PIN_SELECTION_COMMAND } from '../src/commands';
import { AgentAskAIAction } from '../src/components/AgentAskAIAction';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

let container: HTMLDivElement | null = null;
let root: Root | null = null;
let editor: LexicalEditor | null = null;

afterEach(() => {
  if (root) act(() => root?.unmount());
  container?.remove();
  root = null;
  container = null;
  document.body.innerHTML = '';
});

function Capture() {
  [editor] = useLexicalComposerContext();
  return null;
}

function mount(onPin?: () => void) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root?.render(
      <LexicalComposer
        initialConfig={{
          namespace: 'AskAI',
          onError: (e) => {
            throw e;
          },
        }}
      >
        <AgentAskAIAction onPin={onPin} />
        <Capture />
      </LexicalComposer>,
    ),
  );
  return container.querySelector<HTMLButtonElement>('button')!;
}

describe('AgentAskAIAction', () => {
  it('renders a labelled action button with a tooltip', () => {
    const button = mount();
    expect(button.textContent).toContain('Ask AI');
    expect(button.querySelector('svg')).not.toBeNull();
    expect(button.dataset.tooltip).toBe('Ask AI');
    expect(button.className).toContain('re-ui-action-btn');
  });

  it('pins the selection on click, not on mousedown', () => {
    const onPin = vi.fn();
    const button = mount(onPin);
    const pinned = vi.fn(() => true);
    editor!.registerCommand(AGENT_PIN_SELECTION_COMMAND, pinned, COMMAND_PRIORITY_CRITICAL);

    const down = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
    act(() => {
      button.dispatchEvent(down);
    });
    expect(down.defaultPrevented).toBe(true);
    expect(pinned).not.toHaveBeenCalled();

    act(() => button.click());
    expect(pinned).toHaveBeenCalledOnce();
    expect(onPin).toHaveBeenCalledOnce();
  });
});
