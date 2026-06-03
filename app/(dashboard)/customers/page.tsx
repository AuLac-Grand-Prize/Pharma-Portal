"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Heart, Plus, Search, User } from "lucide-react";
import { Button, Badge, Card, Input, SortHeader, Stat } from "@/components/ui";
import { formatVND } from "@/lib/utils";
import { useSortable } from "@/hooks/useSortable";

interface Customer {
  id: string;
  name: string;
  phoneMasked: string;
  yearOfBirth: number;
  conditions: string[];
  lastVisit: string;
  ltv: number;
  adherence: number;
}

const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Nguyễn Thị Hoa", phoneMasked: "0903***892", yearOfBirth: 1962, conditions: ["Tăng huyết áp", "Đái tháo đường"], lastVisit: "2026-04-26", ltv: 4_580_000, adherence: 92 },
  { id: "c2", name: "Trần Văn An", phoneMasked: "0982***441", yearOfBirth: 1955, conditions: ["Tim mạch"], lastVisit: "2026-04-24", ltv: 6_120_000, adherence: 78 },
  { id: "c3", name: "Lê Thị Mai", phoneMasked: "0917***035", yearOfBirth: 1988, conditions: ["Dị ứng"], lastVisit: "2026-04-20", ltv: 980_000, adherence: 64 },
  { id: "c4", name: "Phạm Quang Huy", phoneMasked: "0345***712", yearOfBirth: 1979, conditions: ["Hen phế quản"], lastVisit: "2026-04-12", ltv: 2_240_000, adherence: 88 },
];

type SortKey = "name" | "yearOfBirth" | "lastVisit" | "ltv" | "adherence";
const accessors: Record<SortKey, (c: Customer) => string | number> = {
  name: (c) => c.name,
  yearOfBirth: (c) => c.yearOfBirth,
  lastVisit: (c) => c.lastVisit,
  ltv: (c) => c.ltv,
  adherence: (c) => c.adherence,
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function CustomersPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      CUSTOMERS.filter(
        (c) =>
          !query ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.phoneMasked.includes(query),
      ),
    [query],
  );

  const { sort, toggle, sortedRows } = useSortable<Customer, SortKey>(
    filtered,
    { key: "lastVisit", dir: "desc" },
    accessors,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <User className="h-6 w-6 text-brand" /> Khách hàng
          </h1>
          <p className="text-sm text-ink-muted">
            Hồ sơ bệnh nhân, lịch sử mua thuốc và chỉ số tuân thủ điều trị
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" /> Thêm khách hàng
        </Button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Tổng khách hàng" value="1,284" delta="+34 tuần này" tone="up" />
        <Stat label="Bệnh nhân mãn tính" value="412" delta="32% tổng số" />
        <Stat label="Tuân thủ trung bình" value="83%" delta="+2.1pp" tone="up" />
        <Stat label="LTV trung bình" value={formatVND(2_840_000)} />
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between border-b border-line p-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, SĐT, mã KH..."
            leftIcon={<Search className="h-4 w-4" />}
            className="max-w-sm"
          />
          <div className="flex items-center gap-1 rounded-pill border border-line bg-surface p-1 text-xs text-ink-muted">
            <SortHeader
              label="Tên"
              active={sort.key === "name"}
              dir={sort.dir}
              onClick={() => toggle("name")}
            />
            <SortHeader
              label="Tuổi"
              active={sort.key === "yearOfBirth"}
              dir={sort.dir}
              onClick={() => toggle("yearOfBirth")}
            />
            <SortHeader
              label="Ghé gần nhất"
              active={sort.key === "lastVisit"}
              dir={sort.dir}
              onClick={() => toggle("lastVisit")}
            />
            <SortHeader
              label="LTV"
              active={sort.key === "ltv"}
              dir={sort.dir}
              onClick={() => toggle("ltv")}
            />
            <SortHeader
              label="Tuân thủ"
              active={sort.key === "adherence"}
              dir={sort.dir}
              onClick={() => toggle("adherence")}
            />
          </div>
        </div>

        <ul className="divide-y divide-line">
          {sortedRows.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 p-5 hover:bg-surface/60"
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-pill bg-brand-50 text-sm font-semibold text-brand">
                  {c.name
                    .split(" ")
                    .slice(-2)
                    .map((s) => s[0])
                    .join("")}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-ink">{c.name}</div>
                  <div className="text-xs text-ink-muted">
                    {c.phoneMasked} · Sinh {c.yearOfBirth}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.conditions.map((cd) => (
                      <Badge key={cd} tone="info">
                        {cd}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-6 text-sm md:flex">
                <div className="text-right">
                  <div className="text-xs text-ink-muted">Ghé gần nhất</div>
                  <div className="text-ink">{formatDate(c.lastVisit)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ink-muted">LTV</div>
                  <div className="font-medium text-ink">{formatVND(c.ltv)}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart
                    className={
                      c.adherence >= 85
                        ? "h-4 w-4 text-emerald-500"
                        : c.adherence >= 70
                          ? "h-4 w-4 text-amber-500"
                          : "h-4 w-4 text-red-500"
                    }
                  />
                  <span className="text-xs text-ink-muted">{c.adherence}% tuân thủ</span>
                </div>
                <button className="text-ink-subtle hover:text-brand" aria-label="Xem chi tiết">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {sortedRows.length === 0 && (
            <li className="px-6 py-12 text-center text-sm text-ink-muted">
              Không tìm thấy khách hàng nào.
            </li>
          )}
        </ul>
      </Card>
    </div>
  );
}
