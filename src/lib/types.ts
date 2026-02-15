export interface CalendarEntryBase {
  id: string; // DATE as string (YYYY-MM-DD format)
  studentid: string; // raw student identifier (e.g. github_id)
  courseid: string;
  timeactive: number; // minutes (converted from 30-second blocks at load)
  pageloads: number; // BIGINT
}

// Enriched calendar entry used by the app (includes student full name).
export interface CalendarEntry extends CalendarEntryBase {
  full_name: string; // display name from TutorsConnectUser (falls back to studentid when missing)
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

// Supabase `learning_records` table model (full_name added during enrichment)
export interface LearningRecord {
  course_id: string; // text not null
  student_id: string; // text not null (github_id, used for links)
  full_name?: string; // added during enrichment from tutors-connect-users
  lo_id: string | null; // text null
  duration: number | null; // minutes (converted from 30-second blocks at load)
  count: number | null; // bigint null
  date_last_accessed: string | null; // timestamptz null (ISO string)
  type: string | null; // text null
}

import type { CalendarModel } from "$lib/components/calendar/CalendarModel";
import type { LabsModel } from "$lib/components/labs/LabsModel";
import type { CalendarRow, CalendarMedianRow } from "$lib/components/calendar/calendarUtils";
import type { LabRow, LabMedianRow } from "$lib/components/labs/labUtils";

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
  /** Prepared lab/step views for LabsGrid. Initialised in loadCalendar. */
  labsModel: LabsModel;
};

// Single-student calendar view for a given course (extracted from CourseTime)
export type StudentCalendar = {
  courseid: string;
  courseTitle: string;
  studentid: string;
  studentName: string;
  /** Student's calendar row (by week view) */
  calendarByWeek: CalendarRow | null;
  /** Week column field names for calendar display */
  weeks: string[];
  /** Course median row (by week) */
  courseMedianByWeek: CalendarMedianRow | null;
  /** Student's calendar row (by day view) */
  calendarByDay: CalendarRow | null;
  /** Date column field names for calendar-by-day display */
  dates: string[];
  /** Course median row (by day) */
  courseMedianByDay: CalendarMedianRow | null;
  /** Student's lab row (by lab view) */
  labsByLab: LabRow | null;
  /** Lab column field names for display */
  labColumns: string[];
  /** Course median lab row */
  labsMedianByLab: LabMedianRow | null;
  /** Student's lab row (by day) – for lab activity heatmap */
  labsByDay: LabRow | null;
  /** Course median lab row (by day) – for lab median heatmap */
  labsMedianByDay: LabMedianRow | null;
  error: string | null;
  /** True if student has calendar or lab data */
  hasData: boolean;
};



