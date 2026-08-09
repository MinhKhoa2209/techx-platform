"use client";

import { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Icon from "@/components/ui/Icon";
import { useCart } from "@/lib/CartContext";
import { discountPercent, formatUsd } from "@/lib/format";
import {
  AVAILABILITY_CONTENT,
  CONTENT,
  ROUTES,
  UI_TIMINGS,
} from "@/lib/site-config";
import { useStorefront } from "@/lib/StorefrontContext";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { categories } = useStorefront();
  const [added, setAdded] = useState(false);
  const category = categories.find((item) => item.id === product.category);
  const availability = AVAILABILITY_CONTENT[product.availability];
  const discount = discountPercent(
    product.priceCents,
    product.compareAtPriceCents,
  );
  const unavailable = product.availability === "out_of_stock";

  function add() {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), UI_TIMINGS.transientFeedbackMs);
  }

  return (
    <article className="product-card">
      <Link className="product-card-media" href={ROUTES.product(product.id)}>
        <img
          src={product.images[0]!.src}
          alt={product.images[0]!.alt}
          width={640}
          height={480}
          loading="lazy"
        />
        {discount !== null && (
          <Badge variant="danger">{CONTENT.product.save(discount)}</Badge>
        )}
      </Link>
      <div className="product-card-body">
        <div className="product-card-meta">
          <span>{category?.label}</span>
          <Badge
            variant={
              availability.tone === "neutral" ? "neutral" : availability.tone
            }
          >
            {availability.label}
          </Badge>
        </div>
        <h3>
          <Link href={ROUTES.product(product.id)}>{product.name}</Link>
        </h3>
        <p>{product.shortDescription}</p>
        <div className="product-price-row">
          <strong>{formatUsd(product.priceCents)}</strong>
          {product.compareAtPriceCents && (
            <del>{formatUsd(product.compareAtPriceCents)}</del>
          )}
        </div>
        <div className="product-card-actions">
          <Link className="btn btn-secondary" href={ROUTES.product(product.id)}>
            {CONTENT.common.viewProduct}
          </Link>
          <button
            className="btn btn-primary"
            type="button"
            onClick={add}
            disabled={unavailable || added}
          >
            {added ? (
              <>
                <Icon name="check" size={17} />
                {CONTENT.common.added}
              </>
            ) : (
              CONTENT.common.addToCart
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
