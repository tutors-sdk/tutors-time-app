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

// Supabase `learning_records` table model
export interface LearningRecord {
  course_id: string; // text not null
  student_id: string; // text not null
  lo_id: string | null; // text null
  duration: number | null; // bigint null
  count: number | null; // bigint null
  date_last_accessed: string | null; // timestamptz null (ISO string)
  type: string | null; // text null
}

import type { CalendarModel } from "$lib/services/CalendarModel";

// Aggregated per-course calendar view used by the grids
export type CourseCalendar = {
  id: string; // original course ID
  title: string; // display title (usually from tutors-connect-courses)
  data: CalendarEntry[];
  loading: boolean;
  error: string | null;
  learningRecords: LearningRecord[];
  learningRecordsLoading: boolean;
  learningRecordsError: string | null;
  /** Prepared day/week/summary views for calendar grids. Initialised in loadCalendar. */
  calendarModel: CalendarModel;
};


