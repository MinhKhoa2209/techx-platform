import Link from "next/link";
import {
  CONTENT,
  NAVIGATION,
  ROUTES,
  SITE,
  UI_LIMITS,
} from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <section className="footer-brand" aria-labelledby="footer-brand-title">
          <span className="brand-mark" aria-hidden="true">
            {SITE.mark}
          </span>
          <div>
            <h2 id="footer-brand-title">{SITE.name}</h2>
            <p>{SITE.tagline}</p>
          </div>
        </section>
        <nav className="footer-nav" aria-label={CONTENT.shell.footerNavigation}>
          <h2>{CONTENT.shell.footerShop}</h2>
          {NAVIGATION.slice(0, UI_LIMITS.desktopNavigationItems).map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <section className="footer-help" aria-labelledby="footer-help-title">
          <h2 id="footer-help-title">{CONTENT.shell.demoInformation}</h2>
          <Link href={ROUTES.orders}>{CONTENT.order.lookupTitle}</Link>
          <p>{SITE.demoNotice}</p>
        </section>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {SITE.shortName}
        </span>
        <span>{CONTENT.shell.temporaryOrders}</span>
      </div>
    </footer>
  );
}
