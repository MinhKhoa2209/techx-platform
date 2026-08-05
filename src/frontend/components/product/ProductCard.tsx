"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import { formatUsd } from "@/lib/format";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Badge from "@/components/ui/Badge";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const detailHref = `/product/${product.id}`;
  const originalPrice = Math.round(product.priceCents * 1.15);

  function openCard(event: React.MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (!target.closest("a, button")) router.push(detailHref);
  }

  function handleAddToCart(event: React.MouseEvent) {
    event.stopPropagation();
    (onAddToCart ?? addItem)(product, quantity);
    setAdded(true);
    setQuantity(1);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleWishlist(event: React.MouseEvent) {
    event.stopPropagation();
    setWishlisted((previous) => !previous);
  }

  return (
    <article className="product-card" onClick={openCard}>
      <div className="product-image-wrap">
        <Badge className="product-badge">Featured</Badge>
        <button
          className={`wishlist-btn${wishlisted ? " active" : ""}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          type="button"
        >
          {wishlisted ? "♥" : "♡"}
        </button>
        <Link href={detailHref} aria-label={`View ${product.name}`}>
          <img
            src={product.image}
            alt={product.name}
            className="product-img"
            loading="lazy"
          />
        </Link>
      </div>

      <div className="product-content">
        <h3 className="product-title">
          <Link href={detailHref}>{product.name}</Link>
        </h3>
        <div className="product-rating">
          <span className="product-stars" aria-label="4.5 out of 5 stars">
            ★★★★☆
          </span>
          <span className="product-rating-count">(124)</span>
        </div>
        <div className="price-row">
          <span className="current-price">{formatUsd(product.priceCents)}</span>
          <span className="original-price">{formatUsd(originalPrice)}</span>
          <Badge variant="danger" style={{ fontSize: 10 }}>
            −13%
          </Badge>
        </div>
        <p className="product-desc">{product.description}</p>
        <div className="product-actions">
          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={99}
          />
          <button
            className="add-to-cart-btn"
            type="button"
            onClick={handleAddToCart}
            disabled={added}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              "✓ Added!"
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
