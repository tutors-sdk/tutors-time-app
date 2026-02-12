import { CourseTime } from "./CourseTime";

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
  }
};
