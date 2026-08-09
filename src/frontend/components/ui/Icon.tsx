import type { SVGProps } from "react";

export type IconName =
  | "accessories"
  | "arrow"
  | "binoculars"
  | "cart"
  | "check"
  | "close"
  | "menu"
  | "package"
  | "search"
  | "shield"
  | "scope"
  | "truck";

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export default function Icon({ name, size = 20, ...props }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };

  if (name === "menu")
    return (
      <svg {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  if (name === "close")
    return (
      <svg {...common}>
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  if (name === "search")
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    );
  if (name === "cart")
    return (
      <svg {...common}>
        <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
    );
  if (name === "arrow")
    return (
      <svg {...common}>
        <path d="M5 12h14m-5-5 5 5-5 5" />
      </svg>
    );
  if (name === "check")
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  if (name === "truck")
    return (
      <svg {...common}>
        <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </svg>
    );
  if (name === "shield")
    return (
      <svg {...common}>
        <path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  if (name === "package")
    return (
      <svg {...common}>
        <path d="m4 7 8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10" />
      </svg>
    );
  if (name === "binoculars")
    return (
      <svg {...common}>
        <path d="m7 5-3 6-1 7h7l2-7 2 7h7l-1-7-3-6-5 3z" />
        <path d="M7 5h3m4 0h3" />
      </svg>
    );
  if (name === "accessories")
    return (
      <svg {...common}>
        <path d="M5 8h14v11H5zM8 8V5h8v3" />
        <path d="M9 13h6" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="m4 15 3 3 4-7 9-5" />
      <circle cx="16" cy="7" r="3" />
      <path d="M11 11 8 4" />
    </svg>
  );
}
