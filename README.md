# Pharma Portal — Web/Tablet app for 60,000+ Vietnamese pharmacies

> **The PharmLink AI platform layer for pharmacists.**
> Smart POS + AI Clinical Assistant + Smart Inventory + Patient Care Dashboard + Compliance.

---

## 1. Target users

- **60,000+ independent pharmacies** in Vietnam (optimized for low-cost Android tablets).
- Head pharmacists, assistant pharmacists, cashiers, in-house accountants.
- Rural and mountainous users — UI optimized for slow 3G/4G networks and low-spec devices.

## 2. Key features

### POS (Point of Sale)
- Fast checkout with barcode scanning, drug search by Vietnamese/brand name.
- Payments: cash, QR (VietQR), card, e-wallets (Momo, ZaloPay, VNPay).
- Print receipts (thermal printer) or send an e-receipt via the Zalo Mini App.

### AI Clinical Assistant (4 AI engines integrated)
- **VietDrug AI** — real-time drug-interaction alerts in the cart.
- **PrescriptionVision** — photograph a prescription → auto-fill the cart.
- **PharmaGPT-VN** — a chatbox for drug lookup in natural Vietnamese.
- **DemandForecast AI** — weekly optimal reorder suggestions.

### Smart Inventory
- Real-time stock tracking by batch and expiry (FEFO).
- Near-expiry alerts and promotion suggestions to reduce stock.
- Direct B2B ordering from the portal via the API Gateway.

### Patient Care Dashboard
- Manage chronic patients (diabetes, hypertension, cardiovascular).
- Follow-up reminders and treatment adherence via Zalo OA.
- Purchase history shared across pharmacies in the PharmLink network.

### Compliance Automation
- Ministry of Health reporting (controlled substances, antibiotics).
- GPP audit log — automated checklist.
- HL7 FHIR interoperability via the API Gateway.

## 3. Tech stack

| Layer | Tech | Version |
|-------|------|---------|
| Framework | Next.js (App Router, RSC) | 14.2.18 |
| UI runtime | React / React DOM | 18.3.1 |
| Language | TypeScript (strict) | 5.6.3 |
| Styling | TailwindCSS + Radix UI + CVA | 3.4.14 |
| Icons / Charts | lucide-react / Recharts | 0.460.0 / 2.13.3 |
| State | SWR (server) + Zustand (client) | 2.2.5 / 5.0.1 |
| HTTP | Axios | 1.7.7 |
| Forms | React Hook Form + Zod | 7.53.2 / 3.23.8 |
| Auth | NextAuth.js (credentials, JWT) | 4.24.10 |
| i18n | next-intl (vi default + en) | 3.25.0 |
| Tests | Vitest + Testing Library / Playwright | 2.1.5 / 1.48.2 |
| Lint/Format | ESLint / Prettier | 8.57.1 / 3.3.3 |
| Runtime / PM | Node.js ≥ 20 / pnpm | — / 9.12.0 |

## 4. Directory structure

```
pharma-portal/
├── app/                          # App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing / redirect to dashboard
│   ├── (auth)/                   # Login, register, forgot password
│   ├── (dashboard)/              # Authenticated routes
│   │   ├── layout.tsx            # Sidebar + topbar
│   │   ├── pos/                  # POS — sales
│   │   ├── inventory/            # Inventory, FEFO
│   │   ├── customers/            # Customers & patients
│   │   ├── prescriptions/        # Prescription OCR
│   │   ├── patient-care/         # Chronic-care dashboard
│   │   ├── analytics/            # KPI dashboard
│   │   └── compliance/           # MoH reporting
│   └── api/                      # Route handlers (proxy to the API Gateway)
├── components/
│   ├── ui/                       # UI primitives
│   ├── pos/                      # CartLine, BarcodeInput, PaymentDialog
│   ├── inventory/                # StockTable, ExpiryAlert
│   ├── patient/                  # PatientCard, MedicationTimeline
│   ├── prescriptions/            # PrescriptionScanner, OCRReviewModal
│   └── layout/                   # Sidebar, Topbar
├── lib/                          # api client, utils, env
├── hooks/                        # useCart, useInteractionCheck, ...
├── types/                        # Domain types
├── public/                       # Logo, icons
└── styles/                       # Global tailwind
```

## 5. Getting started

### Requirements
- Node.js 20+
- pnpm 9+ (recommended) or npm 10+
- pharma-api-gateway running at `http://localhost:8080`

