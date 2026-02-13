<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { CalendarRow, CalendarMedianRow } from "$lib/components/calendar/calendarUtils";

  interface Props {
    /** Calendar row with date keys (YYYY-MM-DD) and values in 30-second blocks per day */
    calendarByDay: CalendarRow | CalendarMedianRow | null;
    /** Date identifiers (YYYY-MM-DD) for each day */
    dates: string[];
    /** Unique element ID for Heat.js (required when multiple heatmaps on same page) */
    elementId?: string;
  }

  let { calendarByDay, dates, elementId = "calendar-heatmap" }: Props = $props();

  let container = $state<HTMLDivElement | null>(null);

  onMount(async () => {
    const id = elementId;
    if (!container || !calendarByDay || dates.length === 0) return;

    await import("jheat.js");
    await import("jheat.js/dist/heat.js.css");

    const heat = (window as unknown as { $heat: { render: (el: HTMLElement, opts: object) => void; updateDate: (id: string, date: Date, count: number, type?: string, refresh?: boolean) => void; refresh: (id: string) => void; destroy: (id: string) => void } }).$heat;
    if (!heat) return;

    const bindingOptions = {
      defaultView: "map",
      sideMenu: { enabled: false },
      title: { enabled: false },
      useLocalStorageForData: false,
      /** Color ranges in increments of 10 from 0 to 200 minutes */
      dynamicColorRange: {
        enabled: true,
        color: "#50c878",
        startMinimum: 0,
        maximumMinimum: 200,
        totalColors: 21
      }
    };

    heat.render(container, bindingOptions);

    for (const dateStr of dates) {
      /** Values are 30-second blocks; convert to minutes: blocks * 30 / 60 */
      const blocks = (calendarByDay[dateStr] as number) ?? 0;
      const countMinutes = Math.max(0, Math.round((blocks * 30) / 60));
      const date = new Date(dateStr + "T12:00:00");
      heat.updateDate(id, date, countMinutes, "Unknown", false);
    }

    heat.refresh(id);
  });

  onDestroy(() => {
    const id = elementId;
    const heat = (window as unknown as { $heat?: { destroy: (id: string) => void } }).$heat;
    if (heat?.destroy) {
      try {
        heat.destroy(id);
      } catch {
        /* Heat.js destroy can throw if Svelte has already removed the DOM */
      }
    }
  });
</script>

<div
  bind:this={container}
  id={elementId}
  class="calendar-heatmap-container min-h-[200px] w-full"
  role="img"
  aria-label="Calendar activity heatmap"
></div>
