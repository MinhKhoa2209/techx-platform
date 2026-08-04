export interface Product {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  image: string;
}

export interface ErrorEnvelope {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
}