### Setup
```bash
cp .env.example .env.local
pnpm install
pnpm dev                 # http://localhost:3000
```

### Environment variables (.env.local)

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | Environment |
| `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_URL` | App name & URL |
| `API_GATEWAY_URL` | pharma-api-gateway URL (e.g. http://localhost:8080) |
| `API_GATEWAY_TIMEOUT_MS` | Gateway call timeout (e.g. 15000) |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | NextAuth config (use a strong random secret) |
| `NEXT_PUBLIC_SENTRY_DSN` | (optional) error tracking |
| `NEXT_PUBLIC_FEATURE_RX_OCR` | Feature flag to enable prescription OCR |
| `NEXT_PUBLIC_FEATURE_PHARMAGPT_CHAT` | Feature flag to enable the PharmaGPT chatbox |

### Build & test
```bash
pnpm build               # production build
pnpm start               # run the build
pnpm test                # vitest
pnpm test:e2e            # playwright
pnpm lint                # ESLint
pnpm typecheck           # TypeScript strict
pnpm format              # Prettier
```

### i18n & middleware
- Languages: **vi** (default) + **en**, translation files at `messages/{vi,en}.json` (groups: common, nav, hero, stats, engines, impact); configured in `lib/i18n.ts`.
- `middleware.ts` uses NextAuth `withAuth()` to protect dashboard routes (`/pos`, `/inventory`, `/customers`, `/prescriptions`, `/patient-care`, `/analytics`, `/compliance`, `/engines/*`) — unauthenticated users are redirected to `/login`.

> Note: the feature-specific component folders (`components/{inventory,patient,pos,prescriptions}`) are currently placeholders and will be filled in per the roadmap.

## 6. Connecting to the AI engines

The Portal **never calls** the AI services directly — everything goes through `pharma-api-gateway` to get:
- Centralized auth/RBAC.
- Rate limiting + audit log.
- Failover when an engine is down.
- Data-center internal networking with mTLS/TLS encryption.

```ts
// lib/api/clinical.ts
export async function checkInteractions(payload: CheckInteractionsPayload) {
  return apiClient.post("/clinical/check-interactions", payload);
}
```

## 7. UX for low-spec devices

- **Lazy load** most routes via dynamic import.
- **Skeleton + optimistic UI** for POS to keep it feeling smooth on slow networks.
- **Service Worker (PWA)** — partial offline selling, syncing when back online.
- **Bundle size budget**: < 200KB gzipped JS for the main POS route.

## 8. Security

- Every request carries a CSRF token + JWT in an HttpOnly cookie.
- Clinical content (PharmaGPT-VN responses) is shown with a disclaimer.
- Audit log for every action that touches patient data (Decree 13/2023).
- No PII logged to the browser console, even in dev mode.

## 9. Roadmap

- **v0.1**: POS + Inventory + VietDrug AI integration.
- **v0.2**: PrescriptionVision OCR + Patient Care Dashboard.
- **v0.3**: PharmaGPT-VN chatbox + DemandForecast reorder.
- **v1.0**: PWA offline mode + multi-pharmacy chain support.

---

## About PharmLink AI

This repository is the **platform layer** of [**PharmLink AI**](https://github.com/AuLac-Grand-Prize) — Vietnam's *Made-in-Vietnam* pharmaceutical AI platform serving 60,000+ pharmacies and up to 100 million citizens, in service of medication safety and national health-data sovereignty.

**The platform:**
- 🖥️ **Pharma Portal** — the pharmacist workspace *(this repo)*
- 💊 [VietDrug AI](https://github.com/AuLac-Grand-Prize/Pharma-VietDrugAI) — drug-interaction checks
- 📝 [PrescriptionVision](https://github.com/AuLac-Grand-Prize/Pharma-PrescriptionVision) — handwritten-prescription OCR
- 🤖 [PharmaGPT-VN](https://github.com/AuLac-Grand-Prize/PharmaGPT-VN) — Vietnamese pharma assistant
- 📈 [DemandForecast AI](https://github.com/AuLac-Grand-Prize/Pharma-DemandForecast) — demand forecasting

The Portal is the operations layer that surfaces all four AI engines to pharmacists, patients (Zalo Mini App), and ecosystem partners (API) — always through the API Gateway for centralized auth, RBAC, and audit.

> **Disclaimer:** PharmLink AI augments pharmacists — it does not replace them. Every clinical decision rests with a licensed pharmacist; clinical content is shown with a disclaimer and validated by the Vietnamese Clinical Pharmacist Scientific Council.
