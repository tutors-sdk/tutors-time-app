<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type { CalendarRow } from "$lib/components/calendar/calendarUtils";

  interface Props {
    /** Calendar row with week keys (Monday dates) and values in seconds */
    calendarByWeek: CalendarRow | null;
    /** Week identifiers (Monday dates, YYYY-MM-DD) */
    weeks: string[];
  }

  let { calendarByWeek, weeks }: Props = $props();

  const ELEMENT_ID = "student-calendar-heatmap";
  let container = $state<HTMLDivElement | null>(null);

  /** Add 7 days (Mon–Sun) for a week, each with the given count (minutes) */
  function addWeekToHeatmap(
    heat: { updateDate: (id: string, date: Date, count: number, type?: string, refresh?: boolean) => unknown },
    weekMonday: string,
    countMinutes: number
  ) {
    const base = new Date(weekMonday + "T12:00:00");
    for (let d = 0; d < 7; d++) {
      const date = new Date(base);
      date.setDate(base.getDate() + d);
      heat.updateDate(ELEMENT_ID, date, countMinutes, "Unknown", false);
    }
  }

  onMount(async () => {
    if (!container || !calendarByWeek || weeks.length === 0) return;

    await import("jheat.js");
    await import("jheat.js/dist/heat.js.css");

    const heat = (window as unknown as { $heat: { render: (el: HTMLElement, opts: object) => void; updateDate: (id: string, date: Date, count: number, type?: string, refresh?: boolean) => void; refresh: (id: string) => void; destroy: (id: string) => void } }).$heat;
    if (!heat) return;

    const bindingOptions = {
      defaultView: "map",
      sideMenu: { enabled: false },
      title: { enabled: false },
      useLocalStorageForData: false,
      /** Custom color ranges so low-activity days (1–9 min) show; default starts at 10 so they were invisible */
      colorRanges: [
        { id: "1", name: "1+ min", minimum: 0, cssClassName: "day-color-1", visible: true },
        { id: "2", name: "5+ min", minimum: 5, cssClassName: "day-color-2", visible: true },
        { id: "3", name: "15+ min", minimum: 15, cssClassName: "day-color-3", visible: true },
        { id: "4", name: "30+ min", minimum: 30, cssClassName: "day-color-4", visible: true }
      ]
    };

    heat.render(container, bindingOptions);

    for (const week of weeks) {
      const seconds = (calendarByWeek[week] as number) ?? 0;
      const countMinutes = Math.max(0, Math.round(seconds / 60));
      addWeekToHeatmap(heat, week, countMinutes);
    }

    heat.refresh(ELEMENT_ID);
  });

  onDestroy(() => {
    const heat = (window as unknown as { $heat?: { destroy: (id: string) => void } }).$heat;
    if (heat?.destroy) {
      heat.destroy(ELEMENT_ID);
    }
  });
</script>

<div
  bind:this={container}
  id={ELEMENT_ID}
  class="calendar-heatmap-container min-h-[200px] w-full"
  role="img"
  aria-label="Calendar activity heatmap"
></div>
