import type { CSSProperties, ReactNode } from 'react';

interface WorkbenchProps {
  actions?: ReactNode;
  baseSurface?: boolean;
  children: ReactNode;
  meta?: ReactNode;
  panel: ReactNode;
  panelLabel: string;
  panelTitle?: string;
  panelWidth?: number;
  title: string;
}

export function Workbench({
  actions,
  baseSurface,
  children,
  meta,
  panel,
  panelLabel,
  panelTitle,
  panelWidth = 300,
  title,
}: WorkbenchProps) {
  return (
    <div className="wb" style={{ '--wb-panel': `${panelWidth}px` } as CSSProperties}>
      <div className="wb-main">
        <header className="wb-bar">
          <h1 className="wb-title">{title}</h1>
          {meta}
          {actions && <div className="wb-actions">{actions}</div>}
        </header>
        <div className={baseSurface ? 'wb-stage wb-stage-base' : 'wb-stage'}>{children}</div>
      </div>
      <aside aria-label={panelLabel} className="wb-panel">
        {panelTitle && <div className="wb-panel-head">{panelTitle}</div>}
        {panel}
      </aside>
    </div>
  );
}
