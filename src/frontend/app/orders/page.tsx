"use client";

import { useState } from "react";
import Link from "next/link";
import { formatUsd } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useCart } from "@/lib/CartContext";

type State = "idle" | "loading" | "success" | "error";

export default function OrdersPage() {
  const { itemCount } = useCart();
  const [orderId, setOrderId] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const id = orderId.trim();
    if (!id) {
      setError("Please enter an order ID.");
      return;
    }
    setState("loading");
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
        cache: "no-store",
      });
      const body = (await res.json()) as {
        order?: Order;
        error?: { message: string };
      };
      if (!res.ok)
        throw new Error(body.error?.message ?? `Error ${res.status}`);
      setOrder(body.order ?? null);
      setState("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not find this order.",
      );
      setState("error");
    }
  }

  async function copyOrderId() {
    if (order) await navigator.clipboard.writeText(order.id);
  }

  return (
    <div className="lookup-page">
      <nav
        className="breadcrumb"
        aria-label="Breadcrumb"
        style={{ marginBottom: 24 }}
      >
        <Link href="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: "var(--ink)" }}>Track Order</span>
      </nav>

      <div className="lookup-card">
        <p className="section-eyebrow">Order Management</p>
        <h1 className="lookup-title">Track Your Order</h1>
        <p className="lookup-desc">
          Enter your order ID to check status and details. Order IDs start with
          <code
            style={{
              marginLeft: 4,
              fontSize: 13,
              background: "var(--surface-2)",
              padding: "1px 6px",
              borderRadius: 4,
            }}
          >
            ord_
          </code>
          . This is a demo — orders expire after 1 hour.
        </p>

        <form className="lookup-form" onSubmit={handleLookup}>
          <div className="form-group">
            <label htmlFor="order-id" className="form-label">
              Order ID
            </label>
            <div className="lookup-input-row">
              <input
                id="order-id"
                type="text"
                className="form-input"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="ord_…"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                className="btn btn-secondary"
                disabled={state === "loading"}
              >
                {state === "loading" ? "Looking…" : "🔍 Find Order"}
              </button>
            </div>
          </div>
        </form>

        <div aria-live="polite" aria-atomic="true">
          {state === "loading" && (
            <div style={{ marginTop: 16 }} aria-busy="true">
              <div
                className="skeleton-line w-full"
                style={{ marginBottom: 8 }}
              />
              <div className="skeleton-line w-3-4" />
            </div>
          )}
          {state === "error" && (
            <div className="alert alert-error" style={{ marginTop: 16 }}>
              <span>❌</span>
              <div>
                <strong>Not found</strong>
                <p>{error}</p>
              </div>
            </div>
          )}

          {state === "success" && order && (
            <div className="lookup-order-result">
              <p className="lookup-result-title">✓ Order Found</p>
              <div className="lookup-result-row">
                <span className="lookup-result-label">Order ID</span>
                <span className="lookup-result-value">
                  {order.id}{" "}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={copyOrderId}
                  >
                    📋 Copy
                  </button>
                </span>
              </div>
              <div className="lookup-result-row">
                <span className="lookup-result-label">Items</span>
                <span className="lookup-result-value">
                  {order.items.length} line item
                  {order.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="lookup-result-row">
                <span className="lookup-result-label">Total</span>
                <span className="lookup-result-value">
                  {formatUsd(order.totalCents)}
                </span>
              </div>
              <div className="lookup-result-row">
                <span className="lookup-result-label">Created</span>
                <span className="lookup-result-value">
                  {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="lookup-result-row">
                <span className="lookup-result-label">Expires</span>
                <span className="lookup-result-value">
                  {new Date(order.expiresAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {itemCount > 0 && (
          <p className="lookup-back-link">
            Have items in your cart? <Link href="/cart">Go to Cart →</Link>
          </p>
        )}
        <p className="lookup-back-link">
          <Link href="/">← Back to Store</Link>
        </p>
      </div>
    </div>
  );
}
