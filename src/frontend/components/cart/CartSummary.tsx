"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { formatUsd } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 5000; // $50.00 in cents

interface CartSummaryProps {
  mode?: "cart" | "checkout";
}

export default function CartSummary({ mode = "cart" }: CartSummaryProps) {
  const { items, totalCents } = useCart();
  const shippingCents = totalCents >= FREE_SHIPPING_THRESHOLD ? 0 : 999;
  const grandTotal = totalCents + shippingCents;
  const progressPct = Math.min(
    (totalCents / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  );
  const remainingCents = Math.max(FREE_SHIPPING_THRESHOLD - totalCents, 0);

  return (
    <aside className="cart-summary-panel" aria-label="Order summary">
      <p className="cart-summary-title">Order Summary</p>

      {mode === "cart" && (
        <div className="shipping-progress" aria-label="Free shipping progress">
          <div className="shipping-progress-bar-wrap">
            <div
              className="shipping-progress-bar"
              style={{ width: `${progressPct}%` }}
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <p
            className={`shipping-progress-text${remainingCents === 0 ? " unlocked" : ""}`}
          >
            {remainingCents === 0
              ? "🎉 Free shipping unlocked!"
              : `Add ${formatUsd(remainingCents)} more for free shipping`}
          </p>
        </div>
      )}

      <div className="cart-summary-rows">
        {mode === "checkout" &&
          items.map((item) => (
            <div key={item.product.id} className="cart-summary-row">
              <span className="cart-summary-row-label">
                {item.product.name} × {item.quantity}
              </span>
              <span className="cart-summary-row-value">
                {formatUsd(item.product.priceCents * item.quantity)}
              </span>
            </div>
          ))}
        <div className="cart-summary-row">
          <span className="cart-summary-row-label">Subtotal</span>
          <span className="cart-summary-row-value">
            {formatUsd(totalCents)}
          </span>
        </div>
        <div className="cart-summary-row">
          <span className="cart-summary-row-label">Shipping</span>
          <span
            className="cart-summary-row-value"
            style={{
              color: shippingCents === 0 ? "var(--success)" : undefined,
            }}
          >
            {shippingCents === 0 ? "FREE" : formatUsd(shippingCents)}
          </span>
        </div>
      </div>

      <div className="cart-summary-divider" />

      <div className="cart-summary-total">
        <span className="cart-summary-total-label">Total</span>
        <span className="cart-summary-total-value">
          {formatUsd(grandTotal)}
        </span>
      </div>

      {mode === "cart" && (
        <>
          <Link href="/checkout" className="btn btn-primary btn-full btn-lg">
            Proceed to Checkout →
          </Link>
          <div className="payment-logos">
            <span className="payment-logo">VISA</span>
            <span className="payment-logo">MC</span>
            <span className="payment-logo">PayPal</span>
          </div>
          <div className="promo-row">
            <input
              type="text"
              className="promo-input"
              placeholder="Promo code"
              aria-label="Promo code"
            />
            <button type="button" className="promo-btn">
              Apply
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
