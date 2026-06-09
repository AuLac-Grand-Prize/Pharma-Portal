import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { GATEWAY_URL, isRealInteractionRequest } from "@/test/msw/handlers";

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
    // REAL snake_case response: the api layer maps it to the camelCase alert the
    // UI renders, so the SENTINEL only appears if the mapping ran on real data.
    const SENTINEL_RESPONSE = {
      risk_level: "high",
      interactions: [
        {
          drug_a: "SENTINEL",
          drug_b: "GatewayDrug",
          severity: "high",
          mechanism: "Returned by the mocked Gateway",
          clinical_advice: "Proves the live path executed.",
        },
      ],
      personalized_score: 0.9,
      human_review_required: true,
      latency_ms: 120,
    };
    let seenAuth: string | null = null;
    let seenBody: unknown;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        seenAuth = request.headers.get("authorization");
        seenBody = await request.json();
        return HttpResponse.json(SENTINEL_RESPONSE);
      }),
    );

    const Page = await loadPage(true);
    render(<Page />);

    // Two drugs are preselected; trigger analysis.
    fireEvent.click(screen.getByRole("button", { name: /Phân tích tương tác/ }));

    expect(await screen.findByText(/SENTINEL/)).toBeInTheDocument();
    expect(seenAuth).toBe("Bearer vietdrug-token");
    // The page must send the REAL snake_case request DTO, not the old shape.
    expect(isRealInteractionRequest(seenBody)).toBe(true);
    expect(seenBody).toMatchObject({
      new_medication: expect.any(String),
      current_medications: expect.any(Array),
      patient_context: { age: expect.any(Number) },
    });
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
