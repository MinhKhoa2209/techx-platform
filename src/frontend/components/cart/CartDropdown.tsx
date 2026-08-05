"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { formatUsd } from "@/lib/format";

interface CartDropdownProps {
  onClose: () => void;
}

export default function CartDropdown({ onClose }: CartDropdownProps) {
  const { items, totalCents } = useCart();

  return (
    <div
      className="cart-dropdown"
      role="dialog"
      aria-label="Cart preview"
      aria-modal="true"
    >
      <div className="cart-dropdown-header">
        <span className="cart-dropdown-title">
          My Cart {items.length > 0 && `(${items.length})`}
        </span>
        <button
          className="cart-dropdown-close"
          onClick={onClose}
          aria-label="Close cart"
          type="button"
        >
          ×
        </button>
      </div>

      {items.length === 0 ? (
        <div className="cart-dropdown-empty">
          <div className="cart-dropdown-empty-icon">🛒</div>
          <p>Your cart is empty</p>
          <p style={{ fontSize: 12, marginTop: 4, color: "var(--ink-3)" }}>
            Browse our collection to get started
          </p>
        </div>
      ) : (
        <div className="cart-dropdown-items">
          {items.map((item) => (
            <div key={item.product.id} className="cart-dropdown-item">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="cart-dropdown-item-img"
              />
              <div className="cart-dropdown-item-info">
                <p className="cart-dropdown-item-name">{item.product.name}</p>
                <p className="cart-dropdown-item-meta">
                  Qty: {item.quantity} · {formatUsd(item.product.priceCents)}{" "}
                  each
                </p>
              </div>
              <span className="cart-dropdown-item-price">
                {formatUsd(item.product.priceCents * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="cart-dropdown-footer">
          <div className="cart-dropdown-subtotal">
            <span className="cart-dropdown-subtotal-label">Subtotal</span>
            <span className="cart-dropdown-subtotal-amount">
              {formatUsd(totalCents)}
            </span>
          </div>
          <div className="cart-dropdown-actions">
            <Link
              href="/cart"
              className="btn btn-outline btn-sm"
              onClick={onClose}
            >
              View Cart
            </Link>
            <Link
              href="/checkout"
              className="btn btn-primary btn-sm"
              onClick={onClose}
            >
              Checkout
            </Link>
          </div>
        </div>
      )}

      {items.length === 0 && (
        <div style={{ padding: "12px 20px 16px" }}>
          <Link
            href="/products"
            className="btn btn-primary btn-full btn-sm"
            onClick={onClose}
          >
            Shop Now
          </Link>
        </div>
      )}
    </div>
  );
}
