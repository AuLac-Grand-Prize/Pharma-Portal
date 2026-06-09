import { describe, it, expect } from "vitest";
import { loginSchema } from "@/lib/validation/login";

const valid = {
  pharmacyCode: "DEMO",
  email: "demo@pharmlink.vn",
  password: "demo1234",
};

describe("loginSchema", () => {
  it("parses valid input", () => {
    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(valid);
    }
  });

  it("fails when pharmacyCode is empty", () => {
    const result = loginSchema.safeParse({ ...valid, pharmacyCode: "" });
    expect(result.success).toBe(false);
  });

  it("fails when email is invalid", () => {
    const result = loginSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("fails when password is shorter than 6 chars", () => {
    const result = loginSchema.safeParse({ ...valid, password: "12345" });
    expect(result.success).toBe(false);
  });

  it("trims surrounding whitespace on pharmacyCode and email", () => {
    const result = loginSchema.safeParse({
      pharmacyCode: "  DEMO  ",
      email: "  demo@pharmlink.vn  ",
      password: "demo1234",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pharmacyCode).toBe("DEMO");
      expect(result.data.email).toBe("demo@pharmlink.vn");
    }
  });
});
