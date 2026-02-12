<script lang="ts">
  import { Navigation } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import { page } from "$app/stores";

  let { children } = $props();

  const courseId = $derived(($page.params.courseid as string) ?? "");
  const basePath = $derived(`/${courseId}/calendar`);

  const links = $derived([
    {
      label: "Calendar By Day",
      href: `${basePath}/byday`,
      icon: "streamline-ultimate-color:calendar-date"
    },
    {
      label: "Calendar by Week",
      href: `${basePath}/byweek`,
      icon: "streamline-ultimate-color:calendar-1"
    },
    {
      label: "Calendar Median by day",
      href: `${basePath}/median/byday`,
      icon: "streamline-ultimate-color:analytics-bars-3d"
    },
    {
      label: "Calendar Median By Week",
      href: `${basePath}/median/byweek`,
      icon: "streamline-ultimate-color:app-window-pie-chart"
    }
  ]);
</script>

<div class="flex h-full min-h-0">
  <Navigation layout="sidebar" class="w-16 shrink-0">
    <Navigation.Content>
      <Navigation.Group>
        <Navigation.Menu class="flex flex-col gap-1">
          {#each links as item (item.href)}
            <Navigation.TriggerAnchor
              href={item.href}
              title={item.label}
              class="btn btn-icon btn-icon-lg preset-tonal justify-center w-full"
            >
              <Icon icon={item.icon} class="size-8 shrink-0" />
            </Navigation.TriggerAnchor>
          {/each}
        </Navigation.Menu>
      </Navigation.Group>
    </Navigation.Content>
  </Navigation>
  <div class="flex-1 min-w-0 min-h-0 flex flex-col overflow-auto">
    {@render children()}
  </div>
</div>
