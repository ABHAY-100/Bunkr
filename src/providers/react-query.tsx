"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { PropsWithChildren } from "react";
import { AttendanceSettingsProvider } from "./attendance-settings";

export default function ReactQueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 3 * 60 * 1000,
            gcTime: 5 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AttendanceSettingsProvider>
        {children}
      </AttendanceSettingsProvider>
    </QueryClientProvider>
  );
}
