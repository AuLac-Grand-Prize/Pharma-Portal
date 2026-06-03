"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Brain, Building2, KeyRound, Loader2, Mail } from "lucide-react";
import { Button, Input } from "@/components/ui";

const loginSchema = z.object({
  pharmacyCode: z.string().trim().min(1, "Nhập mã nhà thuốc"),
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/analytics";
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { pharmacyCode: "", email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setServerError(null);
    const res = await signIn("credentials", {
      ...values,
      redirect: false,
      callbackUrl,
    });
    setSubmitting(false);
    if (!res || res.error) {
      setServerError("Mã nhà thuốc, email hoặc mật khẩu không đúng.");
      return;
    }
    router.push(res.url ?? callbackUrl);
    router.refresh();
  }

  function fillDemo() {
    setValue("pharmacyCode", "DEMO");
    setValue("email", "demo@pharmlink.vn");
    setValue("password", "demo1234");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50/30 via-white to-accent-50/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-card">
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand to-accent text-white">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-ink">PharmLink AI</span>
        </Link>

        <h1 className="mt-6 text-2xl font-bold text-ink">Đăng nhập nhà thuốc</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Sử dụng tài khoản dược sĩ của nhà thuốc.
        </p>

        {serverError && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Field label="Mã nhà thuốc" error={errors.pharmacyCode?.message}>
            <Input
              {...register("pharmacyCode")}
              placeholder="Mã do Bộ Y tế cấp"
              leftIcon={<Building2 className="h-4 w-4" />}
              autoComplete="organization"
            />
          </Field>

          <Field label="Email" error={errors.email?.message}>
            <Input
              {...register("email")}
              type="email"
              placeholder="duocsi@nhathuoc.vn"
              leftIcon={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />
          </Field>

          <Field label="Mật khẩu" error={errors.password?.message}>
            <Input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              leftIcon={<KeyRound className="h-4 w-4" />}
              autoComplete="current-password"
            />
          </Field>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Đăng nhập
          </Button>
        </form>

        <div className="mt-4 rounded-lg border border-dashed border-line bg-surface px-3 py-2.5 text-xs text-ink-muted">
          <div className="font-medium text-ink">Tài khoản demo</div>
          <div>
            <code className="text-brand">DEMO / demo@pharmlink.vn / demo1234</code>
          </div>
          <button
            type="button"
            onClick={fillDemo}
            className="mt-1 text-xs font-medium text-brand hover:underline"
          >
            Điền tự động
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-ink-muted">
          Chưa có tài khoản?{" "}
          <Link href="/" className="font-medium text-brand hover:underline">
            Đăng ký nhà thuốc mới
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="mt-1">{children}</div>
      {error && (
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </span>
      )}
    </label>
  );
}
