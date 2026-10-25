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

const passed: Review = { status: 'passed', findings: [] };

export const reviews: Record<string, Review> = {
  'ui/popover': passed,
  'ui/dropdown-menu': passed,
  'ui/select': passed,
  'ui/combobox': passed,
  'ui/tooltip': passed,
  'ui/action-button': passed,
  'ui/segmented-control': passed,
  'ui/animated-tabs': passed,
  'ui/checkbox': passed,
  'ui/color-picker': passed,
  'ui/auto-resize-textarea': passed,
  'ui/alert': passed,
  'ui/badge': passed,
  'ui/kbd': passed,
  'ui/status-dot': passed,
  'ui/spinner': passed,
  'ui/collapsible': passed,
  'ui/scroll-area': passed,
  'ui/code-block': passed,
  'chrome/toolbar': passed,
  'chrome/floating-toolbar': passed,
  'chrome/slash-menu': passed,
  'chrome/mention-menu': passed,
  'chrome/block-handle': passed,
  'chrome/link-editor': passed,
  'chrome/table-controls': passed,
  'chrome/image-editor': {
    status: 'issues',
    findings: [
      {
        title:
          'Only the chrome radius rule is applied. Controls are still 36, 26 and 30 high instead of 24/28/32, the insert sheet keeps an accent-tinted badge, and font sizes are set per element instead of from chromeText.',
        rule: 'rich-plugin-image-editor · chrome rules',
        state: 'open',
      },
    ],
  },
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
