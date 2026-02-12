<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { GridApi } from "ag-grid-community";
  import type { LabsModel } from "$lib/components/labs/LabsModel";
  import type { LabRow, LabMedianRow, LabViewMode } from "$lib/components/labs/labUtils";

  ModuleRegistry.registerModules([AllCommunityModule]);

  interface Props {
    model: LabsModel;
    mode: LabViewMode;
    /** Optional: limit rows to a single student id (matches LabRow.studentid). */
    studentId?: string | null;
    /** When true and mode is "lab", append the course median row (student view: show student + course median in same grid). */
    includeMedianRow?: boolean;
  }

  let { model, mode, studentId = null, includeMedianRow = false }: Props = $props();

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<LabRow> | null>(null);

  const view = $derived(mode === "lab" ? model.lab : model.step);
  const rows = $derived(
    (() => {
      let result = studentId ? view.rows.filter((row) => row.studentid === studentId) : view.rows;
      if (includeMedianRow && mode === "lab") {
        const medianRow = model.medianByLab.row;
        if (medianRow) {
          const combined: LabRow = {
            ...medianRow,
            studentid: "Course median"
          };
          result = [...result, combined];
        }
      }
      return result;
    })()
  );

  $effect(() => {
    const container = gridContainer;
    if (!container) return;
    const api = createGrid<LabRow>(container, {
      columnDefs: view.columnDefs,
      rowData: rows,
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
      api.setGridOption("columnDefs", view.columnDefs);
      api.setGridOption("rowData", rows);
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
