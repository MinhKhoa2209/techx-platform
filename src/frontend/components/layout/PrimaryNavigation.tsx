"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { CONTENT, NAVIGATION, UI_LIMITS } from "@/lib/site-config";

export default function PrimaryNavigation({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = mobile
    ? NAVIGATION
    : NAVIGATION.slice(0, UI_LIMITS.desktopNavigationItems);

  function isActive(href: string) {
    const [route, query] = href.split("?");
    if (pathname !== route) return false;
    const targetCategory = new URLSearchParams(query ?? "").get("category");
    return targetCategory === searchParams.get("category");
  }

  return (
    <nav
      className={mobile ? undefined : "desktop-nav"}
      aria-label={
        mobile
          ? CONTENT.shell.mobileNavigation
          : CONTENT.shell.primaryNavigation
      }
    >
      {items.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
            {mobile && <Icon name="arrow" />}
          </Link>
        );
      })}
    </nav>
  );
}
