import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AttendanceReport, CourseDetail } from "@/types";

export const useAttendanceReport = () => {
  return useQuery<AttendanceReport>({
    queryKey: ["attendance-report"],
    queryFn: async () => {
      const res = await axios.post("/attendancereports/student/detailed");
      if (!res) throw new Error("Failed to fetch attendance report data");
      return res.data;
    },
  });
};

export const useCourseDetails = (courseId: string) => {
  return useQuery<CourseDetail>({
    queryKey: ["attendance-report", courseId],
    queryFn: async () => {
      if (!courseId) throw new Error("Course ID is required");

      const res = await axios.get(
        `/attendancereports/institutionuser/courses/${courseId}/summery`
      );
      if (!res) throw new Error("Failed to fetch course details data");
      return res.data;
    },
    enabled: !!courseId,
  });
};
