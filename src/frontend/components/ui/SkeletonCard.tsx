export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-img" />
      <div className="skeleton-content">
        <div className="skeleton-line w-full h-6" />
        <div className="skeleton-line w-3-4" />
        <div className="skeleton-line w-1-2" />
        <div className="skeleton-line w-full h-8 skeleton-action" />
      </div>
    </div>
  );
}
