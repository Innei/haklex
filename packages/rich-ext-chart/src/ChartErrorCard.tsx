import * as s from './error-card.css';
import type { ChartIssue } from './types';

export interface ChartErrorCardProps {
  issues: ChartIssue[];
  rows?: number;
  title?: string;
  type?: string;
}

export function ChartErrorCard({ issues, title, type, rows }: ChartErrorCardProps) {
  const count = issues.length;
  const meta = ['chart', type, rows != null ? `${rows} rows` : undefined]
    .filter(Boolean)
    .join(' · ');
  return (
    <div className={s.card} role="alert">
      <div className={s.header}>
        <svg
          className={s.icon}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={1.5}
          viewBox="0 0 16 16"
        >
          <circle cx={8} cy={8} r={6.5} />
          <path d="M8 4.8v3.6M8 11h.01" />
        </svg>
        <span className={s.heading}>
          {count === 1 ? 'Chart data has 1 problem' : `Chart data has ${count} problems`}
        </span>
        <span className={s.meta}>{meta}</span>
      </div>
      {title && <div className={s.context}>{title}</div>}
      <ol className={s.list}>
        {issues.map((issue) => (
          <li className={s.item} key={`${issue.path}:${issue.message}`}>
            <code className={s.path}>{issue.path}</code> {issue.message}
            {issue.hint && <span className={s.hint}>{issue.hint}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
