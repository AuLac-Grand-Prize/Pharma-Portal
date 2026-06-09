"use client";

import useSWRMutation from "swr/mutation";
import { apiClient } from "@/lib/api-client";
import {
  mapInteractionResponse,
  type InteractionCheckResult,
  type VietDrugInteractionPayload,
} from "@/lib/api";

/** REAL VietDrugAI request DTO (snake_case) — see `VietDrugInteractionPayload`. */
type Payload = VietDrugInteractionPayload;

async function poster(_url: string, { arg }: { arg: Payload }) {
  const res = await apiClient.post("/clinical/check-interactions", arg);
  // The Gateway forwards VietDrugAI's snake_case body verbatim; map it to the
  // camelCase domain result so consumers read `riskLevel` / `interactions`.
  return mapInteractionResponse(res.data) satisfies InteractionCheckResult;
}

export function useInteractionCheck() {
  return useSWRMutation("/clinical/check-interactions", poster);
}
