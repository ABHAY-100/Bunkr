import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface CourseInfo {
  id: number;
  si_no: number;
  name: string;
  code: string;
  start_year: string | null;
  end_year: string | null;
  institution_id: number;
  usersubgroup_id: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  academic_year: string;
  academic_semester: string;
  pre_requisites: string | null;
  ltp_credits: string | null;
  reference_docs: string | null;
  text_books: string | null;
  course_type_id: number;
  course_category_id: number | null;
  deleted_at: string | null;
  enable_laboratory: boolean | null;
}

export interface SessionInfo {
  id: number;
  name: string;
  time_from: string | null;
  time_to: string | null;
  view_order: string;
  institution_id: number;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string;
  type: string | null;
}

export interface AttendanceType {
  id: number;
  name: string;
  code: string;
  color: string | null;
  view_order: string;
  positive_report_value: number;
  institution_id: number;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DateInfo {
  key: string;
  date: string;
  day: string;
}

export interface SessionData {
  course: number | null;
  attendance: number | null;
}

export interface AttendanceReport {
  courses: Record<string, CourseInfo>;
  sessions: Record<string, SessionInfo>;
  attendanceTypes: Record<string, AttendanceType>;
  studentAttendanceData: Record<string, Record<string, SessionData>>;
  attendanceDatesArray: Record<string, DateInfo>;
}

export interface CourseDetail {
  present: number;
  absent: number;
  totel: number;
  persantage: number;
  course: {
    id: number | string;
    name: string;
    code: string;
  };
}

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

export const calculateCourseAttendance = (
  attendanceData: AttendanceReport | undefined,
  courseId: string
) => {
  if (!attendanceData || !attendanceData.studentAttendanceData || !courseId) {
    return { present: 0, absent: 0, total: 0, percentage: 0 };
  }

  let present = 0;
  let absent = 0;
  let dutyLeave = 0;

  Object.values(attendanceData.studentAttendanceData).forEach((dateData) => {
    Object.values(dateData).forEach((session: SessionData) => {
      if (session.course === parseInt(courseId)) {
        if (session.attendance === 110) {
          present++;
        } else if (session.attendance === 111) {
          absent++;
        } else if (session.attendance === 225) {
          dutyLeave++;
        }
      }
    });
  });

  const effectivePresent = present + dutyLeave;
  const total = effectivePresent + absent;
  const percentage =
    total > 0 ? Math.round((effectivePresent / total) * 100) : 0;

  return { present: effectivePresent, absent, total, percentage };
};

export const getCourseCodes = (
  attendanceData: AttendanceReport | undefined
) => {
  if (!attendanceData || !attendanceData.courses) {
    return {};
  }

  const courseCodes: Record<string, { name: string; code: string }> = {};

  Object.entries(attendanceData.courses).forEach(([id, course]) => {
    courseCodes[id] = {
      name: course.name,
      code: course.code,
    };
  });

  return courseCodes;
};

export const getCourseName = (
  attendanceData: AttendanceReport | undefined,
  courseId: string | number
) => {
  if (
    !attendanceData ||
    !attendanceData.courses ||
    !attendanceData.courses[courseId]
  ) {
    return "Unknown Course";
  }

  return attendanceData.courses[courseId].name;
};

export const useAllCourseAttendance = (courseIds: string[]) => {
  return useQuery({
    queryKey: ["all-course-attendance", courseIds],
    queryFn: async () => {
      if (!courseIds.length) return {};

      const results: Record<string, CourseDetail> = {};

      await Promise.all(
        courseIds.map(async (courseId) => {
          try {
            const res = await axios.get(
              `/attendancereports/institutionuser/courses/${courseId}/summery`
            );
            if (res && res.data) {
              results[courseId] = res.data;
            }
          } catch (error) {
            console.error(
              `Failed to fetch attendance for course ${courseId}:`,
              error
            );
          }
        })
      );

      return results;
    },
    enabled: courseIds.length > 0,
  });
};

export const formatCourseCode = (code: string): string => {
  if (code.includes("-")) {
    return code.split("-")[0].trim();
  }

  return code;
};
