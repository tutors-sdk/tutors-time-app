<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { GridApi } from "ag-grid-community";
  import type { LabsModel } from "$lib/components/labs/LabsModel";
  import type { LabMedianRow } from "$lib/components/labs/labUtils";

  ModuleRegistry.registerModules([AllCommunityModule]);

  interface Props {
    model: LabsModel;
  }

  let { model }: Props = $props();

  const columnDefs = $derived(model.medianByDay.columnDefs);
  const row = $derived(model.medianByDay.row);
  const rowData = $derived(row ? [row] : []);
  const hasData = $derived(model.hasData);

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<LabMedianRow> | null>(null);

  $effect(() => {
    const container = gridContainer;
    if (!container) return;
    const api = createGrid<LabMedianRow>(container, {
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
    <p class="text-lg">Loading lab median...</p>
  </div>
{:else if model.error}
  <div class="card preset-filled-error-500 p-4">
    <p class="font-bold">Error loading lab data</p>
    <p class="text-sm">{model.error}</p>
  </div>
{:else if !hasData}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg text-surface-600">No lab data available</p>
  </div>
{:else}
  <div class="flex h-full flex-col gap-2">
    <div class="ag-theme-quartz grid-fill-container min-h-0 flex-1" role="grid" aria-label="Lab median by day">
      <div bind:this={gridContainer} class="grid-fill-container"></div>
    </div>
  </div>
{/if}
