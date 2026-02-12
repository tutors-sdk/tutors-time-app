<script lang="ts">
  import LabsMedianGrid from "$lib/components/labs/LabsMedianGrid.svelte";
  import { CourseTime } from "$lib/services/CourseTime";
  import type { CourseCalendar } from "$lib/types";
  import { onMount } from "svelte";

  type Mode = "day" | "week";

  interface Props {
    courseId: string;
    mode: Mode;
  }

  let { courseId, mode }: Props = $props();

  let course = $state<CourseCalendar | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  const title = $derived(mode === "week" ? "Median lab by week" : "Median lab by step");

  onMount(async () => {
    const id = courseId.trim();

    if (!id) {
      error = "Course ID is required.";
      loading = false;
      return;
    }

    try {
      course = await CourseTime.loadCalendar(id, null, null);
      error = course.error;
    } catch (e) {
      error = e instanceof Error ? e.message : "Failed to load lab data";
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content="Course {title.toLowerCase()}" />
</svelte:head>

<section class="p-2 h-[calc(100vh-4rem)]">
  <div class="card p-4 h-full flex flex-col">
    <div class="flex flex-col flex-1 min-h-0">
      {#if loading}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg">Loading lab data...</p>
        </div>
      {:else if error && !course}
        <div class="card preset-filled-error-500 p-4">
          <p class="font-bold">Error loading lab data</p>
          <p class="text-sm">{error}</p>
        </div>
      {:else if course && !(mode === "day" ? course.labsModel.hasMedianByLabStep : course.labsModel.hasMedianByLab)}
        <div class="flex items-center justify-center flex-1">
          <p class="text-lg text-surface-600">No median data found for this course.</p>
        </div>
      {:else if course}
        <div class="flex-1 min-h-0 flex flex-col">
          <div class="flex-1 min-h-0">
            <LabsMedianGrid model={course.labsModel} {mode} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
