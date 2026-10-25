import type { ReactNode } from 'react';

import { Callout, Lines, Squares, Svg } from './primitives';

export const nodeSketches: Record<string, ReactNode> = {
  'spoiler': (
    <span>
      Text with a{' '}
      <span style={{ background: 'var(--rc-text)', color: 'transparent', borderRadius: 3 }}>
        hidden
      </span>
    </span>
  ),
  'katex-inline': (
    <span className="sk-math">
      E = mc<sup style={{ fontSize: 11 }}>2</sup>
    </span>
  ),
  'ruby': (
    <ruby style={{ fontSize: 18 }}>
      漢字<rt style={{ fontSize: 10, color: 'var(--rc-text-tertiary)' }}>かんじ</rt>
    </ruby>
  ),
  'mention': (
    <span
      style={{
        padding: '2px 8px',
        borderRadius: 4,
        background: 'var(--rc-fill-secondary)',
        fontSize: 13,
      }}
    >
      @innei
    </span>
  ),
  'comment': <span className="sk-mono">&lt;!-- note --&gt;</span>,
  'footnote': (
    <span>
      Footnote<sup style={{ fontSize: 11, color: 'var(--rc-accent)' }}>[1]</sup>
    </span>
  ),
  'image': (
    <Svg>
      <rect height="42" rx="4" width="62" x="1" y="1" />
      <circle cx="20" cy="15" r="5" />
      <path d="M1 36l18-14 14 10 10-7 20 14" />
    </Svg>
  ),
  'video': (
    <Svg>
      <rect height="42" rx="4" width="62" x="1" y="1" />
      <path d="M27 15v14l12-7z" fill="currentColor" />
    </Svg>
  ),
  'code-block': <Lines widths={['60%', '80%', '45%', '20%']} />,
  'code-snippet': (
    <div className="sk-stack">
      <div className="sk-row sk-mono" style={{ gap: 10, fontSize: 10 }}>
        <span style={{ color: 'var(--rc-text)', borderBottom: '1px solid var(--rc-text)' }}>
          index.ts
        </span>
        <span>README.md</span>
      </div>
      <Lines widths={['70%', '50%']} />
    </div>
  ),
  'mermaid': (
    <div className="sk-row">
      <span className="sk-box" style={{ width: 30, height: 18 }} />
      <span style={{ width: 16, height: 1, background: 'var(--rc-text-quaternary)' }} />
      <span className="sk-box" style={{ width: 30, height: 18 }} />
      <span style={{ width: 16, height: 1, background: 'var(--rc-text-quaternary)' }} />
      <span className="sk-box" style={{ width: 18, height: 18, borderRadius: 999 }} />
    </div>
  ),
  'katex-block': <span className="sk-math">∫ f(x) dx</span>,
  'link-card': (
    <div className="sk-card sk-row" style={{ width: 150 }}>
      <Lines strongFirst widths={['80%', '100%', '60%']} />
      <span className="sk-fill" style={{ width: 28, height: 28, flex: 'none' }} />
    </div>
  ),
  'table': (
    <Svg h={44} w={140}>
      <path d="M0 1h140M0 15h140M0 29h140M47 1v42M93 1v42" />
    </Svg>
  ),
  'list': (
    <div className="sk-stack" style={{ fontSize: 13 }}>
      <span className="sk-row" style={{ color: 'var(--rc-text-tertiary)' }}>
        <span className="sk-fill" style={{ width: 12, height: 12, background: 'var(--rc-text)' }} />
        <s>Write spec</s>
      </span>
      <span className="sk-row">
        <span className="sk-box" style={{ width: 12, height: 12, borderRadius: 3 }} />
        Ship layout
      </span>
    </div>
  ),
  'excalidraw': (
    <Svg h={48} w={80}>
      <path d="M4 8c8-1 18 0 26 1l-1 18c-8 1-17 0-25-1z" />
      <path d="M32 18c8 0 14 1 18 2M46 16l5 4-6 3" />
      <ellipse cx="66" cy="30" rx="11" ry="12" />
    </Svg>
  ),
  'poll': (
    <div className="sk-stack">
      <div className="sk-fill" style={{ width: '72%', height: 14 }} />
      <div className="sk-fill" style={{ width: '40%', height: 14 }} />
      <div className="sk-fill" style={{ width: '22%', height: 14 }} />
    </div>
  ),
  'chat': (
    <div className="sk-stack">
      <span className="sk-fill" style={{ alignSelf: 'flex-end', width: '56%', height: 18 }} />
      <span className="sk-card" style={{ width: '70%', height: 18, padding: 0 }} />
    </div>
  ),
  'alert-quote': <Callout title="Note" tone="var(--rc-alert-info)" />,
  'banner': <Callout title="Success" tone="var(--rc-alert-tip)" />,
  'details': (
    <div className="sk-card" style={{ width: '100%', padding: 0 }}>
      <div style={{ padding: '6px 10px', fontSize: 12 }}>▾ Summary</div>
      <div style={{ padding: '8px 10px', borderTop: '1px solid var(--rc-border-subtle)' }}>
        <Lines widths={['70%']} />
      </div>
    </div>
  ),
  'gallery': <Squares n={3} />,
  'grid-container': (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 44px)', gap: 6 }}>
      {[0, 1, 2, 3].map((i) => (
        <span className="sk-box" key={i} style={{ height: 22, borderStyle: 'dashed' }} />
      ))}
    </div>
  ),
};
