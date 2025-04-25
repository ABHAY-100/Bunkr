import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Notification } from "@/types";

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
