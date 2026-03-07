import type { ReactNode } from 'react';

interface PanelProps {
  badge?: string;
  bodyStyle?: React.CSSProperties;
  children: ReactNode;
  headerExtra?: ReactNode;
  title: string;
}

export function Panel({ title, badge, headerExtra, children, bodyStyle }: PanelProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div className="panel-header-left">
          <h2 className="panel-title">{title}</h2>
          {badge && <span className="badge">{badge}</span>}
        </div>
        {headerExtra && <div className="panel-header-right">{headerExtra}</div>}
      </div>
      <div className="panel-body" style={bodyStyle}>
        {children}
      </div>
    </div>
  );
}
