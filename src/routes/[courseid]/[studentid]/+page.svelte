<script lang="ts">
  import type { StudentCalendar } from "$lib/types";
  import CalendarHeatmap from "$lib/components/calendar/CalendarHeatmap.svelte";
  import StudentCalendarTable from "$lib/components/tables/StudentCalendarTable.svelte";
  import StudentLabTable from "$lib/components/tables/StudentLabTable.svelte";
  import { CourseTimeService } from "$lib/services/CourseTimeService";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  let studentCalendar = $state<StudentCalendar | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  /** Student's calendar row (by week) - loaded from StudentCalendar.calendarByWeek */
  const calendarByWeek = $derived(studentCalendar?.calendarByWeek ?? null);
  const medianRow = $derived(studentCalendar?.courseMedianByWeek ?? null);
  const weeks = $derived(studentCalendar?.weeks ?? []);
  /** Student's calendar row (by day) - for heatmap */
  const calendarByDay = $derived(studentCalendar?.calendarByDay ?? null);
  const dates = $derived(studentCalendar?.dates ?? []);
  /** Course median row (by day) - for median heatmap */
  const courseMedianByDay = $derived(studentCalendar?.courseMedianByDay ?? null);
  const studentLabRow = $derived(studentCalendar?.labsByLab ?? null);
  const labMedianRow = $derived(studentCalendar?.labsMedianByLab ?? null);
  const labColumns = $derived(studentCalendar?.labColumns ?? []);
  /** Student's lab row (by day) – for lab activity heatmap */
  const labsByDay = $derived(studentCalendar?.labsByDay ?? null);
  /** Course median lab row (by day) – for lab median heatmap */
  const labsMedianByDay = $derived(studentCalendar?.labsMedianByDay ?? null);

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
      const result = await CourseTimeService.loadStudentCalendar(courseId, studentId, null, null);
      studentCalendar = result;
      error = result.error;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load student calendar data";
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Student Calendar</title>
  <meta name="description" content="Single-student calendar view for a specific course" />
</svelte:head>

<section class="p-2 h-[calc(100vh-4rem)] flex flex-col min-h-0 overflow-y-auto">
  <!-- Heatmaps: full width, stacked above tables (both in scroll flow) -->
  {#if studentCalendar && dates.length > 0}
    <section class="heatmap-full-width shrink-0 py-4 -mx-2 w-[calc(100%+1rem)] min-w-0 space-y-6">
      {#if calendarByDay}
        <div class="px-4">
          <h2 class="text-2xl font-semibold mb-4">Calendar Activity Heatmap – {studentCalendar.studentName}</h2>
          <CalendarHeatmap calendarByDay={calendarByDay} {dates} elementId="student-activity-heatmap" />
        </div>
      {/if}
      {#if courseMedianByDay}
        <div class="px-4">
          <h2 class="text-2xl font-semibold mb-4">Course Median Activity Heatmap</h2>
          <CalendarHeatmap calendarByDay={courseMedianByDay} {dates} elementId="course-median-heatmap" />
        </div>
      {/if}
      {#if labsByDay}
        <div class="px-4">
          <h2 class="text-2xl font-semibold mb-4">Lab Activity by Day – {studentCalendar.studentName}</h2>
          <CalendarHeatmap calendarByDay={labsByDay} {dates} elementId="student-lab-heatmap" />
        </div>
      {/if}
      {#if labsMedianByDay}
        <div class="px-4">
          <h2 class="text-2xl font-semibold mb-4">Lab Median Activity by Day</h2>
          <CalendarHeatmap calendarByDay={labsMedianByDay} {dates} elementId="lab-median-heatmap" />
        </div>
      {/if}
    </section>
  {/if}

  <div class="card p-4 flex flex-col min-w-0 shrink-0">
    <div class="flex flex-col gap-6">
      {#if loading}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg">Loading student calendar...</p>
        </div>
      {:else if error}
        <div class="card preset-filled-error-500 p-4">
          <p class="font-bold">Error loading student calendar</p>
          <p class="text-sm">{error}</p>
        </div>
      {:else if studentCalendar && !studentCalendar.hasData}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">
            No calendar or lab data found for this student in this course.
          </p>
        </div>
      {:else if studentCalendar}
        <div class="flex flex-col gap-6">
          <StudentCalendarTable
            courseid={studentCalendar.courseid}
            studentid={studentCalendar.studentid}
            calendarByWeek={calendarByWeek}
            medianRow={medianRow}
            weeks={weeks}
          />
          <StudentLabTable
            courseid={studentCalendar.courseid}
            studentid={studentCalendar.studentid}
            studentLabRow={studentLabRow}
            labMedianRow={labMedianRow}
            labColumns={labColumns}
          />
        </div>
      {/if}
    </div>
  </div>
</section>
