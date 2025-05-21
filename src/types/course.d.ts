export interface Course {
  id: number;
  si_no?: number;
  name: string; // Course name
  code?: string; // Course code
  academic_year?: string; // Academic year
  academic_semester?: string; // Even or Odd
  usersubgroup?: {
    id: number;
    start_date: string; // Sem start date
    end_date: string; // Sem end date
    usergroup: {
      id: number;
      name: string; // Branch name
      affiliated_university: string; // University name
    };
  };
  institution_users?: CourseUser[];
}
