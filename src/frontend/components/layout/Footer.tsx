"use client";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        {/* Col 1 — Brand */}
        <div>
          <div className="footer-logo-wrap">
            <div className="footer-logo-mark" aria-hidden="true">
              TX
            </div>
            <span className="footer-brand-name">TechX Store</span>
          </div>
          <p className="footer-tagline">See Further. Go Beyond.</p>
          <p className="footer-desc">
            A GitOps-managed storefront built on Amazon EKS, demonstrating
            microservices, request-correlated logs, and cloud-native practices.
          </p>
          <p className="footer-copyright">
            © {currentYear} TechX Corp. Demo environment.
          </p>
        </div>

        {/* Col 2 — Navigation */}
        <div>
          <p className="footer-col-title">Navigation</p>
          <nav className="footer-links">
            <Link href="/" className="footer-link">
              Home
            </Link>
            <Link href="/products" className="footer-link">
              Products
            </Link>
            <Link href="/cart" className="footer-link">
              Cart
            </Link>
            <Link href="/checkout" className="footer-link">
              Checkout
            </Link>
            <Link href="/orders" className="footer-link">
              Track Order
            </Link>
          </nav>
        </div>

        {/* Col 3 — Newsletter */}
        <div>
          <p className="footer-col-title">Stay in the Loop</p>
          <p className="footer-newsletter-desc">
            Get the latest on new arrivals, exclusive deals, and stargazing
            tips. This is a demo — no emails will be sent.
          </p>
          <form
            className="footer-newsletter-form"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="footer-newsletter-input"
              aria-label="Email for newsletter"
            />
            <button type="submit" className="footer-newsletter-btn">
              Subscribe
            </button>
          </form>
          <div className="footer-socials">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="GitHub"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
              aria-label="Twitter / X"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>TechX internship thin slice — EKS demo</span>
        <span>Built for GitOps delivery</span>
      </div>
    </footer>
  );
}
