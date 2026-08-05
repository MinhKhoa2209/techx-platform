export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  image: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderItem extends OrderItemInput {
  name: string;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: string;
  expiresAt: string;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}
