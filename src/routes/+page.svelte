<script lang="ts">
  import { AppBar, Tabs } from '@skeletonlabs/skeleton-svelte';
  import CourseIdDialog from '$lib/ui/CourseIdDialog.svelte';
  import CalendarTable from '$lib/ui/CalendarTable.svelte';
  import CalendarGrid from '$lib/ui/CalendarGrid.svelte';
  import CourseSummaryGrid from '$lib/ui/CourseSummaryGrid.svelte';
  import { getCalendarData } from '$lib/services/calendar';
  import type { PageData } from './$types';
  import type { CalendarEntry } from '$lib/types';

  let { data }: { data: PageData } = $props();

  type CourseViewState = {
    id: string;
    data: CalendarEntry[];
    loading: boolean;
    error: string | null;
  };

  // Selected courses and dialog state
  let courses = $state<CourseViewState[]>([]);
  let primaryCourseId = $state<string | null>(null); // used to seed dialog when single-course
  let dialogOpen = $state(true); // Open dialog on page load

  // Dialog-level state (validation + "any loading" flag)
  let dialogLoading = $state(false);
  let dialogError = $state<string | null>(null);

  // Tab state
  let activeTab = $state<string | null>(null);

  function makeTabValue(courseId: string, suffix: 't' | 'v' | 's'): string {
    return `${courseId} (${suffix})`;
  }

  async function loadCalendarDataForCourses(courseIds: string[]) {
    const uniqueIds = Array.from(
      new Set(
        courseIds
          .map((id) => id.trim())
          .filter(Boolean)
      )
    );

    if (uniqueIds.length === 0) {
      dialogError = 'At least one course ID is required';
      return;
    }

    dialogError = null;
    dialogLoading = true;

    // Initialise per-course state
    courses = uniqueIds.map((id) => ({
      id,
      data: [],
      loading: true,
      error: null,
    }));

    // Track "primary" course only when a single course is selected
    primaryCourseId = uniqueIds.length === 1 ? uniqueIds[0] : null;

    // Set initial active tab: first course, table view
    activeTab = makeTabValue(uniqueIds[0], 't');

    dialogOpen = false;

    for (const id of uniqueIds) {
      try {
        const data = await getCalendarData(id);
        courses = courses.map((c) =>
          c.id === id ? { ...c, data, loading: false, error: null } : c
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load calendar data';
        courses = courses.map((c) =>
          c.id === id ? { ...c, data: [], loading: false, error: msg } : c
        );
      }
    }

    dialogLoading = false;
  }

  function handleCourseIdSubmit(event: CustomEvent<{ courseIds: string[] }>) {
    loadCalendarDataForCourses(event.detail.courseIds);
  }

  function openChangeCourseDialog() {
    dialogOpen = true;
  }

  function handleDialogClose() {
    // Dialog close is handled by the component - prevent closing if no courses selected
    if (!courses.length) {
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
  courseId={primaryCourseId}
  loading={dialogLoading}
  error={dialogError}
  on:submit={handleCourseIdSubmit}
  on:close={handleDialogClose}
  on:open={handleDialogOpen}
/>

<section class="p-2">
  <div class="card p-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-3xl font-bold">Calendar Data</h1>
      {#if courses.length === 1}
        <div class="flex items-center gap-4">
          <span class="text-sm text-surface-600">
            Course ID: <strong>{courses[0].id}</strong>
          </span>
          <button
            type="button"
            onclick={openChangeCourseDialog}
            class="btn variant-filled-secondary"
          >
            Change Courses
          </button>
        </div>
      {:else if courses.length > 1}
        <div class="flex items-center gap-4">
          <span class="text-sm text-surface-600">
            Courses:
            <strong>{courses.map((c) => c.id).join(', ')}</strong>
          </span>
          <button
            type="button"
            onclick={openChangeCourseDialog}
            class="btn variant-filled-secondary"
          >
            Change Courses
          </button>
        </div>
      {/if}
    </div>

    {#if courses.length === 0}
      <div class="flex items-center justify-center p-8">
        <p class="text-lg text-surface-600">
          Please select one or more course IDs to view calendar data
        </p>
      </div>
    {:else}
      <Tabs
        value={activeTab ?? (courses.length ? makeTabValue(courses[0].id, 't') : 'table')}
        onValueChange={(details) => (activeTab = details.value)}
      >
        <Tabs.List>
          {#each courses as course}
            <Tabs.Trigger value={makeTabValue(course.id, 't')}>
              {course.id} (t)
            </Tabs.Trigger>
            <Tabs.Trigger value={makeTabValue(course.id, 'v')}>
              {course.id} (v)
            </Tabs.Trigger>
            <Tabs.Trigger value={makeTabValue(course.id, 's')}>
              {course.id} (s)
            </Tabs.Trigger>
          {/each}
          <Tabs.Indicator />
        </Tabs.List>
        {#each courses as course}
          <Tabs.Content value={makeTabValue(course.id, 't')}>
            <CalendarTable
              data={course.data}
              loading={course.loading}
              error={course.error}
            />
          </Tabs.Content>
          <Tabs.Content value={makeTabValue(course.id, 'v')}>
            <div class="visual-tab-viewport">
              <CalendarGrid
                data={course.data}
                loading={course.loading}
                error={course.error}
              />
            </div>
          </Tabs.Content>
          <Tabs.Content value={makeTabValue(course.id, 's')}>
            <div class="summary-tab-viewport">
              <CourseSummaryGrid
                data={course.data}
                loading={course.loading}
                error={course.error}
              />
            </div>
          </Tabs.Content>
        {/each}
      </Tabs>
    {/if}
  </div>
</section>
