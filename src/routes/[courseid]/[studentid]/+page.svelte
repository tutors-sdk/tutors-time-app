<script lang="ts">
  import CalendarGrid from "$lib/components/calendar/CalendarGrid.svelte";
  import { CourseTimeService } from "$lib/services/CourseTimeService";
  import type { StudentCalendar } from "$lib/types";
  import type { CalendarRow, CalendarMedianRow } from "$lib/components/calendar/calendarUtils";
  import type { LabRow, LabMedianRow } from "$lib/components/labs/labUtils";
  import { formatDateShort, formatTimeMinutesOnly, cellColorForMinutes } from "$lib/components/calendar/calendarUtils";
  import { extractLabIdentifier } from "$lib/components/labs/labUtils";
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

  // Get student row from week data
  const studentRow = $derived.by<CalendarRow | null>(() => {
    const calendar = studentCalendar;
    if (!calendar?.calendarModel?.week?.rows || !calendar.studentId) return null;
    const studentId = calendar.studentId;
    return calendar.calendarModel.week.rows.find(
      (r) => r.studentid === studentId
    ) ?? null;
  });

  // Get course median row
  const medianRow = $derived(studentCalendar?.calendarModel.medianByWeek.row ?? null);

  // Get week columns (week Monday dates) from CalendarModel columnDefs to match studentRow structure
  const weeks = $derived.by(() => {
    if (!studentCalendar?.calendarModel?.week?.columnDefs) return [];
    // Extract week field names from columnDefs (excluding full_name, studentid, totalSeconds)
    return studentCalendar.calendarModel.week.columnDefs
      .map((col) => col.field as string)
      .filter((field) => field && field !== "full_name" && field !== "studentid" && field !== "totalSeconds");
  });

  // Format time from seconds as minutes only
  function formatTime(seconds: number | undefined): string {
    if (seconds == null || seconds === 0) return "—";
    const minutes = Math.round(seconds / 60);
    return `${minutes}`;
  }

  // Format lab time from 30-second blocks as minutes only
  function formatLabTime(blocks: number | undefined): string {
    if (blocks == null || blocks === 0) return "—";
    return formatTimeMinutesOnly(blocks);
  }

  // Get student lab row (filter by display name since learning records use full_name)
  const studentLabRow = $derived.by<LabRow | null>(() => {
    const calendar = studentCalendar;
    if (!calendar?.labsModel?.lab?.rows) return null;
    const displayName = studentDisplayName;
    return calendar.labsModel.lab.rows.find(
      (r) => r.studentid === displayName
    ) ?? null;
  });

  // Get course median lab row
  const labMedianRow = $derived(studentCalendar?.labsModel?.medianByLab?.row ?? null);

  // Get lab column IDs (extract from columnDefs, excluding studentid and totalMinutes)
  const labColumns = $derived.by(() => {
    if (!studentCalendar?.labsModel?.lab?.columnDefs) return [];
    return studentCalendar.labsModel.lab.columnDefs
      .map((col) => col.field as string)
      .filter((field) => field !== "studentid" && field !== "totalMinutes");
  });


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
        <div class="flex flex-col gap-6 flex-1 min-h-0 overflow-auto">
          <!-- Calendar Table -->
          {#if studentCalendar.calendarModel.hasData && studentRow}
            <section class="card p-6">
              <h2 class="text-2xl font-semibold mb-4">Calendar Activity by Week</h2>
              <div class="overflow-x-auto">
                <table class="w-full border-collapse" style="table-layout: fixed;">
                  <thead>
                    <tr class="border-b-2 border-surface-300">
                      <th class="text-left py-4 px-4 font-semibold" style="width: 160px;">Name</th>
                      {#each weeks as week}
                        <th class="text-center py-4 px-1 font-semibold align-middle" style="width: 36px; min-width: 36px; max-width: 36px; height: 140px; overflow: hidden;">
                          <div class="transform -rotate-90 whitespace-nowrap text-xs" style="height: 100%; display: flex; align-items: center; justify-content: center;">
                            {formatDateShort(week)}
                          </div>
                        </th>
                      {/each}
                      <th class="text-right py-4 px-4 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Student Row -->
                    <tr class="border-b border-surface-200 hover:bg-surface-50">
                      <td class="py-3 px-4" style="width: 160px;">
                        <a href="/{studentCalendar.id}/{studentCalendar.studentId}" class="underline text-primary-600">
                          {studentRow.full_name}
                        </a>
                      </td>
                      {#each weeks as week}
                        {@const weekSeconds = studentRow[week] as number | undefined}
                        {@const weekBlocks = weekSeconds != null ? Math.round(weekSeconds / 30) : 0}
                        <td class="py-3 px-1 text-center font-mono text-xs" style="width: 36px; min-width: 36px; max-width: 36px; background-color: {cellColorForMinutes(weekBlocks)}">
                          {formatTime(weekSeconds)}
                        </td>
                      {/each}
                      <td class="py-3 px-4 text-right font-mono font-semibold" style="background-color: {cellColorForMinutes(studentRow.totalSeconds != null ? Math.round(studentRow.totalSeconds / 30) : 0)}">
                        {formatTime(studentRow.totalSeconds)}
                      </td>
                    </tr>
                    <!-- Median Row -->
                    {#if medianRow}
                      <tr class="border-b-2 border-surface-300 bg-surface-100">
                        <td class="py-3 px-4 font-semibold" style="width: 160px;">Course Median</td>
                        {#each weeks as week}
                          {@const weekBlocks = medianRow[week] as number | undefined}
                          <td class="py-3 px-1 text-center font-mono text-xs" style="width: 36px; min-width: 36px; max-width: 36px; background-color: {cellColorForMinutes(weekBlocks ?? 0)}">
                            {formatLabTime(weekBlocks)}
                          </td>
                        {/each}
                        {@const totalBlocks = medianRow.totalSeconds ?? 0}
                        <td class="py-3 px-4 text-right font-mono font-semibold" style="background-color: {cellColorForMinutes(totalBlocks)}">
                          {formatLabTime(medianRow.totalSeconds)}
                        </td>
                      </tr>
                    {/if}
                  </tbody>
                </table>
              </div>
            </section>
          {/if}

          <!-- Labs Table -->
          {#if studentCalendar.labsModel.hasData && studentLabRow}
            <section class="card p-6">
              <h2 class="text-2xl font-semibold mb-4">Lab Activity by Lab</h2>
              <div class="overflow-x-auto">
                <table class="w-full border-collapse" style="table-layout: fixed;">
                  <thead>
                    <tr class="border-b-2 border-surface-300">
                      <th class="text-left py-4 px-4 font-semibold" style="width: 160px;">Student ID</th>
                      {#each labColumns as labId}
                        <th class="text-center py-4 px-1 font-semibold align-middle" style="width: 36px; min-width: 36px; max-width: 36px; height: 140px; overflow: hidden;">
                          <div class="transform -rotate-90 whitespace-nowrap text-xs" style="height: 100%; display: flex; align-items: center; justify-content: center;">
                            {extractLabIdentifier(labId)}
                          </div>
                        </th>
                      {/each}
                      <th class="text-right py-4 px-4 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Student Row -->
                    <tr class="border-b border-surface-200 hover:bg-surface-50">
                      <td class="py-3 px-4" style="width: 160px;">
                        <a href="https://github.com/{studentCalendar.studentId}" target="_blank" rel="noopener noreferrer" class="underline text-primary-600">
                          {studentLabRow.studentid}
                        </a>
                      </td>
                      {#each labColumns as labId}
                        {@const labBlocks = studentLabRow[labId] as number | undefined}
                        <td class="py-3 px-1 text-center font-mono text-xs" style="width: 36px; min-width: 36px; max-width: 36px; background-color: {cellColorForMinutes(labBlocks ?? 0)}">
                          {formatLabTime(labBlocks)}
                        </td>
                      {/each}
                      <td class="py-3 px-4 text-right font-mono font-semibold" style="background-color: {cellColorForMinutes(studentLabRow.totalMinutes ?? 0)}">
                        {formatLabTime(studentLabRow.totalMinutes)}
                      </td>
                    </tr>
                    <!-- Median Row -->
                    {#if labMedianRow}
                      <tr class="border-b-2 border-surface-300 bg-surface-100">
                        <td class="py-3 px-4 font-semibold" style="width: 160px;">Course Median</td>
                        {#each labColumns as labId}
                          {@const labBlocks = labMedianRow[labId] as number | undefined}
                          <td class="py-3 px-1 text-center font-mono text-xs" style="width: 36px; min-width: 36px; max-width: 36px; background-color: {cellColorForMinutes(labBlocks ?? 0)}">
                            {formatLabTime(labBlocks)}
                          </td>
                        {/each}
                        <td class="py-3 px-4 text-right font-mono font-semibold" style="background-color: {cellColorForMinutes(labMedianRow.totalMinutes ?? 0)}">
                          {formatLabTime(labMedianRow.totalMinutes)}
                        </td>
                      </tr>
                    {/if}
                  </tbody>
                </table>
              </div>
            </section>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</section>

