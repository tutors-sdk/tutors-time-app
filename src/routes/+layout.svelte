<script lang="ts">
  import "../app.css";
  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import { goto } from "$app/navigation";
  import StudentCard from "$lib/components/StudentCard.svelte";

  let { children, data } = $props();

  const title = $derived(data.courseTitle ?? "Tutors Time");
  const subtitle = $derived(data.viewType ?? "");
</script>

<AppBar>
  <AppBar.Toolbar class="grid-cols-[1fr_2fr_1fr]">
    <AppBar.Lead class="justify-start">
      {#if data.courseId}
        <button
          type="button"
          class="btn preset-outlined"
          onclick={() => goto("/")}
          aria-label="Change course"
        >
          Change course
        </button>
      {/if}
    </AppBar.Lead>
    <AppBar.Headline class="flex flex-col justify-center items-center text-center">
      <p class="font-semibold truncate max-w-full">{title}</p>
      {#if subtitle}
        <p class="text-sm text-surface-600 truncate max-w-full">{subtitle}</p>
      {/if}
    </AppBar.Headline>
    <AppBar.Trail class="justify-end">
      {#if data.studentName}
        <StudentCard fullName={data.studentName} avatarUrl={data.avatarUrl} compact />
      {/if}
    </AppBar.Trail>
  </AppBar.Toolbar>
</AppBar>

<main>
  {@render children()}
</main>
