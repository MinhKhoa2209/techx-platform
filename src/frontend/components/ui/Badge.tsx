import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant = "navy" | "success" | "danger" | "warning" | "teal";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

export default function Badge({
  children,
  variant = "navy",
  className = "",
  ...props
}: BadgeProps) {
  const classes = ["badge", `badge-${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
