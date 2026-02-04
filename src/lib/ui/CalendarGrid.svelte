<script lang="ts">
  import { createGrid, ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
  import type { ColDef, GridApi } from 'ag-grid-community';
  import type { CalendarEntry } from '$lib/types';

  ModuleRegistry.registerModules([AllCommunityModule]);

  interface Props {
    data: CalendarEntry[];
    loading: boolean;
    error: string | null;
  }

  /** Pivoted row: student id, total seconds, then one field per date (time active seconds) */
  type PivotedRow = { studentid: string; totalSeconds: number; [dateKey: string]: string | number };

  let { data, loading, error }: Props = $props();

  let gridContainer = $state<HTMLDivElement | null>(null);
  let gridApi = $state<GridApi<PivotedRow> | null>(null);

  /** Compressed date for column headers to minimize width (e.g. "3/2" for 3 Feb) */
  function formatDateShort(dateString: string): string {
    try {
      const date = new Date(dateString + 'T12:00:00');
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return `${day}/${month}`;
    } catch {
      return dateString;
    }
  }

  /** Time to nearest minute only (e.g. "1h 30", "45") */
  function formatTime(seconds: number): string {
    const totalMinutes = Math.round(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}`;
    }
    return `${minutes}`;
  }

  /** Background colour by minutes: 0 = white, 1 = light green, 1–30 = deeper green */
  function cellColorForMinutes(seconds: number | null | undefined): string {
    const minutes = seconds != null ? Number(seconds) / 60 : 0;
    const white = { r: 255, g: 255, b: 255 };
    const lightGreen = { r: 200, g: 255, b: 200 };
    const deepGreen = { r: 0, g: 120, b: 0 };
    let r: number;
    let g: number;
    let b: number;
    if (minutes <= 0) {
      r = white.r;
      g = white.g;
      b = white.b;
    } else if (minutes <= 1) {
      const t = minutes;
      r = Math.round(white.r + t * (lightGreen.r - white.r));
      g = Math.round(white.g + t * (lightGreen.g - white.g));
      b = Math.round(white.b + t * (lightGreen.b - white.b));
    } else {
      const t = Math.min(1, (minutes - 1) / 29);
      r = Math.round(lightGreen.r + t * (deepGreen.r - lightGreen.r));
      g = Math.round(lightGreen.g + t * (deepGreen.g - lightGreen.g));
      b = Math.round(lightGreen.b + t * (deepGreen.b - lightGreen.b));
    }
    return `rgb(${r}, ${g}, ${b})`;
  }

  const dates = $derived(Array.from(new Set(data.map((e) => e.id))).sort());

  const pivotedRowData = $derived(
    (() => {
      const students = Array.from(new Set(data.map((e) => e.studentid))).sort();
      const map = new Map<string, number>();
      for (const e of data) {
        const key = `${e.studentid}\t${e.id}`;
        map.set(key, (map.get(key) ?? 0) + e.timeactive);
      }
      return students.map((studentid) => {
        let totalSeconds = 0;
        const row: PivotedRow = { studentid, totalSeconds: 0 };
        for (const d of dates) {
          const secs = map.get(`${studentid}\t${d}`) ?? 0;
          row[d] = secs;
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
      {
        field: 'totalSeconds',
        headerName: 'Total',
        headerClass: 'ag-header-vertical',
        sort: 'desc',
        valueFormatter: (p) =>
          p.value != null && Number(p.value) > 0
            ? String(Math.round(Number(p.value) / 60))
            : '',
        cellClass: 'ag-right-aligned-cell',
        cellStyle: (p) => ({ backgroundColor: cellColorForMinutes(p.value as number) }),
        width: 52,
        maxWidth: 64,
      },
    ];
    for (const d of dates) {
      cols.push({
        field: d,
        headerName: formatDateShort(d),
        headerClass: 'ag-header-vertical',
        valueFormatter: (p) =>
          p.value != null && Number(p.value) > 0 ? formatTime(Number(p.value)) : '',
        cellClass: 'ag-right-aligned-cell',
        cellStyle: (p) => ({
          backgroundColor: cellColorForMinutes(p.value as number),
          textAlign: 'center',
        }),
        width: 40,
        maxWidth: 64,
      });
    }
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
  <div class="ag-theme-quartz grid-fill-container" role="grid" aria-label="Course usage by student and date">
    <div bind:this={gridContainer} class="grid-fill-container"></div>
  </div>
{/if}
