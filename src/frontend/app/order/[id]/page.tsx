"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatUsd } from "@/lib/format";
import { useCart } from "@/lib/CartContext";
import type { Order } from "@/lib/types";

type State = "loading" | "success" | "error";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<State>("loading");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    clearCart();
    const cached = window.sessionStorage.getItem("techx-last-order");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Order;
        if (
          parsed.id === id &&
          Number.isInteger(parsed.subtotalCents) &&
          Number.isInteger(parsed.shippingCents) &&
          Number.isInteger(parsed.totalCents)
        ) {
          setOrder(parsed);
          setState("success");
          return;
        }
      } catch {
        window.sessionStorage.removeItem("techx-last-order");
      }
    }
    fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Order returned ${response.status}`);
        return response.json();
      })
      .then((body: { order: Order }) => {
        setOrder(body.order);
        setState("success");
      })
      .catch(() => setState("error"));
  }, [clearCart, id]);

  async function copyId() {
    if (!order) return;
    await navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (state === "loading") {
    return (
      <div className="confirmation-page">
        <div className="confirmation-card">
          <div
            className="skeleton-line w-3-4 h-8"
            style={{ margin: "0 auto 16px" }}
          />
          <div
            className="skeleton-line w-1-2"
            style={{ margin: "0 auto 12px" }}
          />
          <div className="skeleton-line w-full" style={{ marginBottom: 8 }} />
          <div className="skeleton-line w-full" />
        </div>
      </div>
    );
  }

  if (state === "error" || !order) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-card">
          <div className="alert alert-error">
            <span>⚠️</span>
            <div>
              <strong>Order not found</strong>
              <p>This order may have expired or the ID is invalid.</p>
            </div>
          </div>
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 12,
              justifyContent: "center",
            }}
          >
            <Link href="/orders" className="btn btn-secondary">
              Track Another Order
            </Link>
            <Link href="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        {/* Check animation */}
        <div className="check-animation">
          <div className="check-circle" role="img" aria-label="Order confirmed">
            ✓
          </div>
        </div>

        <h1 className="confirmation-title">Order Confirmed!</h1>
        <p className="confirmation-subtitle">
          Thank you for your purchase, Demo User. Your items are on their way!
        </p>
        <p className="confirmation-subtitle">
          Created {new Date(order.createdAt).toLocaleString()}
        </p>

        {/* Order ID */}
        <div className="order-id-card">
          <p className="order-id-label">Order ID</p>
          <div className="order-id-row">
            <code className="order-id-value">{order.id}</code>
            <button
              className="btn btn-outline btn-sm"
              type="button"
              onClick={copyId}
              aria-label="Copy order ID"
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="confirmation-items">
          {order.items.map((item) => (
            <div key={item.productId} className="confirmation-item">
              <span className="confirmation-item-name">
                {item.name} × {item.quantity}
              </span>
              <span className="confirmation-item-price">
                {formatUsd(item.lineTotalCents)}
              </span>
            </div>
          ))}
          <div className="confirmation-totals">
            <div className="confirmation-total-row">
              <span>Subtotal</span>
              <span>{formatUsd(order.subtotalCents)}</span>
            </div>
            <div className="confirmation-total-row">
              <span>Shipping</span>
              <span>
                {order.shippingCents === 0
                  ? "FREE"
                  : formatUsd(order.shippingCents)}
              </span>
            </div>
            <div className="confirmation-total-row">
              <span>Total</span>
              <span>{formatUsd(order.totalCents)}</span>
            </div>
          </div>
        </div>

        <p className="confirmation-delivery">
          🚚 Estimated delivery: 3–5 business days (demo environment)
        </p>

        <div className="confirmation-actions">
          <Link href="/orders" className="btn btn-outline">
            🔍 Track Another Order
          </Link>
          <Link href="/products" className="btn btn-primary">
            🛒 Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
