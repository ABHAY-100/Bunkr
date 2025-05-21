import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { UserProfile } from "@/types";

interface UpdateProfileData {
  id: number;
  data: UserProfile;
}

export const useProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/myprofile");
      if (!res) throw new Error("Failed to fetch user profile data");
      return res.data;
    },
  });
};

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateProfileData) => {
      const res = await axiosInstance.put(`/userprofiles/${id}`, data);
      if (!res) throw new Error("Failed to update profile");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
