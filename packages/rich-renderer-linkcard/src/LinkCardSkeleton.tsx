export function LinkCardSkeleton() {
  return (
    <div className="link-card link-card--skeleton">
      <span className="link-card__content">
        <span className="link-card__title skeleton-text">Loading...</span>
        <span className="link-card__desc skeleton-text">
          Fetching card data
        </span>
      </span>
    </div>
  )
}
