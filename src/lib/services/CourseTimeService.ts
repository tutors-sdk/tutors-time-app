import { CourseTime } from "./CourseTime";
import { getSupabase } from "./supabase";
import type { StudentCalendar } from "../types";
import { buildLabRowByDay, buildMedianByDay } from "$lib/components/labs/labUtils";

const courseMap = new Map<string, CourseTime>();

async function getAvatarUrl(githubId: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("tutors-connect-users")
    .select("avatar_url")
    .eq("github_id", githubId)
    .maybeSingle();
  const row = data as { avatar_url?: string | null } | null;
  return row?.avatar_url ?? null;
}

/** Fetch student display name and avatar for app bar (used when on student route). */
export async function getStudentDisplayInfo(
  studentId: string
): Promise<{ studentName: string; avatarUrl: string | null }> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("tutors-connect-users")
    .select("full_name, avatar_url")
    .eq("github_id", studentId.trim())
    .maybeSingle();
  const row = data as { full_name?: string | null; avatar_url?: string | null } | null;
  const studentName =
    row?.full_name && String(row.full_name).trim().length > 0 ? String(row.full_name).trim() : studentId.trim();
  const avatarUrl = row?.avatar_url ?? null;
  return { studentName, avatarUrl };
}

export const CourseTimeService = {
  /**
   * Load a course by ID. Returns cached CourseTime if already loaded (when no date filter),
   * otherwise creates and loads a new one.
   * Caching only applies when both startDate and endDate are null/undefined.
   */
  async loadCourse(
    id: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<CourseTime> {
    const trimmedId = id.trim();
    if (!trimmedId) throw new Error("Course ID is required");

    const useCache = (startDate == null || startDate === "") && (endDate == null || endDate === "");
    const normalizedStart = startDate && startDate.trim() ? startDate.trim() : null;
    const normalizedEnd = endDate && endDate.trim() ? endDate.trim() : null;

    if (useCache) {
      const cached = courseMap.get(trimmedId);
      if (cached) {
        return cached;
      }
    }

    const courseTime = new CourseTime();
    await courseTime.loadCalendar(trimmedId, normalizedStart, normalizedEnd);

    if (useCache) {
      courseMap.set(trimmedId, courseTime);
    }

    return courseTime;
  },

  /**
   * Load calendar data for a single student within a course.
   * Calls loadCourse to get CourseTime, then extracts student-specific data from the model.
   */
  async loadStudentCalendar(
    courseId: string,
    studentId: string,
    startDate?: string | null,
    endDate?: string | null
  ): Promise<StudentCalendar> {
    const trimmedCourseId = courseId.trim();
    const trimmedStudentId = studentId.trim();

    if (!trimmedCourseId) throw new Error("Course ID is required");
    if (!trimmedStudentId) throw new Error("Student ID is required");

    const courseTime = await this.loadCourse(trimmedCourseId, startDate ?? null, endDate ?? null);
    const course = courseTime.courseData;

    if (!course) {
      const avatarUrl = await getAvatarUrl(trimmedStudentId);
      return {
        courseid: trimmedCourseId,
        courseTitle: trimmedCourseId,
        studentid: trimmedStudentId,
        studentName: trimmedStudentId,
        avatarUrl,
        calendarByWeek: null,
        weeks: [],
        courseMedianByWeek: null,
        calendarByDay: null,
        dates: [],
        courseMedianByDay: null,
        labsByLab: null,
        labColumns: [],
        labsMedianByLab: null,
        labsByDay: null,
        labsMedianByDay: null,
        error: "Failed to load course data",
        hasData: false
      };
    }

    const calModel = course.calendarModel;
    const labsModel = course.labsModel;

    const studentCalRowWeek = calModel.week.rows.find((r) => r.studentid === trimmedStudentId) ?? null;
    const studentCalRowDay = calModel.day.rows.find((r) => r.studentid === trimmedStudentId) ?? null;
    const studentName = studentCalRowWeek?.full_name ?? trimmedStudentId;

    const weeks =
      calModel.week.columnDefs
        ?.map((c) => c.field as string)
        .filter((f) => f && f !== "full_name" && f !== "studentid" && f !== "totalSeconds") ?? [];

    const dates =
      calModel.day.columnDefs
        ?.map((c) => c.field as string)
        .filter((f) => f && f !== "full_name" && f !== "studentid" && f !== "totalSeconds") ?? [];

    const studentLabRow =
      labsModel.lab.rows.find((r) => r.studentid === trimmedStudentId) ??
      labsModel.lab.rows.find((r) => r.studentid === studentName) ??
      null;

    const labColumns =
      labsModel.lab.columnDefs
        ?.map((c) => c.field as string)
        .filter((f) => f && f !== "studentid" && f !== "full_name" && f !== "totalMinutes") ?? [];

    const labsByDay =
      dates.length > 0 && course.learningRecords.length > 0
        ? buildLabRowByDay(
            course.learningRecords,
            trimmedStudentId,
            dates,
            studentName
          )
        : null;

    const labsMedianByDay =
      dates.length > 0 && course.learningRecords.length > 0
        ? buildMedianByDay(course.learningRecords, course.id, dates)
        : null;

    const hasCalData = (studentCalRowWeek != null || studentCalRowDay != null) && calModel.hasData;
    const hasLabData = studentLabRow != null && labsModel.hasData;

    const avatarUrl = await getAvatarUrl(trimmedStudentId);

    return {
      courseid: course.id,
      courseTitle: course.title,
      studentid: trimmedStudentId,
      studentName,
      avatarUrl,
      calendarByWeek: studentCalRowWeek,
      weeks,
      courseMedianByWeek: calModel.medianByWeek.row ?? null,
      calendarByDay: studentCalRowDay,
      dates,
      courseMedianByDay: calModel.medianByDay.row ?? null,
      labsByLab: studentLabRow,
      labColumns,
      labsMedianByLab: labsModel.medianByLab.row ?? null,
      labsByDay,
      labsMedianByDay,
      error: course.error,
      hasData: hasCalData || hasLabData
    };
  }
};
