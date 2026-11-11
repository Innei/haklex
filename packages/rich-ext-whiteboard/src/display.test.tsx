import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { WhiteboardDisplayRenderer } from './WhiteboardDisplayRenderer';

describe('WhiteboardDisplayRenderer error states', () => {
  it('reports a non-JSON, non-URL string as invalid instead of empty', () => {
    const html = renderToStaticMarkup(<WhiteboardDisplayRenderer snapshot="hello" />);
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('Empty whiteboard');
  });

  it('keeps a blank snapshot as an empty whiteboard', () => {
    const html = renderToStaticMarkup(<WhiteboardDisplayRenderer snapshot="   " />);
    expect(html).toContain('Empty whiteboard');
  });

  it('offers no Retry for a configuration error a refetch cannot fix', () => {
    const html = renderToStaticMarkup(<WhiteboardDisplayRenderer snapshot="ref:file/abc" />);
    expect(html).toContain('Missing apiUrl');
    expect(html).not.toContain('Retry');
  });
});
