/** Calendar entry used by the app. Raw DB rows omit full_name (enriched at load). */
export interface CalendarEntry {
  id: string; // DATE as string (YYYY-MM-DD format)
  studentid: string; // raw student identifier (e.g. github_id)
  courseid: string;
  timeactive: number; // minutes (converted from 30-second blocks at load)
  pageloads: number; // BIGINT
  full_name: string; // display name from TutorsConnectUser (falls back to studentid when missing)
}

/** Pivoted per-student row for calendar grids (day/week view). */
export type CalendarRow = {
  courseid: string;
  studentid: string;
  full_name: string;
  totalSeconds: number;
  [key: string]: string | number;
};

/** Median row for calendar grids (one row with medians per date or week). */
export type CalendarMedianRow = { courseid: string; totalSeconds: number; [key: string]: string | number };

/** Prepared rows for the day/week calendar grid (pivoted per student). */
export type CalendarTable = {
  rows: CalendarRow[];
};

/** Prepared row for the median grid (medians per date or week). */
export type CalendarMedianTable = {
  row: CalendarMedianRow | null;
};

/** Calendar model interface for course/student views. */
export interface CalendarModel {
  readonly day: CalendarTable;
  readonly week: CalendarTable;
  readonly medianByDay: CalendarMedianTable;
  readonly medianByWeek: CalendarMedianTable;
  readonly weeks: string[];
  readonly dates: string[];
  readonly error: string | null;
}

// Supabase `tutors-connect-courses` table model
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

/** Return type of TutorsTime.getStudentDisplayInfo */
export type StudentDisplayInfo = {
  studentName: string;
  avatarUrl: string | null;
};

/** Return type of TutorsTime.getCourseDisplayInfo */
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

/** Pivoted row type for LabsGrid. */
export type LabRow = {
  studentid: string; // raw github_id (for links)
  full_name: string; // display name (from enrichment)
  totalMinutes: number;
  [lo_id: string]: string | number;
};

/** Summary row type for labs median grid (one row, median values per lab or step). */
export type LabMedianRow = {
  courseid: string;
  totalMinutes: number;
  [key: string]: string | number;
};

/** Prepared rows for the lab/step grid (pivoted per student). */
export type LabTable = {
  rows: LabRow[];
};

/** Prepared row for the labs median grid (medians per lab or step). */
export type LabMedianTable = {
  row: LabMedianRow | null;
};

/** Lab model interface for course/student views. */
export interface LabModel {
  readonly lab: LabTable;
  readonly step: LabTable;
  readonly medianByLabStep: LabMedianTable;
  readonly medianByLab: LabMedianTable;
  readonly labs: string[];
  readonly steps: string[];
  readonly courseId: string;
  readonly error: string | null;
}

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
  /** Prepared day/week/summary views for calendar grids. Initialised in loadTime. */
  calendarModel: CalendarModel;
  /** Prepared lab/step views for LabsGrid. Initialised in loadTime. */
  labsModel: LabModel;
  /** Lab median by day (from learning records). Set when dates available (e.g. in student view). */
  labsMedianByDay?: LabMedianRow | null;
  /** Week column names (from calendarModel.week). Set in student view. */
  weeks?: string[];
  /** Date column names (from calendarModel.day). Set in student view. */
  dates?: string[];
  /** Lab column names (from labsModel.labs). Set in student view. */
  labColumns?: string[];
  /** Step column names (from labsModel.steps). Set in student view. */
  stepColumns?: string[];
  /** Load time data for a course and date range. Populates instance and returns it. */
  loadTime?(
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
  /** Student's lab row (by step view) */
  labsByStep: LabRow | null;
  error: string | null;
  /** True if student has calendar or lab data */
  hasData: boolean;
};

/**
 * Abstraction for course/calendar and student display services.
 * TutorsTime is the default implementation.
 */
export interface TutorsTimeService {
  getStudentDisplayInfo(studentId: string): Promise<StudentDisplayInfo>;
  getCourseDisplayInfo(courseId: string): Promise<CourseDisplayInfo>;
  loadCourseTime(
    id: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<TutorsTimeCourse>;
  loadStudentTime(
    courseId: string,
    studentId: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<TutorsTimeStudent>;
}
