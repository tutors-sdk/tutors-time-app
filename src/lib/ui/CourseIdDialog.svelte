<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  interface Props {
    open: boolean;
    /** Last used / primary course ID (used to seed multi-input) */
    courseId: string | null;
    /** Overall loading flag while (re)loading courses */
    loading: boolean;
    /** Validation / top-level error message for the dialog */
    error: string | null;
  }

  type Events = {
    /** One or more course IDs submitted from the dialog */
    submit: { courseIds: string[] };
    close: void;
    open: { open: boolean };
  };

  let { open, courseId, loading, error }: Props = $props();

  const dispatch = createEventDispatcher<Events>();

  // Multi-course input: one course ID per line
  let courseIdsInput = $state('');
  let dialogElement: HTMLDialogElement | undefined;

  // Update textarea when primary courseId prop changes
  $effect(() => {
    if (courseId) {
      courseIdsInput = courseId;
    }
  });

  // Handle dialog open/close
  $effect(() => {
    if (open && dialogElement) {
      dialogElement.showModal();
    } else if (!open && dialogElement) {
      dialogElement.close();
    }
  });

  function handleSubmit() {
    const ids = courseIdsInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const uniqueIds = Array.from(new Set(ids));

    if (!uniqueIds.length) {
      return;
    }

    dispatch('submit', { courseIds: uniqueIds });
  }

  function handleClose() {
    // Let the parent decide whether the dialog should reopen
    dispatch('close');
  }
</script>

<dialog
  bind:this={dialogElement}
  class="backdrop:bg-surface-50-950/50 backdrop:backdrop-blur-sm bg-transparent border-none p-0"
  onclose={handleClose}
>
  <div class="card bg-surface-100-900 w-full max-w-md p-6 space-y-4 shadow-xl m-auto">
    <h2 class="text-2xl font-bold">Select Course IDs</h2>
    <p class="text-surface-600">
      Enter one or more course IDs to view calendar data. Use one course ID per line.
    </p>
    <div class="space-y-4">
      <div>
        <label for="courseids-input" class="label">Course IDs</label>
        <textarea
          id="courseids-input"
          bind:value={courseIdsInput}
          placeholder="Enter one course ID per line"
          class="textarea"
          rows={4}
        ></textarea>
        {#if error && open}
          <p class="text-sm text-error-500 mt-1">{error}</p>
        {/if}
      </div>
      <div class="flex justify-end gap-2">
        <button
          type="button"
          onclick={handleSubmit}
          class="btn preset-filled"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load Data'}
        </button>
      </div>
    </div>
  </div>
</dialog>

<style>
  dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
  }

  dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
  }
</style>
