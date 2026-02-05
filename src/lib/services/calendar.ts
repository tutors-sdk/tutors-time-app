import { getSupabase } from "./supabase";
import type { CalendarEntry, TutorsConnectCourse, TutorsConnectUser, CourseCalendar } from "../types";

export async function getCalendarData(courseid?: string): Promise<CalendarEntry[]> {
  const supabase = getSupabase();
  let query = supabase.from("calendar").select("*").order("id", { ascending: true });

  if (courseid) {
    query = query.eq("courseid", courseid);
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

  const { data: userRows, error: userError } = await supabase
    .from("tutors-connect-users")
    .select("github_id, full_name")
    .in("github_id", studentIds);

  if (userError) {
    // If lookup fails, fall back to raw student IDs
    return entries;
  }

  const nameMap: Record<string, string> = {};
  for (const row of (userRows ?? []) as TutorsConnectUser[]) {
    const key = row.github_id?.trim();
    if (!key) continue;
    const displayName =
      row.full_name && row.full_name.trim().length > 0 ? row.full_name.trim() : key;
    nameMap[key] = displayName;
  }

  // Replace studentid with the full name (or leave as-is if no match)
  return entries.map((entry) => ({
    ...entry,
    studentid: nameMap[entry.studentid] ?? entry.studentid,
  }));
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

/**
 * Lookup course titles from tutors-connect-courses table.
 * Returns a map from course_id -> title (or course_id if title not found).
 */
async function getCourseTitles(courseIds: string[]): Promise<Record<string, string>> {
  const uniqueIds = Array.from(new Set(courseIds.map((id) => id.trim()).filter(Boolean)));
  if (!uniqueIds.length) {
    return {};
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tutors-connect-courses")
    .select("course_id, course_record")
    .in("course_id", uniqueIds);

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
}

/** Load calendar data for multiple courses with date filtering. */
export async function loadCalendarDataForCourses(courseIds: string[], startDate: string | null, endDate: string | null): Promise<CourseCalendar[]> {
  const uniqueIds = Array.from(new Set(courseIds.map((id) => id.trim()).filter(Boolean)));

  if (uniqueIds.length === 0) {
    throw new Error("At least one course ID is required");
  }

  // Lookup course titles from tutors-connect-courses table
  const titleMap = await getCourseTitles(uniqueIds);

  // Initialize per-course state with titles
  const courses: CourseCalendar[] = uniqueIds.map((id) => ({
    id,
    title: titleMap[id] || id, // Use title or fallback to id
    data: [],
    loading: true,
    error: null
  }));

  // Load data for each course
  const results = await Promise.allSettled(
    uniqueIds.map(async (id) => {
      try {
        const rawData = await getCalendarData(id);
        const filteredData = filterByDateRange(rawData, startDate, endDate);
        return { id, data: filteredData, error: null };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load calendar data";
        return { id, data: [], error: msg };
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
        error: result.value.error
      };
    } else {
      return {
        ...course,
        loading: false,
        error: result.reason?.message || "Failed to load calendar data"
      };
    }
  });
}
