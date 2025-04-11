import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface User {
  id: number;
  username: string;
  email: string;
}

export const useUser = () => {
  return useQuery<User>({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await axiosInstance.get("/user");
      if (!res) throw new Error('Failed to fetch user data');
      return res.data;
    }
  });
};
