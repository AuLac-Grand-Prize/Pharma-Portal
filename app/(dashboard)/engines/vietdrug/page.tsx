"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Pill,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Button, Card, CardHeader, Input, SeverityPill } from "@/components/ui";
import type { InteractionAlert } from "@/types/domain";
import { cn } from "@/lib/utils";
import { checkVietDrugInteractions, isApiError } from "@/lib/api";

/** When on, `analyze()` calls the real Gateway via the typed api layer. */
const VIETDRUG_LIVE = process.env.NEXT_PUBLIC_FEATURE_VIETDRUG_LIVE === "true";

interface SelectedDrug {
  id: string;
  name: string;
  inn: string;
  strength: string;
}

const SUGGESTED_DRUGS: SelectedDrug[] = [
  { id: "d1", name: "Warfarin 5mg", inn: "Warfarin", strength: "5mg" },
  { id: "d2", name: "Aspirin 81mg", inn: "Acetylsalicylic acid", strength: "81mg" },
  { id: "d3", name: "Metformin 850mg", inn: "Metformin HCl", strength: "850mg" },
  { id: "d4", name: "Amlodipin 5mg", inn: "Amlodipine besylate", strength: "5mg" },
  { id: "d5", name: "Atorvastatin 20mg", inn: "Atorvastatin", strength: "20mg" },
];

const MOCK_ALERTS: InteractionAlert[] = [
  {
    drugA: "Warfarin",
    drugB: "Aspirin",
    severity: "high",
    mechanism: "Tăng tác dụng chống đông qua ức chế kết tập tiểu cầu",
    clinicalAdvice:
      "Tránh phối hợp ở bệnh nhân không có chỉ định bắt buộc. Nếu phải dùng, theo dõi INR mỗi 3 ngày và dấu hiệu chảy máu.",
  },
  {
    drugA: "Amlodipin",
    drugB: "Atorvastatin",
    severity: "moderate",
    mechanism: "Amlodipin ức chế CYP3A4, làm tăng nồng độ atorvastatin",
    clinicalAdvice:
      "Giới hạn liều atorvastatin ≤ 20mg/ngày khi phối hợp. Theo dõi triệu chứng cơ.",
  },
];

