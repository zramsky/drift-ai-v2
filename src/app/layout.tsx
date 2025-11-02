import type { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";
import { QueryProvider } from "@/lib/query-client";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "DRIFT.AI - Contract Reconciliation Platform",
  description: "Cut waste. Keep the signal. Your contracts, your rules. Verified every time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <QueryProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
