import type { Metadata } from "next";
import "@/styles/globals.css";
import { SessionProvider } from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "PharmLink AI — Portal nhà thuốc",
  description: "Nền tảng AI dược phẩm Make in Vietnam.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
