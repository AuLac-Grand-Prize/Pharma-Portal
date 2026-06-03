"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowUpDown, Filter, Package, Plus, Search } from "lucide-react";
import { Button, Badge, Card, Input, SortHeader, Stat } from "@/components/ui";
import { formatVND } from "@/lib/utils";
import { useSortable } from "@/hooks/useSortable";

interface InventoryRow {
  sku: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  unitPrice: number;
  expiry: string;
  status: "ok" | "low" | "expiring";
}

const ROWS: InventoryRow[] = [
  { sku: "PRC-500", name: "Paracetamol 500mg", category: "Giảm đau · hạ sốt", stock: 320, reorderLevel: 100, unitPrice: 2500, expiry: "2027-11-30", status: "ok" },
  { sku: "AMX-500", name: "Amoxicillin 500mg", category: "Kháng sinh", stock: 8, reorderLevel: 60, unitPrice: 8500, expiry: "2026-06-15", status: "low" },
  { sku: "MET-850", name: "Metformin 850mg", category: "Đái tháo đường", stock: 280, reorderLevel: 100, unitPrice: 3200, expiry: "2026-04-20", status: "expiring" },
  { sku: "AML-5", name: "Amlodipin 5mg", category: "Tim mạch", stock: 92, reorderLevel: 50, unitPrice: 4100, expiry: "2027-09-01", status: "ok" },
  { sku: "LOR-10", name: "Loratadin 10mg", category: "Dị ứng", stock: 22, reorderLevel: 50, unitPrice: 4500, expiry: "2026-12-30", status: "low" },
];

type SortKey = "sku" | "name" | "category" | "stock" | "reorderLevel" | "unitPrice" | "expiry";

const accessors: Record<SortKey, (r: InventoryRow) => string | number> = {
  sku: (r) => r.sku,
  name: (r) => r.name,
  category: (r) => r.category,
  stock: (r) => r.stock,
  reorderLevel: (r) => r.reorderLevel,
  unitPrice: (r) => r.unitPrice,
  expiry: (r) => r.expiry,
};

function formatExpiry(iso: string): string {
  const [y, m] = iso.split("-");
  return `${m}/${y}`;
}

export default function InventoryPage() {
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "low" | "expiring">("all");

  const filtered = useMemo(() => {
    return ROWS.filter((r) => {
      const matchesQ = query
        ? `${r.sku} ${r.name} ${r.category}`.toLowerCase().includes(query.toLowerCase())
        : true;
      const matchesStatus = filterStatus === "all" ? true : r.status === filterStatus;
      return matchesQ && matchesStatus;
    });
  }, [query, filterStatus]);

  const { sort, toggle, sortedRows } = useSortable<InventoryRow, SortKey>(
    filtered,
    { key: "name", dir: "asc" },
    accessors,
  );

  const totalSKU = ROWS.length;
  const lowStock = ROWS.filter((r) => r.status === "low").length;
  const expiring = ROWS.filter((r) => r.status === "expiring").length;
  const totalValue = ROWS.reduce((s, r) => s + r.stock * r.unitPrice, 0);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <Package className="h-6 w-6 text-brand" />
            Tồn kho
          </h1>
          <p className="text-sm text-ink-muted">
            DemandForecast AI gợi ý đặt hàng tối ưu theo dự báo nhu cầu 30 ngày
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Thêm SKU
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tổng SKU" value={totalSKU} />
        <Stat label="Sản phẩm sắp hết" value={lowStock} delta="Cần đặt ngay" tone="down" />
        <Stat label="Hết hạn ≤ 90 ngày" value={expiring} delta="Cần xử lý" tone="down" />
        <Stat label="Giá trị tồn kho" value={formatVND(totalValue)} delta="+2.4% vs tuần" tone="up" />
      </div>

      <Card padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo SKU, tên, hoạt chất..."
            leftIcon={<Search className="h-4 w-4" />}
            className="max-w-sm"
          />
          <div className="flex items-center gap-1 rounded-pill border border-line bg-white p-1 text-xs">
            {(["all", "low", "expiring"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f)}
                className={
                  filterStatus === f
                    ? "rounded-pill bg-brand px-3 py-1 font-medium text-white"
                    : "rounded-pill px-3 py-1 text-ink-muted hover:text-ink"
                }
              >
                {f === "all" ? "Tất cả" : f === "low" ? "Sắp hết" : "Hết hạn sớm"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line bg-surface text-left">
              <tr>
                <Th><SortHeader label="SKU" active={sort.key === "sku"} dir={sort.dir} onClick={() => toggle("sku")} /></Th>
                <Th><SortHeader label="Tên thuốc" active={sort.key === "name"} dir={sort.dir} onClick={() => toggle("name")} /></Th>
                <Th><SortHeader label="Danh mục" active={sort.key === "category"} dir={sort.dir} onClick={() => toggle("category")} /></Th>
                <Th align="right"><SortHeader label="Tồn" active={sort.key === "stock"} dir={sort.dir} onClick={() => toggle("stock")} align="right" /></Th>
                <Th align="right"><SortHeader label="Min" active={sort.key === "reorderLevel"} dir={sort.dir} onClick={() => toggle("reorderLevel")} align="right" /></Th>
                <Th align="right"><SortHeader label="Giá" active={sort.key === "unitPrice"} dir={sort.dir} onClick={() => toggle("unitPrice")} align="right" /></Th>
                <Th><SortHeader label="HSD" active={sort.key === "expiry"} dir={sort.dir} onClick={() => toggle("expiry")} /></Th>
                <Th>Trạng thái</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {sortedRows.map((r) => (
                <tr key={r.sku} className="hover:bg-surface/60">
                  <td className="px-4 py-3 font-mono text-xs text-ink-muted">{r.sku}</td>
                  <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
                  <td className="px-4 py-3 text-ink-muted">{r.category}</td>
                  <td className="px-4 py-3 text-right">{r.stock}</td>
                  <td className="px-4 py-3 text-right text-ink-muted">{r.reorderLevel}</td>
                  <td className="px-4 py-3 text-right">{formatVND(r.unitPrice)}</td>
                  <td className="px-4 py-3 text-ink-muted">{formatExpiry(r.expiry)}</td>
                  <td className="px-4 py-3">
                    {r.status === "ok" && <Badge tone="success">Ổn</Badge>}
                    {r.status === "low" && (
                      <Badge tone="warn">
                        <AlertTriangle className="mr-1 h-3 w-3" /> Sắp hết
                      </Badge>
                    )}
                    {r.status === "expiring" && <Badge tone="danger">Hết hạn sớm</Badge>}
                  </td>
                </tr>
              ))}
              {sortedRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-ink-muted">
                    Không tìm thấy SKU nào khớp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}
