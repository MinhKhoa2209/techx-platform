import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductCard from "@/components/product/ProductCard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { CartProvider, useCart } from "@/lib/CartContext";
import { CART_STORAGE_KEY } from "@/lib/cart";
import { categoryFixture, configFixture, productFixture } from "./fixtures";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/StorefrontContext", () => ({
  useStorefront: () => ({
    products: [productFixture],
    categories: [categoryFixture],
    config: configFixture,
    catalogState: "success",
    configState: "success",
    retryCatalog: vi.fn(),
    retryConfig: vi.fn(),
  }),
}));

function CartProbe() {
  const { itemCount, subtotalCents, ready } = useCart();
  return (
    <output data-testid="cart-state">
      {ready ? `${itemCount}:${subtotalCents}` : "loading"}
    </output>
  );
}

describe("storefront shared UI", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("exposes consistent button and badge variants", () => {
    render(
      <>
        <Button variant="danger">Remove</Button>
        <Badge variant="success">In stock</Badge>
      </>,
    );
    expect(screen.getByRole("button", { name: "Remove" })).toHaveClass(
      "btn-danger",
    );
    expect(screen.getByText("In stock")).toHaveClass("badge-success");
  });

  it("adds a catalog product to the persisted cart", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <ProductCard product={productFixture} />
        <CartProbe />
      </CartProvider>,
    );
    await waitFor(() =>
      expect(screen.getByTestId("cart-state")).toHaveTextContent("0:0"),
    );
    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(screen.getByTestId("cart-state")).toHaveTextContent("1:10000");
    await waitFor(() =>
      expect(window.sessionStorage.getItem(CART_STORAGE_KEY)).toContain(
        productFixture.id,
      ),
    );
  });
});
