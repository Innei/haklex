import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { SceneContent } from './Scene';

const shape = (type: string) => ({
  id: type,
  type,
  x: 350,
  y: 140,
  width: 160,
  height: 80,
  strokeColor: '#e8590c',
  backgroundColor: '#ffc078',
  fillStyle: 'solid',
  strokeWidth: 2,
  roughness: 1,
  opacity: 100,
  seed: 2,
});

describe('solid fills', () => {
  it.each(['rectangle', 'ellipse', 'diamond'])('%s paints its background colour', (type) => {
    const html = renderToStaticMarkup(
      <svg>
        <SceneContent dark={false} scene={{ elements: [shape(type) as never] }} />
      </svg>,
    );
    expect(html).toContain('fill="#ffc078"');
  });

  it('fills an ellipse with the nonzero rule, as roughjs does', () => {
    const html = renderToStaticMarkup(
      <svg>
        <SceneContent dark={false} scene={{ elements: [shape('ellipse') as never] }} />
      </svg>,
    );
    const fillPath = /<path[^>]*fill="#ffc078"[^>]*>/.exec(html)![0];
    expect(fillPath).not.toContain('evenodd');
  });
});
