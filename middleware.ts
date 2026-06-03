import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/pos/:path*",
    "/inventory/:path*",
    "/customers/:path*",
    "/prescriptions/:path*",
    "/patient-care/:path*",
    "/analytics/:path*",
    "/compliance/:path*",
    "/engines/:path*",
  ],
};
