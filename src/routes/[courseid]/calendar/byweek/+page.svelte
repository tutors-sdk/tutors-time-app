<script lang="ts">
  import CalendarComponent from "$lib/components/calendar/CalendarComponent.svelte";
  import type { CourseCalendar } from "$lib/types";

  interface Props {
    data: { course: CourseCalendar | null };
  }

  let { data }: Props = $props();
</script>

<CalendarComponent course={data.course} mode="week" />
