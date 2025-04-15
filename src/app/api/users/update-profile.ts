"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface ProfileData {
  first_name?: string;
  last_name?: string;
  gender?: string | null;
  birth_date?: string | null;
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
