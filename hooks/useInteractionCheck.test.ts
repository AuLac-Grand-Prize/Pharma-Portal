import { describe, it, expect } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useInteractionCheck } from "@/hooks/useInteractionCheck";
import { MAPPED_INTERACTIONS, MAPPED_RISK_LEVEL } from "@/test/msw/handlers";

describe("useInteractionCheck", () => {
  it("posts the REAL request DTO and resolves the mapped (camelCase) payload", async () => {
    const { result } = renderHook(() => useInteractionCheck());

    let resolved: Awaited<ReturnType<typeof result.current.trigger>> | undefined;
    await act(async () => {
      // REAL snake_case request DTO. A body in the old `{ patientId,
      // currentMedications, newMedication }` shape would 422 at the handler.
      resolved = await result.current.trigger({
        patient_id: "p1",
        current_medications: ["Warfarin"],
        new_medication: "Aspirin",
        patient_context: { age: 62, egfr: 48, conditions: ["Suy thận"] },
      });
    });

    expect(resolved).toBeDefined();
    // Response is mapped from the REAL snake_case body to camelCase.
    expect(resolved?.riskLevel).toBe(MAPPED_RISK_LEVEL);
    expect(resolved?.interactions).toEqual(MAPPED_INTERACTIONS);

    await waitFor(() => {
      expect(result.current.data?.interactions).toEqual(MAPPED_INTERACTIONS);
    });
  });
});
