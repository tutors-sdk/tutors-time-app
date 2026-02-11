import type { ColDef } from "ag-grid-community";
import type { LearningRecord } from "$lib/types";
import {
  getDistinctLabs,
  getDistinctLabSteps,
  buildLabsPivotedRows,
  buildLabColumns,
  buildTotalMinutesColumn,
  buildMedianByStep,
  buildMedianByLab,
  type LabRow,
  type LabMedianRow
} from "$lib/components/labs/labUtils";

/** Prepared data for the lab/step grid (one column per lab or step). */
export type LabsTable = {
  rows: LabRow[];
  columnDefs: ColDef<LabRow>[];
};

/** Prepared data for the labs median grid (one row with medians per date or step). */
export type LabsMedianTable = {
  row: LabMedianRow | null;
  columnDefs: ColDef<LabMedianRow>[];
};

/**
 * Lab data prepared for LabsGrid.
 * Filters learning records to those with a segment starting with "book", then builds lab and step views.
 */
export class LabsModel {
  readonly lab: LabsTable;
  readonly step: LabsTable;
  readonly medianByDay: LabsMedianTable;
  readonly medianByWeek: LabsMedianTable;
  readonly loading: boolean;
  readonly error: string | null;

  constructor(records: LearningRecord[], loading: boolean, error: string | null) {
    this.loading = loading;
    this.error = error;

    const filtered = this.filterAndSortRecords(records);

    this.lab = this.buildLabView(filtered);
    this.step = this.buildStepView(filtered);
    this.medianByDay = this.buildMedianByDayView(filtered);
    this.medianByWeek = this.buildMedianByWeekView(filtered);
  }

  private filterAndSortRecords(records: LearningRecord[]): LearningRecord[] {
    return [...records]
      .sort((a, b) => {
        const aId = a.lo_id ?? "";
        const bId = b.lo_id ?? "";
        return aId.localeCompare(bId);
      })
      .filter((record) => {
        if (!record.lo_id) return false;
        const segments = record.lo_id.split("/");
        return segments.some((s) => s.trim().toLowerCase().startsWith("book"));
      });
  }

  private buildLabView(records: LearningRecord[]): LabsTable {
    const labs = getDistinctLabs(records);
    const rows = buildLabsPivotedRows(records, "lab");
    const labColumns = buildLabColumns<LabRow>(labs, false);
    const columnDefs: ColDef<LabRow>[] = [
      {
        field: "studentid",
        headerName: "Student ID",
        minWidth: 120,
        flex: 1,
        pinned: "left",
        cellStyle: { paddingLeft: "4px" }
      },
      buildTotalMinutesColumn<LabRow>("totalMinutes", "Total"),
      ...labColumns
    ];
    return { rows, columnDefs };
  }

  private buildStepView(records: LearningRecord[]): LabsTable {
    const steps = getDistinctLabSteps(records);
    const rows = buildLabsPivotedRows(records, "step");
    const stepColumns = buildLabColumns<LabRow>(steps, "step");
    const columnDefs: ColDef<LabRow>[] = [
      {
        field: "studentid",
        headerName: "Student ID",
        minWidth: 120,
        flex: 1,
        pinned: "left",
        cellStyle: { paddingLeft: "4px" }
      },
      buildTotalMinutesColumn<LabRow>("totalMinutes", "Total"),
      ...stepColumns
    ];
    return { rows, columnDefs };
  }

  get hasData(): boolean {
    return this.lab.rows.length > 0;
  }

  get hasMedianByDay(): boolean {
    return this.medianByDay.row != null;
  }

  get hasMedianByWeek(): boolean {
    return this.medianByWeek.row != null;
  }

  private buildMedianByDayView(records: LearningRecord[]): LabsMedianTable {
    const steps = getDistinctLabSteps(records);
    const courseid = records.length > 0 ? records[0].course_id : "";
    const row = buildMedianByStep(records, courseid, steps);
    const stepColumns = buildLabColumns<LabMedianRow>(steps, "step");
    const columnDefs: ColDef<LabMedianRow>[] = [
      buildTotalMinutesColumn<LabMedianRow>("totalMinutes", "Total"),
      ...stepColumns
    ];
    return { row, columnDefs };
  }

  private buildMedianByWeekView(records: LearningRecord[]): LabsMedianTable {
    const labs = getDistinctLabs(records);
    const steps = getDistinctLabSteps(records);
    const courseid = records.length > 0 ? records[0].course_id : "";
    const medianByStepRow = this.medianByDay.row;
    const row = buildMedianByLab(medianByStepRow, courseid, labs, steps);
    const labColumns = buildLabColumns<LabMedianRow>(labs, "lab");
    const columnDefs: ColDef<LabMedianRow>[] = [
      buildTotalMinutesColumn<LabMedianRow>("totalMinutes", "Total"),
      ...labColumns
    ];
    return { row, columnDefs };
  }
}
