"use client";

import { useState } from "react";
import {
  Camera,
  CheckCircle2,
  CircleDot,
  FileText,
  ImagePlus,
  Loader2,
  RefreshCw,
  ScanLine,
  ShoppingCart,
  Upload,
} from "lucide-react";
import { Button, Card, CardHeader, Badge, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

interface OcrLine {
  id: string;
  raw: string;
  drugName: string;
  dosage: string;
  schedule: string;
  qty: number;
  confidence: number;
}

const MOCK_OCR: OcrLine[] = [
  {
    id: "l1",
    raw: "Amoxicillin 500mg × 21v · 1v × 3/ngày",
    drugName: "Amoxicillin 500mg",
    dosage: "500mg",
    schedule: "1 viên × 3 lần/ngày × 7 ngày",
    qty: 21,
    confidence: 0.97,
  },
  {
    id: "l2",
    raw: "Paracetamol 500mg × 10v · khi sốt > 38.5",
    drugName: "Paracetamol 500mg",
    dosage: "500mg",
    schedule: "Khi sốt > 38.5°C, cách 6h",
    qty: 10,
    confidence: 0.94,
  },
  {
    id: "l3",
    raw: "Loratadin 10mg × 7v · tối 1v",
    drugName: "Loratadin 10mg",
    dosage: "10mg",
    schedule: "1 viên buổi tối × 7 ngày",
    qty: 7,
    confidence: 0.88,
  },
];

export default function PrescriptionVisionPage() {
  const [stage, setStage] = useState<"idle" | "scanning" | "review">("idle");
  const [lines, setLines] = useState<OcrLine[]>([]);

  async function startScan() {
    setStage("scanning");
    await new Promise((r) => setTimeout(r, 1400));
    setLines(MOCK_OCR);
    setStage("review");
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <ScanLine className="h-6 w-6 text-accent" />
            PrescriptionVision · OCR đơn thuốc viết tay
          </h1>
          <p className="text-sm text-ink-muted">
            Vision Transformer · Hỗ trợ chữ bác sĩ tiếng Việt · 95%+ chính xác
          </p>
        </div>
        <Badge tone="success">v3.2 · 2025</Badge>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader title="Ảnh đơn thuốc" subtitle="Chụp ảnh hoặc tải lên file PDF/JPG/PNG" />
          <div
            className={cn(
              "mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-surface p-10 text-center transition-colors",
              stage === "scanning" && "border-brand/60 bg-brand-50/40",
            )}
          >
            {stage === "idle" && (
              <>
                <ImagePlus className="h-10 w-10 text-ink-subtle" />
                <p className="mt-3 text-sm font-medium text-ink">Kéo ảnh vào đây hoặc</p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <Button onClick={startScan}>
                    <Upload className="h-4 w-4" /> Tải ảnh lên
                  </Button>
                  <Button variant="secondary" onClick={startScan}>
                    <Camera className="h-4 w-4" /> Chụp ảnh
                  </Button>
                </div>
              </>
            )}
            {stage === "scanning" && (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-brand" />
                <p className="mt-4 text-sm font-medium text-ink">Đang phân tích đơn thuốc...</p>
                <p className="mt-1 text-xs text-ink-muted">
                  Trích xuất hoạt chất, liều, lịch dùng và số lượng.
                </p>
              </>
            )}
            {stage === "review" && (
              <div className="grid h-64 w-full place-items-center rounded-lg bg-white text-sm text-ink-muted">
                [Ảnh đơn thuốc đã upload — preview]
              </div>
            )}
          </div>

          {stage === "review" && (
            <div className="mt-4 flex justify-between">
              <Button variant="secondary" onClick={() => setStage("idle")}>
                <RefreshCw className="h-4 w-4" /> Chụp lại
              </Button>
              <div className="flex items-center gap-2 text-sm text-ink-muted">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Trích xuất hoàn tất · {lines.length} dòng
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Kết quả OCR"
            subtitle="Kiểm tra & chỉnh sửa trước khi đẩy vào POS"
            action={
              <Button size="sm" disabled={lines.length === 0}>
                <ShoppingCart className="h-4 w-4" /> Auto-fill POS
              </Button>
            }
          />

          {lines.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-line p-8 text-center text-sm text-ink-muted">
              Chưa có dữ liệu — tải ảnh để bắt đầu.
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {lines.map((line) => (
                <OcrLineCard key={line.id} line={line} onChange={(updated) =>
                  setLines((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
                } />
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Thông tin đơn" subtitle="Trích xuất từ header đơn thuốc" />
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Field label="Bác sĩ" value="BS. Trần Minh Quân" />
          <Field label="Phòng khám" value="BV Bạch Mai · Khoa Nội tiết" />
          <Field label="Mã bệnh nhân" value="BN-2025-09812" />
          <Field label="Ngày kê" value="28/04/2026" />
        </div>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2">
      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
        <FileText className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 text-sm font-medium text-ink">{value}</div>
    </div>
  );
}

interface OcrLineCardProps {
  line: OcrLine;
  onChange: (updated: OcrLine) => void;
}

function OcrLineCard({ line, onChange }: OcrLineCardProps) {
  const conf = Math.round(line.confidence * 100);
  const tone = conf >= 95 ? "success" : conf >= 90 ? "info" : "warn";
  return (
    <li className="rounded-xl border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <CircleDot className="h-3 w-3 text-brand" />
          {line.raw}
        </div>
        <Badge tone={tone}>{conf}%</Badge>
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
        <Input
          value={line.drugName}
          onChange={(e) => onChange({ ...line, drugName: e.target.value })}
          aria-label="Tên thuốc"
        />
        <Input
          value={line.schedule}
          onChange={(e) => onChange({ ...line, schedule: e.target.value })}
          aria-label="Lịch dùng"
        />
        <Input
          type="number"
          value={line.qty}
          onChange={(e) => onChange({ ...line, qty: Number(e.target.value) || 0 })}
          aria-label="Số lượng"
        />
      </div>
    </li>
  );
}
