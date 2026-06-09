import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SeverityPill } from "@/components/ui/SeverityPill";

describe("SeverityPill", () => {
  it("renders the mapped label for a known severity", () => {
    const { getByText } = render(<SeverityPill severity="high" />);
    expect(getByText("Nặng")).toBeInTheDocument();
  });

  it("does not crash on an unknown/extra severity from the real contract", () => {
    // The REAL VietDrugAI severity enum includes values outside the local union
    // (e.g. "none"); an unguarded `map[severity].cls` would throw at runtime.
    const unknownSeverity: string = "none";
    expect(() =>
      render(<SeverityPill severity={unknownSeverity} />),
    ).not.toThrow();
  });
});
