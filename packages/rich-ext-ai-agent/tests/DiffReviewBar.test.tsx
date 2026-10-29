import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { DiffReviewBar } from '../src/plugins/DiffReviewBar';

const noop = () => {};

function render(props: { canNavigate: boolean; position: number; total: number }) {
  return renderToStaticMarkup(
    <DiffReviewBar
      pendingCount={3}
      onAccept={noop}
      onAcceptAll={noop}
      onNext={noop}
      onPrevious={noop}
      onReject={noop}
      onRejectAll={noop}
      {...props}
    />,
  );
}

describe('DiffReviewBar', () => {
  it('shows the current position and puts Reject before Accept', () => {
    const html = render({ canNavigate: true, position: 2, total: 5 });
    expect(html).toContain('2 / 5');
    expect(html).toContain('aria-label="Previous change"');
    expect(html).toContain('aria-label="Next change"');
    expect(html.indexOf('Reject')).toBeLessThan(html.indexOf('Accept'));
    expect(html).toContain('All…');
  });

  it('falls back to a pending count when hunks are not in the document', () => {
    const html = render({ canNavigate: false, position: 0, total: 0 });
    expect(html).toContain('3 changes');
  });
});
