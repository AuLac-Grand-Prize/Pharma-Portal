import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Node-side MSW request mock server shared across the Vitest suite. */
export const server = setupServer(...handlers);
