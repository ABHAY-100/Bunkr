"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Loading } from "@/components/loading";
import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { getToken } from "@/utils/auth";
import { useInstitutions } from "@/app/api/users/institutions";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const { error: institutionError, isLoading: institutionLoading } =
    useInstitutions();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (!token) {
        redirect("/");
      } else {
        setHasToken(true);
      }
    };

    checkAuth();
  }, []);

  // Wait until both token check and institution fetch are done
  const isAppLoading = hasToken === null || institutionLoading;

  if (institutionError) {
    redirect("/");
  }

  if (isAppLoading) {
    return (
      <div className="h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <div className="fixed w-full top-0 left-0 right-0 z-10">
        <Navbar />
      </div>
      <div className="mt-20">{children}</div>
      <div>
        <Footer />
      </div>
    </>
  );
}
