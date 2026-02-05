<script lang="ts">
  import CourseIdDialog from "$lib/ui/CourseIdDialog.svelte";
  import CourseList from "$lib/ui/CourseList.svelte";
  import CourseTabsView from "$lib/ui/CourseTabsView.svelte";
  import { TutorsStore } from "$lib/services/TutorsStore";
  import type { CourseCalendar } from "$lib/services/calendar";
  import type { PageData } from "./$types";

  // Selected courses and dialog state
  let courses = $state<CourseCalendar[]>([]);
  let primaryCourseId = $state<string | null>(null); // used to seed dialog when single-course
  let dialogOpen = $state(true); // Open dialog on page load

  // Dialog-level state (validation + "any loading" flag)
  let dialogLoading = $state(false);
  let dialogError = $state<string | null>(null);

  // Course selection and tab state
  let selectedCourseId = $state<string | null>(null);
  let activeTab = $state<"raw" | "calendar" | "summary" | null>(null);

  // Derived: find the selected course
  const selectedCourse = $derived(courses.find((c) => c.id === selectedCourseId) ?? null);

  async function handleLoadCourses(courseIds: string[], startDate: string | null, endDate: string | null) {
    dialogError = null;
    dialogLoading = true;

    try {
      const loadedCourses = await TutorsStore.loadCalendar(courseIds, startDate, endDate);

      courses = loadedCourses;

      // Track "primary" course only when a single course is selected
      primaryCourseId = loadedCourses.length === 1 ? loadedCourses[0].id : null;

      // Set initial selected course and tab
      if (loadedCourses.length > 0) {
        selectedCourseId = loadedCourses[0].id;
        activeTab = "calendar";
      }

      dialogOpen = false;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load calendar data";
      dialogError = msg;
    } finally {
      dialogLoading = false;
    }
  }

  function handleCourseIdSubmit(
    event: CustomEvent<{
      courseIds: string[];
      startDate: string | null;
      endDate: string | null;
    }>
  ) {
    handleLoadCourses(event.detail.courseIds, event.detail.startDate, event.detail.endDate);
  }

  function openChangeCourseDialog() {
    dialogOpen = true;
  }

  function handleDialogClose() {
    // Dialog close is handled by the component - prevent closing if no courses selected
    if (!courses.length) {
      dialogOpen = true;
    }
  }

  function handleDialogOpen(event: CustomEvent<{ open: boolean }>) {
    dialogOpen = event.detail.open;
  }

  function handleCourseRemove(event: CustomEvent<{ courseId: string }>) {
    const courseIdToRemove = event.detail.courseId;
    
    // Remove the course from the array
    courses = courses.filter(c => c.id !== courseIdToRemove);
    
    // Update selection if the removed course was selected
    if (selectedCourseId === courseIdToRemove) {
      if (courses.length > 0) {
        // Select the first course, or maintain selection if possible
        selectedCourseId = courses[0].id;
      } else {
        // No courses left, clear selection
        selectedCourseId = null;
        activeTab = null;
      }
    }
    
    // Update primaryCourseId if needed
    if (primaryCourseId === courseIdToRemove) {
      primaryCourseId = courses.length === 1 ? courses[0].id : null;
    }
  }
</script>

<svelte:head>
  <title>Tutors Time</title>
  <meta name="description" content="Calendar visualization for student course time tracking" />
</svelte:head>

<CourseIdDialog
  open={dialogOpen}
  courseId={primaryCourseId}
  loading={dialogLoading}
  error={dialogError}
  on:submit={handleCourseIdSubmit}
  on:close={handleDialogClose}
  on:open={handleDialogOpen}
/>

<section class="p-2 h-[calc(100vh-4rem)]">
  <div class="card p-4 h-full flex flex-col">
    <div class="flex justify-between items-center mb-4 shrink-0">
      <h1 class="text-3xl font-bold">Calendar Data</h1>
    </div>

    <div class="flex gap-4 flex-1 min-h-0">
      <CourseList 
        {courses} 
        bind:selectedCourseId 
        onAddCourses={openChangeCourseDialog}
        on:remove={handleCourseRemove}
      />

      {#if courses.length === 0}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">
            Please select one or more course IDs to view calendar data
          </p>
        </div>
      {:else}
        <CourseTabsView {selectedCourse} bind:activeTab />
      {/if}
    </div>
  </div>
</section>
