# Pharma Portal — Web/Tablet cho 60.000+ nhà thuốc Việt Nam

> **Lớp Platform của PharmLink AI dành cho dược sĩ.**
> POS thông minh + AI Clinical Assistant + Smart Inventory + Patient Care Dashboard + Compliance.

---

## 1. Đối tượng người dùng

- **60.000+ nhà thuốc tư nhân** Việt Nam (ưu tiên thiết bị tablet/Android tablet giá rẻ).
- Dược sĩ trưởng, dược sĩ phụ, thu ngân, kế toán nội bộ.
- Người dùng vùng nông thôn, miền núi — UI tối ưu cho mạng 3G/4G chậm và thiết bị cấu hình thấp.

## 2. Tính năng chính

### POS (Point of Sale)
- Bán hàng nhanh với barcode scan, search thuốc bằng tên VN/biệt dược.
- Thanh toán: tiền mặt, QR (VietQR), thẻ, ví điện tử (Momo, ZaloPay, VNPay).
- In hóa đơn (máy in nhiệt) hoặc gửi e-receipt qua Zalo Mini App.

### AI Clinical Assistant (tích hợp 4 engine AI)
- **VietDrug AI** — cảnh báo tương tác thuốc realtime trong giỏ hàng.
- **PrescriptionVision** — chụp ảnh đơn thuốc → auto-fill giỏ hàng.
- **PharmaGPT-VN** — chatbox tra cứu thuốc bằng tiếng Việt tự nhiên.
- **DemandForecast AI** — gợi ý đặt hàng tối ưu hàng tuần.

### Smart Inventory
- Theo dõi tồn kho realtime, lô, hạn dùng (FEFO).
- Cảnh báo thuốc sắp hết hạn, đề xuất khuyến mại để giảm tồn.
- Đặt hàng B2B trực tiếp từ portal qua API Gateway.

### Patient Care Dashboard
- Quản lý bệnh nhân mãn tính (tiểu đường, tăng huyết áp, tim mạch).
- Nhắc nhở tái khám, tuân thủ điều trị qua Zalo OA.
- Hồ sơ thuốc đã mua liên thông giữa các nhà thuốc trong mạng PharmLink.

### Compliance Automation
- Báo cáo Bộ Y tế (thuốc kiểm soát đặc biệt, kháng sinh).
- GPP audit log — checklist tự động.
- Liên thông HL7 FHIR qua API Gateway.

## 3. Stack công nghệ

| Layer | Tech | Phiên bản |
|-------|------|-----------|
| Framework | Next.js (App Router, RSC) | 14.2.18 |
| UI runtime | React / React DOM | 18.3.1 |
| Language | TypeScript (strict) | 5.6.3 |
| Styling | TailwindCSS + Radix UI + CVA | 3.4.14 |
| Icons / Charts | lucide-react / Recharts | 0.460.0 / 2.13.3 |
| State | SWR (server) + Zustand (client) | 2.2.5 / 5.0.1 |
| HTTP | Axios | 1.7.7 |
| Forms | React Hook Form + Zod | 7.53.2 / 3.23.8 |
| Auth | NextAuth.js (credentials, JWT) | 4.24.10 |
| i18n | next-intl (vi mặc định + en) | 3.25.0 |
| Tests | Vitest + Testing Library / Playwright | 2.1.5 / 1.48.2 |
| Lint/Format | ESLint / Prettier | 8.57.1 / 3.3.3 |
| Runtime / PM | Node.js ≥ 20 / pnpm | — / 9.12.0 |

## 4. Cấu trúc thư mục

