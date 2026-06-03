import { Activity, Bell, Heart, MessageCircle, Stethoscope, TrendingUp } from "lucide-react";
import { Button, Badge, Card, CardHeader, Stat } from "@/components/ui";
import { cn } from "@/lib/utils";

interface PatientCard {
  name: string;
  age: number;
  condition: string;
  adherence: number;
  lastDose: string;
  nextRefill: string;
  notes: string;
}

const PATIENTS: PatientCard[] = [
  {
    name: "Nguyễn Thị Hoa",
    age: 64,
    condition: "Tăng huyết áp · ĐTĐ type 2",
    adherence: 92,
    lastDose: "Hôm nay 07:30",
    nextRefill: "05/05/2026",
    notes: "HbA1c 6.8% · ổn",
  },
  {
    name: "Trần Văn An",
    age: 71,
    condition: "Suy tim NYHA II",
    adherence: 68,
    lastDose: "Hôm qua 20:10",
    nextRefill: "30/04/2026",
    notes: "Quên liều furosemide tuần trước",
  },
  {
    name: "Lê Đức Minh",
    age: 58,
    condition: "COPD",
    adherence: 84,
    lastDose: "Sáng nay 06:00",
    nextRefill: "12/05/2026",
    notes: "Cần ICS-LABA tái khám",
  },
];

export default function PatientCarePage() {
  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <Stethoscope className="h-6 w-6 text-brand" /> Chăm sóc bệnh nhân
        </h1>
        <p className="text-sm text-ink-muted">
          Theo dõi tuân thủ điều trị tiểu đường, tăng huyết áp, tim mạch, COPD, hen phế quản
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Bệnh nhân theo dõi" value="412" delta="+18 tháng này" tone="up" />
        <Stat label="Tuân thủ trung bình" value="83%" delta="+2.1pp MoM" tone="up" />
        <Stat label="Cảnh báo cần can thiệp" value="9" delta="3 ưu tiên cao" tone="down" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {PATIENTS.map((p) => (
          <Card key={p.name}>
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-ink">{p.name}</div>
                <div className="text-xs text-ink-muted">
                  {p.age} tuổi · {p.condition}
                </div>
              </div>
              <AdherenceRing percent={p.adherence} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-surface p-3">
                <div className="text-xs text-ink-muted">Liều gần nhất</div>
                <div className="text-ink">{p.lastDose}</div>
              </div>
              <div className="rounded-lg bg-surface p-3">
                <div className="text-xs text-ink-muted">Cần tái cấp</div>
                <div className="text-ink">{p.nextRefill}</div>
              </div>
            </div>

            <p className="mt-3 flex items-start gap-2 text-xs text-ink-muted">
              <Activity className="mt-0.5 h-3.5 w-3.5 text-brand" />
              {p.notes}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button size="sm" variant="secondary">
                <Bell className="h-3.5 w-3.5" /> Nhắc Zalo
              </Button>
              <Button size="sm" variant="secondary">
                <MessageCircle className="h-3.5 w-3.5" /> Tin nhắn
              </Button>
              {p.adherence < 75 && (
                <Badge tone="warn">
                  <Heart className="mr-1 h-3 w-3" /> Cần can thiệp
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AdherenceRing({ percent }: { percent: number }) {
  const tone =
    percent >= 85 ? "text-emerald-500" : percent >= 70 ? "text-amber-500" : "text-red-500";
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "grid h-12 w-12 place-items-center rounded-pill border-4",
          percent >= 85 && "border-emerald-200",
          percent >= 70 && percent < 85 && "border-amber-200",
          percent < 70 && "border-red-200",
        )}
      >
        <div className="text-xs font-bold">{percent}%</div>
      </div>
      <div className={cn("flex items-center gap-1 text-xs", tone)}>
        <TrendingUp className="h-3 w-3" />
        Tuân thủ
      </div>
    </div>
  );
}
