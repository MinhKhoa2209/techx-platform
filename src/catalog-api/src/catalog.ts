import type {
  Availability,
  CatalogCategory,
  Product,
  ProductCategory,
} from "./types.js";
import { AVAILABILITY_VALUES, PRODUCT_CATEGORIES } from "./types.js";

const CATEGORY_CONTENT: Record<
  ProductCategory,
  { label: string; description: string }
> = {
  telescopes: {
    label: "Telescopes",
    description: "Explore the Moon, planets and deep-sky objects.",
  },
  binoculars: {
    label: "Binoculars",
    description: "Portable optics for stargazing and daytime adventures.",
  },
  accessories: {
    label: "Accessories",
    description: "Essential upgrades for clearer, more comfortable observing.",
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireString(value: unknown, path: string, max = 500): string {
  if (
    typeof value !== "string" ||
    value.trim() !== value ||
    value.length < 1 ||
    value.length > max
  ) {
    throw new Error(`${path} must be a non-empty trimmed string.`);
  }
  return value;
}

function requireInteger(
  value: unknown,
  path: string,
  minimum: number,
  maximum = Number.MAX_SAFE_INTEGER,
): number {
  if (
    !Number.isInteger(value) ||
    (value as number) < minimum ||
    (value as number) > maximum
  ) {
    throw new Error(
      `${path} must be an integer from ${minimum} to ${maximum}.`,
    );
  }
  return value as number;
}

function requireStringList(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 12) {
    throw new Error(`${path} must contain between 1 and 12 values.`);
  }
  const values = value.map((item, index) =>
    requireString(item, `${path}[${index}]`, 80),
  );
  if (new Set(values).size !== values.length) {
    throw new Error(`${path} must not contain duplicates.`);
  }
  return values;
}

function parseProduct(value: unknown, index: number): Product {
  const path = `products[${index}]`;
  if (!isRecord(value)) throw new Error(`${path} must be an object.`);

  const allowedKeys = new Set([
    "id",
    "sku",
    "name",
    "category",
    "shortDescription",
    "description",
    "priceCents",
    "compareAtPriceCents",
    "currency",
    "availability",
    "inventoryQuantity",
    "featured",
    "tags",
    "specifications",
    "images",
  ]);
  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key))
      throw new Error(`${path}.${key} is not supported.`);
  }

  const id = requireString(value.id, `${path}.id`, 100);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`${path}.id must be a lowercase slug.`);
  }
  const sku = requireString(value.sku, `${path}.sku`, 40);
  const name = requireString(value.name, `${path}.name`, 120);
  if (!PRODUCT_CATEGORIES.includes(value.category as ProductCategory)) {
    throw new Error(`${path}.category is invalid.`);
  }
  const category = value.category as ProductCategory;
  const shortDescription = requireString(
    value.shortDescription,
    `${path}.shortDescription`,
    180,
  );
  const description = requireString(
    value.description,
    `${path}.description`,
    800,
  );
  const priceCents = requireInteger(value.priceCents, `${path}.priceCents`, 1);
  const compareAtPriceCents =
    value.compareAtPriceCents === undefined
      ? undefined
      : requireInteger(
          value.compareAtPriceCents,
          `${path}.compareAtPriceCents`,
          priceCents + 1,
        );
  if (value.currency !== "USD")
    throw new Error(`${path}.currency must be USD.`);
  if (!AVAILABILITY_VALUES.includes(value.availability as Availability)) {
    throw new Error(`${path}.availability is invalid.`);
  }
  const availability = value.availability as Availability;
  const inventoryQuantity = requireInteger(
    value.inventoryQuantity,
    `${path}.inventoryQuantity`,
    0,
    99,
  );
  if (availability === "out_of_stock" && inventoryQuantity !== 0) {
    throw new Error(`${path} out-of-stock inventory must be zero.`);
  }
  if (availability !== "out_of_stock" && inventoryQuantity === 0) {
    throw new Error(`${path} available inventory must be positive.`);
  }
  if (availability === "low_stock" && inventoryQuantity > 5) {
    throw new Error(`${path} low-stock inventory cannot exceed five.`);
  }
  if (typeof value.featured !== "boolean") {
    throw new Error(`${path}.featured must be a boolean.`);
  }
  const tags = requireStringList(value.tags, `${path}.tags`);

  if (!Array.isArray(value.specifications) || value.specifications.length < 3) {
    throw new Error(`${path}.specifications must contain at least three rows.`);
  }
  const specifications = value.specifications.map(
    (specification, specIndex) => {
      if (!isRecord(specification)) {
        throw new Error(
          `${path}.specifications[${specIndex}] must be an object.`,
        );
      }
      return {
        label: requireString(
          specification.label,
          `${path}.specifications[${specIndex}].label`,
          60,
        ),
        value: requireString(
          specification.value,
          `${path}.specifications[${specIndex}].value`,
          120,
        ),
      };
    },
  );

  if (
    !Array.isArray(value.images) ||
    value.images.length < 1 ||
    value.images.length > 4
  ) {
    throw new Error(`${path}.images must contain between one and four images.`);
  }
  const images = value.images.map((image, imageIndex) => {
    if (!isRecord(image))
      throw new Error(`${path}.images[${imageIndex}] must be an object.`);
    const src = requireString(
      image.src,
      `${path}.images[${imageIndex}].src`,
      200,
    );
    if (!src.startsWith("/products/")) {
      throw new Error(
        `${path}.images[${imageIndex}].src must use a local product asset.`,
      );
    }
    return {
      src,
      alt: requireString(image.alt, `${path}.images[${imageIndex}].alt`, 180),
    };
  });

  return {
    id,
    sku,
    name,
    category,
    shortDescription,
    description,
    priceCents,
    ...(compareAtPriceCents === undefined ? {} : { compareAtPriceCents }),
    currency: "USD",
    availability,
    inventoryQuantity,
    featured: value.featured,
    tags,
    specifications,
    images,
  };
}

export function validateProducts(value: unknown): readonly Product[] {
  if (!Array.isArray(value) || value.length < 1) {
    throw new Error("Catalog must contain at least one product.");
  }
  const products = value.map(parseProduct);
  const ids = new Set<string>();
  const skus = new Set<string>();
  for (const product of products) {
    if (ids.has(product.id))
      throw new Error(`Duplicate product id: ${product.id}.`);
    if (skus.has(product.sku))
      throw new Error(`Duplicate product sku: ${product.sku}.`);
    ids.add(product.id);
    skus.add(product.sku);
  }
  return Object.freeze(products.map((product) => Object.freeze(product)));
}

export function buildCategories(
  products: readonly Product[],
): CatalogCategory[] {
  return PRODUCT_CATEGORIES.map((id) => ({
    id,
    ...CATEGORY_CONTENT[id],
    count: products.filter((product) => product.category === id).length,
  }));
}
