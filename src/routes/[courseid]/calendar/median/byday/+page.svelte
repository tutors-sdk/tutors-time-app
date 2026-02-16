<script lang="ts">
  import CalendarMedianGrid from "$lib/components/calendar/CalendarMedianGrid.svelte";
  import type { CourseCalendar } from "$lib/types";

  interface Props {
    data: { course: CourseCalendar | null };
  }

  let { data }: Props = $props();
</script>

<CalendarMedianGrid course={data.course} mode="day" />
