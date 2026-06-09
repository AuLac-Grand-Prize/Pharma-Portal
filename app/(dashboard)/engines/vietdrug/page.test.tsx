import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { GATEWAY_URL } from "@/test/msw/handlers";
import type { InteractionAlert } from "@/types/domain";

const ENDPOINT = `${GATEWAY_URL}/clinical/check-interactions`;

// useSession returns a session carrying an access token so the live path can
// forward a bearer token through the typed api layer.
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { accessToken: "vietdrug-token", user: {} },
    status: "authenticated",
  }),
}));

/** Import the page fresh after setting the feature flag (read at module load). */
async function loadPage(live: boolean) {
  vi.resetModules();
  process.env.NEXT_PUBLIC_FEATURE_VIETDRUG_LIVE = live ? "true" : "false";
  const mod = await import("@/app/(dashboard)/engines/vietdrug/page");
  return mod.default;
}

afterEach(() => {
  delete process.env.NEXT_PUBLIC_FEATURE_VIETDRUG_LIVE;
});

describe("VietDrug engine page", () => {
  it("renders Gateway-returned alerts (sentinel) when the live flag is ON", async () => {
    const SENTINEL: InteractionAlert = {
      drugA: "SENTINEL",
      drugB: "GatewayDrug",
      severity: "contraindicated",
      mechanism: "Returned by the mocked Gateway",
      clinicalAdvice: "Proves the live path executed.",
    };
    let seenAuth: string | null = null;
    server.use(
      http.post(ENDPOINT, ({ request }) => {
        seenAuth = request.headers.get("authorization");
        return HttpResponse.json({ interactions: [SENTINEL], riskLevel: "high" });
      }),
    );

    const Page = await loadPage(true);
    render(<Page />);

    // Two drugs are preselected; trigger analysis.
    fireEvent.click(screen.getByRole("button", { name: /Phân tích tương tác/ }));

    expect(await screen.findByText(/SENTINEL/)).toBeInTheDocument();
    expect(seenAuth).toBe("Bearer vietdrug-token");
  });

  it("uses MOCK_ALERTS and makes no outbound request when the live flag is OFF", async () => {
    // No handler override: if the page hit the network, MSW's
    // onUnhandledRequest:"error" (or this guard) would fail the test.
    server.use(
      http.post(ENDPOINT, () => {
        throw new Error("Live path must not be taken when the flag is OFF");
      }),
    );

    const Page = await loadPage(false);
    render(<Page />);

    fireEvent.click(screen.getByRole("button", { name: /Phân tích tương tác/ }));

    // Static MOCK_ALERTS contains the Warfarin × Aspirin pairing; SENTINEL must
    // never appear because no Gateway call is made.
    await waitFor(() =>
      expect(screen.getByText(/Warfarin × Aspirin/)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/SENTINEL/)).not.toBeInTheDocument();
  });
});
