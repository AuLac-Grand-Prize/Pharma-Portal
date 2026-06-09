# Phase: Pharma-Portal — Test Infrastructure + Real API Wiring — Specification

**Created:** 2026-06-09
**Ambiguity score:** 0.06 (gate: ≤ 0.20)
**Requirements:** 12 locked

## Goal
Stand up Vitest + Playwright test infrastructure for the Pharma-Portal Next.js 14 app and ship a typed, NextAuth-aware Gateway API layer — proving it end-to-end by wiring the VietDrug engine page to the real Gateway behind a feature flag — with every test running against a mocked Gateway (MSW), no live backend, reaching ≥ 60% line coverage on the targeted utils/hooks/api modules.

## Background
Pharma-Portal is the pharmacist-facing web app (port 3000) in PharmLink AI. It is a Next.js 14 App Router project (`next` 14.2.18, React 18.3.1) with NextAuth 4.24.10 credentials auth, SWR, Zustand, react-hook-form + Zod, Tailwind, and Recharts.

Confirmed against real code:

- **Pages render mock/static data, not Gateway calls.** `app/(dashboard)/pos/page.tsx` hardcodes `CATALOG`, `PATIENTS`, `INTERACTIONS`, `BARCODE_MAP` consts and fakes checkout with `setTimeout`. `app/(dashboard)/analytics/page.tsx` uses `TOP_DRUGS` / `REVENUE_SPARK` consts. `app/(dashboard)/engines/vietdrug/page.tsx` uses `SUGGESTED_DRUGS` / `MOCK_ALERTS` and a `setTimeout`-based fake `analyze()` that just re-sets `MOCK_ALERTS`.
- **The only real Gateway call is `hooks/useInteractionCheck.ts`** — a `useSWRMutation` that posts to `/clinical/check-interactions` via `apiClient`. It is not consumed by any page (POS renders the static `INTERACTIONS` array instead).
- **Zero tests exist** although Vitest 2.1.5, `@vitejs/plugin-react`, `@testing-library/react` 16, `@testing-library/jest-dom`, `jsdom`, and `@playwright/test` 1.48.2 are installed. There is no `vitest.config.ts`, no `playwright.config.ts`, no test setup file, and no `*.test.*` / `*.spec.*` files. `package.json` scripts already declare `test` (`vitest run`), `test:watch`, and `test:e2e` (`playwright test`). **MSW is not installed.**
- **The API client is thin.** `lib/api-client.ts` exports `createApiClient(baseURL, token?)` and a token-less singleton `apiClient` pointed at `process.env.API_GATEWAY_URL ?? "http://localhost:8080"`. There is no request/response interceptor, no error normalization, and the NextAuth `session.accessToken` (typed in `types/next-auth.d.ts`, populated in `lib/auth.ts` callbacks) is never forwarded from client components — the singleton is created with no token.
- **The login Zod schema is duplicated**: `credentialsSchema` in `lib/auth.ts` and `loginSchema` in `app/(auth)/login/page.tsx` are byte-for-byte equivalent fields (`pharmacyCode`, `email`, `password` with min-6) but defined twice.
- Utilities live in `lib/utils.ts` (`cn`, `formatVND`). The sortable hook is `hooks/useSortable.ts` (`useSortable`, `SortHeader` consumes it). TS uses path alias `@/*` and `strict` + `noUncheckedIndexedAccess`. Git is clean on `main`.

## Requirements

1. **Vitest config**: A `vitest.config.ts` at repo root configures the jsdom environment, React plugin, the `@/*` path alias, a global setup file, and V8 coverage scoped to the targeted modules.
   - Current: No `vitest.config.ts`; `pnpm test` (`vitest run`) runs with zero discovered tests and no jsdom/alias config.
   - Target: `vitest.config.ts` uses `@vitejs/plugin-react`, `test.environment: "jsdom"`, `test.globals: true`, `test.setupFiles` pointing at the setup file (Req 2), resolves `@/*` to the repo root, and configures `coverage` (provider `v8`) including at minimum `lib/utils.ts`, `hooks/useSortable.ts`, `hooks/useInteractionCheck.ts`, `lib/api.ts` (Req 9), and `lib/validation/login.ts` (Req 8).
   - Acceptance: `pnpm test` exits 0 and reports ≥ 1 passing test; running with `--coverage` emits a report listing the included modules.

2. **Test setup file**: A shared setup file registers `@testing-library/jest-dom` matchers and starts/stops the MSW server around the suite.
   - Current: No setup file; `toBeInTheDocument` and friends are unavailable; no request mocking layer.
   - Target: A setup file (e.g. `test/setup.ts`) imports `@testing-library/jest-dom/vitest`, and calls `server.listen({ onUnhandledRequest: "error" })` in `beforeAll`, `server.resetHandlers()` in `afterEach`, and `server.close()` in `afterAll` against the MSW node server from Req 7.
   - Acceptance: A test asserting `expect(el).toBeInTheDocument()` compiles and passes; an un-mocked outbound request inside a test fails that test (proving `onUnhandledRequest: "error"`).

