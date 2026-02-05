import type { CourseCalendar } from "../types";
import { loadCalendarDataForCourses } from "./calendar";
import { getSupabase } from "./supabase";
import type { TutorsConnectCourse } from "$lib/types";

/**
 * Lookup course titles from tutors-connect-courses for a single course ID.
 * Falls back to the raw courseId if no title can be found.
 */
async function lookupCourseTitle(courseId: string): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tutors-connect-courses")
    .select("course_id, course_record")
    .eq("course_id", courseId)
    .maybeSingle();

  if (error || !data) {
    return courseId;
  }

  const row = data as TutorsConnectCourse;
  const id = row.course_id?.trim() || courseId;
  const title = row.course_record?.title?.trim();
  return title && title.length > 0 ? title : id;
}

export const TutorsStore = {
  /**
   * Load calendar data for one or more courses and a date range.
   * Delegates to the existing calendar service and returns the CourseCalendar[]
   * shape expected by the grids.
   */
  async loadCalendar(
    courseIds: string[],
    startDate: string | null,
    endDate: string | null
  ): Promise<CourseCalendar[]> {
    return loadCalendarDataForCourses(courseIds, startDate, endDate);
  },

  /**
   * Return a display title for a given course ID.
   * Uses tutors-connect-courses.course_record.title when available, otherwise falls back to the ID.
   */
  async getCourseTitle(courseId: string): Promise<string> {
    return lookupCourseTitle(courseId);
  }
};