```
pharma-portal/
├── app/                          # App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing / redirect to dashboard
│   ├── (auth)/                   # Login, register, forgot password
│   ├── (dashboard)/              # Authenticated routes
│   │   ├── layout.tsx            # Sidebar + topbar
│   │   ├── pos/                  # POS — bán hàng
│   │   ├── inventory/            # Tồn kho, FEFO
│   │   ├── customers/            # Khách hàng & bệnh nhân
│   │   ├── prescriptions/        # OCR đơn thuốc
│   │   ├── patient-care/         # Dashboard bệnh mãn tính
│   │   ├── analytics/            # KPI dashboard
│   │   └── compliance/           # Báo cáo BYT
│   └── api/                      # Route handlers (proxy đến API Gateway)
├── components/
│   ├── ui/                       # shadcn primitives
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

## 5. Khởi chạy

### Yêu cầu
- Node.js 20+
- pnpm 9+ (khuyến nghị) hoặc npm 10+
- pharma-api-gateway chạy tại `http://localhost:8080`

### Setup
```bash
cp .env.example .env.local
pnpm install
pnpm dev                 # http://localhost:3000
```

### Biến môi trường (.env.local)

| Biến | Mục đích |
|------|----------|
| `NODE_ENV` | Môi trường |
| `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_URL` | Tên & URL app |
| `API_GATEWAY_URL` | URL pharma-api-gateway (vd http://localhost:8080) |
| `API_GATEWAY_TIMEOUT_MS` | Timeout gọi gateway (vd 15000) |
| `NEXTAUTH_URL` / `NEXTAUTH_SECRET` | Cấu hình NextAuth (secret random mạnh) |
| `NEXT_PUBLIC_SENTRY_DSN` | (tùy chọn) error tracking |
| `NEXT_PUBLIC_FEATURE_RX_OCR` | Feature flag bật OCR đơn thuốc |
| `NEXT_PUBLIC_FEATURE_PHARMAGPT_CHAT` | Feature flag bật chatbox PharmaGPT |

### Build & test
```bash
pnpm build               # production build
pnpm start               # chạy bản build
pnpm test                # vitest
pnpm test:e2e            # playwright
pnpm lint                # ESLint
pnpm typecheck           # TypeScript strict
pnpm format              # Prettier
```

### i18n & middleware
- Ngôn ngữ: **vi** (mặc định) + **en**, file dịch tại `messages/{vi,en}.json` (nhóm: common, nav, hero, stats, engines, impact); cấu hình tại `lib/i18n.ts`.
- `middleware.ts` dùng NextAuth `withAuth()` bảo vệ các route dashboard (`/pos`, `/inventory`, `/customers`, `/prescriptions`, `/patient-care`, `/analytics`, `/compliance`, `/engines/*`) — chưa đăng nhập sẽ redirect về `/login`.

> Ghi chú: các thư mục component theo tính năng (`components/{inventory,patient,pos,prescriptions}`) hiện là placeholder, sẽ bổ sung theo roadmap.

## 6. Kết nối các engine AI

Portal **không gọi trực tiếp** vào AI services — tất cả qua `pharma-api-gateway` để có:
- Auth/RBAC tập trung.
- Rate limiting + audit log.
- Failover khi 1 engine down.
- Đường truyền nội bộ data center, mã hóa TLS mTLS.

```ts
// lib/api/clinical.ts
export async function checkInteractions(payload: CheckInteractionsPayload) {
  return apiClient.post("/clinical/check-interactions", payload);
}
```

## 7. UX cho thiết bị cấu hình thấp

- **Lazy load** hầu hết route theo dynamic import.
- **Skeleton + optimistic UI** cho POS để duy trì cảm giác mượt khi mạng chậm.
- **Service Worker (PWA)** — bán offline khi mất mạng, sync khi có lại.
- **Bundle size budget**: < 200KB JS gzip cho route POS chính.

## 8. Bảo mật

- Mọi request có CSRF token + JWT trong HttpOnly cookie.
- Nội dung clinical (response từ PharmaGPT-VN) hiển thị có disclaimer.
- Audit log mọi hành động touch dữ liệu bệnh nhân (Nghị định 13/2023).
- Không log PII vào browser console kể cả ở dev mode.

## 9. Roadmap

- **v0.1**: POS + Inventory + tích hợp VietDrug AI.
- **v0.2**: PrescriptionVision OCR + Patient Care Dashboard.
- **v0.3**: PharmaGPT-VN chatbox + DemandForecast reorder.
- **v1.0**: PWA offline mode + multi-pharmacy chain support.