3. **MSW installed**: `msw` is added as a dev dependency and a node-side request mock server is provided.
   - Current: MSW is not in `package.json`; there is no way to intercept Axios/fetch in tests.
   - Target: `msw` (v2.x) appears in `devDependencies`; a `test/msw/server.ts` exports `setupServer(...handlers)`.
   - Acceptance: `pnpm test` resolves `msw` without a missing-module error and the server module imports cleanly.

4. **Playwright config**: A `playwright.config.ts` at repo root defines the E2E project so `pnpm test:e2e` is runnable.
   - Current: No `playwright.config.ts`; `pnpm test:e2e` (`playwright test`) has no config and no spec directory.
   - Target: `playwright.config.ts` sets `testDir` (e.g. `e2e/`), a `chromium` project, and `use.baseURL` of `http://localhost:3000`. At least one smoke spec (e.g. `e2e/login.spec.ts`) asserts the `/login` page renders the "Đăng nhập nhà thuốc" heading. The spec may be tagged/skippable so CI does not require a running dev server.
   - Acceptance: `pnpm exec playwright test --list` enumerates ≥ 1 test without a config error.

5. **Unit tests — utils**: `lib/utils.ts` has unit tests for `formatVND` and `cn`.
   - Current: No tests for `formatVND` / `cn`.
   - Target: `formatVND(2500)` is asserted to produce the vi-VN VND-formatted string for 2500 (assertion compares against `new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(2500)` to stay locale-data-independent), and `formatVND(0)` is covered. `cn` is asserted to merge conflicting Tailwind classes (e.g. `cn("p-2", "p-4")` → `"p-4"`) and to drop falsy inputs.
   - Acceptance: Both functions have ≥ 2 assertions each; tests pass.

6. **Unit tests — hooks**: `useSortable` and `useInteractionCheck` have unit tests via React Testing Library / `renderHook`.
   - Current: No tests for either hook.
   - Target (`useSortable`): asserts initial sort order, that `toggle(sameKey)` flips `dir` asc→desc, and that `toggle(newKey)` resets to `asc` — using a small fixture array + accessors. Target (`useInteractionCheck`): with the Gateway `POST /clinical/check-interactions` mocked by MSW (Req 7), `trigger(payload)` resolves to the mocked `{ interactions, riskLevel }` shape.
   - Acceptance: `useSortable` has ≥ 3 assertions covering both toggle branches; `useInteractionCheck` test drives the SWR mutation and asserts the resolved data against the MSW handler.

7. **MSW handlers for Gateway**: MSW request handlers exist for the Gateway endpoints exercised by tests.
   - Current: No handlers; nothing intercepts `apiClient`/`fetch` calls to `http://localhost:8080`.
   - Target: `test/msw/handlers.ts` defines handlers for `POST {GATEWAY}/clinical/check-interactions` (used by Req 6 and Req 11) and the VietDrug interaction endpoint used by Req 12, each returning a typed fixture. Handlers match the base URL the api layer uses under test.
   - Acceptance: Tests relying on these handlers pass; removing a handler makes its dependent test fail with the `onUnhandledRequest: "error"` error.

8. **Login schema extracted + tested**: The login Zod schema is defined once in a shared module and unit-tested.
   - Current: The schema is duplicated as `credentialsSchema` (`lib/auth.ts`) and `loginSchema` (`app/(auth)/login/page.tsx`).
   - Target: A single `lib/validation/login.ts` exports the schema (and inferred type); `app/(auth)/login/page.tsx` imports it. `lib/auth.ts` MAY also import it (optional, not required for this phase). Unit tests assert: valid input parses; empty `pharmacyCode` fails; invalid `email` fails; `password` < 6 chars fails.
   - Acceptance: The login page imports the shared schema (no second inline `z.object` for login); the schema test has ≥ 4 assertions (1 valid + 3 invalid) and passes.

