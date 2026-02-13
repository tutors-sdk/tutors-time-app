import { CourseTime } from "./CourseTime";
import type { StudentCalendar } from "../types";

const courseMap = new Map<string, CourseTime>();

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
      return {
        courseid: trimmedCourseId,
        courseTitle: trimmedCourseId,
        studentid: trimmedStudentId,
        studentName: trimmedStudentId,
        calendarByWeek: null,
        weeks: [],
        courseMedianByWeek: null,
        labsByLab: null,
        labColumns: [],
        labsMedianByLab: null,
        error: "Failed to load course data",
        hasData: false
      };
    }

    const calModel = course.calendarModel;
    const labsModel = course.labsModel;

    const studentCalRow = calModel.week.rows.find((r) => r.studentid === trimmedStudentId) ?? null;
    const studentName = studentCalRow?.full_name ?? trimmedStudentId;

    const weeks =
      calModel.week.columnDefs
        ?.map((c) => c.field as string)
        .filter((f) => f && f !== "full_name" && f !== "studentid" && f !== "totalSeconds") ?? [];

    const studentLabRow =
      labsModel.lab.rows.find((r) => r.studentid === studentName) ??
      labsModel.lab.rows.find((r) => r.studentid === trimmedStudentId) ??
      null;

    const labColumns =
      labsModel.lab.columnDefs
        ?.map((c) => c.field as string)
        .filter((f) => f && f !== "studentid" && f !== "totalMinutes") ?? [];

    const hasCalData = studentCalRow != null && calModel.hasData;
    const hasLabData = studentLabRow != null && labsModel.hasData;

    return {
      courseid: course.id,
      courseTitle: course.title,
      studentid: trimmedStudentId,
      studentName,
      calendarByWeek: studentCalRow,
      weeks,
      courseMedianByWeek: calModel.medianByWeek.row ?? null,
      labsByLab: studentLabRow,
      labColumns,
      labsMedianByLab: labsModel.medianByLab.row ?? null,
      error: course.error,
      hasData: hasCalData || hasLabData
    };
  }
};
