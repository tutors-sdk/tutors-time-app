import type { CourseCalendar, LearningRecord, CalendarEntry } from "../types";
import { filterByDateRange } from "./calendarUtils";
import { getSupabase } from "./supabase";
import type { TutorsConnectCourse, TutorsConnectUser } from "$lib/types";

export const CourseTime = {
  /** Loaded calendar data for the current course. Updated when loadCalendar is called. */
  CourseData: null as CourseCalendar | null,

  /**
   * Load calendar data for a single course and date range.
   * Stores the result in CourseData and returns it.
   */
  async loadCalendar(
    courseId: string,
    startDate: string | null,
    endDate: string | null
  ): Promise<CourseCalendar> {
    const course = await CourseTime.loadCalendarDataForCourse(courseId, startDate, endDate);
    CourseTime.CourseData = course;
    return course;
  },

  /**
   * Load calendar data for a single course with optional date filtering.
   * Does not update CourseData; use loadCalendar for that.
   */
  async loadCalendarDataForCourse(
    courseId: string,
    startDate: string | null,
    endDate: string | null
  ): Promise<CourseCalendar> {
    const id = courseId.trim();
    if (!id) throw new Error("Course ID is required");

    const titleMap = await CourseTime.getCourseTitles([id]);
    const title = titleMap[id] || id;

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

      return {
        id,
        title,
        data: filteredData,
        loading: false,
        error: null,
        learningRecords,
        learningRecordsLoading: false,
        learningRecordsError
      };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load calendar data";
      return {
        id,
        title,
        data: [],
        loading: false,
        error: msg,
        learningRecords: [],
        learningRecordsLoading: false,
        learningRecordsError: msg
      };
    }
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

    const entries: CalendarEntry[] = (data as CalendarEntry[]) ?? [];

    // Look up student full names by studentid (github_id in tutors-connect-users)
    const studentIds = Array.from(new Set(entries.map((e) => e.studentid).filter(Boolean)));
    if (!studentIds.length) {
      return entries;
    }

    const { data: userRows, error: userError } = await supabase.from("tutors-connect-users").select("github_id, full_name").in("github_id", studentIds);

    if (userError) {
      // If lookup fails, fall back to raw student IDs
      return entries;
    }

    const nameMap: Record<string, string> = {};
    for (const row of (userRows ?? []) as TutorsConnectUser[]) {
      const key = row.github_id?.trim();
      if (!key) continue;
      const displayName = row.full_name && row.full_name.trim().length > 0 ? row.full_name.trim() : key;
      nameMap[key] = displayName;
    }

    // Replace studentid with the full name (or leave as-is if no match)
    return entries.map((entry) => ({
      ...entry,
      studentid: nameMap[entry.studentid] ?? entry.studentid
    }));
  },

  /**
   * Lookup course titles from tutors-connect-courses table.
   * Returns a map from course_id -> title (or course_id if title not found).
   */
  async getCourseTitles(courseIds: string[]): Promise<Record<string, string>> {
    const uniqueIds = Array.from(new Set(courseIds.map((id) => id.trim()).filter(Boolean)));
    if (!uniqueIds.length) {
      return {};
    }

    const supabase = getSupabase();
    const { data, error } = await supabase.from("tutors-connect-courses").select("course_id, course_record").in("course_id", uniqueIds);

    if (error) {
      // On error, fall back to using course IDs as titles
      return {};
    }

    const titleMap: Record<string, string> = {};
    for (const row of (data ?? []) as TutorsConnectCourse[]) {
      const courseId = row.course_id?.trim();
      if (!courseId) continue;

      // Extract title from course_record JSON, fallback to course_id
      const title = row.course_record?.title?.trim() || courseId;
      titleMap[courseId] = title;
    }

    // Ensure all requested IDs have at least a fallback
    for (const id of uniqueIds) {
      if (!titleMap[id]) {
        titleMap[id] = id;
      }
    }

    return titleMap;
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
