import type { LearningRecord } from "$lib/types";
import type { ColDef } from "ag-grid-community";
import { cellColorForMinutes, formatDateShort, formatTimeMinutesOnly } from "$lib/components/calendar/calendarUtils";

/** View mode for labs grid (lab vs step). */
export type LabViewMode = "lab" | "step";

/** Pivoted row type for LabsGrid. */
export type LabRow = {
  studentid: string;
  totalMinutes: number;
  [lo_id: string]: string | number;
};

/** Summary row type for labs median grid (one row, median values per date). Values stored as 30-second blocks. */
export type LabMedianRow = {
  courseid: string;
  totalMinutes: number;
  [key: string]: string | number;
};

/**
 * Extract lab identifier from lo_id.
 * Labs are identified by the segment (string between '/' and '/') that starts with "book".
 * Returns the segment that starts with "book".
 * Example: "path/to/book-1/step-1" -> "book-1"
 *          "lab1/book-2/step-2" -> "book-2"
 *          "prefix/book-5/suffix" -> "book-5"
 */
export function extractLabIdentifier(loId: string): string {
  const segments = loId.split("/");

  for (const segment of segments) {
    if (segment.trim().toLowerCase().startsWith("book")) {
      return segment.trim();
    }
  }

  return loId;
}

/** Extract step name from lo_id (last path segment). e.g. "path/to/book-1/step-1" -> "step-1". */
export function extractStepName(loId: string): string {
  const segments = loId.split("/").filter((s) => s.trim().length > 0);
  return segments.length > 0 ? segments[segments.length - 1] : loId;
}

const NO_DATE_KEY = "__no_date__";

/** Extract YYYY-MM-DD from date_last_accessed (ISO string). Returns NO_DATE_KEY when null. */
function getDateFromRecord(record: LearningRecord): string {
  const d = record.date_last_accessed;
  if (!d) return NO_DATE_KEY;
  try {
    const date = new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return NO_DATE_KEY;
  }
}

/** Return distinct sorted dates from learning records (date_last_accessed). Records without date use NO_DATE_KEY. */
export function getDistinctSortedDatesFromRecords(records: LearningRecord[]): string[] {
  const validRecords = records.filter((r) => r.lo_id != null);
  if (!validRecords.length) return [];

  const dates = Array.from(new Set(validRecords.map(getDateFromRecord)));
  return dates.sort((a, b) => (a === NO_DATE_KEY ? 1 : b === NO_DATE_KEY ? -1 : a.localeCompare(b)));
}

/** Return distinct sorted lab step IDs (lo_id) from learning records, excluding null values. */
export function getDistinctLabSteps(records: LearningRecord[]): string[] {
  return Array.from(new Set(records.map((r) => r.lo_id).filter((lo_id): lo_id is string => lo_id !== null && lo_id !== undefined))).sort();
}

/** Return distinct sorted lab identifiers (aggregated from lo_id) from learning records, excluding null values. */
export function getDistinctLabs(records: LearningRecord[]): string[] {
  const labIdentifiers = Array.from(
    new Set(
      records
        .map((r) => r.lo_id)
        .filter((lo_id): lo_id is string => lo_id !== null && lo_id !== undefined)
        .map(extractLabIdentifier)
    )
  );
  return labIdentifiers;
}

/**
 * Build pivoted per-student rows for LabsGrid.
 * Each row has studentid, totalMinutes, and a column per lab or step (depending on viewMode).
 * - 'step' mode: Aggregates duration values for each (student_id, lo_id) combination.
 * - 'lab' mode: Aggregates duration values for each (student_id, lab_identifier) combination.
 */
export function buildLabsPivotedRows(records: LearningRecord[], viewMode: LabViewMode = "step"): LabRow[] {
  const validRecords = records.filter((r) => r.lo_id !== null && r.lo_id !== undefined);

  if (validRecords.length === 0) {
    return [];
  }

  const sortedRecords = [...validRecords].sort((a, b) => {
    const aLoId = a.lo_id || "";
    const bLoId = b.lo_id || "";
    return aLoId.localeCompare(bLoId);
  });

  const students = Array.from(new Set(sortedRecords.map((r) => r.student_id))).sort();

  const columns = viewMode === "lab" ? getDistinctLabs(sortedRecords) : getDistinctLabSteps(sortedRecords);

  const map = new Map<string, number>();

  for (const record of sortedRecords) {
    const columnKey = viewMode === "lab" ? extractLabIdentifier(record.lo_id!) : record.lo_id!;
    const key = `${record.student_id}\t${columnKey}`;
    const duration = record.duration ?? 0;
    map.set(key, (map.get(key) ?? 0) + duration);
  }

  return students.map((studentid) => {
    let totalMinutes = 0;
    const row: LabRow = { studentid, totalMinutes: 0 };

    for (const columnId of columns) {
      const blocks = map.get(`${studentid}\t${columnId}`) ?? 0;
      row[columnId] = blocks;
      totalMinutes += blocks;
    }

    row.totalMinutes = totalMinutes;
    return row;
  });
}

