<script lang="ts">
  import type { LabViewMode } from '$lib/services/learningRecordUtils';

  interface Props {
    viewMode: LabViewMode;
    onToggle: () => void;
  }

  let { viewMode, onToggle }: Props = $props();
</script>

<div class="flex shrink-0 justify-end">
  <button
    type="button"
    onclick={onToggle}
    class="btn variant-filled-secondary"
    aria-label={viewMode === 'lab' ? 'Switch to step view' : 'Switch to lab view'}
  >
    {viewMode === 'lab' ? 'View by Step' : 'View by Lab'}
  </button>
</div>
