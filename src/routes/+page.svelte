<script lang="ts">
  import { AppBar } from '@skeletonlabs/skeleton';
  import { getCalendarData } from '$lib/services/calendar';
  import type { PageData } from './$types';
  import type { CalendarEntry } from '$lib/types';

  let { data }: { data: PageData } = $props();

  // Course ID state
  let courseid = $state<string | null>(null);
  let dialogOpen = $state(true); // Open dialog on page load

  // Calendar data state
  let calendarData = $state<CalendarEntry[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Dialog input state
  let courseidInput = $state('');
  let dialogElement: HTMLDialogElement | undefined;

  // Extract distinct values for filters
  let distinctStudentIds = $derived(
    Array.from(new Set(calendarData.map((e) => e.studentid))).sort()
  );

  // Filter state
  let selectedStudentId = $state<string | null>(null);
  let startDate = $state('');
  let endDate = $state('');

  // Filtered data
  let filteredData = $derived(
    calendarData.filter((entry) => {
      // Student filter
      if (selectedStudentId && entry.studentid !== selectedStudentId) {
        return false;
      }
      // Date range filter
      if (startDate || endDate) {
        const entryDate = entry.id;
        if (startDate && entryDate < startDate) {
          return false;
        }
        if (endDate && entryDate > endDate) {
          return false;
        }
      }
      return true;
    })
  );

  async function loadCalendarData(courseId: string) {
    loading = true;
    error = null;
    try {
      const data = await getCalendarData(courseId);
      calendarData = data;
      courseid = courseId;
      dialogOpen = false;
      // Reset filters when loading new course
      selectedStudentId = null;
      startDate = '';
      endDate = '';
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load calendar data';
      calendarData = [];
    } finally {
      loading = false;
    }
  }

  function handleCourseIdSubmit() {
    const trimmedCourseId = courseidInput.trim();
    if (!trimmedCourseId) {
      error = 'Course ID is required';
      return;
    }
    loadCalendarData(trimmedCourseId);
  }

  function openChangeCourseDialog() {
    courseidInput = courseid || '';
    dialogOpen = true;
  }

  // Open dialog when dialogOpen becomes true
  $effect(() => {
    if (dialogOpen && dialogElement) {
      dialogElement.showModal();
    } else if (!dialogOpen && dialogElement) {
      dialogElement.close();
    }
  });

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

  function clearFilters() {
    selectedStudentId = null;
    startDate = '';
    endDate = '';
  }
</script>

<svelte:head>
  <title>Tutors Time</title>
  <meta name="description" content="Calendar visualization for student course time tracking" />
</svelte:head>

<AppBar>
  <svelte:fragment slot="lead">
    <span class="text-xl font-bold">Tutors Time</span>
  </svelte:fragment>
</AppBar>

<!-- Course ID Selection Dialog -->
<dialog
  bind:this={dialogElement}
  class="backdrop:bg-surface-50-950/50 backdrop:backdrop-blur-sm bg-transparent border-none p-0"
  onclose={() => {
    // Prevent closing dialog if no courseid is set
    if (!courseid) {
      dialogOpen = true;
    }
  }}
>
  <div class="card bg-surface-100-900 w-full max-w-md p-6 space-y-4 shadow-xl m-auto">
    <h2 class="text-2xl font-bold">Select Course ID</h2>
    <p class="text-surface-600">
      Please enter a course ID to view calendar data for that course.
    </p>
    <div class="space-y-4">
      <div>
        <label for="courseid-input" class="label">Course ID</label>
        <input
          id="courseid-input"
          type="text"
          bind:value={courseidInput}
          placeholder="Enter course ID"
          class="input"
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              handleCourseIdSubmit();
            }
          }}
        />
        {#if error && dialogOpen}
          <p class="text-sm text-error-500 mt-1">{error}</p>
        {/if}
      </div>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          onclick={handleCourseIdSubmit}
          class="btn preset-filled"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load Data'}
        </button>
      </div>
    </div>
  </div>
</dialog>

<section class="container mx-auto p-4">
  <div class="card p-6">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">Calendar Data</h1>
      {#if courseid}
        <div class="flex items-center gap-4">
          <span class="text-sm text-surface-600">Course ID: <strong>{courseid}</strong></span>
          <button
            type="button"
            onclick={openChangeCourseDialog}
            class="btn variant-filled-secondary"
          >
            Change Course
          </button>
        </div>
      {/if}
    </div>

    {#if loading}
      <div class="flex items-center justify-center p-8">
        <p class="text-lg">Loading calendar data...</p>
      </div>
    {:else if error}
      <div class="card preset-filled-error-500 p-4">
        <p class="font-bold">Error loading data</p>
        <p class="text-sm">{error}</p>
      </div>
    {:else if !courseid}
      <div class="flex items-center justify-center p-8">
        <p class="text-lg text-surface-600">Please select a course ID to view calendar data</p>
      </div>
    {:else if calendarData.length === 0}
      <div class="flex items-center justify-center p-8">
        <p class="text-lg text-surface-600">No calendar data available for course ID: {courseid}</p>
      </div>
    {:else}
      <!-- Filters -->
      <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label for="student-filter" class="label">Student ID</label>
          <select
            id="student-filter"
            bind:value={selectedStudentId}
            class="select"
          >
            <option value={null}>All Students</option>
            {#each distinctStudentIds as studentId}
              <option value={studentId}>{studentId}</option>
            {/each}
          </select>
        </div>

        <div>
          <label for="start-date" class="label">Start Date</label>
          <input
            id="start-date"
            type="date"
            bind:value={startDate}
            class="input"
          />
        </div>

        <div>
          <label for="end-date" class="label">End Date</label>
          <div class="flex gap-2">
            <input
              id="end-date"
              type="date"
              bind:value={endDate}
              class="input flex-1"
            />
            <button
              type="button"
              onclick={clearFilters}
              class="btn variant-filled-secondary"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      {#if filteredData.length === 0}
        <div class="flex items-center justify-center p-8">
          <p class="text-lg text-surface-600">No entries match the selected filters</p>
        </div>
      {:else}
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
              {#each filteredData as entry (entry.id + entry.studentid + entry.courseid)}
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
          Showing {filteredData.length} of {calendarData.length} calendar entries
        </p>
      {/if}
    {/if}
  </div>
</section>

<style>
  section {
    margin-top: 2rem;
  }
</style>
