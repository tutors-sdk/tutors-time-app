import type { CalendarEntry } from "$lib/types";
import type { ColDef } from "ag-grid-community";

// Shared view mode type for calendar grids.
export type ViewMode = "week" | "day";

// Shared row types so grids can reuse aggregation helpers.
export type CalendarRow = {
  courseid: string;
  studentid: string;
  full_name: string;
  totalSeconds: number;
  [key: string]: string | number;
};
export type CalendarMedianRow = { courseid: string; totalSeconds: number; [key: string]: string | number };

/** Filter calendar entries by date range (inclusive). */
export function filterByDateRange(entries: CalendarEntry[], startDate: string | null, endDate: string | null): CalendarEntry[] {
  if (!startDate && !endDate) return entries;
  return entries.filter((entry) => {
    const entryDate = entry.id;
    if (startDate && entryDate < startDate) return false;
    if (endDate && entryDate > endDate) return false;
    return true;
  });
}

/** Return distinct sorted dates (ids) from calendar entries. */
export function getDistinctSortedDates(entries: CalendarEntry[]): string[] {
  return Array.from(new Set(entries.map((e) => e.id))).sort();
}

/** Compute the median of a list of numbers. Returns 0 for empty input. */
function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  if (n % 2 === 1) {
    return sorted[mid];
  }
  const lower = sorted[mid - 1];
  const upper = sorted[mid];
  return Math.round((lower + upper) / 2);
}

/**
 * Get the median duration (timeactive) for all entries on a specific date.
 * @param entries Array of calendar entries
 * @param date Date string in YYYY-MM-DD format
 * @returns Median duration in 30-second blocks, or 0 if no entries for that date
 */
export function getMedianForDate(entries: CalendarEntry[], date: string): number {
  const entriesForDate = entries.filter((entry) => entry.id === date);
  if (entriesForDate.length === 0) {
    return 0;
  }
  const durations = entriesForDate.map((entry) => entry.timeactive ?? 0);
  return median(durations);
}

/** Compressed date for column headers to minimize width (e.g. "3/2/25" for 3 Feb 2025). */
export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString + "T12:00:00");
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = String(date.getFullYear() % 100).padStart(2, "0");
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/** Time to nearest minute only (e.g. "1h 30", "45").
 *  NOTE: input is a count of 30-second blocks, not raw seconds.
 */
