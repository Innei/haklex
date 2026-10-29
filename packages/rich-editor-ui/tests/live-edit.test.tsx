// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeAll, describe, expect, it } from 'vitest';

import type { LiveApply } from '../src/hooks/use-live-edit';
import { useLiveEdit } from '../src/hooks/use-live-edit';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

type Values = { alt: string };

function mount(values: Values, onApply: LiveApply<Values>) {
  let api: ReturnType<typeof useLiveEdit<Values>> | undefined;
  function Probe() {
    api = useLiveEdit(values, true, onApply);
    return null;
  }
  const root = createRoot(document.createElement('div'));
  act(() => root.render(<Probe />));
  return { api: () => api!, unmount: () => act(() => root.unmount()) };
}

describe('useLiveEdit', () => {
  it('merges every edit after the first into one history step', () => {
    const calls: [Partial<Values>, boolean][] = [];
    const { api, unmount } = mount({ alt: 'a' }, (patch, merge) => calls.push([patch, merge]));
    api().apply({ alt: 'b' });
    api().apply({ alt: 'c' });
    expect(calls).toEqual([
      [{ alt: 'b' }, false],
      [{ alt: 'c' }, true],
    ]);
    unmount();
  });

  it('reverts to the values from when it opened, only after a change', () => {
    const calls: [Partial<Values>, boolean][] = [];
    const { api, unmount } = mount({ alt: 'a' }, (patch, merge) => calls.push([patch, merge]));
    api().revert();
    expect(calls).toEqual([]);
    api().apply({ alt: 'b' });
    api().revert();
    expect(calls.at(-1)).toEqual([{ alt: 'a' }, true]);
    unmount();
  });
});
