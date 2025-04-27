import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "@/providers/react-query";
import { Analytics } from "@vercel/analytics/react";
import { Plus_Jakarta_Sans, DM_Mono } from "next/font/google";

export const metadata: Metadata = {
  title: "bunkr",
  description: "A simple, student-only alternative to Ezygo",
};

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-mono",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased lowercase ${plusJakartaSans.variable} ${dmMono.variable}`}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
