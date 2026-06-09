import { http, HttpResponse } from "msw";
import type { InteractionAlert } from "@/types/domain";

/**
 * The base URL the api layer / api-client target under test. Tests set
 * `NEXT_PUBLIC_API_GATEWAY_URL` (and the server-only `API_GATEWAY_URL`) to this
 * value; if unset, both default to localhost:8080.
 */
export const GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ??
  process.env.API_GATEWAY_URL ??
  "http://localhost:8080";

/** Fixture returned by the interaction-check endpoint in the happy path. */
export const INTERACTION_FIXTURE: {
  interactions: InteractionAlert[];
  riskLevel: string;
} = {
  interactions: [
    {
      drugA: "Warfarin",
      drugB: "Aspirin",
      severity: "high",
      mechanism: "Tăng nguy cơ chảy máu do ức chế kết tập tiểu cầu",
      clinicalAdvice: "Theo dõi INR mỗi 3 ngày; tránh phối hợp nếu có thể.",
    },
  ],
  riskLevel: "high",
};

/**
 * Handler for `POST {GATEWAY}/clinical/check-interactions`.
 *
 * Used by Req 6 / Req 11 (`useInteractionCheck` SWR mutation), Req 9 (typed api
 * layer — echoes whether a bearer token arrived) and Req 12 (VietDrug live
 * wiring). The VietDrug live test overrides this with `server.use(...)` to
 * return a distinctive SENTINEL alert, proving the rendered output came from the
 * (mocked) Gateway rather than the static `MOCK_ALERTS`.
 */
export const checkInteractionsHandler = http.post(
  `${GATEWAY_URL}/clinical/check-interactions`,
  ({ request }) => {
    const auth = request.headers.get("authorization");
    return HttpResponse.json({
      ...INTERACTION_FIXTURE,
      // Echo the Authorization header so the auth-forwarding test (Req 9) can
      // assert the bearer token reached the server.
      authReceived: auth ?? null,
    });
  },
);

export const handlers = [checkInteractionsHandler];
