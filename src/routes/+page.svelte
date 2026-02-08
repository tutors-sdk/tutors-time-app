<script lang="ts">
  import CourseIdDialog from "$lib/ui/CourseIdDialog.svelte";
  import CourseTabsView from "$lib/ui/CourseTabsView.svelte";
  import { CourseTime } from "$lib/services/CourseTime";
  import type { CourseCalendar } from "$lib/types";

  let course = $state<CourseCalendar | null>(null);
  let courseIdForDialog = $state<string | null>(null);
  let dialogOpen = $state(true);
  let dialogLoading = $state(false);
  let dialogError = $state<string | null>(null);
  let activeTab = $state<"raw" | "calendar" | "summary" | "learning" | "labs" | null>(null);

  async function handleLoadCourse(courseId: string, startDate: string | null, endDate: string | null) {
    dialogError = null;
    dialogLoading = true;
    try {
      const loaded = await CourseTime.loadCalendar(courseId, startDate, endDate);
      course = loaded;
      courseIdForDialog = loaded.id;
      activeTab = "calendar";
      dialogOpen = false;
    } catch (e) {
      dialogError = e instanceof Error ? e.message : "Failed to load calendar data";
    } finally {
      dialogLoading = false;
    }
  }

  function handleCourseIdSubmit(
    event: CustomEvent<{ courseId: string; startDate: string | null; endDate: string | null }>
  ) {
    handleLoadCourse(event.detail.courseId, event.detail.startDate, event.detail.endDate);
  }

  function openChangeCourseDialog() {
    dialogOpen = true;
  }

  function handleDialogClose() {
    if (!course) {
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
  courseId={courseIdForDialog}
  loading={dialogLoading}
  error={dialogError}
  on:submit={handleCourseIdSubmit}
  on:close={handleDialogClose}
  on:open={handleDialogOpen}
/>

<section class="p-2 h-[calc(100vh-4rem)]">
  <div class="card p-4 h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 shrink-0">
      <h1 class="text-3xl font-bold">Calendar Data</h1>
      {#if course}
        <button
          type="button"
          class="btn preset-outlined"
          onclick={openChangeCourseDialog}
        >
          Change course
        </button>
      {/if}
    </div>

    <div class="flex flex-col flex-1 min-h-0">
      {#if course}
        <CourseTabsView selectedCourse={course} bind:activeTab />
      {:else}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">
            Enter a course ID to load calendar data
          </p>
        </div>
      {/if}
    </div>
  </div>
</section>
