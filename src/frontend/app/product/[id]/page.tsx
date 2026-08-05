"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { formatUsd } from "@/lib/format";
import QuantityStepper from "@/components/ui/QuantityStepper";
import ProductGrid from "@/components/product/ProductGrid";
import type { Product } from "@/lib/types";

type State = "loading" | "success" | "error";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [state, setState] = useState<State>("loading");
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    setState("loading");
    Promise.all([
      fetch(`/api/products/${id}`, { cache: "no-store" }).then(
        async (response) => {
          if (!response.ok)
            throw new Error(`Product returned ${response.status}`);
          return response.json();
        },
      ),
      fetch("/api/products", { cache: "no-store" }).then(async (response) => {
        if (!response.ok)
          throw new Error(`Catalog returned ${response.status}`);
        return response.json();
      }),
    ])
      .then(
        ([single, all]: [{ product: Product }, { products: Product[] }]) => {
          setProduct(single.product);
          setAllProducts(all.products ?? []);
          setState("success");
        },
      )
      .catch(() => setState("error"));
  }, [id]);

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  if (state === "loading") {
    return (
      <div className="product-detail-page">
        <div className="product-detail-grid">
          <div
            className="product-gallery"
            style={{ background: "var(--surface-2)", minHeight: 400 }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="skeleton-line w-3-4 h-8" />
            <div className="skeleton-line w-1-2" />
            <div className="skeleton-line w-full" />
            <div className="skeleton-line w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (state === "error" || !product) {
    return (
      <div className="product-detail-page">
        <div className="alert alert-error" role="alert">
          <span>⚠️</span>
          <div>
            <strong>Product not found</strong>
            <p>This product may have been removed or the ID is invalid.</p>
          </div>
        </div>
        <Link
          href="/products"
          className="btn btn-primary"
          style={{ marginTop: 20 }}
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const originalPrice = Math.round(product.priceCents * 1.15);
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <div className="product-detail-page">
      {toast && (
        <div className="toast" role="status">
          <span className="toast-icon">✓</span>
          Added to cart!
        </div>
      )}

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <Link href="/products">Products</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: "var(--ink)" }}>{product.name}</span>
      </nav>

      <div className="product-detail-grid">
        <div className="product-gallery">
          <img
            src={product.image}
            alt={product.name}
            className="product-gallery-img"
          />
        </div>

        <div className="product-info-col">
          <h1 className="product-info-name">{product.name}</h1>

          <div className="product-info-rating">
            <span className="product-info-stars">★★★★☆</span>
            <span className="product-info-rating-text">
              4.5 out of 5 · 124 reviews
            </span>
          </div>

          <div className="product-info-price-row">
            <span className="product-info-price">
              {formatUsd(product.priceCents)}
            </span>
            <span className="product-info-original">
              {formatUsd(originalPrice)}
            </span>
            <span className="badge badge-danger">−13% OFF</span>
          </div>

          <div className="product-info-divider" />

          <p className="product-info-desc">{product.description}</p>

          <div>
            <span className="badge badge-success">✓ In Stock</span>
          </div>

          <div className="product-qty-row">
            <span className="product-qty-label">Quantity</span>
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={99}
            />
          </div>

          <button
            className="add-to-cart-main"
            type="button"
            onClick={handleAddToCart}
          >
            <svg
              width="18"
              height="18"
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
          </button>

          <div className="shipping-info-box">
            <div className="shipping-info-item">
              ✅ Free shipping on orders over $50
            </div>
            <div className="shipping-info-item">
              🔄 30-day return policy, no questions asked
            </div>
            <div className="shipping-info-item">
              🛡 2-year manufacturer warranty included
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related-section">
          <h2 className="related-title">You Might Also Like</h2>
          <div className="related-grid">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