export function formatTimeNearestMinute(blocks: number): string {
  const totalMinutes = Math.round((blocks * 30) / 60); // 30-second blocks -> minutes
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}`;
  }
  return `${minutes}`;
}

/** Time in minutes only, no hours (e.g. "90", "45").
 *  NOTE: input is a count of 30-second blocks, not raw seconds.
 */
export function formatTimeMinutesOnly(blocks: number): string {
  const totalMinutes = Math.round((blocks * 30) / 60); // 30-second blocks -> minutes
  return `${totalMinutes}`;
}

/** Background colour by minutes: 0 = white, 1 = light green, 1–200 = deeper green, 200–400 = light red, 400–800 = deep red.
 *  NOTE: input is a count of 30-second blocks, not raw seconds.
 */
export function cellColorForMinutes(blocks: number | null | undefined): string {
  const minutes = blocks != null ? (Number(blocks) * 30) / 60 : 0; // 30-second blocks -> minutes
  const white = { r: 255, g: 255, b: 255 };
  const lightGreen = { r: 200, g: 255, b: 200 };
  const deepGreen = { r: 0, g: 120, b: 0 };
  const lightRed = { r: 255, g: 180, b: 180 }; // Lighter red for 200-400 range
  const deepRed = { r: 180, g: 0, b: 0 }; // Deeper red for 400-800 range
  let r: number;
  let g: number;
  let b: number;
  if (minutes <= 0) {
    r = white.r;
    g = white.g;
    b = white.b;
  } else if (minutes <= 1) {
    // Transition from white to light green (0-1 minutes)
    const t = minutes;
    r = Math.round(white.r + t * (lightGreen.r - white.r));
    g = Math.round(white.g + t * (lightGreen.g - white.g));
    b = Math.round(white.b + t * (lightGreen.b - white.b));
  } else if (minutes <= 200) {
    // Transition from light green to deep green (1-200 minutes)
    const t = (minutes - 1) / 199;
    r = Math.round(lightGreen.r + t * (deepGreen.r - lightGreen.r));
    g = Math.round(lightGreen.g + t * (deepGreen.g - lightGreen.g));
    b = Math.round(lightGreen.b + t * (deepGreen.b - lightGreen.b));
  } else if (minutes <= 400) {
    // Transition from deep green to light red (200-400 minutes)
    const t = (minutes - 200) / 200;
    r = Math.round(deepGreen.r + t * (lightRed.r - deepGreen.r));
    g = Math.round(deepGreen.g + t * (lightRed.g - deepGreen.g));
    b = Math.round(deepGreen.b + t * (lightRed.b - deepGreen.b));
  } else {
    // Transition from light red to deep red (400-800 minutes)
    const t = Math.min(1, (minutes - 400) / 400);
    r = Math.round(lightRed.r + t * (deepRed.r - lightRed.r));
    g = Math.round(lightRed.g + t * (deepRed.g - lightRed.g));
    b = Math.round(lightRed.b + t * (deepRed.b - lightRed.b));
  }
  return `rgb(${r}, ${g}, ${b})`;
}

/** Column definition for a totalSeconds column with common styling and colouring. */
export function buildTotalSecondsColumn<T = any>(field: string = "totalSeconds", headerName = "Total"): ColDef<T> {
  return {
    field: field as any,
    headerName,
    headerClass: "ag-header-vertical",
    sort: "desc",
    valueFormatter: (p) =>
      p.value != null && Number(p.value) > 0
        ? String(Math.round((Number(p.value) * 30) / 60)) // 30-second blocks -> minutes
        : "",
    cellClass: "ag-right-aligned-cell",
    cellStyle: (p) => ({
      backgroundColor: cellColorForMinutes(p.value as number),
      paddingLeft: "4px"
    }),
    width: 60,
    maxWidth: 72
  };
}

/** Column definitions for per‑date time columns with shared styling/formatting. */
export function buildPerDateTimeColumns<T = any>(dates: string[]): ColDef<T>[] {
  return dates.map((d) => ({
    field: d as any,
    headerName: formatDateShort(d),
    headerClass: "ag-header-vertical",
    valueFormatter: (p) =>
      p.value != null ? formatTimeNearestMinute(Number(p.value)) : "",
    cellClass: "ag-right-aligned-cell",
    cellStyle: (p) => ({
      backgroundColor: cellColorForMinutes(p.value as number),
      textAlign: "center",
      paddingLeft: "4px"
    }),
    width: 48,
    maxWidth: 72
  })) as ColDef<T>[];
}

/** Column definitions for per‑date time columns showing minutes only (for summary views). */
export function buildPerDateTimeColumnsMinutesOnly<T = any>(dates: string[]): ColDef<T>[] {
  return dates.map((d) => ({
    field: d as any,
    headerName: formatDateShort(d),
    headerClass: "ag-header-vertical",
    valueFormatter: (p) =>
      p.value != null ? formatTimeMinutesOnly(Number(p.value)) : "",
    cellClass: "ag-right-aligned-cell",
    cellStyle: (p) => ({
      backgroundColor: cellColorForMinutes(p.value as number),
      textAlign: "center",
      paddingLeft: "4px"
    }),
    width: 48,
    maxWidth: 72
  })) as ColDef<T>[];
}

/** Get the Monday date (YYYY-MM-DD) for the week containing the given date. */
export function getMondayForDate(dateString: string): string {
  try {
    const date = new Date(dateString + "T12:00:00");
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to 6 days back
    const monday = new Date(date);
    monday.setDate(date.getDate() - daysToMonday);
    // Format back to YYYY-MM-DD
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, "0");
    const day = String(monday.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } catch {
    return dateString; // Fallback to original if parsing fails
  }
}

/** Return distinct sorted Monday dates (week identifiers) from calendar entries. */
export function getDistinctSortedWeeks(entries: CalendarEntry[]): string[] {
  const mondayDates = entries.map((e) => getMondayForDate(e.id));
  return Array.from(new Set(mondayDates)).sort();
}

/** Column definitions for per‑week time columns with shared styling/formatting. */
export function buildPerWeekTimeColumns<T = any>(weeks: string[]): ColDef<T>[] {
  return weeks.map((weekMonday) => ({
    field: weekMonday as any,
    headerName: formatDateShort(weekMonday),
    headerClass: "ag-header-vertical",
    valueFormatter: (p) =>
      p.value != null ? formatTimeNearestMinute(Number(p.value)) : "",
    cellClass: "ag-right-aligned-cell",
    cellStyle: (p) => ({
      backgroundColor: cellColorForMinutes(p.value as number),
      textAlign: "center",
      paddingLeft: "4px"
    }),
    width: 48,
    maxWidth: 72
  })) as ColDef<T>[];
}

/** Column definitions for per‑week time columns showing minutes only (for summary views). */
export function buildPerWeekTimeColumnsMinutesOnly<T = any>(weeks: string[]): ColDef<T>[] {
  return weeks.map((weekMonday) => ({
    field: weekMonday as any,
    headerName: formatDateShort(weekMonday),
    headerClass: "ag-header-vertical",
    valueFormatter: (p) =>
      p.value != null ? formatTimeMinutesOnly(Number(p.value)) : "",
    cellClass: "ag-right-aligned-cell",
    cellStyle: (p) => ({
      backgroundColor: cellColorForMinutes(p.value as number),
      textAlign: "center",
      paddingLeft: "4px"
    }),
    width: 48,
    maxWidth: 72
  })) as ColDef<T>[];
}

/**
 * Build pivoted per-student rows for CalendarGrid, based on viewMode.
 * Each row has studentid, totalSeconds, and a column per week or date.
 */
export function buildPivotedRows(entries: CalendarEntry[], weeks: string[], dates: string[], viewMode: ViewMode): CalendarRow[] {
  const students = Array.from(new Set(entries.map((e) => e.studentid))).sort();
  const courseId = entries.length > 0 ? entries[0].courseid : "";
  const nameMap = new Map<string, string>();

  for (const e of entries) {
    if (!nameMap.has(e.studentid)) {
      nameMap.set(e.studentid, e.full_name ?? e.studentid);
    }
  }

  const map = new Map<string, number>();

  if (viewMode === "week") {
    for (const e of entries) {
      const weekMonday = getMondayForDate(e.id);
      const key = `${e.studentid}\t${weekMonday}`;
      map.set(key, (map.get(key) ?? 0) + e.timeactive);
    }
    return students.map((studentid) => {
      let totalSeconds = 0;
      const row: CalendarRow = {
        courseid: courseId,
        studentid,
        full_name: nameMap.get(studentid) ?? studentid,
        totalSeconds: 0
      };
      for (const weekMonday of weeks) {
        const secs = map.get(`${studentid}\t${weekMonday}`) ?? 0;
        row[weekMonday] = secs;
        totalSeconds += secs;
      }
      row.totalSeconds = totalSeconds;
      return row;
    });
  } else {
    for (const e of entries) {
      const key = `${e.studentid}\t${e.id}`;
      map.set(key, (map.get(key) ?? 0) + e.timeactive);
    }
    return students.map((studentid) => {
      let totalSeconds = 0;
      const row: CalendarRow = {
        courseid: courseId,
        studentid,
        full_name: nameMap.get(studentid) ?? studentid,
        totalSeconds: 0
      };
      for (const date of dates) {
        const secs = map.get(`${studentid}\t${date}`) ?? 0;
        row[date] = secs;
        totalSeconds += secs;
      }
      row.totalSeconds = totalSeconds;
      return row;
    });
  }
}

/**
 * Build a median row for day view, calculating median duration for each date.
 * @param entries Array of calendar entries
 * @param courseid Course ID
 * @param dates Array of date strings (YYYY-MM-DD format)
 * @returns CalendarMedianRow with medians per date, or null if no entries
 */
export function buildMedianByDay(entries: CalendarEntry[], courseid: string, dates: string[]): CalendarMedianRow | null {
  if (!entries.length) return null;

  const row: CalendarMedianRow = { courseid, totalSeconds: 0 };

  // Calculate median for each date using getMedianForDate
  for (const date of dates) {
    const dateMedian = getMedianForDate(entries, date);
    row[date] = dateMedian;
  }

  // Calculate overall median (median of all per-student totals)
  const students = Array.from(new Set(entries.map((e) => e.studentid))).sort();
  const totalsByStudent = new Map<string, number>();
  for (const entry of entries) {
    const secs = entry.timeactive ?? 0;
    const current = totalsByStudent.get(entry.studentid) ?? 0;
    totalsByStudent.set(entry.studentid, current + secs);
  }
  const studentTotals = students.map((studentid) => totalsByStudent.get(studentid) ?? 0);
  row.totalSeconds = median(studentTotals);

  return row;
}

/**
 * Build a median row for week view, aggregating daily medians into weekly sums.
 * Takes the medianByDay row and groups dates by week, calculating the sum of daily medians for each week.
 * @param medianByDayRow The CalendarMedianRow from buildMedianByDay containing daily medians
 * @param courseid Course ID
 * @param weeks Array of week Monday dates (YYYY-MM-DD format)
 * @param dates Array of date strings (YYYY-MM-DD format)
 * @returns CalendarMedianRow with sums of medians per week, or null if medianByDayRow is null
 */
export function buildMedianByWeek(medianByDayRow: CalendarMedianRow | null, courseid: string, weeks: string[], dates: string[]): CalendarMedianRow | null {
  if (!medianByDayRow) return null;

  const row: CalendarMedianRow = { courseid, totalSeconds: 0 };

  // Group daily medians by week and sum them
  const sumsByWeek = new Map<string, number>();
  for (const date of dates) {
    const dateMedian = (medianByDayRow[date] as number) ?? 0;
    if (dateMedian > 0) {
      const weekMonday = getMondayForDate(date);
      const currentSum = sumsByWeek.get(weekMonday) ?? 0;
      sumsByWeek.set(weekMonday, currentSum + dateMedian);
    }
  }

  // Calculate sum for each week (sum of all daily medians in that week)
  const allWeekSums: number[] = [];
  for (const weekMonday of weeks) {
    const weekSum = sumsByWeek.get(weekMonday) ?? 0;
    row[weekMonday] = weekSum;
    if (weekSum > 0) {
      allWeekSums.push(weekSum);
    }
  }

  // Overall total is the median of all week sums
  row.totalSeconds = median(allWeekSums);

  return row;
}

/**
 * Helper to select time columns (week/day, minutes or hours+minutes)
 * so that CalendarGrid and CalendarMedianGrid share the same logic.
 */
export function selectTimeColumns<T>(viewMode: ViewMode, weeks: string[], dates: string[], useMinutesOnly: boolean = false): ColDef<T>[] {
  if (viewMode === "week") {
    return useMinutesOnly ? buildPerWeekTimeColumnsMinutesOnly<T>(weeks) : buildPerWeekTimeColumns<T>(weeks);
  } else {
    return useMinutesOnly ? buildPerDateTimeColumnsMinutesOnly<T>(dates) : buildPerDateTimeColumns<T>(dates);
  }
}
