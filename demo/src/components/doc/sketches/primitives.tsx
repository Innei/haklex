import type { CSSProperties, ReactNode } from 'react';

export function Lines({ widths, strongFirst }: { strongFirst?: boolean; widths: string[] }) {
  return (
    <div className="sk-stack">
      {widths.map((w, i) => (
        <div
          className={strongFirst && i === 0 ? 'sk-line sk-line-strong' : 'sk-line'}
          key={`${w}-${i}`}
          style={{ width: w }}
        />
      ))}
    </div>
  );
}

export function Callout({ tone, title }: { title: string; tone: string }) {
  return (
    <div className="sk-callout" style={{ '--sk-tone': tone, 'width': '100%' } as CSSProperties}>
      <div className="sk-callout-title">{title}</div>
      <div className="sk-line" style={{ width: '80%', marginTop: 6 }} />
    </div>
  );
}

export function Svg({ children, h = 44, w = 64 }: { children: ReactNode; h?: number; w?: number }) {
  return (
    <svg
      className="sk-svg"
      fill="none"
      height={h}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox={`0 0 ${w} ${h}`}
      width={w}
    >
      {children}
    </svg>
  );
}

export function Squares({ n, size = 36 }: { n: number; size?: number }) {
  return (
    <div className="sk-row" style={{ gap: 6 }}>
      {Array.from({ length: n }, (_, i) => (
        <span className="sk-fill" key={i} style={{ width: size, height: size }} />
      ))}
    </div>
  );
}
