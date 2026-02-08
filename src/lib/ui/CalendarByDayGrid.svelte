<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { GridApi } from "ag-grid-community";
  import type { CalendarModel } from "$lib/services/CalendarModel";
  import type { PivotedRow } from "$lib/services/calendarUtils";

  ModuleRegistry.registerModules([AllCommunityModule]);

  interface Props {
    model: CalendarModel;
  }

  let { model }: Props = $props();

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<PivotedRow> | null>(null);

  $effect(() => {
    const container = gridContainer;
    if (!container) return;
    const api = createGrid<PivotedRow>(container, {
      columnDefs: model.day.columnDefs,
      rowData: model.day.rows,
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
      api.setGridOption("columnDefs", model.day.columnDefs);
      api.setGridOption("rowData", model.day.rows);
      api.setGridOption("loading", model.loading);
    }
  });
</script>

{#if model.loading && !model.hasData}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg">Loading calendar data...</p>
  </div>
{:else if model.error}
  <div class="card preset-filled-error-500 p-4">
    <p class="font-bold">Error loading data</p>
    <p class="text-sm">{model.error}</p>
  </div>
{:else if !model.hasData}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg text-surface-600">No calendar data available</p>
  </div>
{:else}
  <div class="ag-theme-quartz grid-fill-container h-full min-h-0" role="grid" aria-label="Course usage by student and day">
    <div bind:this={gridContainer} class="grid-fill-container"></div>
  </div>
{/if}
