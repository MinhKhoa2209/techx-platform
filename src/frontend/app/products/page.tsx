"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar, { PRICE_RANGES } from "@/components/layout/Sidebar";
import ProductGrid from "@/components/product/ProductGrid";
import SkeletonCard from "@/components/ui/SkeletonCard";
import type { Product } from "@/lib/types";

type AsyncState = "loading" | "success" | "error";

function categoryMatch(product: Product, cat: string): boolean {
  if (cat === "all") return true;
  const name = product.name.toLowerCase();
  const desc = product.description.toLowerCase();
  const combined = `${name} ${desc}`;
  if (cat === "telescope")
    return combined.includes("telescope") || combined.includes("refractor");
  if (cat === "binocular") return combined.includes("binocular");
  if (cat === "filter") return combined.includes("filter");
  if (cat === "accessories")
    return (
      combined.includes("atlas") ||
      combined.includes("kit") ||
      combined.includes("light") ||
      combined.includes("care")
    );
  return true;
}

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A – Z" },
];

// Inner component uses useSearchParams — must be in Suspense
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [state, setState] = useState<AsyncState>("loading");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") ?? "all",
  );
  const [selectedPrice, setSelectedPrice] = useState("");
  const [sort, setSort] = useState(() => {
    const requestedSort = searchParams.get("sort");
    return SORT_OPTIONS.some((option) => option.value === requestedSort)
      ? (requestedSort ?? "featured")
      : "featured";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedCategory === "all") params.delete("category");
    else params.set("category", selectedCategory);
    if (sort === "featured") params.delete("sort");
    else params.set("sort", sort);
    const nextQuery = params.toString();
    if (nextQuery !== searchParams.toString()) {
      router.replace(nextQuery ? `/products?${nextQuery}` : "/products", {
        scroll: false,
      });
    }
  }, [router, searchParams, selectedCategory, sort]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => categoryMatch(p, selectedCategory));

    if (selectedPrice) {
      const range = PRICE_RANGES.find((r) => r.value === selectedPrice);
      if (range) {
        list = list.filter(
          (p) => p.priceCents >= range.min && p.priceCents < range.max,
        );
      }
    }

    switch (sort) {
      case "price-asc":
        return [...list].sort((a, b) => a.priceCents - b.priceCents);
      case "price-desc":
        return [...list].sort((a, b) => b.priceCents - a.priceCents);
      case "name-asc":
        return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return list;
    }
  }, [products, selectedCategory, selectedPrice, sort]);

  function handleClear() {
    setSelectedCategory("all");
    setSelectedPrice("");
  }

  return (
    <div className="catalog-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a href="/">Home</a>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: "var(--ink)" }}>Products</span>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">All Products</h1>
        <p className="page-subtitle">
          Premium astronomy gear, hand-picked for every level.
        </p>
      </div>

      {/* Toolbar */}
      <div className="catalog-toolbar">
        <p className="catalog-count">
          {state === "loading" ? (
            "Loading…"
          ) : (
            <>
              <strong>{filtered.length}</strong>{" "}
              {filtered.length === 1 ? "product" : "products"}
            </>
          )}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="mobile-filters-btn"
            onClick={() => setSidebarOpen(true)}
            type="button"
          >
            ⋮ Filters
          </button>
          <select
            className="catalog-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Layout */}
      <div className="catalog-layout">
        <Sidebar
          selectedCategory={selectedCategory}
          selectedPrice={selectedPrice}
          onCategoryChange={setSelectedCategory}
          onPriceChange={setSelectedPrice}
          onClear={handleClear}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="catalog-grid-area">
          {state === "error" ? (
            <div className="alert alert-error" role="alert">
              <span>⚠️</span>
              <div>
                <strong>Could not load products</strong>
                <p>Please try again later.</p>
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
              products={filtered}
              loading={state === "loading"}
              emptyTitle="No products match your filters"
              emptyDesc="Try adjusting your filters or clearing them."
              emptyAction="Clear Filters"
              onEmptyAction={handleClear}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Loading fallback for Suspense
function ProductsLoading() {
  return (
    <div className="catalog-page">
      <div className="breadcrumb">
        <a href="/">Home</a>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: "var(--ink)" }}>Products</span>
      </div>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">All Products</h1>
      </div>
      <div className="product-grid" style={{ marginTop: 24 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

// Page export wraps inner component in Suspense (required for useSearchParams)
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  );
}
