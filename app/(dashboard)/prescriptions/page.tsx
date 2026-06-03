import Link from "next/link";
import { ArrowRight, FileText, Plus, ScanLine } from "lucide-react";
import { Button, Badge, Card, CardHeader, Stat } from "@/components/ui";

interface Prescription {
  id: string;
  patient: string;
  doctor: string;
  hospital: string;
  date: string;
  status: "pending" | "filled" | "expired";
  drugs: number;
}

const ITEMS: Prescription[] = [
  { id: "RX-2026-00921", patient: "Nguyễn Thị Hoa", doctor: "BS. Trần Minh Quân", hospital: "BV Bạch Mai", date: "28/04/2026", status: "pending", drugs: 4 },
  { id: "RX-2026-00919", patient: "Trần Văn An", doctor: "BS. Vũ Thanh Hằng", hospital: "PK Đa Khoa Tâm Anh", date: "27/04/2026", status: "filled", drugs: 2 },
  { id: "RX-2026-00904", patient: "Lê Thị Mai", doctor: "BS. Lê Quốc Cường", hospital: "BV 108", date: "21/04/2026", status: "filled", drugs: 1 },
  { id: "RX-2025-08801", patient: "Phạm Quang Huy", doctor: "BS. Phan Thúy Nga", hospital: "BV Phổi TW", date: "12/03/2026", status: "expired", drugs: 3 },
];

const STATUS_TONES = {
  pending: "warn",
  filled: "success",
  expired: "neutral",
} as const;

const STATUS_LABEL = {
  pending: "Chờ bán",
  filled: "Đã bán",
  expired: "Hết hạn",
};

export default function PrescriptionsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <FileText className="h-6 w-6 text-brand" /> Đơn thuốc
          </h1>
          <p className="text-sm text-ink-muted">
            Chụp ảnh đơn thuốc viết tay — PrescriptionVision đọc và auto-fill giỏ hàng
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/engines/prescription-vision">
            <Button variant="secondary">
              <ScanLine className="h-4 w-4" /> Mở scanner
            </Button>
          </Link>
          <Button>
            <Plus className="h-4 w-4" /> Đơn mới
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Đơn chờ bán" value="12" delta="3 đơn ưu tiên" tone="neutral" />
        <Stat label="Đơn bán hôm nay" value="48" delta="+9 vs hôm qua" tone="up" />
        <Stat label="Tỉ lệ OCR thành công" value="96.2%" delta="+0.8pp" tone="up" />
      </div>

      <Card padded={false}>
        <div className="border-b border-line p-4">
          <CardHeader title="Đơn gần đây" />
        </div>
        <ul className="divide-y divide-line">
          {ITEMS.map((p) => (
            <li key={p.id} className="flex items-center justify-between p-5 hover:bg-surface/60">
              <div className="flex items-center gap-4">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-mono text-xs text-ink-muted">{p.id}</div>
                  <div className="font-medium text-ink">{p.patient}</div>
                  <div className="text-xs text-ink-muted">
                    {p.doctor} · {p.hospital}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <div className="text-xs text-ink-muted">Số thuốc</div>
                  <div className="font-medium text-ink">{p.drugs}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ink-muted">Ngày kê</div>
                  <div>{p.date}</div>
                </div>
                <Badge tone={STATUS_TONES[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                <button className="text-ink-subtle hover:text-brand" aria-label="Xem">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
