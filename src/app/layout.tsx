import type { Metadata } from "next";
import "./globals.css";
import ReactQueryProvider from "@/providers/react-query";
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "bunkr",
  description: "A simple, student-only alternative to Ezygo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`antialiased lowercase`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
