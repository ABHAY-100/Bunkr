"use client";

import { getToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Loading } from "@/components/loading";

export default function HomePage() {
  useEffect(() => {
    const user = getToken();
    if (!user) {
      setTimeout(() => {
        redirect("/login");
      }, 1000);
    }
  }, []);

  return <Loading />;
}
