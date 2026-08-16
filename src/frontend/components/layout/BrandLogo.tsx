import { SITE } from "@/lib/site-config";

export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  const accentIndex = SITE.shortName.length - 1;
  return (
    <span className={`brand-lockup${compact ? " brand-lockup-compact" : ""}`}>
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <circle cx="24" cy="24" r="4.5" fill="currentColor" />
          <path d="M8.5 27.5c4.3-10.8 18.4-18.1 30.7-14.8-1 12.5-12.3 24.6-27.6 25.8" />
          <path d="M13.3 10.8c10.9 3.7 20.7 15.8 22.4 29" />
          <circle
            cx="38.5"
            cy="12.8"
            r="2.7"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      </span>
      <span className="brand-copy">
        <strong>
          {SITE.shortName.slice(0, accentIndex)}
          <span>{SITE.shortName.slice(accentIndex)}</span>
        </strong>
        {!compact && <small>{SITE.brandDescriptor}</small>}
      </span>
    </span>
  );
}
