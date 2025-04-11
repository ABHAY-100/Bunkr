"use client";

import { LoginForm } from "@/components/login-form";
import { useEffect, useState } from "react";
import { Loading } from "@/components/loading";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      if (token) {
        redirect("/dashboard");
      } else {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };
    fetchToken();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
