export interface Institution {
  id: number;
  first_name: string;
  last_name: string;
  institution_id: number;
  institutionrole_id: number;
  enroll_status: string;
  institution: {
    id: number;
    name: string; // Institution name
  };
  institution_role: {
    id: number;
    name: string; // Role name
  };
}
