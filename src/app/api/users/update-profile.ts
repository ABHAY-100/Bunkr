"use client";

import { getToken } from "@/utils/auth";

export async function updateProfile(id: number, data: any) {
  const token = getToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(
    `https://production.api.ezygo.app/api/v1/Xcr45_salt/userprofiles/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
}
