"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Loading } from "@/components/loading";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { getToken } from "@/utils/auth";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      const token = await getToken();
      if (!token) {
        redirect("/");
      }
      setLoading(false);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="fixed w-full top-0 left-0 right-0 z-10">
            <Navbar />
          </div>
          <div className="mt-20">{children}</div>
          <div className="">
            <Footer />
          </div>
        </>
      )}
    </>
  );
}
