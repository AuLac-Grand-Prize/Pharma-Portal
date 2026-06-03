import { Calendar, LineChart as LineChartIcon, Pill, ShoppingBag, TrendingUp } from "lucide-react";
import { Card, CardHeader, Stat, Badge } from "@/components/ui";
import { formatVND, cn } from "@/lib/utils";

const REVENUE_SPARK = [120, 134, 128, 142, 158, 152, 166, 178, 172, 186, 198, 192, 210, 224];

const TOP_DRUGS = [
  { name: "Paracetamol 500mg", units: 480, revenue: 1_200_000 },
  { name: "Amoxicillin 500mg", units: 220, revenue: 1_870_000 },
  { name: "Loratadin 10mg", units: 168, revenue: 756_000 },
  { name: "Metformin 850mg", units: 142, revenue: 454_400 },
  { name: "Amlodipin 5mg", units: 128, revenue: 524_800 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <LineChartIcon className="h-6 w-6 text-brand" />
            Dashboard chỉ số
          </h1>
          <p className="text-sm text-ink-muted">
            Doanh thu · top thuốc · tồn kho · tuân thủ điều trị
          </p>
        </div>
        <Badge tone="info">
          <Calendar className="mr-1 h-3 w-3" /> 14 ngày qua
        </Badge>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Doanh thu 14 ngày"
          value={formatVND(54_280_000)}
          delta="+12.4%"
          tone="up"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <Stat label="Đơn bán" value="3,128" delta="+8.1%" tone="up" icon={<ShoppingBag className="h-4 w-4" />} />
        <Stat label="SKU bán ra" value="218" />
        <Stat label="Bệnh nhân quay lại" value="68%" delta="+1.4pp" tone="up" icon={<Pill className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader title="Doanh thu theo ngày" subtitle="Tính bằng đơn vị · 14 ngày qua" />
        <div className="mt-6 flex h-48 items-end gap-1.5">
          {REVENUE_SPARK.map((v, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t",
                i < 7 ? "bg-brand-100" : "bg-brand-500",
              )}
              style={{ height: `${(v / 224) * 100}%` }}
              title={`Day ${i + 1}: ${v}`}
            />
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Top 5 thuốc bán chạy" />
          <ul className="mt-4 space-y-3">
            {TOP_DRUGS.map((d, i) => {
              const pct = (d.units / 480) * 100;
              return (
                <li key={d.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      <span className="mr-2 inline-block w-5 text-ink-muted">{i + 1}.</span>
                      <span className="font-medium text-ink">{d.name}</span>
                    </span>
                    <span className="text-ink-muted">{d.units} đơn vị</span>
                  </div>
                  <div className="mt-1 h-2 rounded-pill bg-slate-100">
                    <div
                      className="h-full rounded-pill bg-gradient-to-r from-brand to-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Phân bố theo nhóm bệnh" />
          <ul className="mt-4 space-y-2">
            {[
              { label: "Bệnh mãn tính (HA, ĐTĐ, tim mạch)", pct: 38, color: "bg-brand" },
              { label: "Kháng sinh & nhiễm khuẩn", pct: 22, color: "bg-accent" },
              { label: "Giảm đau · hạ sốt", pct: 18, color: "bg-violet-500" },
              { label: "Tiêu hóa", pct: 12, color: "bg-emerald-500" },
              { label: "Khác", pct: 10, color: "bg-slate-400" },
            ].map((s) => (
              <li key={s.label} className="flex items-center gap-3 text-sm">
                <div className={cn("h-2 w-2 rounded-pill", s.color)} />
                <span className="flex-1 text-ink-muted">{s.label}</span>
                <span className="font-medium text-ink">{s.pct}%</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
