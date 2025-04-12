"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";

export interface AttendanceData {
  courses: { [courseId: string]: Course };
  sessions: { [sessionId: string]: Session };
  attendanceTypes: { [attendanceTypeId: string]: AttendanceType };
  studentAttendanceData: {
    [date: string]: { [sessionId: string]: SessionAttendance };
  };
  attendanceDatesArray: { [date: string]: AttendanceDate };
}

export interface Course {
  id: number;
  si_no: number;
  name: string;
  code: string;
  start_year: null | number;
  end_year: null | number;
  institution_id: number;
  usersubgroup_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  academic_year: string;
  academic_semester: string;
  pre_requisites: null | string;
  ltp_credits: null | string;
  reference_docs: null | string;
  text_books: null | string;
  course_type_id: number;
  course_category_id: null | number;
  deleted_at: null | string;
  enable_laboratory: null | number;
}

export interface Session {
  id: number;
  name: string;
  time_from: null | string;
  time_to: null | string;
  view_order: string;
  institution_id: number;
  deleted_at: null | string;
  created_at: null | string;
  updated_at: string;
  type: null | string;
}

export interface AttendanceType {
  id: number;
  name: string;
  code: string;
  color: string | null;
  view_order: string;
  positive_report_value: number;
  institution_id: number;
  deleted_at: null | string;
  created_at: null | string;
  updated_at: null | string;
}

export interface SessionAttendance {
  course: number | null;
  attendance: number | null;
}

export interface AttendanceDate {
  key: string;
  date: string;
  day: string;
}

export const useDetailedAttendance = () => {
  return useQuery<AttendanceData>({
    queryKey: ["detailedAttendance"],
    queryFn: async () => {
      const res = await axiosInstance.post("/attendancereports/student/detailed");
      if (!res) throw new Error("Failed to fetch detailed attendance");
      return res.data;
    },
    select: (data) => {
      if (!data) return null;
      return {
        ...data,
        attendanceDatesArray: Object.values(data.attendanceDatesArray || {}).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        overallAttendance: calculateOverallAttendance(data),
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useSubjectWiseAttendance = (courseId: number) => {
  return useQuery({
    queryKey: ["subjectWiseAttendance", courseId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/attendancereports/institutionuser/courses/${courseId}/summery`);
      if (!res) throw new Error("Failed to fetch subject-wise attendance");
      return res.data;
    },
  });
};

export const useAllCoursesWithUsers = () => {
  return useQuery({
    queryKey: ["allCoursesWithUsers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/institutionuser/courses/withusers");
      if (!res) throw new Error("Failed to fetch courses with users");
      return res.data;
    },
    select: (data) => {
      if (!data) return null;
      return {
        ...data,
        courses: data.courses?.sort((a: Course, b: Course) => 
          a.name.localeCompare(b.name)
        ) || [],
      };
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useUpdateAcademicYear = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (academicYear: string) => {
      const res = await axiosInstance.post("/user/setting/default_academic_year", {
        default_academic_year: academicYear,
      });
      if (!res) throw new Error("Failed to update academic year");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useUpdateSemester = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (semester: string) => {
      const res = await axiosInstance.post("/user/setting/default_semester", {
        default_semester: semester,
      });
      if (!res) throw new Error("Failed to update semester");
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

// Helper function to calculate overall attendance
function calculateOverallAttendance(data: AttendanceData) {
  let totalPresent = 0;
  let totalSessions = 0;

  Object.values(data.studentAttendanceData || {}).forEach(sessions => {
    Object.values(sessions).forEach(session => {
      if (session.attendance !== null) {
        totalSessions++;
        if (session.attendance === 1) totalPresent++;
      }
    });
  });

  return totalSessions ? (totalPresent / totalSessions) * 100 : 0;
}
