import type { Review, ReviewStatus } from '../../site/reviews';
import { reviewStatusLabels } from '../../site/reviews';

export function StatusDotMark({ status }: { status: ReviewStatus }) {
  return <span aria-hidden="true" className="review-dot" data-status={status} />;
}

export function ReviewChip({ status }: { status: ReviewStatus }) {
  return (
    <span className="review-chip" data-status={status}>
      <StatusDotMark status={status} />
      {reviewStatusLabels[status]}
    </span>
  );
}

export function StyleReview({ review }: { review: Review }) {
  if (review.findings.length === 0) {
    return (
      <p className="doc-empty">
        {review.status === 'passed'
          ? 'Reviewed. No findings.'
          : 'No findings yet. This component has not been reviewed.'}
      </p>
    );
  }
  return (
    <table className="doc-table">
      <thead>
        <tr>
          <th>Finding</th>
          <th>Breaks</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
        {review.findings.map((f) => (
          <tr key={f.title}>
            <td>{f.title}</td>
            <td>
              <code>{f.rule}</code>
            </td>
            <td>
              <span className="finding-state" data-state={f.state}>
                {f.state}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
