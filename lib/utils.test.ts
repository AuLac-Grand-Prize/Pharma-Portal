import { describe, it, expect } from "vitest";
import { cn, formatVND } from "@/lib/utils";

describe("formatVND", () => {
  it("formats 2500 as a vi-VN VND currency string", () => {
    const expected = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(2500);
    expect(formatVND(2500)).toBe(expected);
  });

  it("formats 0 as a vi-VN VND currency string", () => {
    const expected = new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(0);
    expect(formatVND(0)).toBe(expected);
  });
});

describe("cn", () => {
  it("merges conflicting Tailwind classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy inputs and keeps truthy ones", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("applies conditional class objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});
