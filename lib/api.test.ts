import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { GATEWAY_URL, INTERACTION_FIXTURE } from "@/test/msw/handlers";
import {
  checkVietDrugInteractions,
  createApi,
  isApiError,
  type ApiError,
} from "@/lib/api";

const ENDPOINT = `${GATEWAY_URL}/clinical/check-interactions`;

describe("lib/api — error normalization", () => {
  it("rejects with a typed ApiError carrying status 401", async () => {
    server.use(
      http.post(ENDPOINT, () =>
        HttpResponse.json({ message: "Unauthorized" }, { status: 401 }),
      ),
    );

    await expect(
      checkVietDrugInteractions({ drugs: ["Warfarin", "Aspirin"] }),
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

    const err = await checkVietDrugInteractions({
      drugs: ["Warfarin", "Aspirin"],
    }).catch((e: unknown) => e);

    expect(isApiError(err)).toBe(true);
    expect((err as ApiError).status).toBe(500);
  });

  it("maps a network failure to status 0", async () => {
    server.use(http.post(ENDPOINT, () => HttpResponse.error()));

    const err = await checkVietDrugInteractions({ drugs: ["X"] }).catch(
      (e: unknown) => e,
    );

    expect(isApiError(err)).toBe(true);
    expect((err as ApiError).status).toBe(0);
  });
});

describe("lib/api — auth forwarding + typed payload", () => {
  it("forwards the bearer token to the server and returns the typed alerts", async () => {
    let seenAuth: string | null = null;
    server.use(
      http.post(ENDPOINT, ({ request }) => {
        seenAuth = request.headers.get("authorization");
        return HttpResponse.json(INTERACTION_FIXTURE);
      }),
    );

    const alerts = await checkVietDrugInteractions(
      { drugs: ["Warfarin", "Aspirin"] },
      () => "test-access-token",
    );

    expect(seenAuth).toBe("Bearer test-access-token");
    expect(alerts).toEqual(INTERACTION_FIXTURE.interactions);
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
    await api.post("/clinical/check-interactions", { drugs: ["X"] });

    expect(seenAuth).toBeNull();
  });
});
