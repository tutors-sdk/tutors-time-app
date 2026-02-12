<script lang="ts">
  import CalendarComponent from "$lib/components/calendar/CalendarComponent.svelte";
  import { page } from "$app/stores";

  const courseId = $derived(($page.params.courseid as string) ?? "");
</script>

{#key courseId}
  <CalendarComponent courseId={courseId} mode="day" />
{/key}
