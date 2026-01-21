import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/lib/auth-context";
import LayoutWrapper from "@/app/components/layout-wrapper";
import { AffiliateCapture } from "@/app/components/affiliate-capture";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Thryft - Student Marketplace",
  description: "The safe and easy way for students to buy, sell, and trade on campus. Join your school community today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <AffiliateCapture>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AffiliateCapture>
        </AuthProvider>
      </body>
    </html>
  );
}
