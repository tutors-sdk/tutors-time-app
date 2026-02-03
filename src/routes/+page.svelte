<script lang="ts">
  import { AppBar, Tabs } from '@skeletonlabs/skeleton-svelte';
  import CourseIdDialog from '$lib/ui/CourseIdDialog.svelte';
  import CalendarTable from '$lib/ui/CalendarTable.svelte';
  import CalendarGrid from '$lib/ui/CalendarGrid.svelte';
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

  // Tab state
  let activeTab = $state('table');

  async function loadCalendarData(courseId: string) {
    loading = true;
    error = null;
    try {
      const data = await getCalendarData(courseId);
      calendarData = data;
      courseid = courseId;
      dialogOpen = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load calendar data';
      calendarData = [];
    } finally {
      loading = false;
    }
  }

  function handleCourseIdSubmit(event: CustomEvent<{ courseId: string }>) {
    const trimmedCourseId = event.detail.courseId.trim();
    if (!trimmedCourseId) {
      error = 'Course ID is required';
      return;
    }
    loadCalendarData(trimmedCourseId);
  }

  function openChangeCourseDialog() {
    dialogOpen = true;
  }

  function handleDialogClose() {
    // Dialog close is handled by the component - prevent closing if no courseId
    if (!courseid) {
      dialogOpen = true;
    }
  }

  function handleDialogOpen(event: CustomEvent<{ open: boolean }>) {
    dialogOpen = event.detail.open;
  }
</script>

<svelte:head>
  <title>Tutors Time</title>
  <meta name="description" content="Calendar visualization for student course time tracking" />
</svelte:head>

<CourseIdDialog
  open={dialogOpen}
  courseId={courseid}
  loading={loading}
  error={error}
  on:submit={handleCourseIdSubmit}
  on:close={handleDialogClose}
  on:open={handleDialogOpen}
/>

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

    {#if !courseid}
      <div class="flex items-center justify-center p-8">
        <p class="text-lg text-surface-600">Please select a course ID to view calendar data</p>
      </div>
    {:else if calendarData.length === 0}
      <div class="flex items-center justify-center p-8">
        <p class="text-lg text-surface-600">No calendar data available for course ID: {courseid}</p>
      </div>
    {:else}
      <Tabs value={activeTab} onValueChange={(details) => (activeTab = details.value)}>
        <Tabs.List>
          <Tabs.Trigger value="table">Table View</Tabs.Trigger>
          <Tabs.Trigger value="visual">Visual View</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="table">
          <CalendarTable
            data={calendarData}
            loading={loading}
            error={error}
          />
        </Tabs.Content>
        <Tabs.Content value="visual">
          <div class="visual-tab-viewport">
            <CalendarGrid
              data={calendarData}
              loading={loading}
              error={error}
            />
          </div>
        </Tabs.Content>
      </Tabs>
    {/if}
  </div>
</section>
