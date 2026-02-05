export interface CalendarEntry {
  id: string; // DATE as string (YYYY-MM-DD format)
  studentid: string;
  courseid: string;
  timeactive: number; // BIGINT
  pageloads: number; // BIGINT
}

// Supabase `tutors-connect-courses` table model
export interface TutorsConnectCourse {
  course_id: string; // text (primary key)
  visited_at: string | null; // timestamptz
  visit_count: number | null; // int8 / bigint
  course_record: {
    title?: string;
    [key: string]: any; // Allow other fields in JSON
  } | null; // json
}

// Supabase `tutors-connect-users` table model
export interface TutorsConnectUser {
  github_id: string; // text, primary key
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  online_status: string | null;
  date_last_accessed: string | null; // timestamptz (ISO string)
}

// Aggregated per-course calendar view used by the grids
export type CourseCalendar = {
  id: string; // original course ID
  title: string; // display title (usually from tutors-connect-courses)
  data: CalendarEntry[];
  loading: boolean;
  error: string | null;
};


