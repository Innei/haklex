import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { fontFamilyToCss } from './fonts';
import { freedrawOutline } from './freedraw';
import { Scene, SceneContent } from './Scene';
import type { ExcalidrawElement, ExcalidrawScene } from './types';

function base(partial: Partial<ExcalidrawElement> & Pick<ExcalidrawElement, 'id' | 'type'>) {
  return {
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 0,
    opacity: 100,
    seed: 1,
    ...partial,
  } as ExcalidrawElement;
}

function attrs(source: string): Record<string, string> {
  return Object.fromEntries([...source.matchAll(/([\w:-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
}

function scene(
  elements: ExcalidrawElement[],
  files: ExcalidrawScene['files'] = {},
): ExcalidrawScene {
  return { type: 'excalidraw', appState: {}, elements, files };
}

describe('fontFamilyToCss', () => {
  it('renders hand-drawn families with LXGW WenKai first', () => {
    expect(fontFamilyToCss(1).startsWith('"LXGW WenKai Screen"')).toBe(true);
    expect(fontFamilyToCss(5).startsWith('"LXGW WenKai Screen"')).toBe(true);
  });

  it('maps Helvetica, Nunito and Liberation Sans to the sans stack', () => {
    for (const id of [2, 6, 9] as const) {
      expect(fontFamilyToCss(id)).toContain('sans-serif');
      expect(fontFamilyToCss(id)).not.toContain('WenKai');
    }
  });

  it('maps Cascadia and Comic Shanns to the mono stack', () => {
    expect(fontFamilyToCss(3)).toContain('monospace');
    expect(fontFamilyToCss(8)).toContain('monospace');
  });
});

describe('freedraw', () => {
  const stroke = base({
    id: 'f',
    type: 'freedraw',
    points: [
      [0, 0],
      [10, 4],
      [20, 10],
      [30, 12],
    ],
    pressures: [],
    simulatePressure: true,
  } as never);

  it('produces a closed outline path', () => {
    const d = freedrawOutline(stroke as never);
    expect(d.startsWith('M')).toBe(true);
    expect(d.trim().endsWith('Z')).toBe(true);
  });

  it('renders the outline filled with the stroke colour', () => {
    const html = renderToStaticMarkup(<Scene scene={scene([stroke])} />);
    expect(html).toMatch(/<path[^>]*d="M[^"]*Z"[^>]*fill="#1e1e1e"/);
    expect(html).not.toMatch(/<path[^>]*stroke="#1e1e1e"[^>]*stroke-linecap="round"[^>]*\/><\/g>/);
  });
});

describe('frame clipping', () => {
  it('clips frame children to the frame rectangle', () => {
    const frame = base({ id: 'fr', type: 'frame', x: 10, y: 10, width: 200, height: 100 });
    const child = base({ id: 'c', type: 'rectangle', x: 150, y: 50, frameId: 'fr' } as never);
    const html = renderToStaticMarkup(<Scene scene={scene([frame, child])} />);
    const clip = html.match(/<clipPath id="([^"]+)"><rect ([^>]*?)\/?>/);
    expect(clip).not.toBeNull();
    expect(attrs(clip![2])).toMatchObject({ x: '10', y: '10', width: '200', height: '100' });
    expect(html).toContain(`clip-path="url(#${clip![1]})"`);
  });

  it('leaves elements whose frame is missing unclipped', () => {
    const child = base({ id: 'c', type: 'rectangle', frameId: 'gone' } as never);
    const html = renderToStaticMarkup(<Scene scene={scene([child])} />);
    expect(html).not.toContain('clip-path');
  });
});

describe('image crop', () => {
  it('shows only the cropped region scaled to the element size', () => {
    const img = base({
      id: 'i',
      type: 'image',
      width: 100,
      height: 50,
      fileId: 'f1',
      crop: { x: 20, y: 10, width: 200, height: 100, naturalWidth: 400, naturalHeight: 300 },
    } as never);
    const html = renderToStaticMarkup(
      <Scene scene={scene([img], { f1: { id: 'f1', dataURL: 'data:image/png;base64,QQ==' } })} />,
    );
    const image = html.match(/<image ([^>]*?)\/?>/);
    expect(attrs(image![1])).toMatchObject({ x: '-10', y: '-5', width: '200', height: '150' });
    const clip = html.match(/<clipPath id="[^"]+"><rect ([^>]*?)\/?>/);
    expect(attrs(clip![1])).toMatchObject({ width: '100', height: '50' });
  });
});

describe('SceneContent hooks for the editor', () => {
  const a = base({ id: 'a', type: 'rectangle' });
  const b = base({ id: 'b', type: 'ellipse' });

  it('omits hidden elements', () => {
    const html = renderToStaticMarkup(
      <svg>
        <SceneContent hiddenIds={new Set(['b'])} scene={scene([a, b])} />
      </svg>,
    );
    expect(html).toContain('data-id="a"');
    expect(html).not.toContain('data-id="b"');
  });

  it('merges per-element props onto the element group', () => {
    const html = renderToStaticMarkup(
      <svg>
        <SceneContent
          elementProps={(el) => (el.id === 'a' ? { 'data-selected': 'true' } : undefined)}
          scene={scene([a, b])}
        />
      </svg>,
    );
    expect(html).toMatch(/data-id="a"[^>]*data-selected="true"/);
  });
});
