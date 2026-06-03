import Link from "next/link";
import {
  ArrowRight,
  Bot,
  Brain,
  Building2,
  CheckCircle2,
  HeartPulse,
  Hospital,
  LineChart,
  Pill,
  PlayCircle,
  ScanLine,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AiEngine {
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  icon: typeof Pill;
  href: string;
  hue: string;
  iconHue: string;
}

const ENGINES: AiEngine[] = [
  {
    name: "VietDrug AI",
    tagline: "Drug Interaction Engine",
    description:
      "Cơ sở dữ liệu 2.000+ hoạt chất Việt Nam, kiểm tra tương tác thuốc theo thời gian thực.",
    bullets: ["DDI ≥ moderate", "Cảnh báo cho bệnh nền", "API Gateway có cache"],
    icon: Pill,
    href: "/engines/vietdrug",
    hue: "from-brand-50 to-white",
    iconHue: "bg-brand-100 text-brand",
  },
  {
    name: "PrescriptionVision",
    tagline: "OCR đơn thuốc viết tay",
    description: "Đọc đơn thuốc viết tay tiếng Việt với độ chính xác 95%+, auto-fill giỏ hàng POS.",
    bullets: ["Vision Transformer", "Hỗ trợ chữ bác sĩ", "Auto-suggest hoạt chất"],
    icon: ScanLine,
    href: "/engines/prescription-vision",
    hue: "from-accent-50 to-white",
    iconHue: "bg-accent-100 text-accent",
  },
  {
    name: "PharmaGPT-VN",
    tagline: "Chatbot dược lâm sàng",
    description: "Trả lời câu hỏi dược học bằng tiếng Việt, có nguồn dẫn từ dược thư & guideline.",
    bullets: ["RAG với dược thư VN", "Disclaimer y khoa", "24/7"],
    icon: Bot,
    href: "/engines/pharmagpt",
    hue: "from-violet-50 to-white",
    iconHue: "bg-violet-100 text-violet-600",
  },
  {
    name: "DemandForecast AI",
    tagline: "Dự báo nhu cầu 30 ngày",
    description:
      "Mô hình chuỗi thời gian cho từng SKU, gợi ý đặt hàng tối ưu, giảm 40% tồn kho chết.",
    bullets: ["Time-series + season", "Cảnh báo hết hạn", "Đặt hàng 1-click"],
    icon: LineChart,
    href: "/engines/demand-forecast",
    hue: "from-emerald-50 to-white",
    iconHue: "bg-emerald-100 text-emerald-600",
  },
];

const STATS = [
  { num: "60,000+", label: "Nhà thuốc tại Việt Nam" },
  { num: "100M", label: "Người dân Việt Nam" },
  { num: "2,000+", label: "Hoạt chất AI hiểu được" },
  { num: "95%", label: "Độ chính xác OCR" },
];

const IMPACT = [
  {
    num: "50,000+",
    label: "Ca tương tác thuốc được ngăn chặn mỗi năm",
    icon: ShieldCheck,
  },
  {
    num: "2 triệu",
    label: "Bệnh nhân được theo dõi tuân thủ điều trị",
    icon: HeartPulse,
  },
  {
    num: "3,000 tỷ ₫",
    label: "Tiết kiệm cho ngành dược nhờ tối ưu tồn kho",
    icon: LineChart,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <a href="#hero" className="skip-link">
        Bỏ qua, đi tới nội dung
      </a>
      <Navbar />
      <Hero />
      <RoleSection />
      <EnginesSection />
      <ImpactSection />
      <CtaBanner />
      <Footer />
    </main>
  );
}

interface RoleCard {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: typeof Stethoscope;
  hue: string;
  iconHue: string;
  bullets: string[];
}

const ROLES: RoleCard[] = [
  {
    id: "pharmacy",
    title: "Tôi là dược sĩ / chủ nhà thuốc",
    description: "Quản lý bán hàng, tồn kho, AI kiểm tra tương tác và OCR đơn thuốc.",
    cta: "Vào portal nhà thuốc",
    href: "/login",
    icon: Stethoscope,
    hue: "from-brand-50 to-white",
    iconHue: "bg-brand-100 text-brand",
    bullets: ["POS bán hàng", "VietDrug AI", "DemandForecast"],
  },
  {
    id: "hospital",
    title: "Tôi là bác sĩ / bệnh viện",
    description: "Hỏi PharmaGPT, theo dõi tuân thủ điều trị bệnh nhân mãn tính.",
    cta: "Vào portal bệnh viện",
    href: "/login?role=hospital",
    icon: Hospital,
    hue: "from-violet-50 to-white",
    iconHue: "bg-violet-100 text-violet-600",
    bullets: ["PharmaGPT-VN", "Chăm sóc bệnh nhân", "API tích hợp HIS"],
  },
  {
    id: "patient",
    title: "Tôi là bệnh nhân",
    description: "Tải Zalo Mini App để tra cứu thuốc, hỏi dược sĩ AI 24/7, nhắc uống thuốc.",
    cta: "Mở Zalo Mini App",
    href: "https://zalo.me/s/pharmlink",
    icon: HeartPulse,
    hue: "from-emerald-50 to-white",
    iconHue: "bg-emerald-100 text-emerald-600",
    bullets: ["Tra cứu thuốc", "Quét đơn thuốc", "Nhắc uống thuốc"],
  },
];

function RoleSection() {
  return (
    <section id="for-you" className="bg-white py-16">
      <div className="container-page">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-ink">PharmLink AI cho ai?</h2>
          <p className="mt-2 text-ink-muted">Chọn vai trò để vào đúng không gian làm việc.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {ROLES.map((r) => (
            <article
              key={r.id}
              className={cn(
                "flex flex-col rounded-2xl border border-line bg-gradient-to-br p-6 shadow-soft transition-shadow hover:shadow-card",
                r.hue,
              )}
            >
              <div className={cn("grid h-12 w-12 place-items-center rounded-xl", r.iconHue)}>
                <r.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-ink">{r.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{r.description}</p>
              <ul className="mt-4 space-y-1.5">
                {r.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-1.5 text-xs text-ink-muted">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    {b}
                  </li>
                ))}
              </ul>
              <Link
                href={r.href}
                className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink/90"
              >
                {r.cta}
                {r.href.startsWith("http") ? (
                  <Smartphone className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Navbar() {
  return (
    <nav className="sticky top-0 z-30 flex h-[72px] items-center border-b border-line bg-white/90 backdrop-blur">
      <div className="container-page flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-accent text-white">
            <Brain className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-ink">PharmLink AI</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm text-ink-muted md:flex">
          <Link href="#engines" className="hover:text-ink">
            AI Engines
          </Link>
          <Link href="#impact" className="hover:text-ink">
            Tác động
          </Link>
          <Link href="/login" className="hover:text-ink">
            Đăng nhập
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/analytics"
            className="hidden rounded-pill border border-brand px-4 py-2 text-sm font-medium text-brand hover:bg-brand-50 sm:inline-flex"
          >
            Vào portal
          </Link>
          <Link
            href="/pos"
            className="inline-flex items-center gap-1.5 rounded-pill bg-brand px-4 py-2 text-sm font-medium text-white shadow-soft hover:bg-brand-dark"
          >
            Dùng thử <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-gradient-to-b from-brand-50/30 via-white to-white"
    >
      <div className="container-page flex flex-col items-center gap-10 py-20 text-center">
        <span className="chip border-brand-200 bg-brand-50 text-brand">
          <Sparkles className="h-3 w-3" />
          Make in Vietnam · Vietnamese AI for Vietnamese Health
        </span>

        <h1 className="max-w-3xl text-5xl font-bold leading-[1.15] tracking-tight text-ink md:text-6xl">
          Trí tuệ nhân tạo dược phẩm{" "}
          <span className="bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
            cho 100 triệu người Việt
          </span>
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-ink-muted">
          Nền tảng AI dược phẩm đầu tiên Make-in-Vietnam, phục vụ 60,000+ nhà thuốc với công nghệ
          chính xác — giá cả phù hợp với thị trường Việt Nam.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/pos" className="btn-primary">
            <PlayCircle className="h-4 w-4" />
            Khám phá ngay
          </Link>
          <Link href="#engines" className="btn-ghost">
            Xem demo
          </Link>
        </div>

        <div className="mt-6 flex w-full max-w-3xl flex-wrap items-center justify-center divide-x divide-line text-center">
          {STATS.map((s) => (
            <div key={s.label} className="px-8 py-2">
              <div className="text-3xl font-bold text-brand">{s.num}</div>
              <div className="mt-1 text-sm text-ink-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page pb-16">
        <div className="relative mx-auto max-w-5xl">
          <div className="rounded-2xl border border-line bg-slate-900 p-2 shadow-card">
            <div className="aspect-[16/9] w-full rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800">
              <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                Portal nhà thuốc · Live preview
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-6 hidden w-48 rotate-3 rounded-3xl border border-line bg-slate-900 p-1.5 shadow-card md:block">
            <div className="aspect-[9/19] w-full rounded-2xl bg-gradient-to-br from-brand-500 to-accent">
              <div className="flex h-full w-full items-center justify-center text-xs text-white/80">
                Zalo Mini App
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EnginesSection() {
  return (
    <section id="engines" className="bg-white py-20">
      <div className="container-page">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-ink">Bốn AI Engine cốt lõi</h2>
          <p className="mt-3 text-base text-ink-muted">
            Công nghệ thuần Việt — model đào tạo trên dữ liệu y dược Việt Nam.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {ENGINES.map((e) => (
            <article
              key={e.name}
              className={cn(
                "rounded-2xl border border-line bg-gradient-to-br p-8 shadow-soft transition-shadow hover:shadow-card",
                e.hue,
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn("grid h-12 w-12 place-items-center rounded-xl", e.iconHue)}>
                  <e.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-ink">{e.name}</h3>
                  <p className="text-sm text-ink-muted">{e.tagline}</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-ink-muted">{e.description}</p>

              <ul className="mt-5 space-y-2">
                {e.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-ink">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {b}
                  </li>
                ))}
              </ul>

              <Link
                href={e.href}
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:gap-2 hover:text-brand-dark"
              >
                Tìm hiểu engine <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section id="impact" className="bg-surface py-20">
      <div className="container-page">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-ink">Tác động thực tế</h2>
          <p className="mt-3 text-ink-muted">
            Mỗi engine đem lại giá trị đo lường được cho ngành dược Việt Nam.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {IMPACT.map(({ num, label, icon: Icon }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-2xl border border-line bg-white p-8 text-center shadow-soft"
            >
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-brand-50">
                <Icon className="h-9 w-9 text-brand" />
              </div>
              <div className="mt-5 text-5xl font-bold text-brand">{num}</div>
              <div className="mt-3 text-base leading-relaxed text-ink-muted">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="bg-white py-20">
      <div className="container-page">
        <div className="rounded-3xl bg-gradient-to-r from-brand to-accent p-10 text-center text-white shadow-card md:p-14">
          <h3 className="text-3xl font-bold md:text-4xl">Sẵn sàng nâng cấp nhà thuốc với AI?</h3>
          <p className="mx-auto mt-3 max-w-xl text-base text-white/85">
            Triển khai 24h, không yêu cầu thay đổi phần mềm bán hàng hiện tại.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/pos"
              className="inline-flex items-center gap-1.5 rounded-pill bg-white px-6 py-3 text-sm font-medium text-brand hover:bg-white/90"
            >
              Vào portal nhà thuốc
              <Building2 className="h-4 w-4" />
            </Link>
            <Link
              href="#engines"
              className="inline-flex items-center gap-1.5 rounded-pill border border-white/40 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
            >
              Đăng ký demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-surface">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand to-accent text-white">
                <Brain className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-ink">PharmLink AI</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-ink-muted">
              Trí tuệ Việt Nam vì sức khỏe người Việt Nam và Đông Nam Á.
            </p>
          </div>

          <FooterCol
            title="Sản phẩm"
            links={[
              { label: "Portal nhà thuốc", href: "/pos" },
              { label: "Zalo Mini App", href: "#" },
              { label: "API Gateway", href: "#" },
            ]}
          />
          <FooterCol
            title="AI Engines"
            links={ENGINES.map((e) => ({ label: e.name, href: e.href }))}
          />
          <FooterCol
            title="Công ty"
            links={[
              { label: "Liên hệ", href: "#" },
              { label: "Tuyển dụng", href: "#" },
              { label: "Bảo mật & GDPR", href: "#" },
            ]}
          />
        </div>

        <div className="mt-10 border-t border-line pt-6 text-center text-xs text-ink-muted">
          © {new Date().getFullYear()} PharmLink AI · Make in Vietnam
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div className="text-sm font-semibold text-ink">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-ink-muted hover:text-ink">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
