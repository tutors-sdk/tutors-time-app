import type { LearningRecord } from "$lib/types";
import type { ColDef } from "ag-grid-community";
import { cellColorForMinutes, formatTimeMinutesOnly } from "./calendarUtils";

/** View mode for labs grid (lab vs step). */
export type LabViewMode = "lab" | "step";

/** Pivoted row type for LabsGrid. */
export type LabsPivotedRow = {
  studentid: string;
  totalMinutes: number;
  [lo_id: string]: string | number;
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

  return labIdentifiers.sort((a, b) => a.localeCompare(b));
}

/**
 * Build pivoted per-student rows for LabsGrid.
 * Each row has studentid, totalMinutes, and a column per lab or step (depending on viewMode).
 * - 'step' mode: Aggregates duration values for each (student_id, lo_id) combination.
 * - 'lab' mode: Aggregates duration values for each (student_id, lab_identifier) combination.
 */
export function buildLabsPivotedRows(records: LearningRecord[], viewMode: LabViewMode = "step"): LabsPivotedRow[] {
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
    const row: LabsPivotedRow = { studentid, totalMinutes: 0 };

    for (const columnId of columns) {
      const blocks = map.get(`${studentid}\t${columnId}`) ?? 0;
      row[columnId] = blocks;
      totalMinutes += blocks;
    }

    row.totalMinutes = totalMinutes;
    return row;
  });
}

/** Column definitions for lab columns with shared styling/formatting. */
export function buildLabColumns<T = any>(labIds: string[], useLabIdentifierForHeader: boolean = false): ColDef<T>[] {
  return labIds.map((labId) => ({
    field: labId as any,
    headerName: useLabIdentifierForHeader ? extractLabIdentifier(labId) : labId,
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
  })) as ColDef<T>[];
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
