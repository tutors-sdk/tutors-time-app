<script lang="ts">
  import CalendarGrid from "$lib/components/calendar/CalendarGrid.svelte";
  import LabsGrid from "$lib/components/labs/LabsGrid.svelte";
  import { CourseTime } from "$lib/services/CourseTime";
  import type { StudentCalendar } from "$lib/types";
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  let studentCalendar = $state<StudentCalendar | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const studentDisplayName = $derived(
    studentCalendar && studentCalendar.data.length > 0
      ? studentCalendar.data[0].full_name || studentCalendar.studentId
      : studentCalendar?.studentId ?? ""
  );

  onMount(async () => {
    const rawCourseId: string | undefined = $page.params.courseid as string | undefined;
    const rawStudentId: string | undefined = $page.params.studentid as string | undefined;

    const courseId = (rawCourseId ?? "").trim();
    const studentId = (rawStudentId ?? "").trim();

    if (!courseId || !studentId) {
      error = "Course ID and student ID are required.";
      loading = false;
      return;
    }

    try {
      const result = await CourseTime.loadStudentCalendar(courseId, studentId, null, null);
      studentCalendar = result;
      error = result.error;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load student calendar data";
    } finally {
      loading = false;
    }
  });

  function goBackToCourse() {
    goto("/");
  }
</script>

<svelte:head>
  <title>Student Calendar</title>
  <meta name="description" content="Single-student calendar view for a specific course" />
</svelte:head>

<section class="p-2 h-[calc(100vh-4rem)]">
  <div class="card p-4 h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div>
        <h1 class="text-3xl font-bold">Student Calendar</h1>
        <p class="text-surface-600 text-sm mt-1">
          Course:
          {#if studentCalendar}
            {studentCalendar.title} ({studentCalendar.id})
          {:else}
            {$page.params.courseid}
          {/if}
          · Student:
          {#if studentCalendar}
            {studentCalendar.studentId}
          {:else}
            {$page.params.studentid}
          {/if}
        </p>
      </div>
      <button
        type="button"
        class="btn preset-outlined"
        onclick={goBackToCourse}
        aria-label="Back to course calendar"
      >
        Back to course calendar
      </button>
    </div>

    <div class="flex flex-col flex-1 min-h-0">
      {#if loading}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg">Loading student calendar...</p>
        </div>
      {:else if error}
        <div class="card preset-filled-error-500 p-4">
          <p class="font-bold">Error loading student calendar</p>
          <p class="text-sm">{error}</p>
        </div>
      {:else if studentCalendar && !studentCalendar.calendarModel.hasData}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">
            No calendar data found for this student in this course.
          </p>
        </div>
      {:else if studentCalendar}
        <div class="flex flex-col gap-4 flex-1 min-h-0">
          <section class="visual-tab-viewport h-1/2 min-h-[220px]">
            <h2 class="text-xl font-semibold mb-2">By week</h2>
            <div class="h-[calc(100%-2rem)]">
              <CalendarGrid model={studentCalendar.calendarModel} mode="week" />
            </div>
          </section>

          <section class="visual-tab-viewport h-1/2 min-h-[220px]">
            <h2 class="text-xl font-semibold mb-2">Labs by lab</h2>
            <div class="h-[calc(100%-2rem)]">
              <LabsGrid model={studentCalendar.labsModel} mode="lab" studentId={studentDisplayName} />
            </div>
          </section>
        </div>
      {/if}
    </div>
  </div>
</section>

