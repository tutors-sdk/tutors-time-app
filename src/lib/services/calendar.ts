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


/** Load calendar data for multiple courses with date filtering. */
export async function loadCalendarDataForCourses(courseIds: string[], startDate: string | null, endDate: string | null): Promise<CourseCalendar[]> {
  const uniqueIds = Array.from(new Set(courseIds.map((id) => id.trim()).filter(Boolean)));

  if (uniqueIds.length === 0) {
    throw new Error("At least one course ID is required");
  }

  // Lookup course titles from tutors-connect-courses table using TutorsStore
  const { TutorsStore } = await import("./TutorsStore");
  const titleMap = await TutorsStore.getCourseTitles(uniqueIds);

  // Initialize per-course state with titles
  const courses: CourseCalendar[] = uniqueIds.map((id) => ({
    id,
    title: titleMap[id] || id, // Use title or fallback to id
    data: [],
    loading: true,
    error: null,
    learningRecords: [],
    learningRecordsLoading: true,
    learningRecordsError: null
  }));

  // Load calendar data and learning records for each course
  const results = await Promise.allSettled(
    uniqueIds.map(async (id) => {
      try {
        // Use TutorsStore to fetch calendar data
        const rawData = await TutorsStore.getCalendarData(id);
        const filteredData = filterByDateRange(rawData, startDate, endDate);
        
        // Load learning records for this course using TutorsStore
        let learningRecords: LearningRecord[] = [];
        let learningRecordsError: string | null = null;
        try {
          learningRecords = await TutorsStore.getAllLearningRecordsForCourse(id);
        } catch (e) {
          learningRecordsError = e instanceof Error ? e.message : "Failed to load learning records";
        }
        
        return { 
          id, 
          data: filteredData, 
          error: null,
          learningRecords,
          learningRecordsError
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load calendar data";
        return { 
          id, 
          data: [], 
          error: msg,
          learningRecords: [],
          learningRecordsError: null
        };
      }
    })
  );

  // Update courses array with results
  return courses.map((course, index) => {
    const result = results[index];
    if (result.status === "fulfilled") {
      return {
        ...course,
        data: result.value.data,
        loading: false,
        error: result.value.error,
        learningRecords: result.value.learningRecords,
        learningRecordsLoading: false,
        learningRecordsError: result.value.learningRecordsError
      };
    } else {
      return {
        ...course,
        loading: false,
        error: result.reason?.message || "Failed to load calendar data",
        learningRecordsLoading: false,
        learningRecordsError: result.reason?.message || "Failed to load learning records"
      };
    }
  });
}
