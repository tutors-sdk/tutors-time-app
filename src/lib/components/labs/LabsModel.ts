import type { ColDef } from "ag-grid-community";
import type { LearningRecord } from "$lib/types";
import {
  getDistinctLabs,
  getDistinctLabSteps,
  buildLabsPivotedRows,
  buildLabColumns,
  buildTotalMinutesColumn,
  type LabRow
} from "$lib/components/labs/labUtils";

/** Prepared data for the lab/step grid (one column per lab or step). */
export type LabsTable = {
  rows: LabRow[];
  columnDefs: ColDef<LabRow>[];
};

/**
 * Lab data prepared for LabsGrid.
 * Filters learning records to those with a segment starting with "book", then builds lab and step views.
 */
export class LabsModel {
  readonly lab: LabsTable;
  readonly step: LabsTable;
  readonly loading: boolean;
  readonly error: string | null;

  constructor(records: LearningRecord[], loading: boolean, error: string | null) {
    this.loading = loading;
    this.error = error;

    const filtered = this.filterAndSortRecords(records);

    this.lab = this.buildLabView(filtered);
    this.step = this.buildStepView(filtered);
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
    const stepColumns = buildLabColumns<LabRow>(steps, true);
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
}
