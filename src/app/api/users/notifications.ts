"use client";

import { getToken } from "@/utils/auth";
import { useQuery } from "@tanstack/react-query";

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: string;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchNotifications() {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    "https://production.api.ezygo.app/api/v1/Xcr45_salt/user/notifications",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json() as Promise<Notification[]>;
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
