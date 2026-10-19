import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ExcalidrawDisplayRenderer } from './ExcalidrawDisplayRenderer';

describe('ExcalidrawDisplayRenderer error states', () => {
  it('reports a non-JSON, non-URL string as invalid instead of empty', () => {
    const html = renderToStaticMarkup(<ExcalidrawDisplayRenderer snapshot="hello" />);
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('Empty whiteboard');
  });

  it('keeps a blank snapshot as an empty whiteboard', () => {
    const html = renderToStaticMarkup(<ExcalidrawDisplayRenderer snapshot="   " />);
    expect(html).toContain('Empty whiteboard');
  });

  it('offers no Retry for a configuration error a refetch cannot fix', () => {
    const html = renderToStaticMarkup(<ExcalidrawDisplayRenderer snapshot="ref:file/abc" />);
    expect(html).toContain('Missing apiUrl');
    expect(html).not.toContain('Retry');
  });
});
