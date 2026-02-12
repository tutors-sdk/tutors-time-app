<script lang="ts">
  import CalendarGrid from "$lib/components/calendar/CalendarGrid.svelte";
  import { CourseTimeService } from "$lib/services/CourseTimeService";
  import type { CourseCalendar } from "$lib/types";
  import { onMount } from "svelte";

  type Mode = "week" | "day";

  interface Props {
    courseId: string;
    mode: Mode;
  }

  let { courseId, mode }: Props = $props();

  let course = $state<CourseCalendar | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const title = $derived(mode === "week" ? "Calendar by week" : "Calendar by day");

  onMount(async () => {
    const id = courseId.trim();

    if (!id) {
      error = "Course ID is required.";
      loading = false;
      return;
    }

    try {
      const courseTime = await CourseTimeService.loadCourse(id);
      course = courseTime.courseData;
      error = course?.error ?? null;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load calendar data";
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content="Course {title.toLowerCase()}" />
</svelte:head>

<section class="p-2 h-[calc(100vh-4rem)]">
  <div class="card p-4 h-full flex flex-col">
    <div class="flex flex-col flex-1 min-h-0">
      {#if loading}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg">Loading calendar data...</p>
        </div>
      {:else if error && !course}
        <div class="card preset-filled-error-500 p-4">
          <p class="font-bold">Error loading calendar</p>
          <p class="text-sm">{error}</p>
        </div>
      {:else if course && !course.calendarModel.hasData}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">No calendar data found for this course.</p>
        </div>
      {:else if course}
        <div class="flex-1 min-h-0 flex flex-col">
          <div class="flex-1 min-h-0">
            <CalendarGrid model={course.calendarModel} {mode} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
