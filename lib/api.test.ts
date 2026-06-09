import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import {
  GATEWAY_URL,
  INTERACTION_FIXTURE,
  MAPPED_INTERACTIONS,
  MAPPED_RISK_LEVEL,
  isRealInteractionRequest,
  type RealInteractionRequest,
} from "@/test/msw/handlers";
import {
  checkVietDrugInteractions,
  createApi,
  isApiError,
  type ApiError,
} from "@/lib/api";

const ENDPOINT = `${GATEWAY_URL}/clinical/check-interactions`;

/** A well-formed REAL request DTO for tests that don't care about the body. */
const REAL_REQUEST: RealInteractionRequest = {
  patient_id: "p1",
  current_medications: ["Warfarin"],
  new_medication: "Aspirin",
  patient_context: { age: 62, egfr: 48, conditions: ["Suy thận"] },
};

describe("lib/api — error normalization", () => {
  it("rejects with a typed ApiError carrying status 401", async () => {
    server.use(
      http.post(ENDPOINT, () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    await expect(
      checkVietDrugInteractions(REAL_REQUEST),
    ).rejects.toMatchObject({
      status: 401,
      message: "Unauthorized",
    });
  });

  it("rejects with a typed ApiError carrying status 500", async () => {
    server.use(
      http.post(ENDPOINT, () =>
        HttpResponse.json({ message: "Boom" }, { status: 500 }),
      ),
    );

    const err = await checkVietDrugInteractions(REAL_REQUEST).catch(
      (e: unknown) => e,
    );

    expect(isApiError(err)).toBe(true);
    expect((err as ApiError).status).toBe(500);
  });

  it("maps a network failure to status 0", async () => {
    server.use(http.post(ENDPOINT, () => HttpResponse.error()));

    const err = await checkVietDrugInteractions(REAL_REQUEST).catch(
      (e: unknown) => e,
    );

    expect(isApiError(err)).toBe(true);
    expect((err as ApiError).status).toBe(0);
  });
});

describe("lib/api — real contract: request DTO + response mapping", () => {
  it("sends the REAL snake_case request DTO (default handler 422s on the wrong shape)", async () => {
    let seenBody: unknown;
    server.use(
      http.post(ENDPOINT, async ({ request }) => {
        seenBody = await request.json();
        return HttpResponse.json(INTERACTION_FIXTURE);
      }),
    );

    await checkVietDrugInteractions(REAL_REQUEST);

    expect(isRealInteractionRequest(seenBody)).toBe(true);
    expect(seenBody).toMatchObject({
      patient_id: "p1",
      current_medications: ["Warfarin"],
      new_medication: "Aspirin",
      patient_context: { age: 62, conditions: ["Suy thận"] },
    });
  });

  it("422s when the body uses the old wrong `{ drugs, patient }` client shape", async () => {
    // The default real-contract handler is active. Posting the legacy shape the
    // client used to send must be rejected exactly as the real Gateway would.
    const api = createApi();
    const err = await api
      .post("/clinical/check-interactions", {
        drugs: ["Warfarin", "Aspirin"],
        patient: { age: 62, sex: "Nữ", egfr: 48, conditions: [] },
      })
      .catch((e: unknown) => e);

    expect(isApiError(err)).toBe(true);
    expect((err as ApiError).status).toBe(422);
  });

  it("maps the REAL snake_case response to camelCase alerts + riskLevel", async () => {
    // Default handler returns INTERACTION_FIXTURE (snake_case).
    const result = await checkVietDrugInteractions(REAL_REQUEST);

    expect(result.riskLevel).toBe(MAPPED_RISK_LEVEL);
    expect(result.interactions).toEqual(MAPPED_INTERACTIONS);
    // Spot-check the snake_case → camelCase field mapping explicitly.
    const first = result.interactions[0];
    expect(first).toBeDefined();
    expect(first).toMatchObject({
      drugA: "Warfarin",
      drugB: "Aspirin",
      clinicalAdvice: INTERACTION_FIXTURE.interactions[0]?.clinical_advice,
    });
  });
});

describe("lib/api — auth forwarding", () => {
  it("forwards the bearer token to the server and returns the mapped result", async () => {
    let seenAuth: string | null = null;
    server.use(
      http.post(ENDPOINT, ({ request }) => {
        seenAuth = request.headers.get("authorization");
        return HttpResponse.json(INTERACTION_FIXTURE);
      }),
    );

    const result = await checkVietDrugInteractions(
      REAL_REQUEST,
      () => "test-access-token",
    );

    expect(seenAuth).toBe("Bearer test-access-token");
    expect(result.interactions).toEqual(MAPPED_INTERACTIONS);
  });

  it("omits the Authorization header when no token is supplied", async () => {
    let seenAuth: string | null = "unset";
    server.use(
      http.post(ENDPOINT, ({ request }) => {
        seenAuth = request.headers.get("authorization");
        return HttpResponse.json(INTERACTION_FIXTURE);
      }),
    );

    const api = createApi();
    await api.post("/clinical/check-interactions", REAL_REQUEST);

    expect(seenAuth).toBeNull();
  });
});
