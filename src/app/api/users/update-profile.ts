"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

interface ProfileData {
  name?: string;
  bio?: string;
  avatar?: string;
  email?: string;
}

interface UpdateProfileData {
  id: number;
  data: ProfileData;
}

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
