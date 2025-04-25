import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Institution } from "@/types";

export function useInstitutions() {
  return useQuery<Institution[]>({
    queryKey: ["institutions"],
    queryFn: async () => {
      const res = await axiosInstance.get("/institutionusers/myinstitutions");
      if (!res) throw new Error("Failed to fetch institutions");

      const studentInstitutions = res.data.filter(
        (institution: Institution) =>
          institution.institution_role.name === "student"
      );

      if (studentInstitutions.length === 0) {
        throw new Error("No student institutions found");
      }

      return studentInstitutions;
    },
  });
}

export function useDefaultInstitute() {
  return useQuery<number>({
    queryKey: ["defaultInstitute"],
    queryFn: async () => {
      const res = await axiosInstance.get("/user/setting/default_institute");
      if (!res) throw new Error("Failed to fetch default institute");

      return res.data;
    },
  });
}

export function useDefaultInstitutionUser() {
  const { data: institutions } = useInstitutions();
  const updateDefaultInstitutionUser = useUpdateDefaultInstitutionUser();

  return useQuery<number>({
    queryKey: ["defaultInstitutionUser"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/user/setting/default_institutionUser"
      );
      if (!res) throw new Error("Failed to fetch default institution user");

      const defaultInstitutionUser = res.data;

      if (defaultInstitutionUser && institutions) {
        const currentDefault = institutions.find(
          (inst) => inst.id === defaultInstitutionUser
        );

        if (
          (!currentDefault ||
            currentDefault.institution_role.name !== "student") &&
          institutions.length > 0
        ) {
          const studentInstitution = institutions[0];
          if (studentInstitution) {
            await updateDefaultInstitutionUser.mutateAsync(
              studentInstitution.id
            );
            return studentInstitution.id;
          }
        }
      }

      return defaultInstitutionUser;
    },
    enabled: !!institutions,
  });
}

export function useUpdateDefaultInstitutionUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (institutionUserId: number) => {
      const res = await axiosInstance.post(
        "/user/setting/default_institutionUser",
        {
          default_institutionUser: institutionUserId,
        }
      );
      if (!res) throw new Error("Failed to update default institution user");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defaultInstitutionUser"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
