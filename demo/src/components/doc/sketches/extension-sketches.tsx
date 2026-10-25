import type { ReactNode } from 'react';

import { nodeSketches } from './node-sketches';
import { Lines, Svg } from './primitives';

export const extensionSketches: Record<string, ReactNode> = {
  'litexml-import': <span className="sk-mono">&lt;alert type=&quot;note&quot;&gt;</span>,
  'excalidraw': nodeSketches.excalidraw,
  'dynamic': (
    <div className="sk-card sk-dashed sk-row">
      <span className="sk-mono">esm</span>
      <span className="sk-fill" style={{ width: 48, height: 14 }} />
    </div>
  ),
  'diff': (
    <div className="sk-row" style={{ width: '100%', alignItems: 'stretch' }}>
      <div className="sk-stack">
        <div className="sk-line" style={{ width: '80%' }} />
        <div
          className="sk-line"
          style={{
            width: '60%',
            background: 'color-mix(in srgb, var(--rc-alert-caution) 30%, transparent)',
          }}
        />
      </div>
      <span style={{ width: 1, background: 'var(--rc-border)' }} />
      <div className="sk-stack">
        <div className="sk-line" style={{ width: '80%' }} />
        <div
          className="sk-line"
          style={{
            width: '70%',
            background: 'color-mix(in srgb, var(--rc-alert-tip) 30%, transparent)',
          }}
        />
      </div>
    </div>
  ),
  'agent-diff-node': (
    <div className="sk-card" style={{ width: '100%' }}>
      <Lines widths={['70%', '50%']} />
      <div className="sk-row" style={{ marginTop: 8, justifyContent: 'flex-end' }}>
        <span className="sk-fill" style={{ width: 32, height: 12 }} />
        <span className="sk-fill" style={{ width: 32, height: 12, background: 'var(--rc-text)' }} />
      </div>
    </div>
  ),
  'linkcard': nodeSketches['link-card'],
  'code-snippet': nodeSketches['code-snippet'],
  'gallery': nodeSketches.gallery,
  'chat': nodeSketches.chat,
  'mermaid': (
    <Svg h={48} w={96}>
      <rect height="16" rx="3" width="28" x="2" y="16" />
      <rect height="16" rx="3" width="28" x="66" y="4" />
      <rect height="16" rx="3" width="28" x="66" y="28" />
      <path d="M30 24h18M48 24c8 0 8-12 18-12M48 24c8 0 8 12 18 12" />
    </Svg>
  ),
};
