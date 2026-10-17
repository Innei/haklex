import { afterEach, describe, expect, it, vi } from 'vitest';

import { markdownTestPreset } from '../../../demo/src/fixtures/markdown-test-preset';
import { nodeSamples } from '../../../demo/src/fixtures/node-samples';
import { renderMermaid } from '../src/utils';

function diagrams(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  const node = value as Record<string, unknown>;
  return [
    ...(node.type === 'mermaid' && typeof node.diagram === 'string' ? [node.diagram] : []),
    ...Object.values(node).flatMap(diagrams),
  ];
}

afterEach(() => vi.unstubAllGlobals());

describe('Pele rendering', () => {
  it('renders the existing English and Chinese document fixtures, including pie and Gantt', () => {
    for (const source of diagrams([nodeSamples, markdownTestPreset])) {
      const result = renderMermaid(source);
      expect(result.svg).toContain('<svg');
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    }
  });

  it('produces identical server and browser output even when Canvas measures text differently', () => {
    const source = 'flowchart LR\n A[中文 and English] --> B["**Bold label**"]';
    const server = renderMermaid(source);
    vi.stubGlobal(
      'OffscreenCanvas',
      class {
        getContext() {
          return { measureText: () => ({ width: 1000 }) };
        }
      },
    );
    expect(renderMermaid(source)).toEqual(server);
  });

  it('embeds the theme in exported SVG images', () => {
    const source = 'graph TD\n A --> B';
    expect(renderMermaid(source, 'light').svg).toContain('--pele-bg:#ffffff;');
    expect(renderMermaid(source, 'dark').svg).toContain('--pele-bg:#171717;--pele-fg:#fafafa;');
    expect(renderMermaid(source, 'dark').svg).toContain(
      'width="100%" height="100%" fill="#171717"',
    );
  });

  it('rejects invalid and oversized diagrams instead of returning a broken image', () => {
    expect(() => renderMermaid('not a diagram')).toThrow();
    expect(() => renderMermaid('graph TD\n' + 'A'.repeat(50_000))).toThrow(/limit/i);
  });
});
