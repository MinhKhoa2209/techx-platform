import { PRICE_FILTERS } from "./site-config";
import type { SORT_OPTIONS } from "./site-config";
import type { Availability, Product, ProductCategory } from "./types";

export type PriceFilterId = (typeof PRICE_FILTERS)[number]["id"] | "";
export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export interface CatalogFilters {
  query: string;
  category: ProductCategory | "";
  price: PriceFilterId;
  availability: Availability | "";
  sort: SortId;
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilters = {
  query: "",
  category: "",
  price: "",
  availability: "",
  sort: "featured",
};

export function filterAndSortProducts(
  products: Product[],
  filters: CatalogFilters,
): Product[] {
  const query = filters.query.trim().toLocaleLowerCase();
  const range = PRICE_FILTERS.find((price) => price.id === filters.price);
  const filtered = products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.availability && product.availability !== filters.availability)
      return false;
    if (
      range &&
      (product.priceCents < range.minimum ||
        product.priceCents >= range.maximum)
    ) {
      return false;
    }
    if (!query) return true;
    const searchable = [
      product.name,
      product.sku,
      product.shortDescription,
      ...product.tags,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return searchable.includes(query);
  });

  return [...filtered].sort((left, right) => {
    if (filters.sort === "price-asc") return left.priceCents - right.priceCents;
    if (filters.sort === "price-desc")
      return right.priceCents - left.priceCents;
    if (filters.sort === "name-asc") return left.name.localeCompare(right.name);
    return Number(right.featured) - Number(left.featured);
  });
}

export function relatedProducts(
  products: Product[],
  current: Product,
): Product[] {
  return products
    .filter((product) => product.id !== current.id)
    .map((product) => ({
      product,
      score:
        (product.category === current.category ? 10 : 0) +
        product.tags.filter((tag) => current.tags.includes(tag)).length,
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(({ product }) => product);
}
