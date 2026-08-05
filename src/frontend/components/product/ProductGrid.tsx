import ProductCard from "./ProductCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import type { Product } from "@/lib/types";

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
  emptyTitle?: string;
  emptyDesc?: string;
  emptyAction?: string;
  emptyActionHref?: string;
  onEmptyAction?: () => void;
}

export default function ProductGrid({
  products,
  loading = false,
  skeletonCount = 6,
  emptyTitle = "No products found",
  emptyDesc = "Try adjusting your filters or check back later.",
  emptyAction,
  emptyActionHref,
  onEmptyAction,
}: ProductGridProps) {
  if (loading) {
    return (
      <div
        className="product-grid"
        aria-busy="true"
        aria-label="Loading products"
      >
        {Array.from({ length: skeletonCount }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon="🔭"
        title={emptyTitle}
        description={emptyDesc}
        {...(emptyAction ? { actionLabel: emptyAction } : {})}
        {...(emptyActionHref ? { actionHref: emptyActionHref } : {})}
        {...(onEmptyAction ? { onAction: onEmptyAction } : {})}
      />
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
