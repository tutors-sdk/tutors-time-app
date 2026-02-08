import { getSupabase } from "./supabase";
import type { CalendarEntry, CourseCalendar, LearningRecord } from "../types";

/**
 * @deprecated Use TutorsStore.getCalendarData instead.
 * This function is kept for backward compatibility but delegates to TutorsStore.
 */
export async function getCalendarData(courseid?: string): Promise<CalendarEntry[]> {
  // Import TutorsStore here to avoid circular dependency at module level
  const { TutorsStore } = await import("./TutorsStore");
  return TutorsStore.getCalendarData(courseid);
}

/** Filter calendar entries by date range. */
export function filterByDateRange(entries: CalendarEntry[], startDate: string | null, endDate: string | null): CalendarEntry[] {
  if (!startDate && !endDate) {
    return entries;
  }

  return entries.filter((entry) => {
    const entryDate = entry.id;
    if (startDate && entryDate < startDate) {
      return false;
    }
    if (endDate && entryDate > endDate) {
      return false;
    }
    return true;
  });
}


/** Load calendar data for a single course with optional date filtering. */
export async function loadCalendarDataForCourse(
  courseId: string,
  startDate: string | null,
  endDate: string | null
): Promise<CourseCalendar> {
  const id = courseId.trim();
  if (!id) {
    throw new Error("Course ID is required");
  }

  const { TutorsStore } = await import("./TutorsStore");
  const titleMap = await TutorsStore.getCourseTitles([id]);
  const title = titleMap[id] || id;

  try {
    const rawData = await TutorsStore.getCalendarData(id);
    const filteredData = filterByDateRange(rawData, startDate, endDate);

    let learningRecords: LearningRecord[] = [];
    let learningRecordsError: string | null = null;
    try {
      learningRecords = await TutorsStore.getAllLearningRecordsForCourse(id);
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
}
