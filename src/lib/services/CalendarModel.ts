import type { ColDef } from "ag-grid-community";
import type { CalendarEntry } from "$lib/types";
import {
  getDistinctSortedWeeks,
  getDistinctSortedDates,
  buildTotalSecondsColumn,
  selectTimeColumns,
  buildPivotedRows,
  buildSummaryRow,
  type PivotedRow,
  type SummaryRow
} from "$lib/services/calendarUtils";

/** Prepared data for the day-view calendar grid. */
export type CalendarDayView = {
  rows: PivotedRow[];
  columnDefs: ColDef<PivotedRow>[];
};

/** Prepared data for the week-view calendar grid. */
export type CalendarWeekView = {
  rows: PivotedRow[];
  columnDefs: ColDef<PivotedRow>[];
};

/** Prepared data for the summary grid (one row, day or week columns). */
export type CalendarSummaryView = {
  rowDay: SummaryRow | null;
  columnDefsDay: ColDef<SummaryRow>[];
  rowWeek: SummaryRow | null;
  columnDefsWeek: ColDef<SummaryRow>[];
};

/**
 * Calendar data prepared for CalendarByDayGrid, CalendarByWeekGrid, and CourseSummaryGrid.
 * Create an instance from raw entries and pass it to the grids.
 */
export class CalendarModel {
  readonly day: CalendarDayView;
  readonly week: CalendarWeekView;
  readonly summary: CalendarSummaryView;
  readonly loading: boolean;
  readonly error: string | null;

  constructor(entries: CalendarEntry[], loading: boolean, error: string | null) {
    this.loading = loading;
    this.error = error;

    const weeks = getDistinctSortedWeeks(entries);
    const dates = getDistinctSortedDates(entries);

    this.day = this.buildDayView(entries, weeks, dates);
    this.week = this.buildWeekView(entries, weeks, dates);
    this.summary = this.buildSummaryView(entries, weeks, dates);
  }

  private buildDayView(entries: CalendarEntry[], weeks: string[], dates: string[]): CalendarDayView {
    const rows = buildPivotedRows(entries, weeks, dates, "day");
    const timeColumns = selectTimeColumns<PivotedRow>("day", weeks, dates, true);
    const columnDefs: ColDef<PivotedRow>[] = [
      {
        field: "studentid",
        headerName: "Student ID",
        minWidth: 120,
        flex: 1,
        pinned: "left",
        cellStyle: { paddingLeft: "4px" }
      },
      buildTotalSecondsColumn<PivotedRow>("totalSeconds", "Total"),
      ...timeColumns
    ];
    return { rows, columnDefs };
  }

  private buildWeekView(entries: CalendarEntry[], weeks: string[], dates: string[]): CalendarWeekView {
    const rows = buildPivotedRows(entries, weeks, dates, "week");
    const timeColumns = selectTimeColumns<PivotedRow>("week", weeks, dates, true);
    const columnDefs: ColDef<PivotedRow>[] = [
      {
        field: "studentid",
        headerName: "Student ID",
        minWidth: 120,
        flex: 1,
        pinned: "left",
        cellStyle: { paddingLeft: "4px" }
      },
      buildTotalSecondsColumn<PivotedRow>("totalSeconds", "Total"),
      ...timeColumns
    ];
    return { rows, columnDefs };
  }

  private buildSummaryView(
    entries: CalendarEntry[],
    weeks: string[],
    dates: string[]
  ): CalendarSummaryView {
    const rowDay = buildSummaryRow(entries, weeks, dates, "day");
    const rowWeek = buildSummaryRow(entries, weeks, dates, "week");
    const timeColumnsDay = selectTimeColumns<SummaryRow>("day", weeks, dates, true);
    const timeColumnsWeek = selectTimeColumns<SummaryRow>("week", weeks, dates, true);
    const columnDefsDay: ColDef<SummaryRow>[] = [
      {
        field: "courseid",
        headerName: "Course ID",
        pinned: "left",
        minWidth: 200,
        flex: 1,
        cellStyle: { paddingLeft: "4px" }
      },
      buildTotalSecondsColumn<SummaryRow>("totalSeconds", "Total"),
      ...timeColumnsDay
    ];
    const columnDefsWeek: ColDef<SummaryRow>[] = [
      {
        field: "courseid",
        headerName: "Course ID",
        pinned: "left",
        minWidth: 200,
        flex: 1,
        cellStyle: { paddingLeft: "4px" }
      },
      buildTotalSecondsColumn<SummaryRow>("totalSeconds", "Total"),
      ...timeColumnsWeek
    ];
    return { rowDay, columnDefsDay, rowWeek, columnDefsWeek };
  }

  get hasData(): boolean {
    return this.day.rows.length > 0;
  }

  get hasSummary(): boolean {
    return this.summary.rowDay != null || this.summary.rowWeek != null;
  }
}
