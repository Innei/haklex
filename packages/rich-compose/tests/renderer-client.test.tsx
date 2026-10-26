// @vitest-environment happy-dom
import { act, useMemo, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { composeRenderer } from '../src/core/compose';
import type { RichRendererBaseProps } from '../src/core/types';
import { rendererVirtualizationModule } from '../src/virtualization/plugin';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root | undefined;
afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const text = {
  type: 'text',
  version: 1,
  text: 'content',
  format: 0,
  detail: 0,
  mode: 'normal',
  style: '',
};
const value = {
  root: {
    type: 'root',
    version: 1,
    direction: null,
    format: '',
    indent: 0,
    children: ['paragraph', 'paragraph', 'heading'].map((type) => ({
      type,
      version: 1,
      tag: type === 'heading' ? 'h2' : undefined,
      direction: null,
      format: '',
      indent: 0,
      children: [text],
    })),
  },
} as RichRendererBaseProps['value'];

describe('renderer custom scroll container', () => {
  it.each(['props', 'module'])(
    'binds the parent ref after mount through %s and estimates original blocks',
    async (mode) => {
      vi.stubGlobal(
        'ResizeObserver',
        class {
          observe() {}
          unobserve() {}
          disconnect() {}
        },
      );
      vi.spyOn(document, 'elementFromPoint').mockReturnValue(null);
      const estimated: string[] = [];
      function Fixture() {
        const viewport = useRef<HTMLDivElement>(null);
        const options = useMemo(
          () => ({
            scrollContainer: viewport,
            overscan: 0,
            estimateBlockHeight: (block: { type: string }) => {
              if (!['paragraph', 'heading'].includes(block.type))
                throw new Error('Expected an original document block');
              estimated.push(block.type);
              return 28;
            },
          }),
          [],
        );
        const Renderer = useMemo(
          () =>
            composeRenderer({
              modules: mode === 'module' ? [rendererVirtualizationModule(options)] : [],
            }),
          [options],
        );
        return (
          <div data-viewport="" ref={viewport}>
            <Renderer
              value={value}
              variant="note"
              virtualization={mode === 'props' ? options : undefined}
            />
          </div>
        );
      }
      const container = document.createElement('div');
      document.body.append(container);
      root = createRoot(container);
      await act(async () => root!.render(<Fixture />));
      let canvas: (HTMLElement & { virtualRenderer?: { viewport: HTMLElement } }) | null = null;
      for (let i = 0; i < 200 && !canvas?.virtualRenderer; i++) {
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
        });
        canvas = container.querySelector('[data-virtual-renderer]');
      }
      expect(container.querySelector('[role="alert"]')).toBeNull();
      expect(canvas?.virtualRenderer?.viewport).toBe(container.querySelector('[data-viewport]'));
      expect(estimated).toHaveLength(3);
    },
  );
});
