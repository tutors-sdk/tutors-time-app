import type { ColDef } from "ag-grid-community";
import type { CalendarEntry } from "$lib/types";
import {
  getDistinctSortedWeeks,
  getDistinctSortedDates,
  buildTotalSecondsColumn,
  selectTimeColumns,
  buildPivotedRows,
  buildMedianByDay,
  buildMedianByWeek,
  type CalendarRow,
  type CalendarMedianRow
} from "./calendarUtils";

/** Prepared data for the day/week calendar grid (pivoted rows with time columns). */
export type CalendarTable = {
  rows: CalendarRow[];
  columnDefs: ColDef<CalendarRow>[];
};

/** Prepared data for the median grid (one row with medians per date or week). */
export type CalendarMedianTable = {
  row: CalendarMedianRow | null;
  columnDefs: ColDef<CalendarMedianRow>[];
};

/**
 * Calendar data prepared for CalendarGrid and CalendarMedianGrid.
 * Create an instance from raw entries and pass it to the grids.
 */
export class CalendarModel {
  readonly day: CalendarTable;
  readonly week: CalendarTable;
  readonly medianByDay: CalendarMedianTable;
  readonly medianByWeek: CalendarMedianTable;
  readonly loading: boolean;
  readonly error: string | null;

  constructor(entries: CalendarEntry[], loading: boolean, error: string | null) {
    this.loading = loading;
    this.error = error;

    const weeks = getDistinctSortedWeeks(entries);
    const dates = getDistinctSortedDates(entries);

    this.day = this.buildDayView(entries, weeks, dates);
    this.week = this.buildWeekView(entries, weeks, dates);
    this.medianByDay = this.buildMedianByDayView(entries, dates);
    this.medianByWeek = this.buildMedianByWeekView(entries, weeks, dates);
  }

  private buildDayView(entries: CalendarEntry[], weeks: string[], dates: string[]): CalendarTable {
    const rows = buildPivotedRows(entries, weeks, dates, "day");
    const timeColumns = selectTimeColumns<CalendarRow>("day", weeks, dates, true);
    const columnDefs: ColDef<CalendarRow>[] = [
      {
        field: "full_name",
        headerName: "Student",
        minWidth: 160,
        flex: 1,
        pinned: "left",
        cellStyle: { paddingLeft: "4px" }
      },
      {
        field: "studentid",
        headerName: "Student ID",
        minWidth: 120,
        pinned: "left",
        cellStyle: { paddingLeft: "4px" },
        cellRenderer: (params) => {
          const studentId = String(params.value ?? "");
          const courseId = String((params.data as any)?.courseid ?? "");
          if (!studentId || !courseId) return studentId;
          const href = `/${courseId}/${studentId}`;
          return `<a href="${href}" class="underline text-primary-600">${studentId}</a>`;
        }
      },
      buildTotalSecondsColumn<CalendarRow>("totalSeconds", "Total"),
      ...timeColumns
    ];
    return { rows, columnDefs };
  }

  private buildWeekView(entries: CalendarEntry[], weeks: string[], dates: string[]): CalendarTable {
    const rows = buildPivotedRows(entries, weeks, dates, "week");
    const timeColumns = selectTimeColumns<CalendarRow>("week", weeks, dates, true);
    const columnDefs: ColDef<CalendarRow>[] = [
      {
        field: "full_name",
        headerName: "Student",
        minWidth: 160,
        flex: 1,
        pinned: "left",
        cellStyle: { paddingLeft: "4px" }
      },
      {
        field: "studentid",
        headerName: "Student ID",
        minWidth: 120,
        pinned: "left",
        cellStyle: { paddingLeft: "4px" },
        cellRenderer: (params) => {
          const studentId = String(params.value ?? "");
          const courseId = String((params.data as any)?.courseid ?? "");
          if (!studentId || !courseId) return studentId;
          const href = `/${courseId}/${studentId}`;
          return `<a href="${href}" class="underline text-primary-600">${studentId}</a>`;
        }
      },
      buildTotalSecondsColumn<CalendarRow>("totalSeconds", "Total"),
      ...timeColumns
    ];
    return { rows, columnDefs };
  }

  get hasData(): boolean {
    return this.day.rows.length > 0;
  }

  get hasMedianByDay(): boolean {
    return this.medianByDay.row != null;
  }

  get hasMedianByWeek(): boolean {
    return this.medianByWeek.row != null;
  }

  private buildMedianByDayView(entries: CalendarEntry[], dates: string[]): CalendarMedianTable {
    const courseid = entries.length > 0 ? entries[0].courseid : "";
    const row = buildMedianByDay(entries, courseid, dates);
    const timeColumnsDay = selectTimeColumns<CalendarMedianRow>("day", [], dates, true);
    const columnDefs: ColDef<CalendarMedianRow>[] = [
      buildTotalSecondsColumn<CalendarMedianRow>("totalSeconds", "Total"),
      ...timeColumnsDay
    ];
    return { row, columnDefs };
  }

  private buildMedianByWeekView(
    entries: CalendarEntry[],
    weeks: string[],
    dates: string[]
  ): CalendarMedianTable {
    const courseid = entries.length > 0 ? entries[0].courseid : "";
    const medianByDayRow = this.medianByDay.row;
    const row = buildMedianByWeek(medianByDayRow, courseid, weeks, dates);
    const timeColumnsWeek = selectTimeColumns<CalendarMedianRow>("week", weeks, dates, true);
    const columnDefs: ColDef<CalendarMedianRow>[] = [
      buildTotalSecondsColumn<CalendarMedianRow>("totalSeconds", "Total"),
      ...timeColumnsWeek
    ];
    return { row, columnDefs };
  }
}
