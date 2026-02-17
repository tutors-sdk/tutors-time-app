<script lang="ts">
  import LabsMedianGrid from "$lib/components/labs/LabsMedianGrid.svelte";
  import type { TutorsTimeCourse } from "$lib/tutors-time-service/types";

  interface Props {
    data: { course: TutorsTimeCourse | null };
  }

  let { data }: Props = $props();
</script>

<LabsMedianGrid course={data.course} mode="week" />
