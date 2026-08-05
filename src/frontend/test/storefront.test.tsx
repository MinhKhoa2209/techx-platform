import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductCard from "@/components/product/ProductCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { CartProvider, useCart } from "@/lib/CartContext";
import { CART_STORAGE_KEY } from "@/lib/cart";
import type { Product } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const product: Product = {
  id: "nova-refractor",
  name: "Nova Refractor",
  description: "A compact telescope for clear nights.",
  priceCents: 29_900,
  image: "/products/nova-refractor.svg",
};

function CartProbe() {
  const { itemCount, totalCents, ready } = useCart();
  return (
    <output data-testid="cart-state">
      {ready ? `${itemCount}:${totalCents}` : "loading"}
    </output>
  );
}

describe("storefront shared UI", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("exposes consistent button and badge variants", () => {
    render(
      <>
        <Button variant="danger">Remove</Button>
        <Badge variant="success">In Stock</Badge>
      </>,
    );

    expect(screen.getByRole("button", { name: "Remove" })).toHaveClass(
      "btn-danger",
    );
    expect(screen.getByText("In Stock")).toHaveClass("badge-success");
  });

  it("adds selected product quantity to the persisted cart", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductCard product={product} />
        <CartProbe />
      </CartProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("cart-state")).toHaveTextContent("0:0"),
    );
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(
      screen.getByRole("button", { name: `Add ${product.name} to cart` }),
    );

    expect(screen.getByTestId("cart-state")).toHaveTextContent("2:59800");
    await waitFor(() =>
      expect(window.sessionStorage.getItem(CART_STORAGE_KEY)).toContain(
        "nova-refractor",
      ),
    );
  });
});
