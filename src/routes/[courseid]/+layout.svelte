<script lang="ts">
  import { Navigation } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import { page } from "$app/stores";

  let { children } = $props();

  const courseId = $derived(($page.params.courseid as string) ?? "");
  const calendarPath = $derived(`/${courseId}/calendar`);
  const labPath = $derived(`/${courseId}/lab`);

  const navLinks = $derived([
    {
      label: "Course overview",
      href: `/${courseId}`,
      icon: "streamline-ultimate-color:house-4"
    },
    {
      label: "Calendar By Day",
      href: `${calendarPath}/byday`,
      icon: "streamline-ultimate-color:calendar-date"
    },
    {
      label: "Calendar by Week",
      href: `${calendarPath}/byweek`,
      icon: "streamline-ultimate-color:calendar-1"
    },
    {
      label: "Calendar Median by day",
      href: `${calendarPath}/median/byday`,
      icon: "streamline-ultimate-color:analytics-bars-3d"
    },
    {
      label: "Calendar Median By Week",
      href: `${calendarPath}/median/byweek`,
      icon: "streamline-ultimate-color:app-window-pie-chart"
    },
    {
      label: "Labs by Step",
      href: `${labPath}/bystep`,
      icon: "streamline-ultimate-color:lab-tube-experiment"
    },
    {
      label: "Labs by Lab",
      href: `${labPath}/bylab`,
      icon: "streamline-ultimate-color:book-open-bookmark"
    },
    {
      label: "Median Lab by Step",
      href: `${labPath}/median/bystep`,
      icon: "streamline-ultimate-color:analytics-bars-3d"
    },
    {
      label: "Median Lab by Week",
      href: `${labPath}/median/byweek`,
      icon: "streamline-ultimate-color:app-window-pie-chart"
    }
  ]);
</script>

<div class="flex h-[calc(100vh-4rem)] min-h-0">
  <Navigation layout="sidebar" class="w-16 shrink-0">
    <Navigation.Content>
      <Navigation.Group>
        <Navigation.Menu class="flex flex-col gap-1">
          {#each navLinks as item (item.href)}
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
  <div class="flex-1 min-w-0 min-h-0 flex flex-col overflow-auto p-2">
    {@render children()}
  </div>
</div>
