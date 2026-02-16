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
// create table public."tutors-connect-courses" (
//   course_id text not null,
//   visited_at timestamptz not null default now(),
//   visit_count bigint null default 0,
//   course_record json null,
//   primary key (course_id)
// )
export interface TutorsConnectCourse {
  course_id: string;
  visited_at: string; // timestamptz not null (ISO string)
  visit_count: number | null; // bigint null
  course_record: {
    title?: string;
    /** Course image URL (displayed in AppBar when no icon) */
    img?: string | null;
    /** Course icon (Iconify): type = icon id, color = optional CSS color */
    icon?: { type: string; color?: string } | null;
    [key: string]: unknown;
  } | null; // json null
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

/** Return type of CourseTimeService.getStudentDisplayInfo */
export type StudentDisplayInfo = {
  studentName: string;
  avatarUrl: string | null;
};

/** Return type of CourseTimeService.getCourseDisplayInfo */
export type CourseDisplayInfo = {
  title: string;
  img: string | null;
  icon: { type: string; color: string | null } | null;
};

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
export type TutorsTimeCourse = {
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
  /** Lab median by day (from learning records). Set when dates available (e.g. in student view). */
  labsMedianByDay?: LabMedianRow | null;
  /** Week column names (from calendarModel.week). Set in student view. */
  weeks?: string[];
  /** Date column names (from calendarModel.day). Set in student view. */
  dates?: string[];
  /** Lab column names (from labsModel.lab). Set in student view. */
  labColumns?: string[];
  /** Load calendar data for a course and date range. Populates instance and returns it. */
  loadCalendar?(
    courseId: string,
    startDate: string | null,
    endDate: string | null,
    title: string
  ): Promise<TutorsTimeCourse>;
};


// Single-student calendar view for a given course (extracted from CourseTime)
export type TutorsTimeStudent = {
  courseid: string;
  courseTitle: string;
  studentid: string;
  studentName: string;
  /** Student avatar URL from tutors-connect-users (null if not set or fetch failed) */
  avatarUrl: string | null;
  /** Loaded course data – use course.calendarModel / course.labsModel for all median values */
  course: TutorsTimeCourse | null;
  /** Student's calendar row (by week view) */
  calendarByWeek: CalendarRow | null;
  /** Student's calendar row (by day view) */
  calendarByDay: CalendarRow | null;
  /** Student's lab row (by lab view) */
  labsByLab: LabRow | null;
  /** Student's lab row (by day) – for lab activity heatmap */
  labsByDay: LabRow | null;
  error: string | null;
  /** True if student has calendar or lab data */
  hasData: boolean;
};

/**
 * Abstraction for course/calendar and student display services.
 * CourseTimeService is the default implementation.
 */
export interface TutorsTimeService {
  getStudentDisplayInfo(studentId: string): Promise<StudentDisplayInfo>;
  getCourseDisplayInfo(courseId: string): Promise<CourseDisplayInfo>;
  loadCourseCalendar(
    id: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<TutorsTimeCourse>;
  loadStudentCalendar(
    courseId: string,
    studentId: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<TutorsTimeStudent>;
}



