export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
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

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}
