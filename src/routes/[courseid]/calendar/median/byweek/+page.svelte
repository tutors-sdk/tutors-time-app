<script lang="ts">
  import CalendarMedianComponent from "$lib/components/calendar/CalendarMedianComponent.svelte";
  import type { CourseCalendar } from "$lib/types";

  interface Props {
    data: { course: CourseCalendar | null };
  }

  let { data }: Props = $props();
</script>

<CalendarMedianComponent course={data.course} mode="week" />
