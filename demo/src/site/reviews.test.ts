import { describe, expect, it } from 'vitest';

import { countByStatus, reviewOf, reviews } from './reviews';

describe('reviewOf', () => {
  it('defaults an unlisted key to unreviewed with no findings', () => {
    expect(reviewOf('ui/no-such-thing')).toEqual({ status: 'unreviewed', findings: [] });
  });

  it('returns the recorded review for a listed key', () => {
    const tokens = reviewOf('tokens');
    expect(tokens.status).toBe('issues');
    expect(tokens.findings[0].state).toBe('open');
  });
});

describe('countByStatus', () => {
  it('counts every key once, defaulting missing keys to unreviewed', () => {
    expect(countByStatus(['tokens', 'ui/a', 'ui/b'])).toEqual({
      unreviewed: 2,
      issues: 1,
      passed: 0,
    });
  });
});

describe('reviews', () => {
  it('marks a review with open findings as issues', () => {
    for (const [key, review] of Object.entries(reviews)) {
      const open = review.findings.some((f) => f.state === 'open');
      if (open) expect(review.status, key).toBe('issues');
    }
  });
});
