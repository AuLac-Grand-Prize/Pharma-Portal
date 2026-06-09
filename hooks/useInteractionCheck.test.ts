import { describe, it, expect } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useInteractionCheck } from "@/hooks/useInteractionCheck";
import { INTERACTION_FIXTURE } from "@/test/msw/handlers";

describe("useInteractionCheck", () => {
  it("posts to the Gateway and resolves the mocked interaction payload", async () => {
    const { result } = renderHook(() => useInteractionCheck());

    let resolved: Awaited<ReturnType<typeof result.current.trigger>> | undefined;
    await act(async () => {
      resolved = await result.current.trigger({
        patientId: "p1",
        currentMedications: ["Warfarin"],
        newMedication: "Aspirin",
      });
    });

    expect(resolved).toBeDefined();
    expect(resolved?.riskLevel).toBe(INTERACTION_FIXTURE.riskLevel);
    expect(resolved?.interactions).toEqual(INTERACTION_FIXTURE.interactions);

    await waitFor(() => {
      expect(result.current.data?.interactions).toEqual(
        INTERACTION_FIXTURE.interactions,
      );
    });
  });
});
