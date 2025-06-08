import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/types";

export function useTrackingCount(user: User, accessToken: string) {
  return useQuery<number>({
    queryKey: ["count", user?.username ],
    queryFn: async () => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SUPABASE_API_URL}/fetch-count`,
        { username: user?.username },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return res.data?.remaining ?? 0;
    },
  });
}
