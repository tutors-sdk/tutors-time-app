<script lang="ts">
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import CalendarTable from "$lib/ui/CalendarTable.svelte";
  import CalendarGrid from "$lib/components/calendar/CalendarGrid.svelte";
  import LearningRecordsTable from "$lib/ui/LearningRecordsTable.svelte";
  import LabsGrid from "$lib/components/labs/LabsGrid.svelte";
  import type { CourseCalendar } from "$lib/types";

  type TabValue =
    | "week"
    | "day"
    | "summaryDay"
    | "summaryWeek"
    | "raw"
    | "learning"
    | "labsStep"
    | "labsLab";

  interface Props {
    selectedCourse: CourseCalendar | null;
    activeTab: TabValue | null;
  }

  let { selectedCourse, activeTab = $bindable() }: Props = $props();

  const calendarModel = $derived(selectedCourse?.calendarModel ?? null);
  const labsModel = $derived(selectedCourse?.labsModel ?? null);
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
        <Tabs.Trigger value="labsStep">Labs by Step</Tabs.Trigger>
        <Tabs.Trigger value="labsLab">Labs by Lab</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="week" class="flex-1 min-h-0">
        <div class="visual-tab-viewport h-full">
          {#if calendarModel}
            <CalendarGrid model={calendarModel} mode="week" />
          {/if}
        </div>
      </Tabs.Content>
      <Tabs.Content value="day" class="flex-1 min-h-0">
        <div class="visual-tab-viewport h-full">
          {#if calendarModel}
            <CalendarGrid model={calendarModel} mode="day" />
          {/if}
        </div>
      </Tabs.Content>
      <Tabs.Content value="summaryDay" class="flex-1 min-h-0">
        <div class="summary-tab-viewport h-full">
          {#if calendarModel}
            <CalendarGrid model={calendarModel} mode="day" variant="summary" />
          {/if}
        </div>
      </Tabs.Content>
      <Tabs.Content value="summaryWeek" class="flex-1 min-h-0">
        <div class="summary-tab-viewport h-full">
          {#if calendarModel}
            <CalendarGrid model={calendarModel} mode="week" variant="summary" />
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
      <Tabs.Content value="labsStep" class="flex-1 min-h-0">
        <div class="visual-tab-viewport h-full">
          {#if labsModel}
            <LabsGrid model={labsModel} mode="step" />
          {/if}
        </div>
      </Tabs.Content>
      <Tabs.Content value="labsLab" class="flex-1 min-h-0">
        <div class="visual-tab-viewport h-full">
          {#if labsModel}
            <LabsGrid model={labsModel} mode="lab" />
          {/if}
        </div>
      </Tabs.Content>
    </Tabs>
  {:else}
    <div class="flex items-center justify-center flex-1">
      <p class="text-lg text-surface-600">No course loaded</p>
    </div>
  {/if}
</main>
