import axios from "@/lib/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type SemesterData = {
  default_semester: "even" | "odd";
};

type AcademicYearData = {
  default_academic_year: string;
};

export const useFetchSemester = () => {
  return useQuery({
    queryKey: ["semester"],
    queryFn: async () => {
      const res = await axios.get("/user/setting/default_semester");
      return res.data;
    },
  });
};

export const useFetchAcademicYear = () => {
  return useQuery({
    queryKey: ["academic-year"],
    queryFn: async () => {
      const res = await axios.get("/user/setting/default_academic_year");
      return res.data;
    },
  });
};

export const useSetSemester = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (semesterData: SemesterData) => {
      const res = await axios.post(
        "/user/setting/default_semester",
        semesterData
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["semester"], variables.default_semester);

      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error) => {
      console.error("Error setting semester:", error);
    },
  });
};

export const useSetAcademicYear = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (academicYearData: AcademicYearData) => {
      const res = await axios.post(
        "/user/setting/default_academic_year",
        academicYearData
      );
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        ["academic-year"],
        variables.default_academic_year
      );

      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error) => {
      console.error("Error setting academic year:", error);
    },
  });
};
