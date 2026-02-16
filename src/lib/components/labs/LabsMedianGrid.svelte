<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { GridApi } from "ag-grid-community";
  import type { LabsModel } from "$lib/components/labs/LabsModel";
  import type { LabMedianRow } from "$lib/components/labs/labUtils";
  import type { TutorsTimeCourse } from "$lib/types";

  ModuleRegistry.registerModules([AllCommunityModule]);

  type MedianMode = "day" | "week";

  interface Props {
    course: TutorsTimeCourse | null;
    mode: MedianMode;
  }

  let { course, mode }: Props = $props();

  const model = $derived(course?.labsModel);
  const title = $derived(mode === "week" ? "Median lab by week" : "Median lab by step");
  const courseError = $derived(course?.error ?? null);

  const columnDefs = $derived(!model ? [] : mode === "day" ? model.medianByLabStep.columnDefs : model.medianByLab.columnDefs);
  const row = $derived(!model ? null : mode === "day" ? model.medianByLabStep.row : model.medianByLab.row);
  const rowData = $derived(row ? [row] : []);
  const hasData = $derived(model?.hasData ?? false);
  const hasMedianRow = $derived(!model ? false : mode === "day" ? model.hasMedianByLabStep : model.hasMedianByLab);
  const ariaLabel = $derived(mode === "day" ? "Lab median by step" : "Lab median by week");

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<LabMedianRow> | null>(null);

  $effect(() => {
    const container = gridContainer;
    if (!container || !model) return;
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
    if (api && model) {
      api.setGridOption("columnDefs", columnDefs);
      api.setGridOption("rowData", rowData);
      api.setGridOption("loading", model.loading);
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content="Course {title.toLowerCase()}" />
</svelte:head>

<section class="p-2 h-[calc(100vh-4rem)]">
  <div class="card p-4 h-full flex flex-col">
    <div class="flex flex-col flex-1 min-h-0">
      {#if !course}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg">Loading lab data...</p>
        </div>
      {:else if courseError}
        <div class="card preset-filled-error-500 p-4">
          <p class="font-bold">Error loading lab data</p>
          <p class="text-sm">{courseError}</p>
        </div>
      {:else if !hasMedianRow}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">No median data found for this course.</p>
        </div>
      {:else}
        <div class="flex-1 min-h-0 flex flex-col">
          <div class="flex-1 min-h-0">
            {#if model?.error}
              <div class="card preset-filled-error-500 p-4">
                <p class="font-bold">Error loading lab data</p>
                <p class="text-sm">{model.error}</p>
              </div>
            {:else}
              <div class="flex h-full flex-col gap-2">
                <div class="ag-theme-quartz grid-fill-container min-h-0 flex-1" role="grid" aria-label={ariaLabel}>
                  <div bind:this={gridContainer} class="grid-fill-container"></div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
