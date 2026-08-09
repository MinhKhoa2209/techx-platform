"use client";

import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/lib/CartContext";
import { formatUsd } from "@/lib/format";
import { hasUnavailableItems, orderPreview } from "@/lib/cart";
import { CONTENT, ROUTES } from "@/lib/site-config";
import { useStorefront } from "@/lib/StorefrontContext";

export default function CartSummary({
  mode = "cart",
}: {
  mode?: "cart" | "checkout";
}) {
  const { items, subtotalCents } = useCart();
  const { config, configState, retryConfig } = useStorefront();

  if (!config) {
    return (
      <aside className="cart-summary-panel" aria-label={CONTENT.cart.summary}>
        <h2>{CONTENT.cart.summary}</h2>
        {configState === "error" ? (
          <div className="inline-error" role="alert">
            <p>{CONTENT.cart.deliveryUnavailable}</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={retryConfig}
            >
              {CONTENT.common.retry}
            </button>
          </div>
        ) : (
          <div className="summary-skeleton" aria-busy="true">
            {CONTENT.common.loading}
          </div>
        )}
      </aside>
    );
  }

  const preview = orderPreview(items, config);
  const remaining = Math.max(
    config.freeShippingThresholdCents - subtotalCents,
    0,
  );
  const progress = Math.min(
    subtotalCents / config.freeShippingThresholdCents,
    1,
  );
  const blocked = hasUnavailableItems(items);

  return (
    <aside className="cart-summary-panel" aria-label={CONTENT.cart.summary}>
      <h2>
        {mode === "checkout" ? CONTENT.checkout.review : CONTENT.cart.summary}
      </h2>
      {mode === "checkout" && (
        <ul className="summary-items">
          {items.map((item) => (
            <li key={item.product.id}>
              <span>
                {item.product.name} × {item.quantity}
              </span>
              <strong>
                {formatUsd(item.product.priceCents * item.quantity)}
              </strong>
            </li>
          ))}
        </ul>
      )}
      {mode === "cart" && (
        <div className="shipping-progress">
          <progress
            value={progress}
            max={1}
            aria-label={CONTENT.cart.freeDeliveryProgress}
          />
          <p>
            {remaining === 0
              ? CONTENT.cart.freeDelivery
              : CONTENT.cart.freeDeliveryRemaining(formatUsd(remaining))}
          </p>
        </div>
      )}
      <dl className="summary-rows">
        <div>
          <dt>{CONTENT.cart.subtotal}</dt>
          <dd>{formatUsd(preview.subtotalCents)}</dd>
        </div>
        <div>
          <dt>{CONTENT.cart.shipping}</dt>
          <dd>
            {preview.shippingCents === 0
              ? CONTENT.common.free
              : formatUsd(preview.shippingCents)}
          </dd>
        </div>
        <div className="summary-total">
          <dt>{CONTENT.cart.total}</dt>
          <dd>{formatUsd(preview.totalCents)}</dd>
        </div>
      </dl>
      {mode === "cart" &&
        (blocked ? (
          <p className="inline-warning" role="alert">
            {CONTENT.cart.unavailableItems}
          </p>
        ) : (
          <Link href={ROUTES.checkout} className="btn btn-primary btn-full">
            {CONTENT.cart.checkout}
            <Icon name="arrow" size={18} />
          </Link>
        ))}
      <p className="summary-demo-note">
        <Icon name="shield" size={17} />
        {CONTENT.cart.demoNote}
      </p>
    </aside>
  );
}
