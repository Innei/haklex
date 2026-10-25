import type { ReactNode } from 'react';

import { Svg } from './primitives';

export const chartSketches: Record<string, ReactNode> = {
  bar: (
    <Svg h={48} w={96}>
      <path d="M2 46h92" />
      <rect fill="currentColor" height="22" stroke="none" width="10" x="10" y="24" />
      <rect fill="currentColor" height="34" stroke="none" width="10" x="30" y="12" />
      <rect fill="currentColor" height="14" stroke="none" width="10" x="50" y="32" />
      <rect fill="currentColor" height="40" stroke="none" width="10" x="70" y="6" />
    </Svg>
  ),
  line: (
    <Svg h={48} w={96}>
      <path d="M2 46h92" />
      <path d="M4 36l18-10 18 6 18-18 18 8 16-14" />
    </Svg>
  ),
  area: (
    <Svg h={48} w={96}>
      <path d="M2 46h92" />
      <path d="M4 40l18-12 18 6 18-16 18 8 16-12v32H4z" fill="currentColor" opacity="0.35" />
    </Svg>
  ),
  pie: (
    <Svg h={48} w={48}>
      <circle cx="24" cy="24" r="20" />
      <path d="M24 24V4A20 20 0 0 1 43 30z" fill="currentColor" opacity="0.5" />
    </Svg>
  ),
  state: <div className="sk-card sk-dashed sk-mono">empty · invalid</div>,
};
