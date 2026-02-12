<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { GridApi } from "ag-grid-community";
  import type { LabsModel } from "$lib/components/labs/LabsModel";
  import type { LabMedianRow } from "$lib/components/labs/labUtils";

  ModuleRegistry.registerModules([AllCommunityModule]);

  type MedianMode = "day" | "week";

  interface Props {
    model: LabsModel;
    mode: MedianMode;
  }

  let { model, mode }: Props = $props();

  const columnDefs = $derived(mode === "day" ? model.medianByLabStep.columnDefs : model.medianByLab.columnDefs);
  const row = $derived(mode === "day" ? model.medianByLabStep.row : model.medianByLab.row);
  const rowData = $derived(row ? [row] : []);
  const hasData = $derived(model.hasData);
  const hasMedianRow = $derived(mode === "day" ? model.hasMedianByLabStep : model.hasMedianByLab);
  const ariaLabel = $derived(mode === "day" ? "Lab median by step" : "Lab median by week");

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
      headerHeight: 170,
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
{:else if !hasMedianRow}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg text-surface-600">No lab median available</p>
  </div>
{:else}
  <div class="flex h-full flex-col gap-2">
    <div class="ag-theme-quartz grid-fill-container min-h-0 flex-1" role="grid" aria-label={ariaLabel}>
      <div bind:this={gridContainer} class="grid-fill-container"></div>
    </div>
  </div>
{/if}
