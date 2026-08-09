import ProductCard from "./ProductCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import EmptyState from "@/components/ui/EmptyState";
import { CONTENT } from "@/lib/site-config";
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
  emptyTitle = CONTENT.common.noProducts,
  emptyDesc = CONTENT.common.noProductsBody,
  emptyAction,
  emptyActionHref,
  onEmptyAction,
}: ProductGridProps) {
  if (loading) {
    return (
      <div
        className="product-grid"
        aria-busy="true"
        aria-label={CONTENT.catalog.loadingProducts}
      >
        {Array.from({ length: skeletonCount }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon="scope"
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
