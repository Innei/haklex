import type { ReactNode } from 'react';

import { Lines } from './primitives';

function Pop({ children, width = 96 }: { children: ReactNode; width?: number }) {
  return (
    <div className="sk-card sk-pop" style={{ width }}>
      {children}
    </div>
  );
}

function MenuRows({ n, hl = 1 }: { hl?: number; n: number }) {
  return (
    <div className="sk-stack" style={{ gap: 2 }}>
      {Array.from({ length: n }, (_, i) => (
        <div className={i === hl ? 'sk-mi sk-mi-hl' : 'sk-mi'} key={i}>
          <div className="sk-line" style={{ width: `${70 - i * 8}%` }} />
        </div>
      ))}
    </div>
  );
}

const Btn = ({ label, solid }: { label: string; solid?: boolean }) => (
  <span className={solid ? 'sk-btn sk-btn-solid' : 'sk-btn'}>{label}</span>
);

const Field = ({ width = 96 }: { width?: number }) => (
  <span className="sk-field" style={{ width }}>
    <span className="sk-line" style={{ width: '50%' }} />
  </span>
);

const EditorLines = () => <Lines strongFirst widths={['55%', '90%', '75%']} />;

export const uiSketches: Record<string, ReactNode> = {
  'dialog': (
    <Pop width={120}>
      <Lines strongFirst widths={['60%', '90%']} />
      <div className="sk-row" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
        <Btn label="Cancel" />
        <Btn solid label="OK" />
      </div>
    </Pop>
  ),
  'popover': (
    <div className="sk-col">
      <Btn label="Trigger" />
      <Pop>
        <Lines strongFirst widths={['70%', '90%']} />
      </Pop>
    </div>
  ),
  'dropdown-menu': (
    <div className="sk-col">
      <Btn label="Options ▾" />
      <Pop>
        <MenuRows n={3} />
      </Pop>
    </div>
  ),
  'select': (
    <div className="sk-col">
      <Field />
      <Pop>
        <MenuRows hl={0} n={3} />
      </Pop>
    </div>
  ),
  'combobox': (
    <div className="sk-col">
      <Field />
      <Pop>
        <MenuRows n={2} />
      </Pop>
    </div>
  ),
  'tooltip': (
    <div className="sk-col" style={{ alignItems: 'center' }}>
      <span className="sk-tip">Bold ⌘B</span>
      <span className="sk-btn">B</span>
    </div>
  ),
  'action-button': (
    <div className="sk-row">
      <Btn label="Ghost" />
      <Btn solid label="Primary" />
    </div>
  ),
  'segmented-control': (
    <span className="sk-seg">
      <span className="sk-seg-on">Preview</span>
      <span>Code</span>
      <span>Split</span>
    </span>
  ),
  'animated-tabs': (
    <span className="sk-tabs">
      <span className="sk-tabs-on">Preview</span>
      <span>Code</span>
      <span>JSON</span>
    </span>
  ),
  'checkbox': (
    <div className="sk-stack" style={{ width: 'auto' }}>
      <span className="sk-row">
        <span className="sk-check sk-check-on">✓</span>
        <span className="sk-line" style={{ width: 56 }} />
      </span>
      <span className="sk-row">
        <span className="sk-check" />
        <span className="sk-line" style={{ width: 40 }} />
      </span>
    </div>
  ),
  'color-picker': (
    <div className="sk-swatches">
      {[
        'text',
        'text-tertiary',
        'alert-caution',
        'alert-warning',
        'alert-tip',
        'alert-info',
        'alert-important',
        'accent',
      ].map((token) => (
        <span key={token} style={{ background: `var(--rc-${token})` }} />
      ))}
    </div>
  ),
  'auto-resize-textarea': (
    <span className="sk-field sk-area">
      <Lines widths={['80%', '55%']} />
    </span>
  ),
  'alert': (
    <div className="sk-alert">
      <span>i</span>
      <span className="sk-line" style={{ width: '70%' }} />
    </div>
  ),
  'badge': (
    <div className="sk-row">
      <span className="sk-badge">neutral</span>
      <span className="sk-badge sk-badge-tip">success</span>
    </div>
  ),
  'status-dot': (
    <div className="sk-row">
      <span className="sk-dot" />
      <span className="sk-dot sk-dot-tip" />
      <span className="sk-dot sk-dot-caution" />
    </div>
  ),
  'spinner': <span className="sk-spinner" />,
  'collapsible': (
    <div className="sk-stack">
      <span className="sk-row">
        <span className="sk-chev">▾</span>
        <span className="sk-line sk-line-strong" style={{ width: 64 }} />
      </span>
      <Lines widths={['85%', '60%']} />
    </div>
  ),
  'scroll-area': (
    <div className="sk-scroll">
      <Lines widths={['80%', '70%', '85%', '60%']} />
      <span className="sk-thumb" />
    </div>
  ),
  'code-block': (
    <div className="sk-code">
      <div className="sk-code-head">ts</div>
      <Lines widths={['60%', '85%', '45%']} />
    </div>
  ),
};

export const chromeSketches: Record<string, ReactNode> = {
  'toolbar': (
    <div className="sk-editor">
      <div className="sk-toolbar">
        <b>B</b>
        <i>I</i>
        <u>U</u>
        <span className="sk-vsep" />
        <span>H</span>
      </div>
      <EditorLines />
    </div>
  ),
  'floating-toolbar': (
    <div className="sk-editor sk-col" style={{ alignItems: 'center' }}>
      <span className="sk-card sk-pop sk-mini-bar">
        <b>B</b>
        <i>I</i>
        <span>🔗</span>
      </span>
      <span className="sk-line sk-select" style={{ width: '70%' }} />
    </div>
  ),
  'slash-menu': (
    <div className="sk-editor sk-col">
      <span className="sk-mono">/head</span>
      <Pop>
        <MenuRows hl={0} n={3} />
      </Pop>
    </div>
  ),
  'mention-menu': (
    <div className="sk-editor sk-col">
      <span className="sk-mono">@gh</span>
      <Pop>
        <MenuRows hl={0} n={2} />
      </Pop>
    </div>
  ),
  'block-handle': (
    <div className="sk-editor sk-row" style={{ alignItems: 'flex-start' }}>
      <span className="sk-handle">⋮⋮</span>
      <EditorLines />
    </div>
  ),
  'link-editor': (
    <div className="sk-editor sk-col">
      <span className="sk-link">haklex repository</span>
      <Pop width={120}>
        <div className="sk-row">
          <span className="sk-line" style={{ width: 60, background: 'var(--rc-accent)' }} />
          <span className="sk-chev">↗</span>
        </div>
      </Pop>
    </div>
  ),
  'table-controls': (
    <div className="sk-editor">
      <div className="sk-table">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <span className="sk-col-handle" />
    </div>
  ),
  'image-editor': (
    <Pop width={120}>
      <span className="sk-fill" style={{ display: 'block', height: 36 }} />
      <div style={{ marginTop: 6 }}>
        <Field width={100} />
      </div>
    </Pop>
  ),
};
