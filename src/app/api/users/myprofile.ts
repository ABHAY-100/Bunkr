import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  gender: string | null;
  birth_date: string | null;
}

export const useProfile = () => {
  return useQuery<Profile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/myprofile");
      if (!res) throw new Error("Failed to fetch user profile data");
      return res.data;
    },
  });
};
