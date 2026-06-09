import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginSchema as credentialsSchema } from "@/lib/validation/login";

interface DemoAccount {
  pharmacyCode: string;
  email: string;
  password: string;
  user: {
    id: string;
    name: string;
    role: "pharmacist" | "owner" | "admin";
    pharmacyName: string;
  };
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    pharmacyCode: "DEMO",
    email: "demo@pharmlink.vn",
    password: "demo1234",
    user: {
      id: "user_demo_owner",
      name: "DS. Nguyễn Văn A",
      role: "owner",
      pharmacyName: "Nhà thuốc Demo",
    },
  },
  {
    pharmacyCode: "DEMO",
    email: "duocsi@pharmlink.vn",
    password: "demo1234",
    user: {
      id: "user_demo_pharmacist",
      name: "DS. Trần Thị B",
      role: "pharmacist",
      pharmacyName: "Nhà thuốc Demo",
    },
  },
];

interface BackendLoginResponse {
  user: {
    id: string;
    name: string;
    role: "pharmacist" | "owner" | "admin";
    pharmacyName: string;
  };
  accessToken: string;
}

async function verifyWithBackend(
  pharmacyCode: string,
  email: string,
  password: string,
): Promise<BackendLoginResponse | null> {
  const baseUrl = process.env.API_GATEWAY_URL;
  if (!baseUrl) return null;

  try {
    const res = await fetch(`${baseUrl}/auth/pharmacy/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pharmacyCode, email, password }),
      signal: AbortSignal.timeout(Number(process.env.API_GATEWAY_TIMEOUT_MS ?? 10_000)),
    });
    if (!res.ok) return null;
    return (await res.json()) as BackendLoginResponse;
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      name: "Pharmacy",
      credentials: {
        pharmacyCode: { label: "Mã nhà thuốc", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { pharmacyCode, email, password } = parsed.data;

        const backend = await verifyWithBackend(pharmacyCode, email, password);
        if (backend) {
          return {
            id: backend.user.id,
            email,
            name: backend.user.name,
            role: backend.user.role,
            pharmacyCode,
            pharmacyName: backend.user.pharmacyName,
            accessToken: backend.accessToken,
          };
        }

        const demo = DEMO_ACCOUNTS.find(
          (a) =>
            a.pharmacyCode.toUpperCase() === pharmacyCode.toUpperCase() &&
            a.email.toLowerCase() === email.toLowerCase() &&
            a.password === password,
        );
        if (demo) {
          return {
            id: demo.user.id,
            email,
            name: demo.user.name,
            role: demo.user.role,
            pharmacyCode: demo.pharmacyCode,
            pharmacyName: demo.user.pharmacyName,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.pharmacyCode = user.pharmacyCode;
        token.pharmacyName = user.pharmacyName;
        if (user.accessToken) token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email ?? "",
        name: token.name ?? "",
        role: token.role,
        pharmacyCode: token.pharmacyCode,
        pharmacyName: token.pharmacyName,
      };
      session.accessToken = token.accessToken;
      return session;
    },
  },
};
