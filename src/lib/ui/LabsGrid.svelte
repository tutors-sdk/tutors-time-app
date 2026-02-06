<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from "ag-grid-community";
  import type { ColDef, GridApi } from "ag-grid-community";
  import type { LearningRecord } from "$lib/types";
  import LabViewModeToggle from "$lib/ui/LabViewModeToggle.svelte";
  import {
    getDistinctLabs,
    getDistinctLabSteps,
    buildLabsPivotedRows,
    buildLabColumns,
    buildTotalMinutesColumn,
    toggleLabViewMode,
    type LabsPivotedRow,
    type LabViewMode
  } from "$lib/services/calendarUtils";

  ModuleRegistry.registerModules([AllCommunityModule]);

  interface Props {
    data: LearningRecord[];
    loading: boolean;
    error: string | null;
  }

  let { data, loading, error }: Props = $props();

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<LabsPivotedRow> | null>(null);
  let labViewMode = $state<LabViewMode>("step");

  // Sort records by lo_id alphabetically, then filter out records that don't have a segment starting with "book"
  const filteredData = $derived(
    [...data]
      .sort((a, b) => {
        const aId = a.lo_id || '';
        const bId = b.lo_id || '';
        return aId.localeCompare(bId);
      })
      .filter((record) => {
        if (!record.lo_id) return false;
        const segments = record.lo_id.split('/');
        return segments.some((segment) => segment.trim().toLowerCase().startsWith('book'));
      })
  );

  const labs = $derived(labViewMode === 'lab' ? getDistinctLabs(filteredData) : getDistinctLabSteps(filteredData));
  const pivotedRowData = $derived(buildLabsPivotedRows(filteredData, labViewMode));

  const columnDefs = $derived.by((): ColDef<LabsPivotedRow>[] => {
    // In step mode, extract lab identifier for header display; in lab mode, headers are already lab identifiers
    const labColumns = buildLabColumns<LabsPivotedRow>(labs, labViewMode === 'step');
    const cols: ColDef<LabsPivotedRow>[] = [
      { 
        field: "studentid", 
        headerName: "Student ID", 
        minWidth: 120, 
        flex: 1, 
        pinned: "left",
        cellStyle: { paddingLeft: '4px' }
      },
      buildTotalMinutesColumn<LabsPivotedRow>("totalMinutes", "Total"),
      ...labColumns
    ];
    return cols;
  });

  $effect(() => {
    const container = gridContainer;
    if (!container) return;
    const api = createGrid<LabsPivotedRow>(container, {
      columnDefs,
      rowData: pivotedRowData,
      loading,
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
      api.setGridOption("columnDefs", columnDefs);
      api.setGridOption("rowData", pivotedRowData);
      api.setGridOption("loading", loading);
    }
  });
</script>

{#if loading && data.length === 0}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg">Loading lab data...</p>
  </div>
{:else if error}
  <div class="card preset-filled-error-500 p-4">
    <p class="font-bold">Error loading data</p>
    <p class="text-sm">{error}</p>
  </div>
{:else if data.length === 0}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg text-surface-600">No lab data available</p>
  </div>
{:else}
  <div class="flex h-full flex-col gap-2">
    <LabViewModeToggle viewMode={labViewMode} onToggle={() => { labViewMode = toggleLabViewMode(labViewMode); }} />
    <div class="ag-theme-quartz grid-fill-container min-h-0 flex-1" role="grid" aria-label="Lab duration by student">
      <div bind:this={gridContainer} class="grid-fill-container"></div>
    </div>
  </div>
{/if}
