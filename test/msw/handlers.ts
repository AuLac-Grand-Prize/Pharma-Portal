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

/**
 * REAL VietDrugAI request DTO (snake_case). The Gateway `POST
 * /v1/clinical/check-interactions` is a verbatim passthrough, so this is exactly
 * the body the handler must receive. Mirrors `VietDrugInteractionPayload`.
 */
export interface RealInteractionRequest {
  patient_id: string;
  current_medications: string[];
  new_medication: string;
  patient_context: {
    age: number;
    weight_kg?: number;
    egfr?: number;
    conditions: string[];
  };
}

/**
 * REAL VietDrugAI response (snake_case). This is the on-the-wire shape the
 * Gateway forwards; the api layer is responsible for mapping it to camelCase.
 */
export interface RealInteractionResponse {
  risk_level: "none" | "low" | "moderate" | "high";
  interactions: Array<{
    drug_a: string;
    drug_b: string;
    severity: string;
    mechanism: string;
    clinical_advice: string;
    reference?: string;
  }>;
  personalized_score: number;
  human_review_required: boolean;
  latency_ms: number;
}

/**
 * Happy-path fixture in the REAL snake_case response shape returned by the
 * interaction-check endpoint. Tests assert the api layer maps this correctly.
 */
export const INTERACTION_FIXTURE: RealInteractionResponse = {
  risk_level: "high",
  interactions: [
    {
      drug_a: "Warfarin",
      drug_b: "Aspirin",
      severity: "high",
      mechanism: "Tăng nguy cơ chảy máu do ức chế kết tập tiểu cầu",
      clinical_advice: "Theo dõi INR mỗi 3 ngày; tránh phối hợp nếu có thể.",
      reference: "Stockley's Drug Interactions",
    },
  ],
  personalized_score: 0.82,
  human_review_required: true,
  latency_ms: 134,
};

/**
 * The same fixture after the api layer's snake_case → camelCase mapping. Tests
 * that assert on mapped output (the UI-facing {@link InteractionAlert}) compare
 * against this, so they guard the REAL contract end to end.
 */
export const MAPPED_INTERACTIONS: InteractionAlert[] =
  INTERACTION_FIXTURE.interactions.map((i) => ({
    drugA: i.drug_a,
    drugB: i.drug_b,
    severity: i.severity as InteractionAlert["severity"],
    mechanism: i.mechanism,
    clinicalAdvice: i.clinical_advice,
    ...(i.reference !== undefined ? { reference: i.reference } : {}),
  }));

/** Mapped overall risk band for the happy-path fixture. */
export const MAPPED_RISK_LEVEL = INTERACTION_FIXTURE.risk_level;

/**
 * Type guard asserting an incoming JSON body matches the REAL request DTO. The
 * handler 422s (as the real Gateway/VietDrugAI would) when the body is shaped to
 * the CLIENT's old wrong assumptions (`{ drugs, patient }`) instead.
 */
export function isRealInteractionRequest(
  body: unknown,
): body is RealInteractionRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  const ctx = b.patient_context as Record<string, unknown> | undefined;
  return (
    typeof b.patient_id === "string" &&
    Array.isArray(b.current_medications) &&
    typeof b.new_medication === "string" &&
    typeof ctx === "object" &&
    ctx !== null &&
    typeof ctx.age === "number" &&
    Array.isArray(ctx.conditions)
  );
}

/**
 * Handler for `POST {GATEWAY}/clinical/check-interactions`.
 *
 * Guards the REAL Gateway → VietDrugAI contract:
 *  - Asserts the request body is the REAL snake_case DTO; a body in the old
 *    `{ drugs, patient }` shape gets a 422, exactly like the real backend.
 *  - Returns the REAL snake_case response shape.
 *
 * Used by Req 6 / Req 11 (`useInteractionCheck` SWR mutation), Req 9 (typed api
 * layer — echoes whether a bearer token arrived) and Req 12 (VietDrug live
 * wiring). The VietDrug live test overrides this with `server.use(...)` to
 * return a distinctive SENTINEL alert, proving the rendered output came from the
 * (mocked) Gateway rather than the static `MOCK_ALERTS`.
 */
export const checkInteractionsHandler = http.post(
  `${GATEWAY_URL}/clinical/check-interactions`,
  async ({ request }) => {
    const body = await request.json().catch(() => null);

    // Reject bodies that don't match the REAL request DTO, as the real
    // Gateway/VietDrugAI validation layer would (HTTP 422).
    if (!isRealInteractionRequest(body)) {
      return HttpResponse.json(
        { message: "Invalid interaction-check request body", code: "VALIDATION_ERROR" },
        { status: 422 },
      );
    }

    return HttpResponse.json({
      ...INTERACTION_FIXTURE,
      // Echo the Authorization header so the auth-forwarding test (Req 9) can
      // assert the bearer token reached the server.
      authReceived: request.headers.get("authorization") ?? null,
    });
  },
);

export const handlers = [checkInteractionsHandler];
