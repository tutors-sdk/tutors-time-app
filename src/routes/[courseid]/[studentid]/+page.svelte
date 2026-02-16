<script lang="ts">
  import type { StudentCalendar } from "$lib/types";
  import CalendarHeatmap from "$lib/components/calendar/CalendarHeatmap.svelte";
  import StudentCalendarTable from "$lib/components/tables/StudentCalendarTable.svelte";
  import StudentLabTable from "$lib/components/tables/StudentLabTable.svelte";

  interface Props {
    data: { studentCalendar: StudentCalendar };
  }

  let { data }: Props = $props();

</script>

<svelte:head>
  <title>Student Calendar</title>
  <meta name="description" content="Single-student calendar view for a specific course" />
</svelte:head>

<section class="p-2 h-[calc(100vh-4rem)] flex flex-col min-h-0 overflow-y-auto">
  <!-- Heatmaps: full width, stacked above tables (both in scroll flow) -->
  {#if data.studentCalendar && (data.studentCalendar. course?.dates?.length ?? 0) > 0}
    <section class="heatmap-full-width shrink-0 py-4 -mx-2 w-[calc(100%+1rem)] min-w-0 space-y-6">
      {#if data.studentCalendar.calendarByDay}
        <div class="px-4">
          <h2 class="text-2xl font-semibold mb-4">Calendar Activity Heatmap – {data.studentCalendar.studentName}</h2>
          <CalendarHeatmap calendarByDay={data.studentCalendar.calendarByDay} dates={data.studentCalendar.course?.dates ?? []} elementId="student-activity-heatmap" />
        </div>
      {/if}
      {#if data.studentCalendar.course?.calendarModel?.medianByDay?.row}
        <div class="px-4">
          <h2 class="text-2xl font-semibold mb-4">Course Median Activity Heatmap</h2>
          <CalendarHeatmap calendarByDay={data.studentCalendar.course?.calendarModel?.medianByDay?.row} dates={data.studentCalendar.course?.dates ?? []} elementId="course-median-heatmap" />
        </div>
      {/if}
      {#if data.studentCalendar?.labsByDay}
        <div class="px-4">
          <h2 class="text-2xl font-semibold mb-4">Lab Activity by Day – {data.studentCalendar.studentName}</h2>
          <CalendarHeatmap calendarByDay={data.studentCalendar.labsByDay} dates={data.studentCalendar.course?.dates ?? []} elementId="student-lab-heatmap" />
        </div>
      {/if}
      {#if data.studentCalendar.course?.labsMedianByDay}
        <div class="px-4">
          <h2 class="text-2xl font-semibold mb-4">Lab Median Activity by Day</h2>
          <CalendarHeatmap calendarByDay={data.studentCalendar.course?.labsMedianByDay} dates={data.studentCalendar.course?.dates ?? []} elementId="lab-median-heatmap" />
        </div>
      {/if}
    </section>
  {/if}

  <div class="card p-4 flex flex-col min-w-0 shrink-0">
    <div class="flex flex-col gap-6">
      {#if data.studentCalendar.error}
        <div class="card preset-filled-error-500 p-4">
          <p class="font-bold">Error loading student calendar</p>
          <p class="text-sm">{data.studentCalendar.error}</p>
        </div>
      {:else if data.studentCalendar && !data.studentCalendar.hasData}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">
            No calendar or lab data found for this student in this course.
          </p>
        </div>
      {:else if data.studentCalendar}
        <div class="flex flex-col gap-6">
          <StudentCalendarTable
            courseid={data.studentCalendar.courseid}
            studentid={data.studentCalendar.studentid}
            calendarByWeek={data.studentCalendar.calendarByWeek}
            medianRow={data.studentCalendar.course?.calendarModel?.medianByWeek?.row ?? null}
            weeks={data.studentCalendar.course?.weeks ?? []}
          />
          <StudentLabTable
            courseid={data.studentCalendar.courseid}
            studentid={data.studentCalendar.studentid}
            studentLabRow={data.studentCalendar.labsByLab}
            labMedianRow={data.studentCalendar.course?.labsModel?.medianByLab?.row ?? null}
            labColumns={data.studentCalendar.course?.labColumns ?? []}
          />
        </div>
      {/if}
    </div>
  </div>
</section>
