"use client";

import { getToken } from "@/utils/auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Institution {
  id: number;
  first_name: string;
  last_name: string;
  institution_id: number;
  institutionrole_id: number;
  institution_approved: number;
  user_data_completed: number;
  enroll_status: string;
  institution: {
    id: number;
    name: string;
    name_2: string | null;
    type: string;
    approved: number;
    approval_status: string;
  };
  institution_role: {
    id: number;
    name: string;
  };
}

export async function fetchInstitutions() {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    "https://production.api.ezygo.app/api/v1/Xcr45_salt/institutionusers/myinstitutions",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch institutions");
  }

  return response.json() as Promise<Institution[]>;
}

export async function fetchDefaultInstitute() {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    "https://production.api.ezygo.app/api/v1/Xcr45_salt/user/setting/default_institute",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch default institute");
  }

  return response.json() as Promise<number>;
}

export async function fetchDefaultInstitutionUser() {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    "https://production.api.ezygo.app/api/v1/Xcr45_salt/user/setting/default_institutionUser",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch default institution user");
  }

  return response.json() as Promise<number>;
}

export async function updateDefaultInstitutionUser(institutionUserId: number) {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    "https://production.api.ezygo.app/api/v1/Xcr45_salt/user/setting/default_institutionUser",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ default_institutionUser: institutionUserId }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update default institution user");
  }

  return response.json();
}

export function useInstitutions() {
  return useQuery({
    queryKey: ["institutions"],
    queryFn: fetchInstitutions,
  });
}

export function useDefaultInstitute() {
  return useQuery({
    queryKey: ["defaultInstitute"],
    queryFn: fetchDefaultInstitute,
  });
}

export function useDefaultInstitutionUser() {
  return useQuery({
    queryKey: ["defaultInstitutionUser"],
    queryFn: fetchDefaultInstitutionUser,
  });
}

export function useUpdateDefaultInstitutionUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDefaultInstitutionUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defaultInstitutionUser"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
