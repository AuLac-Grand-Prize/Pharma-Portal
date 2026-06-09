import { type AxiosInstance, type AxiosError, isAxiosError } from "axios";
import { createApiClient } from "@/lib/api-client";
import type { InteractionAlert } from "@/types/domain";

/**
 * Normalized, typed error surface for every Gateway call made through the api
 * layer. Network/timeout failures (no HTTP response) are mapped to `status: 0`.
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export function isApiError(e: unknown): e is ApiError {
  return (
    typeof e === "object" &&
    e !== null &&
    typeof (e as ApiError).status === "number" &&
    typeof (e as ApiError).message === "string"
  );
}

/** Supplies the NextAuth `session.accessToken` for the current request. */
export type TokenGetter = () => string | null | undefined;

/**
 * Base URL for client-triggered Gateway calls.
 *
 * Server-only `API_GATEWAY_URL` must NOT leak to the client bundle, so the api
 * layer resolves a public var (`NEXT_PUBLIC_API_GATEWAY_URL`) with the same
 * localhost default the server-side singleton uses.
 */
const PUBLIC_GATEWAY_URL =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:8080";

function normalizeError(err: unknown): ApiError {
  if (isAxiosError(err)) {
    const axiosErr = err as AxiosError<{ message?: string; code?: string }>;
    const response = axiosErr.response;
    if (response) {
      const data = response.data;
      const message =
        (data && typeof data === "object" && typeof data.message === "string"
          ? data.message
          : undefined) ??
        axiosErr.message ??
        `Request failed with status ${response.status}`;
      const code =
        data && typeof data === "object" && typeof data.code === "string"
          ? data.code
          : undefined;
      return { status: response.status, message, ...(code ? { code } : {}) };
    }
    // No response → network error / timeout / aborted request.
    return {
      status: 0,
      message: axiosErr.message || "Network error",
      ...(axiosErr.code ? { code: axiosErr.code } : {}),
    };
  }

  if (err instanceof Error) {
    return { status: 0, message: err.message };
  }
  return { status: 0, message: "Unknown error" };
}

/**
 * Build an Axios instance wired with:
 *  (a) a request interceptor that injects `Authorization: Bearer <token>` from
 *      the supplied token getter (a client component passes its NextAuth
 *      `useSession().data?.accessToken`), and
 *  (b) a response interceptor that rejects with a typed {@link ApiError}.
 */
export function createApi(
  getToken?: TokenGetter,
  baseURL: string = PUBLIC_GATEWAY_URL,
): AxiosInstance {
  const instance = createApiClient(baseURL);

  instance.interceptors.request.use((config) => {
    const token = getToken?.();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (err: unknown) => Promise.reject(normalizeError(err)),
  );

  return instance;
}

export interface VietDrugInteractionPayload {
  /** INN / active-ingredient names of the drugs to screen for interactions. */
  drugs: string[];
  patient?: {
    age?: number;
    sex?: string;
    egfr?: number;
    conditions?: string[];
  };
}

interface CheckInteractionsResponse {
  interactions: InteractionAlert[];
  riskLevel?: string;
}

/**
 * Screen a drug list for interactions via the Gateway VietDrug endpoint and
 * return the typed alert list. Rejects with an {@link ApiError} on failure.
 */
export async function checkVietDrugInteractions(
  payload: VietDrugInteractionPayload,
  getToken?: TokenGetter,
  baseURL?: string,
): Promise<InteractionAlert[]> {
  const api = createApi(getToken, baseURL);
  const res = await api.post<CheckInteractionsResponse>(
    "/clinical/check-interactions",
    payload,
  );
  return res.data.interactions;
}
