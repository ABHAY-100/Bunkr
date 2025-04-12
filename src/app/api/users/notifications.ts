"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

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

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axiosInstance.get("/user/notifications");
      if (!res) throw new Error("Failed to fetch notifications");
      return res.data;
    },
  });
}
