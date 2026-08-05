"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import type { Product } from "@/lib/types";

type AsyncState = "loading" | "success" | "error";

const CATEGORIES = [
  { label: "Telescopes", icon: "🔭", count: 2, value: "telescope" },
  { label: "Binoculars", icon: "👁", count: 1, value: "binocular" },
  { label: "Filters", icon: "🌈", count: 1, value: "filter" },
  { label: "Accessories", icon: "🧰", count: 2, value: "accessories" },
];

const FEATURES = [
  { icon: "🚚", label: "Free Shipping", desc: "On orders over $50" },
  { icon: "🔄", label: "30-Day Returns", desc: "Hassle-free returns" },
  { icon: "🛡", label: "2-Year Warranty", desc: "All products covered" },
  { icon: "📞", label: "Expert Support", desc: "7 days a week" },
];

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<AsyncState>("loading");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setState("loading");
    fetch("/api/products", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`Catalog returned ${response.status}`);
        return response.json();
      })
      .then((body: { products: Product[] }) => {
        setProducts(body.products ?? []);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [retryKey]);

  return (
    <>
      {/* ── HERO ───────────────────────────────────────── */}
      <section className="hero" id="top" aria-label="Hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="hero-eyebrow">
              ★ Astronomy Gear · Premium Quality
            </span>
            <h1 className="hero-title">
              Explore the Universe.
              <br />
              <span>One Lens</span> at a Time.
            </h1>
            <p className="hero-subtitle">
              Shop hand-picked telescopes, binoculars &amp; filters trusted by
              50,000+ astronomers worldwide. Powered by a cloud-native
              microservices stack on Amazon EKS.
            </p>
            <div className="hero-actions">
              <Link href="/products" className="btn btn-primary btn-lg">
                Shop Now →
              </Link>
              <Link href="/orders" className="btn btn-outline-white btn-lg">
                Track Order
              </Link>
            </div>
            <div className="trust-badges">
              <span className="trust-badge">
                <span className="trust-badge-icon">⭐</span>50K+ Customers
              </span>
              <span className="trust-badge">
                <span className="trust-badge-icon">🚚</span>Free Shipping $50+
              </span>
              <span className="trust-badge">
                <span className="trust-badge-icon">🔄</span>30-Day Returns
              </span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hero-ring hero-ring-1" />
            <div className="hero-ring hero-ring-2" />
            <div className="hero-product-card">
              <span className="hero-product-badge">Best Seller</span>
              <img
                src="/products/nova-refractor.svg"
                alt="Nova Refractor"
                className="hero-product-img"
              />
              <p className="hero-product-name">Nova Refractor</p>
              <p className="hero-product-price">$299.00</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────────── */}
      <div className="categories-section">
        <p className="section-eyebrow">Browse by Type</p>
        <div className="categories-grid">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              className="category-card"
              onClick={() => router.push(`/products?category=${cat.value}`)}
              type="button"
            >
              <div className="category-icon">{cat.icon}</div>
              <p className="category-label">{cat.label}</p>
              <p className="category-count">{cat.count} products</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── BEST SELLERS ───────────────────────────────── */}
      <section className="products-section" id="products">
        <div className="products-section-header">
          <div>
            <p className="section-eyebrow">Hot This Week</p>
            <h2 className="section-title">Best Sellers</h2>
          </div>
          <Link href="/products" className="view-all-link">
            View All Products →
          </Link>
        </div>
        {state === "error" ? (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span>
            <div>
              <strong>Catalog unavailable</strong>
              <p>Could not load products. Please try again later.</p>
              <button
                className="btn btn-secondary btn-sm"
                type="button"
                onClick={() => setRetryKey((value) => value + 1)}
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <ProductGrid
            products={products.slice(0, 6)}
            loading={state === "loading"}
          />
        )}
      </section>

      {/* ── FEATURE STRIP ──────────────────────────────── */}
      <div className="feature-strip">
        <div className="feature-strip-grid">
          {FEATURES.map((f) => (
            <div key={f.label} className="feature-item">
              <span className="feature-icon">{f.icon}</span>
              <p className="feature-label">{f.label}</p>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
