<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { GridApi } from "ag-grid-community";
  import type { CalendarModel } from "$lib/services/CalendarModel";
  import type { SummaryRow } from "$lib/services/calendarUtils";

  ModuleRegistry.registerModules([AllCommunityModule]);

  interface Props {
    model: CalendarModel;
  }

  let { model }: Props = $props();

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<SummaryRow> | null>(null);

  $effect(() => {
    const container = gridContainer;
    if (!container) return;
    const api = createGrid<SummaryRow>(container, {
      columnDefs: model.summary.columnDefsDay,
      rowData: model.summary.rowDay ? [model.summary.rowDay] : [],
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
      api.setGridOption("columnDefs", model.summary.columnDefsDay);
      api.setGridOption("rowData", model.summary.rowDay ? [model.summary.rowDay] : []);
      api.setGridOption("loading", model.loading);
    }
  });
</script>

{#if model.loading && !model.hasSummary}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg">Loading course summary...</p>
  </div>
{:else if model.error}
  <div class="card preset-filled-error-500 p-4">
    <p class="font-bold">Error loading summary</p>
    <p class="text-sm">{model.error}</p>
  </div>
{:else if !model.hasSummary}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg text-surface-600">No summary available for this course</p>
  </div>
{:else}
  <div class="ag-theme-quartz grid-fill-container h-full min-h-0" role="grid" aria-label="Course summary by day">
    <div bind:this={gridContainer} class="grid-fill-container"></div>
  </div>
{/if}
