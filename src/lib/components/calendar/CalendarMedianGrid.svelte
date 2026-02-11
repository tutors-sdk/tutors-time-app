<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { GridApi } from "ag-grid-community";
  import type { CalendarModel } from "$lib/components/calendar/CalendarModel";
  import type { CalendarMedianRow } from "$lib/components/calendar/calendarUtils";

  ModuleRegistry.registerModules([AllCommunityModule]);

  type SummaryMode = "day" | "week";

  interface Props {
    model: CalendarModel;
    mode: SummaryMode;
  }

  let { model, mode }: Props = $props();

  const columnDefs = $derived(mode === "day" ? model.medianByDay.columnDefs : model.medianByWeek.columnDefs);
  const row = $derived(mode === "day" ? model.medianByDay.row : model.medianByWeek.row);
  const rowData = $derived(row ? [row] : []);
  const hasData = $derived(mode === "day" ? model.hasMedianByDay : model.hasMedianByWeek);
  const ariaLabel = $derived(mode === "day" ? "Course median by day" : "Course median by week");

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<CalendarMedianRow> | null>(null);

  $effect(() => {
    const container = gridContainer;
    if (!container) return;
    const api = createGrid<CalendarMedianRow>(container, {
      columnDefs,
      rowData,
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
      api.setGridOption("columnDefs", columnDefs);
      api.setGridOption("rowData", rowData);
      api.setGridOption("loading", model.loading);
    }
  });
</script>

{#if model.loading && !hasData}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg">Loading course summary...</p>
  </div>
{:else if model.error}
  <div class="card preset-filled-error-500 p-4">
    <p class="font-bold">Error loading summary</p>
    <p class="text-sm">{model.error}</p>
  </div>
{:else if !hasData}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg text-surface-600">No summary available for this course</p>
  </div>
{:else}
  <div class="ag-theme-quartz grid-fill-container h-full min-h-0" role="grid" aria-label={ariaLabel}>
    <div bind:this={gridContainer} class="grid-fill-container"></div>
  </div>
{/if}
