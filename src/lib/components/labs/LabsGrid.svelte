<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { GridApi } from "ag-grid-community";
  import type { LabsModel } from "$lib/components/labs/LabsModel";
  import type { LabsPivotedRow, LabViewMode } from "$lib/services/learningRecordUtils";

  ModuleRegistry.registerModules([AllCommunityModule]);

  interface Props {
    model: LabsModel;
    mode: LabViewMode;
  }

  let { model, mode }: Props = $props();

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<LabsPivotedRow> | null>(null);

  const view = $derived(mode === "lab" ? model.lab : model.step);

  $effect(() => {
    const container = gridContainer;
    if (!container) return;
    const api = createGrid<LabsPivotedRow>(container, {
      columnDefs: view.columnDefs,
      rowData: view.rows,
      loading: model.loading,
      defaultColDef: { sortable: true, resizable: true },
      domLayout: "normal",
      suppressNoRowsOverlay: false,
      headerHeight: 170
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
      api.setGridOption("columnDefs", view.columnDefs);
      api.setGridOption("rowData", view.rows);
      api.setGridOption("loading", model.loading);
    }
  });
</script>

{#if model.loading && !model.hasData}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg">Loading lab data...</p>
  </div>
{:else if model.error}
  <div class="card preset-filled-error-500 p-4">
    <p class="font-bold">Error loading data</p>
    <p class="text-sm">{model.error}</p>
  </div>
{:else if !model.hasData}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg text-surface-600">No lab data available</p>
  </div>
{:else}
  <div class="flex h-full flex-col gap-2">
    <div class="ag-theme-quartz grid-fill-container min-h-0 flex-1" role="grid" aria-label="Lab duration by student">
      <div bind:this={gridContainer} class="grid-fill-container"></div>
    </div>
  </div>
{/if}
