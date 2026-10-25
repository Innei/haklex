import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function OverviewSection({
  children,
  count,
  title,
}: {
  children: ReactNode;
  count: number;
  title: string;
}) {
  return (
    <section className="ov-section">
      <div className="ov-head">
        <h2>{title}</h2>
        <span>{count}</span>
      </div>
      <div className="ov-grid">{children}</div>
    </section>
  );
}

interface TileProps {
  code?: string;
  count?: number;
  label: string;
  marker?: ReactNode;
  sketch: ReactNode;
  to: string;
}

export function Tile({ code, count, label, marker, sketch, to }: TileProps) {
  return (
    <Link className="tile" to={to}>
      <div aria-hidden="true" className="tile-preview">
        {sketch}
      </div>
      <div className="tile-meta">
        {marker}
        <span className="tile-label">{label}</span>
        {code && <code className="tile-code">{code}</code>}
        {count != null && count > 1 && <span className="tile-count">{count}</span>}
      </div>
    </Link>
  );
}