export default function VietDrugAIPage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SelectedDrug[]>(() => SUGGESTED_DRUGS.slice(0, 2));
  const [analyzing, setAnalyzing] = useState(false);
  const [alerts, setAlerts] = useState<InteractionAlert[]>(MOCK_ALERTS);
  const [error, setError] = useState<string | null>(null);

  function add(d: SelectedDrug) {
    setSelected((prev) => (prev.find((x) => x.id === d.id) ? prev : [...prev, d]));
    setQuery("");
  }
  function remove(id: string) {
    setSelected((prev) => prev.filter((d) => d.id !== id));
  }
  async function analyze() {
    setAnalyzing(true);
    setError(null);

    // Feature-flag off → preserve the original mock path (no network call).
    if (!VIETDRUG_LIVE) {
      await new Promise((r) => setTimeout(r, 800));
      setAlerts(selected.length >= 2 ? MOCK_ALERTS : []);
      setAnalyzing(false);
      return;
    }

    // Live path: call the real Gateway through the typed api layer, forwarding
    // the NextAuth session access token.
    //
    // NOTE (out of scope — left as a known gap): this live path is not yet wired
    // to a working auth phase. Demo-account sessions carry no `accessToken`, and
    // Portal roles (pharmacist/owner) differ from the Gateway/VietDrugAI roles
    // (DS_TRUONG…), so the Gateway will reject these calls until the real auth
    // phase lands. The feature stays behind NEXT_PUBLIC_FEATURE_VIETDRUG_LIVE
    // (default off) precisely so this gap can't reach end users.
    try {
      // Build the REAL VietDrugAI request DTO (snake_case): screen the last
      // selected drug against the rest. INNs are the active-ingredient names.
      // The button is disabled below 2 selections, so `newMedication` is always
      // present; `?? ""` only satisfies the index-access type narrowing.
      const inns = selected.map((d) => d.inn);
      const newMedication = inns[inns.length - 1] ?? "";
      const currentMedications = inns.slice(0, -1);

      const result = await checkVietDrugInteractions(
        {
          patient_id: "demo-patient",
          current_medications: currentMedications,
          new_medication: newMedication,
          patient_context: {
            age: 62,
            egfr: 48,
            conditions: ["Tăng huyết áp", "Đái tháo đường type 2", "Suy thận giai đoạn 3"],
          },
        },
        () => session?.accessToken,
      );
      setAlerts(result.interactions);
    } catch (err) {
      setAlerts([]);
      setError(
        isApiError(err)
          ? `Không thể phân tích tương tác (lỗi ${err.status}).`
          : "Không thể phân tích tương tác.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const filtered = SUGGESTED_DRUGS.filter(
    (d) =>
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.inn.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1 border-b border-line pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <Pill className="h-6 w-6 text-brand" />
          VietDrug AI · Drug Interaction Checker
        </h1>
        <p className="text-sm text-ink-muted">
          Cơ sở dữ liệu 2,000+ hoạt chất Việt Nam · DDI ≥ moderate
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Drug List */}
        <div className="space-y-4">
          <Card>
            <CardHeader title="Danh sách thuốc" subtitle="Thêm tối thiểu 2 thuốc để kiểm tra" />
            <div className="mt-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tên thương mại hoặc INN..."
                leftIcon={<Search className="h-4 w-4" />}
              />
              {query && (
                <ul className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-line bg-white">
                  {filtered.map((d) => (
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => add(d)}
                        className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-brand-50"
                      >
                        <span>
                          <span className="font-medium text-ink">{d.name}</span>{" "}
                          <span className="text-ink-muted">· {d.inn}</span>
                        </span>
                        <Plus className="h-4 w-4 text-brand" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ul className="mt-4 space-y-2">
              {selected.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-brand" />
                    <div>
                      <div className="text-sm font-medium text-ink">{d.name}</div>
                      <div className="text-xs text-ink-muted">{d.inn}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    className="rounded p-1 text-ink-subtle hover:bg-red-50 hover:text-danger"
                    aria-label={`Xóa ${d.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {selected.length === 0 && (
                <li className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-sm text-ink-muted">
                  Chưa có thuốc nào — thêm từ ô tìm kiếm
                </li>
              )}
            </ul>
          </Card>

          <Card>
            <CardHeader
              title="Thông tin bệnh nhân"
              subtitle="Tăng độ chính xác cảnh báo theo bệnh nền"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Tuổi" value="62" />
              <Field label="Giới tính" value="Nữ" />
              <Field label="Cân nặng" value="58 kg" />
              <Field label="eGFR" value="48 mL/phút" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip">Tăng huyết áp</span>
              <span className="chip">Đái tháo đường type 2</span>
              <span className="chip">Suy thận giai đoạn 3</span>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setSelected([])}>
              <Trash2 className="h-4 w-4" /> Xóa hết
            </Button>
            <Button onClick={analyze} disabled={selected.length < 2 || analyzing}>
              {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
              Phân tích tương tác
            </Button>
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-ink">Kết quả phân tích</h2>

          {error && (
            <Card className="border-red-200 bg-red-50/40">
              <div className="flex items-center gap-3 text-sm">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div className="font-medium text-red-700" role="alert">
                  {error}
                </div>
              </div>
            </Card>
          )}

          {alerts.length === 0 && !error && (
            <Card>
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <div className="font-medium text-ink">Không phát hiện tương tác đáng kể</div>
                  <div className="text-ink-muted">An toàn để kê đơn theo dữ liệu hiện tại.</div>
                </div>
              </div>
            </Card>
          )}

          {alerts.map((a, i) => (
            <AlertCard key={i} alert={a} />
          ))}

          <Card className="border-emerald-200 bg-emerald-50/40">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
              <div>
                <div className="font-medium text-ink">Tương tác an toàn</div>
                <div className="text-sm text-ink-muted">
                  Metformin × Amlodipin · Không có cảnh báo đáng kể.
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2">
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

function AlertCard({ alert }: { alert: InteractionAlert }) {
  const isHigh = alert.severity === "high" || alert.severity === "contraindicated";
  return (
    <Card
      padded={false}
      className={cn(
        "border",
        isHigh ? "border-red-200" : "border-amber-200",
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle
              className={cn("h-5 w-5", isHigh ? "text-red-500" : "text-amber-500")}
            />
            <div className="font-semibold text-ink">
              {alert.drugA} × {alert.drugB}
            </div>
          </div>
          <SeverityPill severity={alert.severity} />
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          <span className="font-medium text-ink">Cơ chế:</span> {alert.mechanism}
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          <span className="font-medium text-ink">Khuyến nghị:</span> {alert.clinicalAdvice}
        </p>
      </div>
    </Card>
  );
}
