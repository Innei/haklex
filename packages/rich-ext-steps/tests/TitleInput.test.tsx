// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TitleInput } from '../src/TitleInput';

vi.mock('../src/styles-edit.css', () => ({
  titleInput: '',
  editClassNames: { titleInput: 'rich-steps-edit-title-input' },
}));

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;

function mount(onEnter = vi.fn()) {
  container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <TitleInput autoFocus={false} value="" onEnter={onEnter} onValueChange={vi.fn()} />,
    );
  });
  return { input: container.querySelector('input')!, onEnter, root };
}

afterEach(() => {
  container?.remove();
  container = null;
});

function keydown(input: HTMLInputElement, init: KeyboardEventInit) {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  act(() => {
    input.dispatchEvent(event);
  });
  return event as KeyboardEvent & { _lexicalHandled?: boolean };
}

describe('TitleInput', () => {
  it.each([
    'keydown',
    'keyup',
    'beforeinput',
    'input',
    'compositionstart',
    'compositionend',
    'paste',
    'cut',
    'copy',
  ])('marks %s as handled so the outer Lexical editor ignores it', (type) => {
    const { input } = mount();
    const event = new Event(type, { bubbles: true, cancelable: true }) as Event & {
      _lexicalHandled?: boolean;
    };
    input.dispatchEvent(event);
    expect(event._lexicalHandled).toBe(true);
  });

  it('moves on with Enter', () => {
    const { input, onEnter } = mount();
    const event = keydown(input, { key: 'Enter' });
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores the Enter that confirms an IME candidate', () => {
    const { input, onEnter } = mount();
    keydown(input, { key: 'Enter', isComposing: true });
    keydown(input, { key: 'Enter', keyCode: 229 });
    expect(onEnter).not.toHaveBeenCalled();
  });
});
