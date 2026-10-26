import { ScrollArea } from '@haklex/rich-editor-ui';
import type { CSSProperties, ReactNode, Ref, RefObject } from 'react';

interface WorkbenchProps {
  actions?: ReactNode;
  baseSurface?: boolean;
  children: ReactNode;
  meta?: ReactNode;
  panel: ReactNode;
  panelLabel: string;
  panelTitle?: string;
  panelWidth?: number;
  scrollRef?: RefObject<HTMLDivElement | null>;
  title: string;
  toolbarRef?: Ref<HTMLDivElement>;
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
  scrollRef,
  title,
  toolbarRef,
}: WorkbenchProps) {
  return (
    <div
      className={scrollRef ? 'wb wb-contained' : 'wb'}
      style={{ '--wb-panel': `${panelWidth}px` } as CSSProperties}
    >
      <div className="wb-main">
        <header className="wb-bar">
          <h1 className="wb-title">{title}</h1>
          {meta}
          {actions && <div className="wb-actions">{actions}</div>}
        </header>
        {toolbarRef && <div className="wb-toolbar-host" ref={toolbarRef} />}
        {scrollRef ? (
          <ScrollArea className="wb-stage-scroll" scrollRef={scrollRef}>
            <div className={baseSurface ? 'wb-stage wb-stage-base' : 'wb-stage'}>{children}</div>
          </ScrollArea>
        ) : (
          <div className={baseSurface ? 'wb-stage wb-stage-base' : 'wb-stage'}>{children}</div>
        )}
      </div>
      <aside aria-label={panelLabel} className="wb-panel">
        {panelTitle && <div className="wb-panel-head">{panelTitle}</div>}
        {panel}
      </aside>
    </div>
  );
}
