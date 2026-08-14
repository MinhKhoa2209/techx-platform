import type { CatalogCategory, Order, Product, StoreConfig } from "@/lib/types";

export const productFixture: Product = {
  id: "test-scope",
  sku: "TEST-001",
  name: "Test Scope",
  category: "telescopes",
  shortDescription: "A compact test telescope.",
  description: "A compact test telescope for deterministic UI checks.",
  priceCents: 10_000,
  currency: "USD",
  availability: "in_stock",
  inventoryQuantity: 8,
  featured: true,
  tags: ["test", "beginner"],
  specifications: [
    { label: "Aperture", value: "70 mm" },
    { label: "Mount", value: "Alt-azimuth" },
    { label: "Weight", value: "2 kg" },
  ],
  images: [{ src: "/products/test-scope.svg", alt: "Test telescope" }],
};

export const categoryFixture: CatalogCategory = {
  id: "telescopes",
  label: "Telescopes",
  description: "Test category",
  count: 1,
};

export const configFixture: StoreConfig = {
  currency: "USD",
  freeShippingThresholdCents: 5_000,
  standardShippingCents: 999,
  maxQuantityPerItem: 99,
  orderTtlSeconds: 3_600,
  shippingMethods: [
    {
      id: "standard",
      label: "Standard delivery",
      description: "Estimated in 3–5 business days",
    },
  ],
};

export const orderFixture: Order = {
  id: "ord_00000000-0000-4000-8000-000000000000",
  items: [
    {
      productId: productFixture.id,
      quantity: 1,
      sku: productFixture.sku,
      name: productFixture.name,
      image: productFixture.images[0]!.src,
      unitPriceCents: productFixture.priceCents,
      lineTotalCents: productFixture.priceCents,
    },
  ],
  customer: { name: "Test Customer", emailMasked: "te**@example.com" },
  shippingAddress: {
    city: "Seattle",
    region: "WA",
    postalCode: "98101",
    countryCode: "US",
  },
  status: "confirmed",
  shippingMethod: "standard",
  estimatedDelivery: {
    from: "2026-08-12T12:00:00.000Z",
    to: "2026-08-14T12:00:00.000Z",
  },
  subtotalCents: 10_000,
  shippingCents: 0,
  totalCents: 10_000,
  createdAt: "2026-08-07T12:00:00.000Z",
  expiresAt: "2026-08-07T13:00:00.000Z",
};
