<script lang="ts">
  import type { CalendarEntry } from '$lib/types';

  interface Props {
    data: CalendarEntry[];
    loading: boolean;
    error: string | null;
  }

  let { data, loading, error }: Props = $props();

  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
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
  <!-- Table -->
  <div class="table-wrap overflow-x-auto">
    <table class="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Student ID</th>
          <th>Course ID</th>
          <th class="text-right">Time Active</th>
          <th class="text-right">Page Loads</th>
        </tr>
      </thead>
      <tbody>
        {#each data as entry (entry.id + entry.studentid + entry.courseid)}
          <tr>
            <td>{formatDate(entry.id)}</td>
            <td>{entry.studentid}</td>
            <td>{entry.courseid}</td>
            <td class="text-right">{formatTime(entry.timeactive)}</td>
            <td class="text-right">{entry.pageloads}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="mt-4 text-sm text-surface-600">
    Showing {data.length} calendar {data.length === 1 ? 'entry' : 'entries'}
  </p>
{/if}
