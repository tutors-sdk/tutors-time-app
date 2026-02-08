<script lang="ts">
  import { Tabs } from "@skeletonlabs/skeleton-svelte";
  import CalendarTable from "$lib/ui/CalendarTable.svelte";
  import CalendarGrid from "$lib/ui/CalendarGrid.svelte";
  import CourseSummaryGrid from "$lib/ui/CourseSummaryGrid.svelte";
  import LearningRecordsTable from "$lib/ui/LearningRecordsTable.svelte";
  import LabsGrid from "$lib/ui/LabsGrid.svelte";
  import type { CourseCalendar } from "$lib/types";

  interface Props {
    selectedCourse: CourseCalendar | null;
    activeTab: "raw" | "calendar" | "summary" | "learning" | "labs" | null;
  }

  let { selectedCourse, activeTab = $bindable() }: Props = $props();
</script>

<main class="flex-1 min-w-0 flex flex-col">
  {#if selectedCourse}
    <Tabs value={activeTab ?? "calendar"} onValueChange={(details) => (activeTab = details.value as "raw" | "calendar" | "summary" | "learning" | "labs")} class="flex-1 flex flex-col min-h-0">
      <Tabs.List class="shrink-0">
        <Tabs.Trigger value="calendar">Calendar</Tabs.Trigger>
        <Tabs.Trigger value="summary">Summary</Tabs.Trigger>
        <Tabs.Trigger value="raw">Raw Calendar</Tabs.Trigger>
        <Tabs.Trigger value="learning">Lab Learning Records</Tabs.Trigger>
        <Tabs.Trigger value="labs">Labs</Tabs.Trigger>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="calendar" class="flex-1 min-h-0">
        <div class="visual-tab-viewport h-full">
          <CalendarGrid data={selectedCourse.data} loading={selectedCourse.loading} error={selectedCourse.error} />
        </div>
      </Tabs.Content>
      <Tabs.Content value="summary" class="flex-1 min-h-0">
        <div class="summary-tab-viewport h-full">
          <CourseSummaryGrid data={selectedCourse.data} loading={selectedCourse.loading} error={selectedCourse.error} />
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
