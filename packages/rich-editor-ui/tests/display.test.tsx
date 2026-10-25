import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Badge } from '../src/components/badge';
import { Spinner } from '../src/components/spinner';

describe('Badge', () => {
  it('draws a leading status dot when asked', () => {
    const html = renderToStaticMarkup(
      <Badge dot variant="success">
        Live
      </Badge>,
    );
    expect(html).toMatch(/data-slot="badge-dot"[^>]*><\/span>Live/);
  });

  it('has no dot by default', () => {
    expect(renderToStaticMarkup(<Badge>Draft</Badge>)).not.toContain('badge-dot');
  });
});

describe('Spinner', () => {
  const classes = (html: string) => html.match(/class="([^"]*)"/)![1].split(' ');

  it('offers a large size with its own size class', () => {
    const md = classes(renderToStaticMarkup(<Spinner size="md" />));
    const lg = classes(renderToStaticMarkup(<Spinner size="lg" />));
    expect(lg).toHaveLength(md.length);
    expect(lg).not.toEqual(md);
  });
});
