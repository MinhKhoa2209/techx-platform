export const PRODUCT_CATEGORIES = [
  "telescopes",
  "binoculars",
  "accessories",
] as const;

export const AVAILABILITY_VALUES = [
  "in_stock",
  "low_stock",
  "out_of_stock",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
export type Availability = (typeof AVAILABILITY_VALUES)[number];

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  priceCents: number;
  compareAtPriceCents?: number;
  currency: "USD";
  availability: Availability;
  inventoryQuantity: number;
  featured: boolean;
  tags: string[];
  specifications: ProductSpecification[];
  images: ProductImage[];
}

export interface CatalogCategory {
  id: ProductCategory;
  label: string;
  description: string;
  count: number;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}
