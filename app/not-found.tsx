import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-brand-50 text-brand">
          <Search className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-ink">404</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Không tìm thấy trang bạn yêu cầu. Có thể trang đã được di chuyển hoặc xóa.
        </p>
        <Link href="/" className="mt-5 inline-block">
          <Button>
            <ArrowLeft className="h-4 w-4" /> Về trang chủ
          </Button>
        </Link>
      </div>
    </div>
  );
}
