import { describe, expect, it } from "vitest";
import {
  filterAndSortProducts,
  relatedProducts,
  type CatalogFilters,
} from "@/lib/catalog";
import { productFixture } from "./fixtures";

const filters: CatalogFilters = {
  query: "",
  category: "",
  price: "",
  availability: "",
  sort: "featured",
};

describe("catalog selectors", () => {
  const binocular = {
    ...productFixture,
    id: "test-binocular",
    sku: "TEST-002",
    name: "Night Test 10×50",
    category: "binoculars" as const,
    priceCents: 7_900,
    featured: false,
    tags: ["stargazing", "portable"],
  };

  it("searches typed product fields and combines facets", () => {
    expect(
      filterAndSortProducts([productFixture, binocular], {
        ...filters,
        query: "TEST-002",
        category: "binoculars",
        price: "under-100",
      }),
    ).toEqual([binocular]);
    expect(
      filterAndSortProducts([productFixture, binocular], {
        ...filters,
        query: "portable",
      }),
    ).toEqual([binocular]);
  });

  it("sorts deterministically without mutating the source", () => {
    const source = [productFixture, binocular];
    const sorted = filterAndSortProducts(source, {
      ...filters,
      sort: "price-asc",
    });
    expect(sorted.map((product) => product.id)).toEqual([
      binocular.id,
      productFixture.id,
    ]);
    expect(source[0]?.id).toBe(productFixture.id);
  });

  it("ranks related products by category and shared tags", () => {
    const sibling = {
      ...productFixture,
      id: "sibling-scope",
      sku: "TEST-003",
      tags: ["beginner"],
      featured: false,
    };
    expect(
      relatedProducts([binocular, sibling, productFixture], productFixture)[0]
        ?.id,
    ).toBe(sibling.id);
  });
});
