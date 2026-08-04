"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addToCart, loadCart, saveCart, updateCartQuantity } from "@/lib/cart";
import { formatUsd } from "@/lib/format";
import type { ApiErrorEnvelope, CartItem, Order, Product } from "@/lib/types";

type AsyncState = "idle" | "loading" | "success" | "error";

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as T | ApiErrorEnvelope;
  if (!response.ok) {
    const error = body as ApiErrorEnvelope;
    throw new Error(
      error.error?.message || `Request failed with status ${response.status}.`,
    );
  }
  return body as T;
}

function ProductSkeleton() {
  return (
    <div
      className="product-grid"
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div className="product-card skeleton" key={index} aria-hidden="true">
          <div className="skeleton-image" />
          <div className="skeleton-line wide" />
          <div className="skeleton-line" />
        </div>
      ))}
    </div>
  );
}

function CartPanel({
  items,
  onQuantity,
  onRemove,
  onSubmit,
  submitting,
}: {
  items: CartItem[];
  onQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const total = items.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <aside className="cart-panel" aria-labelledby="cart-title">
      <div className="section-heading compact">
        <div>
          <span className="eyebrow">Your selection</span>
          <h2 id="cart-title">Cart</h2>
        </div>
        <span className="count-pill" aria-label={`${count} items in cart`}>
          {count}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">✦</span>
          <p>Your cart is ready for a little stargazing gear.</p>
        </div>
      ) : (
        <div className="cart-items">
          {items.map((item) => (
            <div className="cart-row" key={item.product.id}>
              <div>
                <strong>{item.product.name}</strong>
                <small>{formatUsd(item.product.priceCents)} each</small>
              </div>
              <div className="cart-actions">
                <label>
                  <span className="sr-only">
                    Quantity for {item.product.name}
                  </span>
                  <input
                    aria-label={`Quantity for ${item.product.name}`}
                    type="number"
                    min="1"
                    max="99"
                    value={item.quantity}
                    onChange={(event) =>
                      onQuantity(item.product.id, Number(event.target.value))
                    }
                  />
                </label>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onRemove(item.product.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cart-total">
        <span>Subtotal</span>
        <strong>{formatUsd(total)}</strong>
      </div>
      <button
        className="primary-button full"
        type="button"
        disabled={items.length === 0 || submitting}
        onClick={onSubmit}
      >
        {submitting ? "Confirming order…" : "Confirm order"}
      </button>
      <p className="demo-note">
        Demo orders are temporary and may disappear after a redeploy.
      </p>
    </aside>
  );
}

export function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsState, setProductsState] = useState<AsyncState>("loading");
  const [productsError, setProductsError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderState, setOrderState] = useState<AsyncState>("idle");
  const [orderError, setOrderError] = useState("");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [lookupState, setLookupState] = useState<AsyncState>("idle");
  const [lookupError, setLookupError] = useState("");
  const [lookedUpOrder, setLookedUpOrder] = useState<Order | null>(null);
  const submittingRef = useRef(false);

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  async function fetchProducts() {
    setProductsState("loading");
    setProductsError("");
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const body = await readResponse<{ products: Product[] }>(response);
      setProducts(body.products);
      setProductsState("success");
    } catch (error) {
      setProductsError(
        error instanceof Error ? error.message : "Could not load products.",
      );
      setProductsState("error");
    }
  }

  useEffect(() => {
    setCart(loadCart(window.sessionStorage));
    setCartReady(true);
    void fetchProducts();
  }, []);

  useEffect(() => {
    if (cartReady) saveCart(window.sessionStorage, cart);
  }, [cart, cartReady]);

  function addProduct(product: Product) {
    const quantity = quantities[product.id] ?? 1;
    setCart((current) => addToCart(current, product, quantity));
    setQuantities((current) => ({ ...current, [product.id]: 1 }));
  }

  async function submitOrder() {
    if (submittingRef.current || cart.length === 0) return;
    submittingRef.current = true;
    setOrderState("loading");
    setOrderError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });
      const body = await readResponse<{ order: Order }>(response);
      setCreatedOrder(body.order);
      setLookupId(body.order.id);
      setCart([]);
      setOrderState("success");
    } catch (error) {
      setOrderError(
        error instanceof Error ? error.message : "Could not create the order.",
      );
      setOrderState("error");
    } finally {
      submittingRef.current = false;
    }
  }

  async function lookupOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = lookupId.trim();
    if (!id) {
      setLookupError("Enter an order ID.");
      return;
    }
    setLookupState("loading");
    setLookupError("");
    setLookedUpOrder(null);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const body = await readResponse<{ order: Order }>(response);
      setLookedUpOrder(body.order);
      setLookupState("success");
    } catch (error) {
      setLookupError(
        error instanceof Error ? error.message : "Could not find the order.",
      );
      setLookupState("error");
    }
  }

  async function copyOrderId() {
    if (createdOrder) await navigator.clipboard.writeText(createdOrder.id);
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="TechX Demo Store home">
          <span className="brand-mark" aria-hidden="true">
            TX
          </span>
          <span>TechX Demo Store</span>
        </a>
        <div className="header-meta">
          <span className="demo-badge">EKS demo</span>
          <a className="cart-link" href="#cart">
            Cart <strong>{itemCount}</strong>
          </a>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">Small stack. Complete journey.</span>
          <h1>
            Explore farther,
            <br />
            deploy smarter.
          </h1>
          <p>
            A focused storefront built to demonstrate containers, Kubernetes
            security and GitOps—without hiding the customer experience.
          </p>
          <a className="primary-button hero-action" href="#products">
            Browse the collection
          </a>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="planet" />
          <span className="star star-one">✦</span>
          <span className="star star-two">✧</span>
        </div>
      </section>

      <section className="store-section" id="products">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Field-tested essentials</span>
            <h2>Observation gear</h2>
          </div>
          <p>
            Static catalog data, served by an isolated internal microservice.
          </p>
        </div>

        <div className="store-layout">
          <div>
            {productsState === "loading" && <ProductSkeleton />}
            {productsState === "error" && (
              <div className="error-state" role="alert">
                <h3>Catalog is out of range</h3>
                <p>{productsError}</p>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => void fetchProducts()}
                >
                  Try again
                </button>
              </div>
            )}
            {productsState === "success" && products.length === 0 && (
              <div className="empty-state large">
                <p>No products are available right now.</p>
              </div>
            )}
            {productsState === "success" && products.length > 0 && (
              <div className="product-grid">
                {products.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image-wrap">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                      />
                      <span className="product-price">
                        {formatUsd(product.priceCents)}
                      </span>
                    </div>
                    <div className="product-content">
                      <h3>{product.name}</h3>
                      <p>{product.description}</p>
                      <div className="product-actions">
                        <label>
                          <span className="sr-only">
                            Quantity for {product.name}
                          </span>
                          <input
                            aria-label={`Quantity for ${product.name}`}
                            type="number"
                            min="1"
                            max="99"
                            value={quantities[product.id] ?? 1}
                            onChange={(event) =>
                              setQuantities((current) => ({
                                ...current,
                                [product.id]: Math.max(
                                  1,
                                  Math.min(99, Number(event.target.value) || 1),
                                ),
                              }))
                            }
                          />
                        </label>
                        <button
                          className="secondary-button"
                          type="button"
                          onClick={() => addProduct(product)}
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div id="cart">
            <CartPanel
              items={cart}
              onQuantity={(id, quantity) =>
                setCart((current) => updateCartQuantity(current, id, quantity))
              }
              onRemove={(id) =>
                setCart((current) =>
                  current.filter((item) => item.product.id !== id),
                )
              }
              onSubmit={() => void submitOrder()}
              submitting={orderState === "loading"}
            />
            <div className="status-region" aria-live="polite">
              {orderState === "error" && (
                <p className="inline-error">
                  {orderError} Your cart is still here.
                </p>
              )}
              {orderState === "success" && createdOrder && (
                <div className="success-card">
                  <span aria-hidden="true">✓</span>
                  <div>
                    <strong>Order confirmed</strong>
                    <code>{createdOrder.id}</code>
                  </div>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => void copyOrderId()}
                  >
                    Copy ID
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="lookup-section">
        <div>
          <span className="eyebrow">Temporary by design</span>
          <h2>Look up an order</h2>
          <p>
            Use the order ID before the demo service restarts or the record
            expires.
          </p>
        </div>
        <div>
          <form
            className="lookup-form"
            onSubmit={(event) => void lookupOrder(event)}
          >
            <label htmlFor="order-id">Order ID</label>
            <div className="input-row">
              <input
                id="order-id"
                value={lookupId}
                onChange={(event) => setLookupId(event.target.value)}
                placeholder="ord_…"
                autoComplete="off"
              />
              <button
                className="primary-button"
                disabled={lookupState === "loading"}
              >
                {lookupState === "loading" ? "Looking…" : "Find order"}
              </button>
            </div>
          </form>
          <div aria-live="polite">
            {lookupState === "error" && (
              <p className="inline-error">{lookupError}</p>
            )}
            {lookupState === "success" && lookedUpOrder && (
              <div className="order-summary">
                <strong>
                  {lookedUpOrder.items.length} line items ·{" "}
                  {formatUsd(lookedUpOrder.totalCents)}
                </strong>
                <span>
                  Created {new Date(lookedUpOrder.createdAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer>
        <span>TechX internship thin slice</span>
        <span>Frontend public · services private · changes GitOps-managed</span>
      </footer>
    </main>
  );
}
