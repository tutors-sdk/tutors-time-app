<script lang="ts">
  import CourseTabsView from "$lib/ui/CourseTabsView.svelte";
  import { CourseTime } from "$lib/services/CourseTime";
  import type { CourseCalendar } from "$lib/types";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let course = $state<CourseCalendar | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);
  let activeTab = $state<"week" | "day" | "summaryDay" | "medianByWeek" | "raw" | "learning" | "labsStep" | "labsLab" | "medianLabsDay" | "medianLabsWeek" | null>(null);
  let lastLoadedCourseId = $state<string | null>(null);

  // Extract course ID from route params and auto-load
  $effect(() => {
    const rawCourseId: string | undefined = $page.params.courseid as string | undefined;
    const courseId = (rawCourseId ?? "").trim();

    if (!courseId) {
      error = "Course ID is required.";
      return;
    }

    // Only load if this is a different course ID than what we last loaded
    if (lastLoadedCourseId !== courseId) {
      handleLoadCourse(courseId, null, null);
    }
  });

  async function handleLoadCourse(courseId: string, startDate: string | null, endDate: string | null) {
    error = null;
    loading = true;
    try {
      const loaded = await CourseTime.loadCalendar(courseId, startDate, endDate);
      course = loaded;
      lastLoadedCourseId = loaded.id;
      activeTab = "week";
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load calendar data";
      lastLoadedCourseId = null;
    } finally {
      loading = false;
    }
  }

  function goToCoursePicker() {
    goto("/");
  }
</script>

<svelte:head>
  <title>Tutors Time</title>
  <meta name="description" content="Calendar visualization for student course time tracking" />
</svelte:head>

<section class="p-2 h-[calc(100vh-4rem)]">
  <div class="card p-4 h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 shrink-0">
      <h1 class="text-3xl font-bold">
        Calendar Data {#if course} for {course.title}{/if}
      </h1>
      <button
        type="button"
        class="btn preset-outlined"
        onclick={goToCoursePicker}
        aria-label="Back to course picker"
      >
        Change course
      </button>
    </div>

    <div class="flex flex-col flex-1 min-h-0">
      {#if loading}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg">Loading calendar data...</p>
        </div>
      {:else if error && !course}
        <div class="card preset-filled-error-500 p-4">
          <p class="font-bold">Error loading data</p>
          <p class="text-sm">{error}</p>
        </div>
      {:else if course}
        <CourseTabsView selectedCourse={course} bind:activeTab />
      {:else}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">
            No calendar data available for this course.
          </p>
        </div>
      {/if}
    </div>
  </div>
</section>
