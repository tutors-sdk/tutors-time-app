<script lang="ts">
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import CalendarTable from "$lib/ui/CalendarTable.svelte";
  import CalendarByWeekGrid from "$lib/ui/CalendarByWeekGrid.svelte";
  import CalendarByDayGrid from "$lib/ui/CalendarByDayGrid.svelte";
  import CalendarSummaryByDayGrid from "$lib/ui/CalendarSummaryByDayGrid.svelte";
  import CalendarSummaryByWeekGrid from "$lib/ui/CalendarSummaryByWeekGrid.svelte";
  import LearningRecordsTable from "$lib/ui/LearningRecordsTable.svelte";
  import LabsGrid from "$lib/ui/LabsGrid.svelte";
  import type { CourseCalendar } from "$lib/types";

  type TabValue = "week" | "day" | "summaryDay" | "summaryWeek" | "raw" | "learning" | "labs";

  interface Props {
    selectedCourse: CourseCalendar | null;
    activeTab: TabValue | null;
  }

  let { selectedCourse, activeTab = $bindable() }: Props = $props();

  const calendarModel = $derived(selectedCourse?.calendarModel ?? null);
</script>

<main class="flex-1 min-w-0 flex flex-col">
  {#if selectedCourse}
    <Tabs value={activeTab ?? "week"} onValueChange={(details) => (activeTab = details.value as TabValue)} class="flex-1 flex flex-col min-h-0">
      <Tabs.List class="shrink-0">
        <Tabs.Trigger value="week">By week</Tabs.Trigger>
        <Tabs.Trigger value="day">By day</Tabs.Trigger>
        <Tabs.Trigger value="summaryDay">Summary by day</Tabs.Trigger>
        <Tabs.Trigger value="summaryWeek">Summary by week</Tabs.Trigger>
        <Tabs.Trigger value="raw">Raw Calendar</Tabs.Trigger>
        <Tabs.Trigger value="learning">Lab Learning Records</Tabs.Trigger>
        <Tabs.Trigger value="labs">Labs</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="week" class="flex-1 min-h-0">
        <div class="visual-tab-viewport h-full">
          {#if calendarModel}
            <CalendarByWeekGrid model={calendarModel} />
          {/if}
        </div>
      </Tabs.Content>
      <Tabs.Content value="day" class="flex-1 min-h-0">
        <div class="visual-tab-viewport h-full">
          {#if calendarModel}
            <CalendarByDayGrid model={calendarModel} />
          {/if}
        </div>
      </Tabs.Content>
      <Tabs.Content value="summaryDay" class="flex-1 min-h-0">
        <div class="summary-tab-viewport h-full">
          {#if calendarModel}
            <CalendarSummaryByDayGrid model={calendarModel} />
          {/if}
        </div>
      </Tabs.Content>
      <Tabs.Content value="summaryWeek" class="flex-1 min-h-0">
        <div class="summary-tab-viewport h-full">
          {#if calendarModel}
            <CalendarSummaryByWeekGrid model={calendarModel} />
          {/if}
        </div>
      </Tabs.Content>
      <Tabs.Content value="raw" class="flex-1 min-h-0">
        <CalendarTable data={selectedCourse.data} loading={selectedCourse.loading} error={selectedCourse.error} />
      </Tabs.Content>
      <Tabs.Content value="learning" class="flex-1 min-h-0">
        <LearningRecordsTable 
          data={selectedCourse.learningRecords} 
          loading={selectedCourse.learningRecordsLoading} 
          error={selectedCourse.learningRecordsError} 
        />
      </Tabs.Content>
      <Tabs.Content value="labs" class="flex-1 min-h-0">
        <div class="visual-tab-viewport h-full">
          <LabsGrid 
            data={selectedCourse.learningRecords} 
            loading={selectedCourse.learningRecordsLoading} 
            error={selectedCourse.learningRecordsError} 
          />
        </div>
      </Tabs.Content>
    </Tabs>
  {:else}
    <div class="flex items-center justify-center flex-1">
      <p class="text-lg text-surface-600">No course loaded</p>
    </div>
  {/if}
</main>
