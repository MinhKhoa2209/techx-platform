"use client";

import { useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/lib/CartContext";
import { formatUsd } from "@/lib/format";
import { CONTENT, ROUTES, UI_LIMITS } from "@/lib/site-config";

export default function CartDropdown({ onClose }: { onClose: () => void }) {
  const { items, subtotalCents } = useCart();

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <section className="cart-dropdown" aria-label={CONTENT.cart.preview}>
      <div className="cart-dropdown-header">
        <strong>{CONTENT.cart.title}</strong>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label={CONTENT.cart.closePreview}
          type="button"
        >
          <Icon name="close" size={18} />
        </button>
      </div>
      {items.length === 0 ? (
        <div className="cart-dropdown-empty">
          <Icon name="cart" size={30} />
          <p>{CONTENT.cart.empty}</p>
          <Link
            href={ROUTES.products}
            className="btn btn-primary"
            onClick={onClose}
          >
            {CONTENT.common.shopNow}
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-dropdown-items">
            {items.slice(0, UI_LIMITS.cartPreviewItems).map((item) => (
              <div key={item.product.id} className="cart-dropdown-item">
                <img
                  src={item.product.images[0]!.src}
                  alt={item.product.images[0]!.alt}
                  width={640}
                  height={480}
                />
                <div>
                  <p>{item.product.name}</p>
                  <small>
                    {item.quantity} × {formatUsd(item.product.priceCents)}
                  </small>
                </div>
                <strong>
                  {formatUsd(item.product.priceCents * item.quantity)}
                </strong>
              </div>
            ))}
          </div>
          <div className="cart-dropdown-footer">
            <div>
              <span>{CONTENT.cart.subtotal}</span>
              <strong>{formatUsd(subtotalCents)}</strong>
            </div>
            <Link
              href={ROUTES.cart}
              className="btn btn-secondary"
              onClick={onClose}
            >
              {CONTENT.cart.viewCart}
            </Link>
            <Link
              href={ROUTES.checkout}
              className="btn btn-primary"
              onClick={onClose}
            >
              {CONTENT.cart.checkout}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
