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
