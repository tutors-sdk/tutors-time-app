<script lang="ts">
  import "../app.css";
  import { AppBar } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
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
      <div class="flex items-center justify-center gap-2">
        {#if data.courseIcon}
          <Icon
            icon={data.courseIcon.type}
            class="size-8 shrink-0"
            style={data.courseIcon.color ? `color: ${data.courseIcon.color}` : undefined}
          />
        {:else if data.courseImg}
          <img
            src={data.courseImg}
            alt=""
            class="size-8 rounded object-cover shrink-0"
          />
        {/if}
        <p class="font-semibold truncate max-w-full">{title}</p>
      </div>
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
