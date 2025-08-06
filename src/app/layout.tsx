import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "BidFlow - Contract Intelligence Platform",
  description: "Uganda's premier contract intelligence and bid management platform. Track contracts, analyze competition, and win more bids with data-driven insights.",
  keywords: "contracts, bidding, Uganda, procurement, analytics, bid management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning={true}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
