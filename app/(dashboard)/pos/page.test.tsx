import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ToastProvider } from "@/components/ui";
import { formatVND } from "@/lib/utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import POSPage from "@/app/(dashboard)/pos/page";

function renderPOS() {
  return render(
    <ToastProvider>
      <POSPage />
    </ToastProvider>,
  );
}

/** Expected displayed total for a given subtotal: subtotal + round(subtotal*5%). */
function expectedTotal(subtotal: number): string {
  return formatVND(subtotal + Math.round(subtotal * 0.05));
}

// `formatVND` separates the amount from "₫" with a non-breaking space (U+00A0),
// which Testing Library's default normalizer collapses to a regular space — so
// an exact-string match against the raw formatted value fails. `\s` in JS regex
// matches U+00A0, so collapsing on `\s+` normalizes both sides uniformly.
const collapse = (s: string) => s.replace(/\s+/g, " ").trim();
function getMoney(value: string): HTMLElement {
  const target = collapse(value);
  return screen.getByText((_content, node) => {
    if (!node) return false;
    // Match the leaf element that directly owns the money text.
    const own = Array.from(node.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? "")
      .join("");
    return collapse(own) === target;
  });
}

describe("POS cart", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the initial total as subtotal + round(subtotal*0.05)", () => {
    renderPOS();
    // Initial cart: Paracetamol x2 @2500 + Amoxicillin x1 @8500 = 13_500 subtotal.
    const subtotal = 2 * 2500 + 1 * 8500;
    expect(getMoney(expectedTotal(subtotal))).toBeInTheDocument();
  });

  it("increments the line and updates the total when adding a catalog drug", () => {
    renderPOS();

    // Add another Paracetamol via its catalog "Thêm" button (search list item).
    const catalogList = screen.getByRole("listbox", { name: "Kết quả tìm thuốc" });
    const paracetamolRow = within(catalogList)
      .getByText("Paracetamol 500mg")
      .closest("li") as HTMLElement;
    fireEvent.click(within(paracetamolRow).getByRole("button", { name: /Thêm/ }));

    // Now Paracetamol x3 @2500 + Amoxicillin x1 @8500 = 16_000 subtotal.
    const subtotal = 3 * 2500 + 1 * 8500;
    expect(getMoney(expectedTotal(subtotal))).toBeInTheDocument();
  });

  it("adjusts quantity with +/- and reflects the new total", () => {
    renderPOS();

    // The first cart line is Paracetamol; decrement it (qty 2 -> 1).
    const minusButtons = screen.getAllByRole("button", { name: "Giảm" });
    fireEvent.click(minusButtons[0]!);

    // subtotal = 1*2500 + 1*8500 = 11_000.
    const subtotal = 1 * 2500 + 1 * 8500;
    expect(getMoney(expectedTotal(subtotal))).toBeInTheDocument();
  });

  it("removes a line and recomputes the total", () => {
    renderPOS();

    // Remove the first cart line (Paracetamol). Remaining: Amoxicillin x1 = 8_500.
    const removeButtons = screen.getAllByRole("button", { name: "Xóa" });
    fireEvent.click(removeButtons[0]!);

    const subtotal = 1 * 8500;
    expect(getMoney(expectedTotal(subtotal))).toBeInTheDocument();
  });
});
