<script lang="ts">
  import CalendarMedianComponent from "$lib/components/calendar/CalendarMedianComponent.svelte";
  import { page } from "$app/stores";

  const courseId = $derived(($page.params.courseid as string) ?? "");
</script>

{#key courseId}
  <CalendarMedianComponent courseId={courseId} mode="day" />
{/key}
