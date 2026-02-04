import type { CalendarEntry } from '$lib/types';
import type { ColDef } from 'ag-grid-community';

/** Return distinct sorted dates (ids) from calendar entries. */
export function getDistinctSortedDates(entries: CalendarEntry[]): string[] {
  return Array.from(new Set(entries.map((e) => e.id))).sort();
}

/** Compressed date for column headers to minimize width (e.g. "3/2" for 3 Feb). */
export function formatDateShort(dateString: string): string {
  try {
    const date = new Date(dateString + 'T12:00:00');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  } catch {
    return dateString;
  }
}

/** Time to nearest minute only (e.g. "1h 30", "45"). */
export function formatTimeNearestMinute(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}`;
  }
  return `${minutes}`;
}

/** Time in minutes only, no hours (e.g. "90", "45"). */
export function formatTimeMinutesOnly(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  return `${totalMinutes}`;
}

/** Background colour by minutes: 0 = white, 1 = light green, 1–200 = deeper green, 200–400 = light red, 400–800 = deep red. */
export function cellColorForMinutes(seconds: number | null | undefined): string {
  const minutes = seconds != null ? Number(seconds) / 60 : 0;
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
export function buildTotalSecondsColumn<T = any>(
  field: string = 'totalSeconds',
  headerName = 'Total'
): ColDef<T> {
  return {
    field: field as any,
    headerName,
    headerClass: 'ag-header-vertical',
    sort: 'desc',
    valueFormatter: (p) =>
      p.value != null && Number(p.value) > 0
        ? String(Math.round(Number(p.value) / 60))
        : '',
    cellClass: 'ag-right-aligned-cell',
    cellStyle: (p) => ({ backgroundColor: cellColorForMinutes(p.value as number) }),
    width: 52,
    maxWidth: 64,
  };
}

/** Column definitions for per‑date time columns with shared styling/formatting. */
export function buildPerDateTimeColumns<T = any>(dates: string[]): ColDef<T>[] {
  return dates.map((d) => ({
    field: d as any,
    headerName: formatDateShort(d),
    headerClass: 'ag-header-vertical',
    valueFormatter: (p) =>
      p.value != null && Number(p.value) > 0
        ? formatTimeNearestMinute(Number(p.value))
        : '',
    cellClass: 'ag-right-aligned-cell',
    cellStyle: (p) => ({
      backgroundColor: cellColorForMinutes(p.value as number),
      textAlign: 'center',
    }),
    width: 40,
    maxWidth: 64,
  })) as ColDef<T>[];
}

/** Get the Monday date (YYYY-MM-DD) for the week containing the given date. */
export function getMondayForDate(dateString: string): string {
  try {
    const date = new Date(dateString + 'T12:00:00');
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday (0) to 6 days back
    const monday = new Date(date);
    monday.setDate(date.getDate() - daysToMonday);
    // Format back to YYYY-MM-DD
    const year = monday.getFullYear();
    const month = String(monday.getMonth() + 1).padStart(2, '0');
    const day = String(monday.getDate()).padStart(2, '0');
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
    headerClass: 'ag-header-vertical',
    valueFormatter: (p) =>
      p.value != null && Number(p.value) > 0
        ? formatTimeNearestMinute(Number(p.value))
        : '',
    cellClass: 'ag-right-aligned-cell',
    cellStyle: (p) => ({
      backgroundColor: cellColorForMinutes(p.value as number),
      textAlign: 'center',
    }),
    width: 40,
    maxWidth: 64,
  })) as ColDef<T>[];
}

/** Column definitions for per‑week time columns showing minutes only (for summary views). */
export function buildPerWeekTimeColumnsMinutesOnly<T = any>(weeks: string[]): ColDef<T>[] {
  return weeks.map((weekMonday) => ({
    field: weekMonday as any,
    headerName: formatDateShort(weekMonday),
    headerClass: 'ag-header-vertical',
    valueFormatter: (p) =>
      p.value != null && Number(p.value) > 0
        ? formatTimeMinutesOnly(Number(p.value))
        : '',
    cellClass: 'ag-right-aligned-cell',
    cellStyle: (p) => ({
      backgroundColor: cellColorForMinutes(p.value as number),
      textAlign: 'center',
    }),
    width: 40,
    maxWidth: 64,
  })) as ColDef<T>[];
}


