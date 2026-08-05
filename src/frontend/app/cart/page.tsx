"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import EmptyState from "@/components/ui/EmptyState";

export default function CartPage() {
  const { items, itemCount, ready } = useCart();

  return (
    <div className="cart-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span className="breadcrumb-sep">/</span>
        <span style={{ color: "var(--ink)" }}>Cart</span>
      </nav>

      <h1 className="page-title">My Cart</h1>
      <p className="page-subtitle">
        {itemCount} item{itemCount !== 1 ? "s" : ""} in your cart
      </p>

      {!ready ? (
        <div className="empty-state" aria-busy="true" aria-label="Loading cart">
          <div className="skeleton-line w-1-2 h-8" />
          <div className="skeleton-line w-3-4" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Browse our collection to get started."
          actionLabel="Start Shopping"
          actionHref="/products"
        />
      ) : (
        <div className="cart-layout">
          <div>
            <div className="cart-items-list" aria-label="Cart items">
              {items.map((item) => (
                <CartItem key={item.product.id} item={item} />
              ))}
            </div>
            <Link href="/products" className="continue-shopping">
              ← Continue Shopping
            </Link>
          </div>
          <CartSummary mode="cart" />
        </div>
      )}
    </div>
  );
}
