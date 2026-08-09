import { useRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { useFocusTrap } from "@/lib/useFocusTrap";

function FocusTrapHarness() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(open, panelRef, () => setOpen(false));

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open filters
      </button>
      {open && (
        <div ref={panelRef} role="dialog" aria-label="Filters">
          <button type="button">First action</button>
          <button type="button">Last action</button>
        </div>
      )}
    </>
  );
}

describe("focus trap", () => {
  it("cycles focus, closes with Escape and restores the trigger", async () => {
    const user = userEvent.setup();
    render(<FocusTrapHarness />);

    const trigger = screen.getByRole("button", { name: "Open filters" });
    await user.click(trigger);
    expect(screen.getByRole("button", { name: "First action" })).toHaveFocus();

    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Last action" })).toHaveFocus();
    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog", { name: "Filters" })).toBeNull();
    expect(trigger).toHaveFocus();
  });
});
