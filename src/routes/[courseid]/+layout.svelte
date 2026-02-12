<script lang="ts">
  import { Navigation, Portal, Tooltip } from "@skeletonlabs/skeleton-svelte";
  import Icon from "@iconify/svelte";
  import { page } from "$app/stores";

  let { children } = $props();

  const courseId = $derived(($page.params.courseid as string) ?? "");
  const calendarPath = $derived(`/${courseId}/calendar`);
  const labPath = $derived(`/${courseId}/lab`);

  const navLinks = $derived([
    {
      label: "Calendar by Week",
      href: `${calendarPath}/byweek`,
      icon: "streamline-ultimate-color:calendar-1"
    },
    {
      label: "Calendar Median By Week",
      href: `${calendarPath}/median/byweek`,
      icon: "streamline-ultimate-color:app-window-pie-chart"
    },
    {
      label: "Calendar By Day",
      href: `${calendarPath}/byday`,
      icon: "streamline-ultimate-color:calendar-date"
    },
    {
      label: "Calendar Median by day",
      href: `${calendarPath}/median/byday`,
      icon: "streamline-ultimate-color:analytics-bars-3d"
    },
    {
      label: "Labs by Lab",
      href: `${labPath}/bylab`,
      icon: "streamline-ultimate-color:book-open-bookmark"
    },
    {
      label: "Median Lab by Lab",
      href: `${labPath}/median/byweek`,
      icon: "streamline-ultimate-color:app-window-pie-chart"
    },
    {
      label: "Labs by Step",
      href: `${labPath}/bystep`,
      icon: "streamline-ultimate-color:lab-tube-experiment"
    },
    {
      label: "Median Lab by Step",
      href: `${labPath}/median/bystep`,
      icon: "streamline-ultimate-color:analytics-bars-3d"
    }
  ]);
</script>

<div class="flex h-[calc(100vh-4rem)] min-h-0">
  <Navigation layout="sidebar" class="w-16 shrink-0">
    <Navigation.Content>
      <Navigation.Group>
        <Navigation.Menu class="flex flex-col gap-1">
          {#each navLinks as item (item.href)}
            <Tooltip positioning={{ placement: "right" }}>
              <Tooltip.Trigger>
                <Navigation.TriggerAnchor
                  href={item.href}
                  class="btn btn-icon btn-icon-lg preset-tonal justify-center w-full"
                >
                  <Icon icon={item.icon} class="size-8 shrink-0" />
                </Navigation.TriggerAnchor>
              </Tooltip.Trigger>
              <Portal>
                <Tooltip.Positioner class="z-20!">
                  <Tooltip.Content class="card p-2 preset-filled-surface-950-50">
                    <span>{item.label}</span>
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Portal>
            </Tooltip>
          {/each}
        </Navigation.Menu>
      </Navigation.Group>
    </Navigation.Content>
  </Navigation>
  <div class="flex-1 min-w-0 min-h-0 flex flex-col overflow-auto p-2">
    {@render children()}
  </div>
</div>
