<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
  import type { ColDef, GridApi } from 'ag-grid-community';
  import type { CalendarEntry } from '$lib/types';
  import {
    getDistinctSortedWeeks,
    getMondayForDate,
    buildTotalSecondsColumn,
    buildPerWeekTimeColumnsMinutesOnly,
  } from '$lib/calendarUtils';

  ModuleRegistry.registerModules([AllCommunityModule]);

  interface Props {
    data: CalendarEntry[];
    loading: boolean;
    error: string | null;
  }

  type SummaryRow = {
    courseid: string;
    totalSeconds: number;
    [weekKey: string]: string | number;
  };

  let { data, loading, error }: Props = $props();

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<SummaryRow> | null>(null);

  const weeks = $derived(getDistinctSortedWeeks(data));

  const summaryRow = $derived(
    (() => {
      if (!data.length) return null;
      const courseid = data[0].courseid;
      let totalSeconds = 0;
      const totalsByWeek = new Map<string, number>();
      // Group by week (Monday date)
      for (const entry of data) {
        const secs = entry.timeactive ?? 0;
        totalSeconds += secs;
        const weekMonday = getMondayForDate(entry.id);
        totalsByWeek.set(weekMonday, (totalsByWeek.get(weekMonday) ?? 0) + secs);
      }
      const row: SummaryRow = { courseid, totalSeconds };
      for (const weekMonday of weeks) {
        row[weekMonday] = totalsByWeek.get(weekMonday) ?? 0;
      }
      return row;
    })()
  );


  const columnDefs = $derived.by((): ColDef<SummaryRow>[] => {
    const cols: ColDef<SummaryRow>[] = [
      {
        field: 'courseid',
        headerName: 'Course ID',
        pinned: 'left',
        minWidth: 200,
        flex: 1,
      },
      buildTotalSecondsColumn<SummaryRow>('totalSeconds', 'Total'),
      ...buildPerWeekTimeColumnsMinutesOnly<SummaryRow>(weeks),
    ];

    return cols;
  });

  $effect(() => {
    const container = gridContainer;
    if (!container) return;
    const api = createGrid<SummaryRow>(container, {
      columnDefs,
      rowData: summaryRow ? [summaryRow] : [],
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
      api.setGridOption('rowData', summaryRow ? [summaryRow] : []);
      api.setGridOption('loading', loading);
    }
  });
</script>

{#if loading && (!data || data.length === 0)}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg">Loading course summary...</p>
  </div>
{:else if error}
  <div class="card preset-filled-error-500 p-4">
    <p class="font-bold">Error loading summary</p>
    <p class="text-sm">{error}</p>
  </div>
{:else if !summaryRow}
  <div class="flex items-center justify-center p-8">
    <p class="text-lg text-surface-600">No summary available for this course</p>
  </div>
{:else}
  <div class="ag-theme-quartz grid-fill-container" role="grid" aria-label="Course summary">
    <div bind:this={gridContainer} class="grid-fill-container"></div>
  </div>
{/if}

