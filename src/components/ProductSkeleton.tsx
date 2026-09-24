"use client";

export default function ProductSkeleton() {
  return (
    <div aria-hidden="true" className="product-skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-content">
        <div className="skeleton-line skeleton-brand" />
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-price" />
        <div className="skeleton-line skeleton-spec" />
        <div className="skeleton-line skeleton-spec short" />
      </div>
    </div>
  );
}
