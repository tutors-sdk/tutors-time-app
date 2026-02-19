<script lang="ts">
  import PinDialog from "$lib/components/PinDialog.svelte";
  import CalendarGrid from "$lib/components/calendar/CalendarGrid.svelte";
  import type { TutorsTimeCourse }  from "$lib/tutors-time-service/types/tutors-time-types";
  let showPinDialog = $state(true);
  interface Props {
    data: { course: TutorsTimeCourse | null };
  }

  let { data }: Props = $props();
  
  function onVerified() {
    showPinDialog = false;
    // App continues...
  }
</script>

<PinDialog
  open={showPinDialog}
  pin={data.course?.pin ?? ""}
  onVerified={onVerified}
/>

<CalendarGrid course={data.course} mode="week" />
