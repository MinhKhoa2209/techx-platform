export const PRODUCT_CATEGORY_VALUES = [
  "telescopes",
  "binoculars",
  "accessories",
] as const;
export const AVAILABILITY_VALUES = [
  "in_stock",
  "low_stock",
  "out_of_stock",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORY_VALUES)[number];
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

export interface CatalogResponse {
  products: Product[];
  categories: CatalogCategory[];
}

export interface StoreConfig {
  currency: "USD";
  freeShippingThresholdCents: number;
  standardShippingCents: number;
  maxQuantityPerItem: number;
  orderTtlSeconds: number;
  shippingMethods: Array<{
    id: "standard";
    label: string;
    description: string;
  }>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  sku: string;
  name: string;
  image: string;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface CreateOrderInput {
  items: Array<{ productId: string; quantity: number }>;
  customer: { name: string; email: string };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    region: string;
    postalCode: string;
    countryCode: "US";
  };
  shippingMethod: "standard";
}

export interface Order {
  id: string;
  items: OrderItem[];
  customer: { name: string; emailMasked: string };
  shippingAddress: {
    city: string;
    region: string;
    postalCode: string;
    countryCode: "US";
  };
  status: "confirmed";
  shippingMethod: "standard";
  estimatedDelivery: { from: string; to: string };
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: string;
  expiresAt: string;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}
