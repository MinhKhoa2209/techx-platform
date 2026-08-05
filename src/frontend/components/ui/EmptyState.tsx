import Link from "next/link";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "🛝",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-desc">{description}</p>}
      {actionLabel &&
        (actionHref ? (
          <Link
            href={actionHref}
            className="btn btn-primary btn-sm"
            style={{ marginTop: 8 }}
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginTop: 8 }}
            onClick={onAction}
          >
            {actionLabel}
          </button>
        ))}
    </div>
  );
}
