import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// --- Mocks: next/navigation + next-auth/react ---------------------------------
const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  useSearchParams: () => new URLSearchParams(""),
}));

const signInMock = vi.fn();
vi.mock("next-auth/react", () => ({
  signIn: (...args: unknown[]) => signInMock(...args),
}));

import LoginPage from "@/app/(auth)/login/page";

describe("LoginPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    refreshMock.mockReset();
    signInMock.mockReset();
  });

  it("shows inline validation errors when submitting empty fields", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    // Errors come from the shared loginSchema (Req 8).
    expect(await screen.findByText("Nhập mã nhà thuốc")).toBeInTheDocument();
    expect(screen.getByText("Email không hợp lệ")).toBeInTheDocument();
    expect(screen.getByText("Mật khẩu tối thiểu 6 ký tự")).toBeInTheDocument();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it("calls signIn('credentials', ...) with the entered values on valid submit", async () => {
    signInMock.mockResolvedValue({ ok: true, error: null, url: "/analytics" });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Mã do Bộ Y tế cấp"), {
      target: { value: "DEMO" },
    });
    fireEvent.change(screen.getByPlaceholderText("duocsi@nhathuoc.vn"), {
      target: { value: "demo@pharmlink.vn" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "demo1234" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => expect(signInMock).toHaveBeenCalledTimes(1));

    const [provider, payload] = signInMock.mock.calls[0] as [
      string,
      Record<string, unknown>,
    ];
    expect(provider).toBe("credentials");
    expect(payload).toMatchObject({
      pharmacyCode: "DEMO",
      email: "demo@pharmlink.vn",
      password: "demo1234",
      redirect: false,
    });
  });
});
