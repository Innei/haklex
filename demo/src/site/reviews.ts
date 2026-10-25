export type ReviewStatus = 'unreviewed' | 'issues' | 'passed';

export interface Finding {
  rule: string;
  state: 'open' | 'fixed';
  title: string;
}

export interface Review {
  findings: Finding[];
  status: ReviewStatus;
}

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  unreviewed: 'Not reviewed',
  issues: 'Has issues',
  passed: 'Passed',
};

export const reviews: Record<string, Review> = {
  'tokens': {
    status: 'issues',
    findings: [
      {
        title:
          'A light region cannot sit inside a dark ancestor: [data-theme="dark"] .articleTheme wins over a nested light theme. Light frames on this site have to re-set every --rc-host-* color and every --rc-shadow-* value (shadows have no host hook).',
        rule: 'rich-style-token · theme scoping',
        state: 'open',
      },
    ],
  },
  'ui/dialog': {
    status: 'issues',
    findings: [
      {
        title:
          'DialogPopup builds its own portal and centers with position: fixed, so a host cannot render it inside a container such as a preview frame or an embedded editor.',
        rule: 'rich-editor-ui · portal container',
        state: 'open',
      },
    ],
  },
};

const unreviewed: Review = { status: 'unreviewed', findings: [] };

export function reviewOf(key: string): Review {
  return reviews[key] ?? unreviewed;
}

export function countByStatus(keys: string[]): Record<ReviewStatus, number> {
  const counts: Record<ReviewStatus, number> = { unreviewed: 0, issues: 0, passed: 0 };
  for (const key of keys) counts[reviewOf(key).status] += 1;
  return counts;
}
