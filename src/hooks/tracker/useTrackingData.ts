import axios from "axios";

import { useQuery } from "@tanstack/react-query";
import { TrackAttendance, User } from "@/types";

export function useTrackingData(user: User | undefined, accessToken: string) {
  return useQuery<TrackAttendance[]>({
    queryKey: ["track_data"],
    queryFn: async () => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SUPABASE_API_URL}/fetch-tracking-data`,
        {
          username: user?.username,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if(!res.data){
        return []
      }
      return res.data.data;
    },
  });
}
