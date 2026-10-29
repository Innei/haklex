// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from '../src/components/dropdown-menu';

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

beforeAll(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

describe('DropdownMenuSub', () => {
  it('renders a submenu trigger as a menu item with its current value', () => {
    const container = document.createElement('div');
    document.body.append(container);
    const root = createRoot(container);
    act(() =>
      root.render(
        <DropdownMenu open>
          <DropdownMenuContent>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger value="Heading 2">Turn into</DropdownMenuSubTrigger>
              <DropdownMenuContent side="right">items</DropdownMenuContent>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      ),
    );
    const trigger = document.body.querySelector('[data-slot="dropdown-menu-sub-trigger"]');
    expect(trigger?.getAttribute('role')).toBe('menuitem');
    expect(trigger?.textContent).toContain('Turn into');
    expect(trigger?.textContent).toContain('Heading 2');
    act(() => root.unmount());
    container.remove();
  });
});
