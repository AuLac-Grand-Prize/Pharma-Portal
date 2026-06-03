import { CheckCircle2, ClipboardList, Download, FileWarning, ShieldCheck } from "lucide-react";
import { Button, Badge, Card, CardHeader, Stat } from "@/components/ui";

interface Report {
  id: string;
  title: string;
  period: string;
  status: "submitted" | "due" | "draft";
  dueIn?: string;
}

const REPORTS: Report[] = [
  { id: "BYT-Q2-2026", title: "Báo cáo thuốc kiểm soát đặc biệt", period: "Q2/2026", status: "submitted" },
  { id: "GPP-2026-04", title: "GPP audit hàng tháng", period: "04/2026", status: "due", dueIn: "5 ngày" },
  { id: "BYT-NCO-04", title: "Báo cáo thuốc gây nghiện · hướng thần", period: "Tháng 04/2026", status: "draft" },
  { id: "ADR-2026-0428", title: "Báo cáo phản ứng có hại của thuốc", period: "28/04/2026", status: "draft" },
];

const STATUS = {
  submitted: { tone: "success" as const, label: "Đã nộp" },
  due: { tone: "warn" as const, label: "Sắp hạn" },
  draft: { tone: "neutral" as const, label: "Bản nháp" },
};

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <ClipboardList className="h-6 w-6 text-brand" /> Báo cáo tuân thủ
          </h1>
          <p className="text-sm text-ink-muted">
            Báo cáo Bộ Y tế · GPP audit · Thuốc kiểm soát đặc biệt
          </p>
        </div>
        <Button>
          <Download className="h-4 w-4" /> Xuất tất cả
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Báo cáo đã nộp 2026" value="14" delta="100% đúng hạn" tone="up" />
        <Stat label="Sắp đến hạn" value="2" delta="trong 7 ngày" tone="neutral" />
        <Stat label="GPP score" value="96 / 100" delta="+3 vs Q1" tone="up" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card padded={false}>
          <div className="border-b border-line p-5">
            <CardHeader title="Danh sách báo cáo" />
          </div>
          <ul className="divide-y divide-line">
            {REPORTS.map((r) => {
              const s = STATUS[r.status];
              return (
                <li key={r.id} className="flex items-center justify-between p-5 hover:bg-surface/60">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand">
                      <FileWarning className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-ink">{r.title}</div>
                      <div className="text-xs text-ink-muted">
                        {r.id} · {r.period}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.dueIn && (
                      <span className="text-xs text-amber-600">Còn {r.dueIn}</span>
                    )}
                    <Badge tone={s.tone}>{s.label}</Badge>
                    <Button size="sm" variant="secondary">
                      Xem
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="GPP Checklist" subtitle="Trạng thái tuân thủ thực hành nhà thuốc tốt" />
          <ul className="mt-4 space-y-2 text-sm">
            {[
              { label: "Bằng cấp dược sĩ phụ trách", ok: true },
              { label: "Sổ theo dõi thuốc kiểm soát", ok: true },
              { label: "Kiểm soát nhiệt độ tủ thuốc", ok: true },
              { label: "Sổ tư vấn dùng thuốc", ok: true },
              { label: "Báo cáo ADR định kỳ", ok: false },
              { label: "Tủ thuốc có biển hiệu rõ ràng", ok: true },
            ].map((c) => (
              <li
                key={c.label}
                className="flex items-center justify-between rounded-lg border border-line bg-white px-3 py-2"
              >
                <span className="text-ink">{c.label}</span>
                {c.ok ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Badge tone="warn">Cần làm</Badge>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm">
            <div className="flex items-center gap-2 font-medium text-emerald-700">
              <ShieldCheck className="h-4 w-4" /> Đạt chuẩn GPP
            </div>
            <p className="mt-1 text-xs text-emerald-700/80">
              Nhà thuốc đáp ứng 96/100 tiêu chí tại lần đánh giá 04/2026.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
