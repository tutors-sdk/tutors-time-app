<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { GridApi } from "ag-grid-community";
  import type { CalendarModel } from "$lib/components/calendar/CalendarModel";
  import type { PivotedRow, SummaryRow } from "$lib/components/calendar/calendarUtils";

  ModuleRegistry.registerModules([AllCommunityModule]);

  type Mode = "day" | "week";
  type Variant = "detail" | "summary";
  type GridRow = PivotedRow | SummaryRow;

  interface Props {
    model: CalendarModel;
    mode: Mode;
    variant?: Variant;
  }

  let { model, mode, variant = "detail" }: Props = $props();

  const isSummary = $derived(variant === "summary");

  const columnDefs = $derived(
    isSummary
      ? mode === "day"
        ? model.summary.columnDefsDay
        : model.summary.columnDefsWeek
      : mode === "day"
        ? model.day.columnDefs
        : model.week.columnDefs
  );

  const rowData = $derived(
    isSummary
      ? (() => {
          const row = mode === "day" ? model.summary.rowDay : model.summary.rowWeek;
          return row ? [row] : [];
        })()
      : mode === "day"
        ? model.day.rows
        : model.week.rows
  );

  const hasData = $derived(isSummary ? model.hasSummary : model.hasData);

  const ariaLabel = $derived(
    isSummary
      ? mode === "day"
        ? "Course summary by day"
        : "Course summary by week"
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
      headerHeight: 72
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
