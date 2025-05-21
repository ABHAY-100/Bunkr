interface SessionData {
  course: number;
  attendance: number;
}

interface Session {
  name: string;
  id: string;
}

export interface AttendanceReport {
  courses: Record<string, CourseInfo>;
  sessions: Record<string, SessionInfo>;
  attendanceTypes: Record<string, AttendanceType>;
  studentAttendanceData: Record<string, Record<string, SessionData>>;
  attendanceDatesArray: Record<string, DateInfo>;
}

export interface AttendanceEvent {
  title: string;
  date: Date;
  sessionName: string;
  sessionKey: string;
  type: string;
  status: string;
  statusColor: string;
  courseId: string;
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
