<script lang="ts">
  import CalendarMedianGrid from "$lib/components/calendar/CalendarMedianGrid.svelte";
  import type { CourseCalendar } from "$lib/types";

  type Mode = "week" | "day";

  interface Props {
    course: CourseCalendar | null;
    mode: Mode;
  }

  let { course, mode }: Props = $props();

  const title = $derived(mode === "week" ? "Median by week" : "Median by day");
  const error = $derived(course?.error ?? null);
  const hasMedianData = $derived(
    course ? (mode === "day" ? course.calendarModel.hasMedianByDay : course.calendarModel.hasMedianByWeek) : false
  );
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content="Course {title.toLowerCase()}" />
</svelte:head>

<section class="p-2 h-[calc(100vh-4rem)]">
  <div class="card p-4 h-full flex flex-col">
    <div class="flex flex-col flex-1 min-h-0">
      {#if !course}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg">Loading calendar data...</p>
        </div>
      {:else if error}
        <div class="card preset-filled-error-500 p-4">
          <p class="font-bold">Error loading calendar</p>
          <p class="text-sm">{error}</p>
        </div>
      {:else if !hasMedianData}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">No median data found for this course.</p>
        </div>
      {:else}
        <div class="flex-1 min-h-0 flex flex-col">
          <div class="flex-1 min-h-0">
            <CalendarMedianGrid model={course.calendarModel} {mode} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
