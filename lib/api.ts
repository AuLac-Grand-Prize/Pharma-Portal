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

/**
 * REAL Gateway request body for `POST /v1/clinical/check-interactions` — a
 * verbatim passthrough to VietDrugAI. snake_case, matching the VietDrugAI DTO.
 *
 * Screening is "one new drug against the current list": `new_medication` is the
 * INN being added; `current_medications` are the INNs already on board.
 */
export interface VietDrugInteractionPayload {
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

/** REAL VietDrugAI risk band (snake_case enum value). */
export type RiskLevel = "none" | "low" | "moderate" | "high";

/**
 * REAL VietDrugAI response shape (snake_case). The Gateway forwards this body
 * unchanged, so the api layer is the single place that translates it into the
 * camelCase domain {@link InteractionAlert} the UI renders.
 */
interface RawInteraction {
  drug_a: string;
  drug_b: string;
  severity: string;
  mechanism: string;
  clinical_advice: string;
  reference?: string;
}

interface CheckInteractionsResponse {
  risk_level: RiskLevel;
  interactions: RawInteraction[];
  personalized_score?: number;
  human_review_required?: boolean;
  latency_ms?: number;
}

/** Mapped result the UI consumes: camelCase alerts plus the overall risk band. */
export interface InteractionCheckResult {
  riskLevel: RiskLevel;
  interactions: InteractionAlert[];
}

/** Translate one snake_case VietDrugAI interaction into the camelCase domain type. */
function mapInteraction(raw: RawInteraction): InteractionAlert {
  return {
    drugA: raw.drug_a,
    drugB: raw.drug_b,
    severity: raw.severity as InteractionAlert["severity"],
    mechanism: raw.mechanism,
    clinicalAdvice: raw.clinical_advice,
    ...(raw.reference !== undefined ? { reference: raw.reference } : {}),
  };
}

/** Map the full snake_case response into the camelCase {@link InteractionCheckResult}. */
export function mapInteractionResponse(
  data: CheckInteractionsResponse,
): InteractionCheckResult {
  return {
    riskLevel: data.risk_level,
    interactions: (data.interactions ?? []).map(mapInteraction),
  };
}

/**
 * Screen a new drug against the patient's current medications via the Gateway
 * VietDrug endpoint. Sends the REAL snake_case request DTO and maps the REAL
 * snake_case response into the camelCase {@link InteractionCheckResult} the UI
 * consumes. Rejects with an {@link ApiError} on failure.
 */
export async function checkVietDrugInteractions(
  payload: VietDrugInteractionPayload,
  getToken?: TokenGetter,
  baseURL?: string,
): Promise<InteractionCheckResult> {
  const api = createApi(getToken, baseURL);
  const res = await api.post<CheckInteractionsResponse>(
    "/clinical/check-interactions",
    payload,
  );
  return mapInteractionResponse(res.data);
}