9. **Typed API layer with auth + error handling**: A typed API module attaches the NextAuth `accessToken` and normalizes errors.
   - Current: `lib/api-client.ts` exposes `createApiClient` + a token-less singleton with no interceptors and no error shape; `session.accessToken` is never forwarded from the client.
   - Target: `lib/api.ts` builds an Axios instance (reusing/wrapping `createApiClient`) with (a) a request interceptor or factory that injects `Authorization: Bearer <accessToken>` from a supplied token getter (so a client component can pass the NextAuth session token, e.g. via `useSession`), and (b) a response interceptor that maps failures to a typed `ApiError { status: number; message: string; code?: string }` (network/timeout errors map to `status: 0`). It exposes at least one typed call used by Req 12 (e.g. `checkVietDrugInteractions(payload): Promise<InteractionAlert[]>`).
   - Acceptance: A unit test with MSW returning HTTP 401/500 asserts the call rejects with an `ApiError` carrying that `status`; a success test asserts the bearer token reached the server (handler reads the `Authorization` header) and the typed payload is returned.

10. **Component test — login form**: `app/(auth)/login/page.tsx` has a component test with `signIn` mocked.
   - Current: No component tests.
   - Target: With `next-auth/react`'s `signIn` mocked, the test renders the login form, submits empty fields and asserts inline validation messages appear (from the shared schema, Req 8), then fills valid demo values, submits, and asserts `signIn` was called once with `"credentials"` and the entered values. `next/navigation` (`useRouter`, `useSearchParams`) is mocked so the form renders outside the App Router.
   - Acceptance: Test passes; `signIn` mock assertion confirms the credential payload; at least one validation-error assertion passes.

11. **Component test — POS cart**: `app/(dashboard)/pos/page.tsx` cart behavior is covered by a component test.
   - Current: No component tests; the cart is pure local React state over the static `CATALOG`.
   - Target: The test renders the POS page (mocking `next/navigation` and `@/components/ui` toast as needed), then exercises cart math: adding a catalog drug increments the line and the displayed total updates; quantity +/- adjust and remove work; subtotal/VAT(5%)/total reflect `formatVND`. Where the POS surface invokes a Gateway call (interaction check), MSW from Req 7 backs it; otherwise the static cart path is asserted directly.
   - Acceptance: Test passes and asserts the rendered total matches the computed `subtotal + round(subtotal*0.05)` for a known cart state.

12. **VietDrug page wired to real Gateway behind a flag, tested with MSW**: The VietDrug engine page calls the real Gateway via the typed API layer when a feature flag is on, falling back to mock data when off.
   - Current: `app/(dashboard)/engines/vietdrug/page.tsx` `analyze()` is a `setTimeout` that re-sets the local `MOCK_ALERTS`; no network call.
   - Target: A feature flag (e.g. `NEXT_PUBLIC_FEATURE_VIETDRUG_LIVE`, added to `.env.example`) gates behavior: when enabled, `analyze()` calls the typed API layer (Req 9, `checkVietDrugInteractions`) against the Gateway and renders the returned `InteractionAlert[]`; when disabled, the existing `MOCK_ALERTS` path is preserved unchanged. A component/integration test with the flag enabled and MSW (Req 7) backing the endpoint asserts the page renders alerts returned by the mocked Gateway (distinct from the static `MOCK_ALERTS`).
   - Acceptance: With the flag on and MSW returning a sentinel alert (e.g. drugA `"SENTINEL"`), the test finds that sentinel in the rendered output; with the flag off, the page renders without any outbound request (no `onUnhandledRequest` error).

## Boundaries
**In scope:**
- `vitest.config.ts`, `playwright.config.ts`, a Vitest setup file, and MSW node server + handlers.
- Unit tests for `lib/utils.ts` (`formatVND`, `cn`), `hooks/useSortable.ts`, `hooks/useInteractionCheck.ts`, and the extracted login Zod schema.
- Component tests for the login form and the POS cart, with `signIn` / navigation mocked and MSW for any network.
- A typed `lib/api.ts` layer that injects the NextAuth `accessToken` and normalizes errors to a typed `ApiError`.
- Wiring exactly ONE surface — the VietDrug engine page — to the real Gateway behind a feature flag, tested against MSW.
- Adding `msw` (dev) and the VietDrug live feature flag to `.env.example`.

**Out of scope:**
- Replacing the mock/static data on every other page (POS catalog/customers, analytics, inventory, customers, prescriptions, patient-care, compliance, and the other three engine pages: demand-forecast, pharmagpt, prescription-vision) with real Gateway data — **explicitly a later phase**; this phase wires only VietDrug as the proof slice. — keeps the change reviewable and avoids coupling to unbuilt Gateway endpoints.
- Standing up or running the real API Gateway, Postgres, or any backend service — tests mock the Gateway with MSW only. — the spec must be verifiable offline/in CI.
- Changing NextAuth providers, session strategy, or the demo-account fallback in `lib/auth.ts`. — auth behavior is already implemented; only token forwarding to the API layer is added.
- E2E coverage beyond one Playwright smoke spec (no full POS/checkout E2E flow). — full E2E needs a running app + backend, deferred.
- Visual/CSS, i18n message, accessibility-audit, and performance work. — orthogonal to test-infra + API wiring.
- CI pipeline / GitHub Actions configuration. — environment-specific, separate concern.

