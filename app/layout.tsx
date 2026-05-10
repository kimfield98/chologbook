import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = new URL("https://www.chologbook.com");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "CHOLOGBOOK",
    template: "%s · CHOLOGBOOK",
  },
  description:
    "Patch(행동) → Minor(인지) → Major(흐름)으로 변화를 쌓아가는 초록북입니다.",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "CHOLOGBOOK",
    title: "CHOLOGBOOK",
    description:
      "Patch(행동) → Minor(인지) → Major(흐름)으로 변화를 쌓아가는 초록북입니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
