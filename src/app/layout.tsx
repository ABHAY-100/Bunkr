import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ReactQueryProvider from "@/providers/react-query";
import { Manrope, DM_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bunkr Web",
  description: "Bunkr — Your Attendance Wingman",
  keywords:
    "Bunkr attendance calculator, skip class calculator for college, Bunkr Ezygo alternative, optimize college attendance percentage, Bunkr smart skip strategy, minimum attendance calculator for students, Bunkr class absence planner, how many classes can I skip Bunkr, attendance percentage tracker app, Bunkr vs Ezygo comparison, automate student attendance tracking, Bunkr attendance predictor, avoid attendance shortage Bunkr, college attendance skip allowance, Bunkr attendance optimizer, student absence management app, calculate class skip limit Bunkr, Bunkr attendance analytics dashboard, best app to skip college classes, Bunkr digital roll call system, attendance risk calculator for students",
  creator: "Zero-Day",
};

const klick = localFont({
  src: "../../public/fonts/Klick.woff2",
  variable: "--font-klick",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
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
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="application-name" content="Bunkr" />
        <meta name="google" content="notranslate" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
        <meta name="theme-color" content="#141414" />
      </head>
      <body
        className={`antialiased ${klick.variable} ${manrope.variable} ${dmMono.variable} overflow-x-hidden`}
      >
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
