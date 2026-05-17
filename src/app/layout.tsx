import type { Metadata } from "next";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/contexts/app-providers";
import { ServiceWorkerReset } from "@/components/app/service-worker-reset";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Sàn Cam Calculator 2026",
    template: "%s | Sàn Cam Calculator 2026",
  },
  description:
    "PWA tính lợi nhuận bán hàng Sàn Cam 2026 cho seller TMĐT Việt Nam.",
  applicationName: "Sàn Cam Calculator 2026",
  manifest: "/manifest.json",
  keywords: [
    "Sàn Cam",
    "tính lợi nhuận",
    "seller",
    "PWA",
    "Firebase",
    "Vietnam ecommerce",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sàn Cam",
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
      className={`${beVietnam.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerReset />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

