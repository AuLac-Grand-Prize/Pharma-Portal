import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./msw/server";

// Pin the Gateway base URL so the api layer (NEXT_PUBLIC_API_GATEWAY_URL) and
// the MSW handlers (GATEWAY_URL) resolve to the same origin in every test.
process.env.NEXT_PUBLIC_API_GATEWAY_URL = "http://localhost:8080";
process.env.API_GATEWAY_URL = "http://localhost:8080";

// Start the mock Gateway; any un-mocked outbound request fails its test.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
