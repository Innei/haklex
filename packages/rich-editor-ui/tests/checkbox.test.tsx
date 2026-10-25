import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AnimatedCheckbox } from '../src/components/checkbox';

describe('AnimatedCheckbox', () => {
  it('reports the mixed state when indeterminate', () => {
    const html = renderToStaticMarkup(
      <AnimatedCheckbox indeterminate checked={false} label="All" />,
    );
    expect(html).toContain('aria-checked="mixed"');
  });

  it('reports checked and unchecked states', () => {
    expect(renderToStaticMarkup(<AnimatedCheckbox checked />)).toContain('aria-checked="true"');
    expect(renderToStaticMarkup(<AnimatedCheckbox checked={false} />)).toContain(
      'aria-checked="false"',
    );
  });

  it('marks a disabled checkbox as disabled to assistive tech', () => {
    expect(renderToStaticMarkup(<AnimatedCheckbox disabled />)).toContain('aria-disabled="true"');
  });
});
