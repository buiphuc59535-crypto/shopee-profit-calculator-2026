import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/contexts/app-providers";
import { ServiceWorkerReset } from "@/components/app/service-worker-reset";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shopee Profit Calculator 2026",
    template: "%s | Shopee Profit Calculator 2026",
  },
  description:
    "PWA tinh loi nhuan ban hang Shopee 2026 cho seller TMĐT Viet Nam.",
  applicationName: "Shopee Profit Calculator 2026",
  manifest: "/manifest.json",
  keywords: [
    "Shopee",
    "tinh loi nhuan",
    "seller",
    "PWA",
    "Firebase",
    "Vietnam ecommerce",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shopee Profit",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerReset />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
