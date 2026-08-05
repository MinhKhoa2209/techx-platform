"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import CartSummary from "@/components/cart/CartSummary";
import EmptyState from "@/components/ui/EmptyState";
import type { Order } from "@/lib/types";

interface FormData {
  email: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvv: string;
}

const INITIAL_FORM: FormData = {
  email: "demo@techx.store",
  name: "Demo User",
  address: "1600 Amphitheatre Pkwy",
  city: "Mountain View",
  state: "CA",
  zip: "94043",
  country: "US",
  cardNumber: "4111 1111 1111 1111",
  expMonth: "12",
  expYear: "2028",
  cvv: "123",
};

export default function CheckoutPage() {
  const { items, clearCart, ready } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!ready) {
    return (
      <div
        className="checkout-page"
        aria-busy="true"
        aria-label="Loading checkout"
      >
        <div className="checkout-form-card">
          <div className="skeleton-line w-1-2 h-8" />
          <div className="skeleton-line w-full" />
          <div className="skeleton-line w-full" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <EmptyState
          icon="🛝"
          title="Nothing to checkout"
          description="Your cart is empty. Add some products before checking out."
          actionLabel="Browse Products"
          actionHref="/products"
        />
      </div>
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const normalizedValue =
      name === "cardNumber"
        ? value
            .replace(/\D/g, "")
            .slice(0, 16)
            .replace(/(.{4})/g, "$1 ")
            .trim()
        : value;
    setForm((prev) => ({ ...prev, [name]: normalizedValue }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
          })),
        }),
      });
      const body = (await res.json()) as {
        order?: Order;
        error?: { message: string };
      };
      if (!res.ok)
        throw new Error(body.error?.message ?? `Error ${res.status}`);
      const orderId = body.order?.id;
      if (!orderId) throw new Error("Invalid response from order service.");
      window.sessionStorage.setItem(
        "techx-last-order",
        JSON.stringify(body.order),
      );
      clearCart();
      router.push(`/order/${orderId}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not place order. Please try again.",
      );
      setSubmitting(false);
    }
  }

  const cardType = form.cardNumber.replace(/\D/g, "").startsWith("4")
    ? "VISA"
    : /^5[1-5]/.test(form.cardNumber.replace(/\D/g, ""))
      ? "Mastercard"
      : "Card";

  return (
    <div className="checkout-page">
      {/* Progress Steps */}
      <div className="progress-steps" aria-label="Checkout progress">
        <div className="progress-step done">
          <span className="progress-step-num">✓</span>
          <span className="progress-step-label">Cart</span>
        </div>
        <div className="progress-connector done" />
        <div className="progress-step active">
          <span className="progress-step-num">2</span>
          <span className="progress-step-label">Checkout</span>
        </div>
        <div className="progress-connector" />
        <div className="progress-step">
          <span className="progress-step-num">3</span>
          <span className="progress-step-label">Confirmation</span>
        </div>
      </div>

      <div className="checkout-layout">
        {/* Form */}
        <div className="checkout-form-card">
          <form onSubmit={handleSubmit} noValidate>
            {/* Contact */}
            <div className="form-section">
              <h2 className="form-section-title">Contact Information</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-input"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Shipping */}
            <div className="form-section">
              <h2 className="form-section-title">Shipping Address</h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="form-input"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="address">
                    Street Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="form-input"
                    value={form.address}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="city">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      className="form-input"
                      value={form.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="state">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      className="form-input"
                      value={form.state}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="zip">
                      ZIP Code
                    </label>
                    <input
                      id="zip"
                      name="zip"
                      type="text"
                      className="form-input"
                      value={form.zip}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="country">
                      Country
                    </label>
                    <input
                      id="country"
                      name="country"
                      type="text"
                      className="form-input"
                      value={form.country}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="form-section">
              <h2 className="form-section-title">Payment Details</h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="cardNumber">
                    Card Number
                  </label>
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    className="form-input"
                    value={form.cardNumber}
                    onChange={handleChange}
                    maxLength={19}
                    placeholder="XXXX XXXX XXXX XXXX"
                    required
                  />
                  <span className="form-hint" aria-live="polite">
                    Detected: {cardType}
                  </span>
                </div>
                <div className="form-row-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="expMonth">
                      Expiry Month
                    </label>
                    <input
                      id="expMonth"
                      name="expMonth"
                      type="text"
                      className="form-input"
                      value={form.expMonth}
                      onChange={handleChange}
                      placeholder="MM"
                      maxLength={2}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="expYear">
                      Expiry Year
                    </label>
                    <input
                      id="expYear"
                      name="expYear"
                      type="text"
                      className="form-input"
                      value={form.expYear}
                      onChange={handleChange}
                      placeholder="YYYY"
                      maxLength={4}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cvv">
                      CVV
                    </label>
                    <input
                      id="cvv"
                      name="cvv"
                      type="text"
                      className="form-input"
                      value={form.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                <span>⚠️</span>
                <div>
                  <strong>Order failed</strong>
                  <p>{error} Your cart is still here.</p>
                </div>
              </div>
            )}

            <div className="checkout-actions">
              <Link href="/cart" className="btn btn-ghost">
                ← Back to Cart
              </Link>
              <button
                type="submit"
                className="btn btn-primary btn-xl"
                disabled={submitting}
              >
                {submitting ? "⏳ Placing order…" : "🔒 Place Order"}
              </button>
            </div>
          </form>
        </div>

        {/* Summary */}
        <CartSummary mode="checkout" />
      </div>
    </div>
  );
}
