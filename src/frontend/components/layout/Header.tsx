"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import CartDropdown from "@/components/cart/CartDropdown";

export default function Header() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  // Sticky shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close cart dropdown on outside click
  useEffect(() => {
    if (!cartOpen) return;
    const handler = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cartOpen]);

  // Close cart on navigation
  useEffect(() => {
    setCartOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/products", label: "Products" },
    { href: "/orders", label: "Track Order" },
  ];

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="header-inner">
        {/* Brand */}
        <Link href="/" className="header-brand" aria-label="TechX Store home">
          <div className="header-logo-mark" aria-hidden="true">
            TX
          </div>
          <span className="header-brand-name">TechX Store</span>
        </Link>

        {/* Nav */}
        <nav className="header-nav" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`header-nav-link${pathname.startsWith(link.href) ? " active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {/* Search (visual placeholder) */}
          <button
            className="header-icon-btn"
            aria-label="Search (coming soon)"
            aria-disabled="true"
            type="button"
            title="Search coming soon"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Cart */}
          <div className="cart-dropdown-wrap" ref={cartRef}>
            <button
              className="header-icon-btn"
              aria-label={`Cart, ${itemCount} item${itemCount !== 1 ? "s" : ""}`}
              type="button"
              onClick={() => setCartOpen((prev) => !prev)}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {itemCount > 0 && (
                <span className="header-cart-badge" aria-hidden="true">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </button>

            {cartOpen && <CartDropdown onClose={() => setCartOpen(false)} />}
          </div>
        </div>
      </div>
    </header>
  );
}
