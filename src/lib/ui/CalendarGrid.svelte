<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
  import type { ColDef, GridApi } from 'ag-grid-community';
  import type { CalendarEntry } from '$lib/types';
  import {
    getDistinctSortedWeeks,
    getMondayForDate,
    buildTotalSecondsColumn,
    buildPerWeekTimeColumns,
  } from '$lib/calendarUtils';

  ModuleRegistry.registerModules([AllCommunityModule]);

  interface Props {
    data: CalendarEntry[];
    loading: boolean;
    error: string | null;
  }

  /** Pivoted row: student id, total seconds, then one field per week (time active seconds) */
  type PivotedRow = { studentid: string; totalSeconds: number; [weekKey: string]: string | number };

  let { data, loading, error }: Props = $props();

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<PivotedRow> | null>(null);

  const weeks = $derived(getDistinctSortedWeeks(data));

  const pivotedRowData = $derived(
    (() => {
      const students = Array.from(new Set(data.map((e) => e.studentid))).sort();
      const map = new Map<string, number>();
      // Group by studentid + week (Monday date)
      for (const e of data) {
        const weekMonday = getMondayForDate(e.id);
        const key = `${e.studentid}\t${weekMonday}`;
        map.set(key, (map.get(key) ?? 0) + e.timeactive);
      }
      return students.map((studentid) => {
        let totalSeconds = 0;
        const row: PivotedRow = { studentid, totalSeconds: 0 };
        for (const weekMonday of weeks) {
          const secs = map.get(`${studentid}\t${weekMonday}`) ?? 0;
          row[weekMonday] = secs;
          totalSeconds += secs;
        }
        row.totalSeconds = totalSeconds;
        return row;
      });
    })()
  );

  const columnDefs = $derived.by((): ColDef<PivotedRow>[] => {
    const cols: ColDef<PivotedRow>[] = [
      { field: 'studentid', headerName: 'Student ID', minWidth: 120, flex: 1, pinned: 'left' },
      buildTotalSecondsColumn<PivotedRow>('totalSeconds', 'Total'),
      ...buildPerWeekTimeColumns<PivotedRow>(weeks),
    ];
    return cols;
  });

  $effect(() => {
    const container = gridContainer;
    if (!container) return;
    const api = createGrid<PivotedRow>(container, {
      columnDefs,
      rowData: pivotedRowData,
      loading,
      defaultColDef: { sortable: true, resizable: true },
      domLayout: 'normal',
      suppressNoRowsOverlay: false,
      headerHeight: 72,
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
      api.setGridOption('columnDefs', columnDefs);
      api.setGridOption('rowData', pivotedRowData);
      api.setGridOption('loading', loading);
    }
  });
</script>

{#if loading && data.length === 0}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg">Loading calendar data...</p>
  </div>
{:else if error}
  <div class="card preset-filled-error-500 p-4">
    <p class="font-bold">Error loading data</p>
    <p class="text-sm">{error}</p>
  </div>
{:else if data.length === 0}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg text-surface-600">No calendar data available</p>
  </div>
{:else}
  <div class="ag-theme-quartz grid-fill-container" role="grid" aria-label="Course usage by student and week">
    <div bind:this={gridContainer} class="grid-fill-container"></div>
  </div>
{/if}
