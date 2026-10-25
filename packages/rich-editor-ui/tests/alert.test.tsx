import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Alert } from '../src/components/alert';

describe('Alert', () => {
  it('renders an optional title above the body', () => {
    const html = renderToStaticMarkup(
      <Alert title="Saved" variant="success">
        Your changes are live.
      </Alert>,
    );
    expect(html).toMatch(/data-slot="alert-title"[^>]*>Saved</);
    expect(html.indexOf('Saved')).toBeLessThan(html.indexOf('Your changes are live.'));
  });

  it('accepts the neutral variant and marks the variant on the root', () => {
    const html = renderToStaticMarkup(<Alert variant="neutral">Heads up</Alert>);
    expect(html).toContain('data-variant="neutral"');
  });

  it('leaves the title out when none is given', () => {
    expect(renderToStaticMarkup(<Alert variant="info">Body</Alert>)).not.toContain('alert-title');
  });
});
