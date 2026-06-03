"use client";

import useSWRMutation from "swr/mutation";
import { apiClient } from "@/lib/api-client";
import type { InteractionAlert } from "@/types/domain";

type Payload = {
  patientId: string;
  currentMedications: string[];
  newMedication: string;
};

async function poster(_url: string, { arg }: { arg: Payload }) {
  const res = await apiClient.post("/clinical/check-interactions", arg);
  return res.data as { interactions: InteractionAlert[]; riskLevel: string };
}

export function useInteractionCheck() {
  return useSWRMutation("/clinical/check-interactions", poster);
}
