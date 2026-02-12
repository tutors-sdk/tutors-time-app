<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { GridApi } from "ag-grid-community";
  import type { CalendarModel } from "$lib/components/calendar/CalendarModel";
  import type { CalendarRow, CalendarMedianRow } from "$lib/components/calendar/calendarUtils";

  ModuleRegistry.registerModules([AllCommunityModule]);

  type Mode = "day" | "week";
  type Variant = "detail" | "summary";
  type GridRow = CalendarRow | CalendarMedianRow;

  interface Props {
    model: CalendarModel;
    mode: Mode;
    variant?: Variant;
    /** When true, append the median row to the grid (student view: show student + course median in same grid). */
    includeMedianRow?: boolean;
    /** When set with includeMedianRow, filter rows to only this student (so median is course-level, not single-student). */
    studentId?: string | null;
  }

  let { model, mode, variant = "detail", includeMedianRow = false, studentId = null }: Props = $props();

  const isSummary = $derived(variant === "summary");

  const baseColumnDefs = $derived(
    isSummary
      ? mode === "day"
        ? model.medianByDay.columnDefs
        : model.medianByWeek.columnDefs
      : mode === "day"
        ? model.day.columnDefs
        : model.week.columnDefs
  );

  /** Strip sort from columns when includeMedianRow so blank row stays between student and median. */
  const columnDefs = $derived(
    includeMedianRow && mode === "week"
      ? baseColumnDefs.map((col) => ({ ...col, sort: undefined }))
      : baseColumnDefs
  );

  const rowData = $derived(
    isSummary
      ? (() => {
          const row = mode === "day" ? model.medianByDay.row : model.medianByWeek.row;
          return row ? [row] : [];
        })()
      : (() => {
          let rows = mode === "day" ? model.day.rows : model.week.rows;
          if (studentId != null && studentId !== "") {
            rows = rows.filter((r) => (r as CalendarRow).studentid === studentId);
          }
          if (!includeMedianRow || mode !== "week") return rows;
          const medianRow = model.medianByWeek.row;
          if (!medianRow) return rows;
          const blankRow: CalendarRow = {
            courseid: "",
            studentid: "",
            full_name: "",
            totalSeconds: 0
          };
          const combined: CalendarRow = {
            ...medianRow,
            studentid: "",
            full_name: "Course median"
          };
          return [...rows, blankRow, combined];
        })()
  );

  const hasData = $derived(
    isSummary
      ? mode === "day"
        ? model.hasMedianByDay
        : model.hasMedianByWeek
      : model.hasData
  );

  const ariaLabel = $derived(
    isSummary
      ? mode === "day"
        ? "Course median by day"
        : "Course median by week"
      : mode === "day"
        ? "Course usage by student and day"
        : "Course usage by student and week"
  );

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<GridRow> | null>(null);

  $effect(() => {
    const container = gridContainer;
    if (!container) return;
    const api = createGrid<GridRow>(container, {
      columnDefs: columnDefs as any,
      rowData: rowData as any,
      loading: model.loading,
      defaultColDef: { sortable: true, resizable: true },
      domLayout: "normal",
      suppressNoRowsOverlay: false,
      headerHeight: 72,
      enableCellTextSelection: true,
      ensureDomOrder: true
    });
    gridApi = api;
    return () => {
      api.destroy();
      gridApi = null;
    };
  });

  $effect(() => {
    const api = gridApi;
    if (api) {
      api.setGridOption("columnDefs", columnDefs as any);
      api.setGridOption("rowData", rowData as any);
      api.setGridOption("loading", model.loading);
    }
  });
</script>

{#if model.loading && !hasData}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg">
      {#if isSummary}
        Loading course summary...
      {:else}
        Loading calendar data...
      {/if}
    </p>
  </div>
{:else if model.error}
  <div class="card preset-filled-error-500 p-4">
    <p class="font-bold">
      {#if isSummary}
        Error loading summary
      {:else}
        Error loading data
      {/if}
    </p>
    <p class="text-sm">{model.error}</p>
  </div>
{:else if !hasData}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg text-surface-600">
      {#if isSummary}
        No summary available for this course
      {:else}
        No calendar data available
      {/if}
    </p>
  </div>
{:else}
  <div class="ag-theme-quartz grid-fill-container h-full min-h-0" role="grid" aria-label={ariaLabel}>
    <div bind:this={gridContainer} class="grid-fill-container"></div>
  </div>
{/if}
