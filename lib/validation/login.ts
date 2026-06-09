import { z } from "zod";

/**
 * Single source of truth for the pharmacy login form / credentials schema.
 *
 * Previously duplicated as `credentialsSchema` (lib/auth.ts) and `loginSchema`
 * (app/(auth)/login/page.tsx). Consumed by both the NextAuth credentials
 * provider and the client login form so validation stays in sync.
 */
export const loginSchema = z.object({
  pharmacyCode: z.string().trim().min(1, "Nhập mã nhà thuốc"),
  email: z.string().trim().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export type LoginValues = z.infer<typeof loginSchema>;
