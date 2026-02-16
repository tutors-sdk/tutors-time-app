<script lang="ts">
  import CalendarMedianGrid from "$lib/components/calendar/CalendarMedianGrid.svelte";
  import type { TutorsTimeCourse } from "$lib/types";

  interface Props {
    data: { course: TutorsTimeCourse | null };
  }

  let { data }: Props = $props();
</script>

<CalendarMedianGrid course={data.course} mode="week" />