/** Header mode: "lab" = book segment, "step" = step name (last segment), "raw" = full id. */
export type LabColumnHeaderMode = "lab" | "step" | "raw";

/** Column definitions for lab columns with shared styling/formatting. */
export function buildLabColumns<T = any>(
  labIds: string[],
  headerMode: LabColumnHeaderMode | boolean = false
): ColDef<T>[] {
  const mode: LabColumnHeaderMode =
    headerMode === true ? "lab" : headerMode === false ? "raw" : headerMode;
  return labIds.map((labId) => {
    const headerName =
      mode === "lab" ? extractLabIdentifier(labId) : mode === "step" ? extractStepName(labId) : labId;
    const headerTooltip = mode === "step" && labId !== headerName ? labId : undefined;
    return {
      field: labId as any,
      headerName,
      headerTooltip,
      headerClass: "ag-header-vertical",
      valueFormatter: (p) => (p.value != null && Number(p.value) > 0 ? formatTimeMinutesOnly(Number(p.value)) : ""),
      cellClass: "ag-right-aligned-cell",
      cellStyle: (p) => ({
        backgroundColor: cellColorForMinutes(p.value as number),
        textAlign: "center",
        paddingLeft: "4px"
      }),
      width: 48,
      maxWidth: 72
    };
  }) as ColDef<T>[];
}

/** Column definition for a totalMinutes column with common styling and colouring. */
export function buildTotalMinutesColumn<T = any>(field: string = "totalMinutes", headerName = "Total"): ColDef<T> {
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

/**
 * Toggle helper for lab view mode.
 * Components should use: `labViewMode = toggleLabViewMode(labViewMode)`.
 */
export function toggleLabViewMode(current: LabViewMode): LabViewMode {
  return current === "lab" ? "step" : "lab";
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  if (n % 2 === 1) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/** Build median row for lab-by-day view: one row with median duration per date. Values in 30-second blocks. */
export function buildMedianByDay(
  records: LearningRecord[],
  courseid: string,
  dates: string[]
): LabMedianRow | null {
  const validRecords = records.filter((r) => r.lo_id != null);
  if (!validRecords.length || !dates.length) return null;

  const map = new Map<string, number>();
  for (const r of validRecords) {
    const date = getDateFromRecord(r);
    const key = `${r.student_id}\t${date}`;
    map.set(key, (map.get(key) ?? 0) + (r.duration ?? 0));
  }

  const students = Array.from(new Set(validRecords.map((r) => r.student_id))).sort();

  const row: LabMedianRow = { courseid, totalMinutes: 0 };
  for (const date of dates) {
    const values = students.map((s) => map.get(`${s}\t${date}`) ?? 0).filter((v) => v > 0);
    row[date] = median(values);
  }

  const totalsByStudent = students.map((s) => {
    let sum = 0;
    for (const date of dates) {
      sum += map.get(`${s}\t${date}`) ?? 0;
    }
    return sum;
  });
  row.totalMinutes = median(totalsByStudent);
  return row;
}

/** Build median row for lab-by-step view: one row with median duration per step. Values in 30-second blocks. */
export function buildMedianByStep(
  records: LearningRecord[],
  courseid: string,
  steps: string[]
): LabMedianRow | null {
  const validRecords = records.filter((r) => r.lo_id != null);
  if (!validRecords.length || !steps.length) return null;

  const pivotedRows = buildLabsPivotedRows(validRecords, "step");
  const row: LabMedianRow = { courseid, totalMinutes: 0 };

  for (const stepId of steps) {
    const values = pivotedRows.map((r) => (r[stepId] as number) ?? 0).filter((v) => v > 0);
    row[stepId] = median(values);
  }

  const studentTotals = pivotedRows.map((r) => r.totalMinutes);
  row.totalMinutes = median(studentTotals);
  return row;
}

/** Column definitions for date columns in labs median-by-day view. */
export function buildDateColumnsForLabs<T = any>(dates: string[]): ColDef<T>[] {
  return dates.map((d) => ({
    field: d as any,
    headerName: d === NO_DATE_KEY ? "No date" : formatDateShort(d),
    headerClass: "ag-header-vertical",
    valueFormatter: (p) =>
      p.value != null && Number(p.value) > 0 ? formatTimeMinutesOnly(Number(p.value)) : "",
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
