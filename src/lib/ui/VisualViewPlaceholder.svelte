<script lang="ts">
  import type { CalendarEntry } from '$lib/types';

  interface Props {
    data: CalendarEntry[];
    loading: boolean;
    error: string | null;
  }

  let { data, loading, error }: Props = $props();
</script>

{#if loading}
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
  <div class="flex flex-col items-center justify-center p-12 space-y-4">
    <div class="text-center">
      <h2 class="text-2xl font-bold mb-2">Visual View</h2>
      <p class="text-lg text-surface-600 mb-4">
        A visual representation of calendar data is coming soon.
      </p>
      <p class="text-sm text-surface-500">
        This view will provide charts, graphs, and other visualizations of the calendar data.
      </p>
    </div>
    <div class="card bg-surface-100-900 p-6 mt-4">
      <p class="text-sm text-surface-600">
        <strong>Data available:</strong> {data.length} calendar entries ready for visualization.
      </p>
    </div>
  </div>
{/if}
