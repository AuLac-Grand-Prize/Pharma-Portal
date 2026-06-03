"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Download,
  LineChart as LineChartIcon,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button, Badge, Card, CardHeader, Stat } from "@/components/ui";
import { formatVND } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ForecastRow {
  sku: string;
  name: string;
  stock: number;
  forecast30: number;
  trend: "up" | "down" | "flat";
  delta: string;
  reorder: number;
  expirySoon?: boolean;
}

const ROWS: ForecastRow[] = [
  {
    sku: "PRC-500",
    name: "Paracetamol 500mg · Hộp 100v",
    stock: 32,
    forecast30: 220,
    trend: "up",
    delta: "+18%",
    reorder: 200,
  },
  {
    sku: "AMX-500",
    name: "Amoxicillin 500mg · Hộp 60v",
    stock: 8,
    forecast30: 180,
    trend: "up",
    delta: "+24%",
    reorder: 180,
    expirySoon: false,
  },
  {
    sku: "MET-850",
    name: "Metformin 850mg · Hộp 100v",
    stock: 280,
    forecast30: 140,
    trend: "flat",
    delta: "0%",
    reorder: 0,
  },
  {
    sku: "AML-5",
    name: "Amlodipin 5mg · Hộp 30v",
    stock: 15,
    forecast30: 75,
    trend: "down",
    delta: "-6%",
    reorder: 60,
    expirySoon: true,
  },
  {
    sku: "VIT-D3",
    name: "Vitamin D3 1000IU · Lọ 60v",
    stock: 60,
    forecast30: 50,
    trend: "up",
    delta: "+9%",
    reorder: 30,
  },
];

const SPARK = [12, 14, 13, 16, 15, 17, 18, 19, 17, 20, 22, 24, 23, 26];

export default function DemandForecastPage() {
  const [horizon, setHorizon] = useState<"7d" | "30d" | "90d">("30d");
  const reorderTotal = ROWS.reduce((s, r) => s + r.reorder, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <LineChartIcon className="h-6 w-6 text-emerald-600" />
            DemandForecast AI
          </h1>
          <p className="text-sm text-ink-muted">
            Dự báo nhu cầu theo mùa vụ & xu hướng — gợi ý đặt hàng tối ưu cho 30 ngày tới
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-pill border border-line bg-white p-1 text-sm">
            {(["7d", "30d", "90d"] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={cn(
                  "rounded-pill px-4 py-1 transition-colors",
                  horizon === h ? "bg-emerald-600 text-white" : "text-ink-muted",
                )}
              >
                {h.toUpperCase()}
              </button>
            ))}
          </div>
          <Button variant="secondary">
            <Download className="h-4 w-4" /> Xuất Excel
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Tổng dự báo bán ra"
          value="2.380 đơn vị"
          delta="+12% MoM"
          tone="up"
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <Stat
          label="Sản phẩm cần đặt hàng"
          value={`${ROWS.filter((r) => r.reorder > 0).length} SKU`}
          delta={`${reorderTotal} đơn vị`}
          tone="neutral"
          icon={<ShoppingBag className="h-4 w-4" />}
        />
        <Stat
          label="Tồn kho dự kiến hết hạn"
          value="3 SKU"
          delta="trong 60 ngày"
          tone="down"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <Stat
          label="Doanh thu dự kiến"
          value={formatVND(285_000_000)}
          delta="+8.4% so với tháng trước"
          tone="up"
          icon={<LineChartIcon className="h-4 w-4" />}
        />
      </div>

      <Card>
        <CardHeader
          title="Xu hướng 14 ngày qua"
          subtitle="Tổng đơn vị bán ra/ngày · toàn bộ SKU"
          action={
            <Badge tone="info">
              <Calendar className="mr-1 h-3 w-3" /> 30 ngày tới
            </Badge>
          }
        />
        <div className="mt-6 flex h-40 items-end gap-1.5">
          {SPARK.map((v, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-t",
                i < 7 ? "bg-brand-100" : "bg-emerald-500",
              )}
              style={{ height: `${(v / 26) * 100}%` }}
              title={`Day ${i + 1}: ${v}`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-muted">
          <span>14 ngày trước</span>
          <span>Hôm nay</span>
        </div>
      </Card>

      <Card padded={false}>
        <div className="flex items-center justify-between p-5">
          <CardHeader
            title="Gợi ý đặt hàng"
            subtitle="Dựa trên dự báo nhu cầu × tồn kho × lead time nhà cung cấp"
          />
          <Button>
            <Package className="h-4 w-4" /> Tạo đơn đặt hàng (1-click)
          </Button>
        </div>
        <table className="w-full text-sm">
          <thead className="border-y border-line bg-surface text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-3">SKU</th>
              <th className="px-5 py-3">Sản phẩm</th>
              <th className="px-5 py-3 text-right">Tồn</th>
              <th className="px-5 py-3 text-right">Dự báo 30d</th>
              <th className="px-5 py-3 text-right">Xu hướng</th>
              <th className="px-5 py-3 text-right">Đặt hàng</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {ROWS.map((r) => {
              const need = r.forecast30 - r.stock;
              const stockOk = need <= 0;
              return (
                <tr key={r.sku} className="hover:bg-surface/60">
                  <td className="px-5 py-3 font-mono text-xs text-ink-muted">{r.sku}</td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{r.name}</div>
                    {r.expirySoon && (
                      <Badge tone="warn" className="mt-1">
                        Hết hạn trong 60 ngày
                      </Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">{r.stock}</td>
                  <td className="px-5 py-3 text-right font-medium text-ink">{r.forecast30}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "ml-auto inline-flex items-center gap-1 text-xs font-medium",
                        r.trend === "up" && "text-emerald-600",
                        r.trend === "down" && "text-red-600",
                        r.trend === "flat" && "text-ink-muted",
                      )}
                    >
                      {r.trend === "up" && <TrendingUp className="h-3 w-3" />}
                      {r.trend === "down" && <TrendingDown className="h-3 w-3" />}
                      {r.delta}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {r.reorder > 0 ? (
                      <span className="font-semibold text-brand">+{r.reorder}</span>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {stockOk ? (
                      <Badge tone="success">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Đủ
                      </Badge>
                    ) : (
                      <Badge tone="warn">
                        <AlertTriangle className="mr-1 h-3 w-3" /> Thiếu {need}
                      </Badge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
