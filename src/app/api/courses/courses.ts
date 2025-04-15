import axios from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export interface CourseUser {
  id: number;
  first_name: string;
  last_name: string;
  enroll_status: string;
  pivot: {
    course_id: number;
    institution_user_id: number;
    courserole_id: number;
  };
}

export interface Course {
  id: number;
  si_no: number;
  name: string; // e.g., "VECTOR CALCULUS, DIFF..."
  code: string; // course code
  academic_year: string; // e.g., "2023-2024"
  academic_semester: string; // even or odd
  usersubgroup: {
    id: number;
    name: string;
    start_date: string; // sem start date
    end_date: string; // sem end date
    usergroup: {
      id: number;
      name: string; // e.g., "Computer Science and Business Systems"
      affiliated_university: string; // university name
    };
  };
  institution_users: CourseUser[];
}

export const useFetchCourses = () => {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const res = await axios.get("/institutionuser/courses/withusers");
      if (!res) throw new Error("Failed to fetch courses data");

      const courses = res.data || [];

      const formattedData = {
        courses: courses.reduce(
          (acc: Record<string, Course>, course: Course) => {
            acc[course.id.toString()] = course;
            return acc;
          },
          {}
        ),
      };

      return formattedData;
    },
  });
};

export const getCourseById = (
  courses: Record<string, Course> | undefined,
  courseId: string
) => {
  if (!courses) return null;
  return courses[courseId] || null;
};

export const getCourseInstructors = (course: Course | null) => {
  if (!course) return [];

  return course.institution_users.filter(
    (user) => user.pivot.courserole_id === 1
  );
};
