import assert from "node:assert/strict";
import { test } from "node:test";
import productsJson from "../data/products.json" with { type: "json" };
import { buildCategories, validateProducts } from "../src/catalog.js";

test("validates the complete v2 seed and derives category facets", () => {
  const products = validateProducts(productsJson);
  assert.equal(products.length, 12);
  assert.equal(products.filter((product) => product.featured).length, 4);
  assert.equal(
    products.filter((product) => product.compareAtPriceCents !== undefined)
      .length,
    3,
  );
  assert.equal(
    products.filter((product) => product.availability === "out_of_stock")
      .length,
    1,
  );
  assert.deepEqual(
    buildCategories(products).map(({ id, count }) => ({ id, count })),
    [
      { id: "telescopes", count: 4 },
      { id: "binoculars", count: 3 },
      { id: "accessories", count: 5 },
    ],
  );
});

test("fails fast for duplicate ids and inconsistent inventory", () => {
  const duplicate = [
    productsJson[0]!,
    { ...productsJson[1]!, id: productsJson[0]!.id },
  ];
  assert.throws(() => validateProducts(duplicate), /Duplicate product id/);

  const inconsistent = [
    { ...productsJson[0]!, availability: "out_of_stock", inventoryQuantity: 2 },
  ];
  assert.throws(() => validateProducts(inconsistent), /inventory must be zero/);
});
