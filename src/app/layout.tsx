import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "stock.macm.dev - CSE Stock Market Tracker",
  description:
    "Track Colombo Stock Exchange (CSE) stocks and manage your portfolio. For informational purposes only.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='font-sans'>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
