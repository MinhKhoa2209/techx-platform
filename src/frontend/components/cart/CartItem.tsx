"use client";

import Link from "next/link";
import { useCart } from "@/lib/CartContext";
import { formatUsd } from "@/lib/format";
import QuantityStepper from "@/components/ui/QuantityStepper";
import type { CartItem as CartItemType } from "@/lib/types";

export default function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="cart-item">
      <img
        src={item.product.image}
        alt={item.product.name}
        className="cart-item-img"
      />
      <div className="cart-item-info">
        <p className="cart-item-name">
          <Link href={`/product/${item.product.id}`}>{item.product.name}</Link>
        </p>
        <p className="cart-item-unit-price">
          {formatUsd(item.product.priceCents)} each
        </p>
      </div>
      <div className="cart-item-controls">
        <QuantityStepper
          value={item.quantity}
          onChange={(qty) => updateQuantity(item.product.id, qty)}
          min={1}
          max={99}
        />
        <span className="cart-item-line-price">
          {formatUsd(item.product.priceCents * item.quantity)}
        </span>
        <button
          className="btn btn-danger"
          type="button"
          onClick={() => removeItem(item.product.id)}
          aria-label={`Remove ${item.product.name} from cart`}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
