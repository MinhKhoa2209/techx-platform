"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CartDropdown from "@/components/cart/CartDropdown";
import BrandLogo from "@/components/layout/BrandLogo";
import PrimaryNavigation from "@/components/layout/PrimaryNavigation";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/lib/CartContext";
import { CART_BADGE_DISPLAY_LIMIT, CONTENT, ROUTES } from "@/lib/site-config";
import { useFocusTrap } from "@/lib/useFocusTrap";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const [query, setQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const checkoutMode = pathname === ROUTES.checkout;

  useEffect(() => {
    setCartOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!cartOpen) return;
    const close = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [cartOpen]);

  useFocusTrap(menuOpen, menuRef, () => setMenuOpen(false));

  function submitSearch(event: React.FormEvent) {
    event.preventDefault();
    if (query.trim()) router.push(ROUTES.search(query));
    else router.push(ROUTES.products);
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        {CONTENT.shell.skipToContent}
      </a>
      <header
        className={`site-header${checkoutMode ? " checkout-site-header" : ""}`}
      >
        <div className="header-inner">
          {!checkoutMode && (
            <button
              ref={menuButtonRef}
              className="icon-button mobile-menu-button"
              type="button"
              aria-label={CONTENT.shell.openNavigation}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Icon name="menu" />
            </button>
          )}

          <Link
            href={ROUTES.home}
            className="brand"
            aria-label="TechX Observatory Supply home"
          >
            <BrandLogo />
          </Link>

          {checkoutMode ? (
            <div className="checkout-header-message">
              <Icon name="shield" size={20} />
              <span>{CONTENT.shell.secureCheckout}</span>
            </div>
          ) : (
            <>
              <Suspense fallback={<div className="desktop-nav-placeholder" />}>
                <PrimaryNavigation />
              </Suspense>
              <form
                className="header-search"
                role="search"
                onSubmit={submitSearch}
              >
                <label className="sr-only" htmlFor="header-search">
                  {CONTENT.shell.searchProducts}
                </label>
                <Icon name="search" size={18} />
                <input
                  id="header-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={CONTENT.shell.searchPlaceholder}
                  type="search"
                />
              </form>

              <div className="header-actions" ref={cartRef}>
                <Link className="order-link" href={ROUTES.orders}>
                  <Icon name="package" size={19} />
                  <span>{CONTENT.shell.orderLookup}</span>
                </Link>
                <button
                  className="cart-button"
                  type="button"
                  aria-label={CONTENT.shell.cartLabel(itemCount)}
                  aria-expanded={cartOpen}
                  onClick={() => setCartOpen((open) => !open)}
                >
                  <Icon name="cart" size={21} />
                  <span>{CONTENT.shell.cart}</span>
                  {itemCount > 0 && (
                    <span className="cart-count">
                      {itemCount > CART_BADGE_DISPLAY_LIMIT
                        ? `${CART_BADGE_DISPLAY_LIMIT}+`
                        : itemCount}
                    </span>
                  )}
                </button>
                {cartOpen && (
                  <CartDropdown onClose={() => setCartOpen(false)} />
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {!checkoutMode && menuOpen && (
        <div className="mobile-menu-layer">
          <button
            type="button"
            className="mobile-menu-backdrop"
            onClick={() => setMenuOpen(false)}
            aria-label={CONTENT.shell.closeNavigation}
          />
          <div
            id="mobile-navigation"
            ref={menuRef}
            className="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label={CONTENT.shell.navigation}
          >
            <div className="mobile-menu-head">
              <BrandLogo compact />
              <button
                className="icon-button"
                type="button"
                aria-label={CONTENT.shell.closeNavigation}
                onClick={() => setMenuOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <Suspense fallback={null}>
              <PrimaryNavigation mobile />
            </Suspense>
            <p>{CONTENT.shell.mobileMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}
