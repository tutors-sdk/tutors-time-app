<script lang="ts">
  import CalendarGrid from "$lib/components/calendar/CalendarGrid.svelte";
  import LabsGrid from "$lib/components/labs/LabsGrid.svelte";
  import { CourseTime } from "$lib/services/CourseTime";
  import type { StudentCalendar } from "$lib/types";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

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
      const courseTime = new CourseTime();
      const result = await courseTime.loadStudentCalendar(courseId, studentId, null, null);
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

<section class="p-2 h-[calc(100vh-4rem)]">
  <div class="card p-4 h-full flex flex-col">
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
      {:else if studentCalendar && !studentCalendar.calendarModel.hasData && !studentCalendar.labsModel.hasData}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">
            No calendar or lab data found for this student in this course.
          </p>
        </div>
      {:else if studentCalendar}
        <div class="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
          <section class="flex-1 min-h-0 flex flex-col">
            <div class="flex-1 min-h-0">
              <CalendarGrid model={studentCalendar.calendarModel} mode="week" includeMedianRow studentId={studentCalendar.studentId} />
            </div>
          </section>

          <section class="flex-1 min-h-0 flex flex-col">
            <div class="flex-1 min-h-0">
              <LabsGrid model={studentCalendar.labsModel} mode="lab" studentId={studentDisplayName} includeMedianRow />
            </div>
          </section>
        </div>
      {/if}
    </div>
  </div>
</section>

