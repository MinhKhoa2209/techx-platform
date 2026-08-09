import axe from "axe-core";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OrderDetails from "@/components/order/OrderDetails";
import EmptyState from "@/components/ui/EmptyState";
import { orderFixture } from "./fixtures";

async function expectNoSeriousViolations(container: HTMLElement) {
  const result = await axe.run(container, {
    rules: {
      "color-contrast": { enabled: false },
    },
  });
  expect(
    result.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious",
    ),
  ).toEqual([]);
}

describe("storefront accessibility", () => {
  it("keeps empty states semantically valid", async () => {
    const { container } = render(
      <main>
        <EmptyState
          icon="cart"
          title="Cart empty"
          description="Choose a product to continue."
          actionLabel="Shop"
          actionHref="/products"
        />
      </main>,
    );
    await expectNoSeriousViolations(container);
  });

  it("keeps order details semantically valid", async () => {
    const { container } = render(
      <main>
        <h1>Order confirmation</h1>
        <OrderDetails order={orderFixture} />
      </main>,
    );
    await expectNoSeriousViolations(container);
  });
});
