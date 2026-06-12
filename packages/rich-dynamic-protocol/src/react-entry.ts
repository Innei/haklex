import type { ReactElement } from 'react';
import { createRoot } from 'react-dom/client';

import type { DynamicComponentModule, DynamicHostContext, DynamicMountInput } from './index';

export function defineDynamicComponent(
  render: (props: Record<string, unknown>, host: DynamicHostContext) => ReactElement,
): DynamicComponentModule {
  return {
    mount(container, input) {
      const root = createRoot(container);
      root.render(render(input.props, input.host));
      return {
        update(next: DynamicMountInput) {
          root.render(render(next.props, next.host));
        },
        unmount() {
          root.unmount();
        },
      };
    },
  };
}