## Constraints
- Tests run with a mocked backend (MSW v2 node server); no live Gateway, Postgres, or network. Unhandled outbound requests must fail tests (`onUnhandledRequest: "error"`).
- Next.js 14 App Router; React 18; TypeScript `strict` + `noUncheckedIndexedAccess`; path alias `@/*` → repo root.
- Package manager is pnpm 9; Node ≥ 20. Test scripts already exist (`test`, `test:watch`, `test:e2e`) and must not be renamed.
- Component tests render client components in jsdom; `next/navigation` and `next-auth/react` are mocked rather than running the real router/auth.
- No secrets or real Gateway URLs committed; the VietDrug live flag defaults to off in `.env.example`.
- Server-side-only env (`API_GATEWAY_URL`) must not leak to the client; client-triggered Gateway calls use the public flag and the typed api layer with the session token.

## Acceptance Criteria
- [ ] `vitest.config.ts` exists with jsdom env, React plugin, `@/*` alias, setup file, and V8 coverage including the targeted modules.
- [ ] `test/setup.ts` registers jest-dom matchers and starts/resets/stops the MSW server (`onUnhandledRequest: "error"`).
- [ ] `msw` is in `devDependencies` and `test/msw/server.ts` + `test/msw/handlers.ts` exist.
- [ ] `playwright.config.ts` exists; `pnpm exec playwright test --list` shows ≥ 1 test.
- [ ] `formatVND` and `cn` each have ≥ 2 passing assertions.
- [ ] `useSortable` (both toggle branches) and `useInteractionCheck` (MSW-backed) have passing tests.
- [ ] The login Zod schema lives only in `lib/validation/login.ts`, is imported by the login page, and has a ≥ 4-assertion test.
- [ ] `lib/api.ts` injects the NextAuth bearer token and rejects with a typed `ApiError` carrying the HTTP status on 401/500 (asserted via MSW).
- [ ] Login-form component test passes and asserts `signIn("credentials", …)` plus a validation error.
- [ ] POS cart component test passes and asserts the displayed total equals `subtotal + round(subtotal*0.05)`.
- [ ] VietDrug page calls the Gateway via `lib/api.ts` when `NEXT_PUBLIC_FEATURE_VIETDRUG_LIVE` is on (MSW sentinel rendered) and uses `MOCK_ALERTS` with no outbound request when off.
- [ ] `pnpm test` exits 0 with all the above tests passing; the api/utils/hooks/validation modules reach ≥ 60% line coverage.
- [ ] `.env.example` documents `NEXT_PUBLIC_FEATURE_VIETDRUG_LIVE` (default off).

## Ambiguity Report
| Dimension          | Score | Min  | Status | Notes |
|--------------------|-------|------|--------|-------|
| Goal Clarity       | 0.93  | 0.75 | PASS   | Single measurable goal: test infra + typed auth-aware API + one flagged real-Gateway slice, MSW-only, ≥60% coverage on targeted modules. |
| Boundary Clarity   | 0.92  | 0.70 | PASS   | Explicit in/out; replacing every page's mock data and running any backend are named out-of-scope. |
| Constraint Clarity | 0.90  | 0.65 | PASS   | MSW v2 node, no live backend, Next 14 App Router, pnpm 9, existing scripts, server-env non-leak all fixed. |
| Acceptance Criteria| 0.91  | 0.70 | PASS   | Each requirement has a concrete pass/fail check tied to a real file/command. |
| **Ambiguity**      | 0.06  | ≤0.20| PASS   | Residual: exact coverage % per file and MSW v1-vs-v2 syntax left to implementer within stated bounds. |

## Interview Log
| Round | Perspective     | Question summary | Decision locked |
|-------|-----------------|------------------|-----------------|
| 1     | Researcher      | Which calls are already real vs mock? | Only `hooks/useInteractionCheck.ts` hits the Gateway; POS/analytics/vietdrug use local consts and `setTimeout`. Wire VietDrug as the proof slice. |
| 2     | Simplifier      | Wire all pages or one? | One page (VietDrug) behind a flag; mock-data replacement for the rest is explicitly a later phase to keep the diff reviewable. |
| 3     | Boundary Keeper | Real backend in tests? | No — MSW v2 node server only; `onUnhandledRequest: "error"`; no Postgres/Gateway/network. Server-only env must not leak to client. |
| 4     | Failure Analyst | How to prove auth + errors actually work? | MSW asserts the bearer token reaches the server and that 401/500 reject with a typed `ApiError`; flag-off path must make zero outbound requests. |

---
*Phase: portal-tests-api-wiring*
*Spec created: 2026-06-09*
