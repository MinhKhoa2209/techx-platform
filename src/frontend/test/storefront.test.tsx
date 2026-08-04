import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Storefront } from "@/components/storefront";

const product = {
  id: "nova-refractor",
  name: "Nova Refractor Telescope",
  description: "A compact telescope.",
  priceCents: 12900,
  image: "/products/nova-refractor.svg",
};

const order = {
  id: "ord_11111111-1111-1111-1111-111111111111",
  items: [
    {
      productId: product.id,
      quantity: 2,
      name: product.name,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * 2,
    },
  ],
  totalCents: product.priceCents * 2,
  createdAt: "2026-08-04T00:00:00.000Z",
  expiresAt: "2026-08-04T01:00:00.000Z",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("Storefront", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url === "/api/products")
          return jsonResponse({ products: [product] });
        if (url === "/api/orders" && init?.method === "POST")
          return jsonResponse({ order }, 201);
        if (url.startsWith("/api/orders/")) return jsonResponse({ order });
        return jsonResponse(
          {
            error: {
              code: "NOT_FOUND",
              message: "Not found",
              requestId: "test",
            },
          },
          404,
        );
      }),
    );
  });

  it("completes browse, cart, confirm, and lookup flow", async () => {
    const user = userEvent.setup();
    render(<Storefront />);

    expect(
      await screen.findByRole("heading", { name: product.name }),
    ).toBeInTheDocument();
    const productQuantity = screen.getByLabelText(
      `Quantity for ${product.name}`,
    );
    fireEvent.change(productQuantity, { target: { value: "2" } });
    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    expect(screen.getByLabelText("2 items in cart")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirm order" }));
    expect(await screen.findByText("Order confirmed")).toBeInTheDocument();
    expect(screen.getByText(order.id)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Find order" }));
    expect(
      await screen.findByText("1 line items · $258.00"),
    ).toBeInTheDocument();

    const fetchMock = vi.mocked(fetch);
    const createCall = fetchMock.mock.calls.find(
      ([url, init]) => url === "/api/orders" && init?.method === "POST",
    );
    expect(createCall).toBeDefined();
    expect(createCall?.[1]?.body).toBe(
      JSON.stringify({ items: [{ productId: product.id, quantity: 2 }] }),
    );
  });

  it("keeps the cart when order submission fails", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/products")
        return jsonResponse({ products: [product] });
      return jsonResponse(
        {
          error: {
            code: "DOWN",
            message: "Order service unavailable.",
            requestId: "request",
          },
        },
        503,
      );
    });
    render(<Storefront />);
    await screen.findByRole("heading", { name: product.name });
    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    await user.click(screen.getByRole("button", { name: "Confirm order" }));
    expect(
      await screen.findByText(/Order service unavailable/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("1 items in cart")).toBeInTheDocument();
  });

  it("prevents duplicate creates while a submission is in flight", async () => {
    const user = userEvent.setup();
    let releaseOrder!: (response: Response) => void;
    const pendingOrder = new Promise<Response>((resolve) => {
      releaseOrder = resolve;
    });
    vi.mocked(fetch).mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/products")
        return jsonResponse({ products: [product] });
      return pendingOrder;
    });

    render(<Storefront />);
    await screen.findByRole("heading", { name: product.name });
    await user.click(screen.getByRole("button", { name: "Add to cart" }));
    const confirm = screen.getByRole("button", { name: "Confirm order" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);

    await waitFor(() => {
      const creates = vi
        .mocked(fetch)
        .mock.calls.filter(
          ([url, init]) => url === "/api/orders" && init?.method === "POST",
        );
      expect(creates).toHaveLength(1);
    });
    releaseOrder(jsonResponse({ order }, 201));
    expect(await screen.findByText("Order confirmed")).toBeInTheDocument();
  });

  it("shows a retry state when catalog loading fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          error: {
            code: "DOWN",
            message: "Catalog unavailable.",
            requestId: "request",
          },
        },
        503,
      ),
    );
    render(<Storefront />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Catalog unavailable.",
    );
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("restores a valid cart from session storage", async () => {
    window.sessionStorage.setItem(
      "techx-demo-cart-v1",
      JSON.stringify({
        version: 1,
        items: [{ product, quantity: 3 }],
      }),
    );
    render(<Storefront />);
    await waitFor(() =>
      expect(screen.getByLabelText("3 items in cart")).toBeInTheDocument(),
    );
  });
});
