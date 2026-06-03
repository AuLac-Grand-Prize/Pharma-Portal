"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[error.tsx]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-card">
        <div className="grid h-12 w-12 place-items-center rounded-pill bg-red-50 text-danger">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-ink">Đã có lỗi xảy ra</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Hệ thống không thể tải nội dung này. Vui lòng thử lại hoặc quay về trang chủ.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-ink-subtle">Mã lỗi: {error.digest}</p>
        )}
        <div className="mt-5 flex gap-2">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4" /> Thử lại
          </Button>
          <Link href="/">
            <Button variant="secondary">
              <ArrowLeft className="h-4 w-4" /> Trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
