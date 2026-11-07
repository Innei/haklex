// @vitest-environment happy-dom
import { createEditor } from 'lexical';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';

import { EditableGate } from '../src/components/editable-gate';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

afterEach(() => {
  document.body.innerHTML = '';
});

describe('EditableGate', () => {
  it('switches to the editable view when the editor is unlocked after mounting', () => {
    const editor = createEditor({ editable: false });
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);

    act(() =>
      root.render(
        <EditableGate editable={<span>edit</span>} editor={editor} readOnly={<span>view</span>} />,
      ),
    );
    expect(container.textContent).toBe('view');

    act(() => editor.setEditable(true));
    expect(container.textContent).toBe('edit');

    act(() => editor.setEditable(false));
    expect(container.textContent).toBe('view');
    act(() => root.unmount());
  });
});
