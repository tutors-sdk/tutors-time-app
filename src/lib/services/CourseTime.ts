import type {
  CourseCalendar,
  LearningRecord,
  CalendarEntry,
  CalendarEntryBase,
  StudentCalendar
} from "../types";
import { CalendarModel } from "$lib/components/calendar/CalendarModel";
import { filterByDateRange } from "$lib/components/calendar/calendarUtils";
import { LabsModel } from "$lib/components/labs/LabsModel";
import { getSupabase } from "./supabase";
import type { TutorsConnectCourse, TutorsConnectUser } from "$lib/types";

export const CourseTime = {
  /** Loaded calendar data for the current course. Updated when loadCalendar is called. */
  CourseData: null as CourseCalendar | null,

  /**
   * Load calendar data for a single course and date range.
   * Stores the result in CourseData and returns it.
   */
  async loadCalendar(courseId: string, startDate: string | null, endDate: string | null): Promise<CourseCalendar> {
    const id = courseId.trim();
    if (!id) throw new Error("Course ID is required");

    // const titleMap = await CourseTime.getCourseTitles([id]);
    //const title = titleMap[id] || id;
    const title = await CourseTime.getCourseTitle(id);
    console.log("title", title);

    let course: CourseCalendar;

    try {
      const rawData = await CourseTime.getCalendarData(id);
      const filteredData = filterByDateRange(rawData, startDate, endDate);

      let learningRecords: LearningRecord[] = [];
      let learningRecordsError: string | null = null;
      try {
        learningRecords = await CourseTime.getAllLearningRecordsForCourse(id);
      } catch (e) {
        learningRecordsError = e instanceof Error ? e.message : "Failed to load learning records";
      }

      course = {
        id,
        title,
        data: filteredData,
        loading: false,
        error: null,
        learningRecords,
        learningRecordsLoading: false,
        learningRecordsError,
        calendarModel: new CalendarModel(filteredData, false, null),
        labsModel: new LabsModel(learningRecords, false, learningRecordsError)
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load calendar data";
      course = {
        id,
        title,
        data: [],
        loading: false,
        error: msg,
        learningRecords: [],
        learningRecordsLoading: false,
        learningRecordsError: msg,
        calendarModel: new CalendarModel([], false, msg),
        labsModel: new LabsModel([], false, msg)
      };
    }

    CourseTime.CourseData = course;
    return course;
  },

  /**
   * Load calendar data for a single student within a course and date range.
   * Does not mutate CourseData; returns a StudentCalendar instance.
   */
  async loadStudentCalendar(
    courseId: string,
    studentId: string,
    startDate: string | null,
    endDate: string | null
  ): Promise<StudentCalendar> {
    const id = courseId.trim();
    const sid = studentId.trim();

    if (!id) throw new Error("Course ID is required");
    if (!sid) throw new Error("Student ID is required");

    const title = await CourseTime.getCourseTitle(id);

    let result: StudentCalendar;

    try {
      const rawData = await CourseTime.getCalendarData(id);
      const filteredByDate = filterByDateRange(rawData, startDate, endDate);

      // All course dates in range (used to keep columns aligned with course-level view)
      const allDates = Array.from(new Set(filteredByDate.map((e) => e.id))).sort();

      // Actual entries for this student
      const studentEntries = filteredByDate.filter((entry) => entry.studentid === sid);

      // Pad missing dates for this student with zero-duration entries
      const displayName =
        studentEntries[0]?.full_name != null && studentEntries[0].full_name.trim().length > 0
          ? studentEntries[0].full_name
          : sid;

      const paddedEntries: CalendarEntry[] = [...studentEntries];

      for (const date of allDates) {
        const hasEntry = studentEntries.some((entry) => entry.id === date);
        if (!hasEntry) {
          paddedEntries.push({
            id: date,
            studentid: sid,
            courseid: id,
            timeactive: 0,
            pageloads: 0,
            full_name: displayName
          });
        }
      }

      // Load all lab learning records for this course.
      // We keep the full set so LabsGrid can show all lab columns,
      // but will filter rows to this student in the UI.
      let learningRecords: LearningRecord[] = [];
      let learningRecordsError: string | null = null;
      try {
        learningRecords = await CourseTime.getAllLearningRecordsForCourse(id);
      } catch (e) {
        learningRecordsError = e instanceof Error ? e.message : "Failed to load learning records";
      }

      result = {
        id,
        studentId: sid,
        title,
        data: paddedEntries,
        loading: false,
        error: null,
        calendarModel: new CalendarModel(paddedEntries, false, null),
        labsModel: new LabsModel(learningRecords, false, learningRecordsError)
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load calendar data";
      result = {
        id,
        studentId: sid,
        title,
        data: [],
        loading: false,
        error: msg,
        calendarModel: new CalendarModel([], false, msg),
        labsModel: new LabsModel([], false, msg)
      };
    }

    return result;
  },

  /**
   * Return a display title for a given course ID.
   * Uses tutors-connect-courses.course_record.title when available, otherwise falls back to the ID.
   */
  async getCourseTitle(courseId: string): Promise<string> {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("tutors-connect-courses").select("course_id, course_record").eq("course_id", courseId).maybeSingle();

    if (error || !data) {
      return courseId;
    }

    const row = data as TutorsConnectCourse;
    const id = row.course_id?.trim() || courseId;
    const title = row.course_record?.title?.trim();
    return title && title.length > 0 ? title : id;
  },

  /**
   * Retrieve learning records from the learning_records table.
   * Filters by student_id, course_id, and type (all required).
   * Returns an empty array if no records are found or on error.
   */
  async getLearningRecords(studentId: string, courseId: string, type: string): Promise<LearningRecord[]> {
    const supabase = getSupabase();
    let query = supabase.from("learning_records").select("*").eq("student_id", studentId).eq("course_id", courseId).eq("type", type);

    const { data, error } = await query;

    if (error) {
      console.error("Failed to fetch learning records:", error.message);
      return [];
    }

    return (data as LearningRecord[]) ?? [];
  },

  /**
   * Retrieve calendar data for a given course (or all courses if courseId is not provided).
   * Enriches entries with student full names from tutors-connect-users.
   * Throws an error if the database query fails.
   */
  async getCalendarData(courseId?: string): Promise<CalendarEntry[]> {
    const supabase = getSupabase();
    let query = supabase.from("calendar").select("*").order("id", { ascending: true });

    if (courseId) {
      query = query.eq("courseid", courseId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch calendar data: ${error.message}`);
    }

    const rawEntries: CalendarEntryBase[] = (data as CalendarEntryBase[]) ?? [];

    // Look up student full names by studentid (github_id in tutors-connect-users)
    const studentIds = Array.from(new Set(rawEntries.map((e) => e.studentid).filter(Boolean)));
    if (!studentIds.length) {
      // No users to look up; fall back to using studentid as full_name
      return rawEntries.map<CalendarEntry>((entry) => ({
        ...entry,
        full_name: entry.studentid
      }));
    }

    const { data: userRows, error: userError } = await supabase
      .from("tutors-connect-users")
      .select("github_id, full_name")
      .in("github_id", studentIds);

    if (userError) {
      // If lookup fails, fall back to raw student IDs
      return rawEntries.map<CalendarEntry>((entry) => ({
        ...entry,
        full_name: entry.studentid
      }));
    }

    const nameMap: Record<string, string> = {};
    for (const row of (userRows ?? []) as TutorsConnectUser[]) {
      const key = row.github_id?.trim();
      if (!key) continue;
      const displayName =
        row.full_name && row.full_name.trim().length > 0 ? row.full_name.trim() : key;
      nameMap[key] = displayName;
    }

    // Attach full_name while preserving raw studentid
    return rawEntries.map<CalendarEntry>((entry) => ({
      ...entry,
      full_name: nameMap[entry.studentid] ?? entry.studentid
    }));
  },

  /**
   * Retrieve all learning records for a given course (all students, type="lab").
   * Enriches records with student full names from tutors-connect-users.
   * Throws an error if the database query fails.
   */
  async getAllLearningRecordsForCourse(courseId: string): Promise<LearningRecord[]> {
    const supabase = getSupabase();
    let query = supabase.from("learning_records").select("*").eq("course_id", courseId).eq("type", "lab").order("date_last_accessed", { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch learning records: ${error.message}`);
    }

    let learningRecords: LearningRecord[] = (data as LearningRecord[]) ?? [];

    // Sort learning records: primary key by student_id, secondary key by lo_id
    learningRecords.sort((a, b) => {
      const aStudentId = a.student_id || "";
      const bStudentId = b.student_id || "";
      const studentCompare = aStudentId.localeCompare(bStudentId);
      if (studentCompare !== 0) {
        return studentCompare;
      }
      // If student_id is the same, sort by lo_id
      const aLoId = a.lo_id || "";
      const bLoId = b.lo_id || "";
      return aLoId.localeCompare(bLoId);
    });

    // Enrich learning records with student full names (similar to calendar entries)
    const studentIds = Array.from(new Set(learningRecords.map((r) => r.student_id).filter(Boolean)));
    if (studentIds.length > 0) {
      const { data: userRows, error: userError } = await supabase.from("tutors-connect-users").select("github_id, full_name").in("github_id", studentIds);

      if (!userError && userRows) {
        const nameMap: Record<string, string> = {};
        for (const row of userRows as TutorsConnectUser[]) {
          const key = row.github_id?.trim();
          if (!key) continue;
          const displayName = row.full_name && row.full_name.trim().length > 0 ? row.full_name.trim() : key;
          nameMap[key] = displayName;
        }

        // Replace student_id with the full name (or leave as-is if no match)
        learningRecords = learningRecords.map((record) => ({
          ...record,
          student_id: nameMap[record.student_id] ?? record.student_id
        }));
      }
    }

    return learningRecords;
  }
};
