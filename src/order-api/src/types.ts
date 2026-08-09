export type ProductCategory = "telescopes" | "binoculars" | "accessories";
export type Availability = "in_stock" | "low_stock" | "out_of_stock";

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
  specifications: Array<{ label: string; value: string }>;
  images: Array<{ src: string; alt: string }>;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface CustomerInput {
  name: string;
  email: string;
}

export interface ShippingAddressInput {
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: "US";
}

export interface CreateOrderInput {
  items: OrderItemInput[];
  customer: CustomerInput;
  shippingAddress: ShippingAddressInput;
  shippingMethod: "standard";
}

export interface OrderItem extends OrderItemInput {
  sku: string;
  name: string;
  image: string;
  unitPriceCents: number;
  lineTotalCents: number;
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

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}
