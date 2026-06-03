import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: "pharmacist" | "owner" | "admin";
      pharmacyCode: string;
      pharmacyName: string;
    };
    accessToken?: string;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: "pharmacist" | "owner" | "admin";
    pharmacyCode: string;
    pharmacyName: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "pharmacist" | "owner" | "admin";
    pharmacyCode: string;
    pharmacyName: string;
    accessToken?: string;
  }
}
